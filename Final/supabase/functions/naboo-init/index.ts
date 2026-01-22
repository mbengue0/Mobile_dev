// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("🚀 Naboo Init started");

        // 1. Authenticate User
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            console.error("❌ Auth Error:", authError);
            return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        console.log("👤 User ID found:", user.id);

        // 1b. Fetch current balance (Required for balance_after constraint)
        const { data: profileData, error: profileError } = await supabaseClient
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("❌ Profile Error:", profileError);
            throw new Error("Failed to fetch user profile");
        }

        const currentBalance = profileData?.wallet_balance ?? 0;
        console.log("💰 Current Balance:", currentBalance);

        console.log("🔑 Checking API Keys...", Deno.env.get('NABOO_API_KEY') ? "Present" : "MISSING");

        const { amount } = await req.json()
        console.log("📦 Request Payload:", { amount });

        if (!amount || amount < 500) { // Check min amount 500 per updated requirement
            return new Response(JSON.stringify({ error: 'Invalid amount (Minimum 500 FCFA)' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 2. Anti-Spam / Cleanup Logic
        const { data: pendingTx, error: fetchError } = await supabaseClient
            .from('wallet_transactions')
            .select('id, created_at')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .eq('provider', 'naboopay')
            .order('created_at', { ascending: false })
            .limit(1)

        if (fetchError) {
            console.error("⚠️ Failed to fetch pending tx:", fetchError);
        }

        if (pendingTx && pendingTx.length > 0) {
            console.log("🧹 Cleaning up old pending transaction:", pendingTx[0].id);
            const oldTx = pendingTx[0];
            await supabaseClient
                .from('wallet_transactions')
                .update({
                    status: 'cancelled',
                    description: 'User started a new payment (Auto-cancelled)'
                })
                .eq('id', oldTx.id)
        }

        // 3. Create New Transaction Record
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const orderId = `order_${user.id.split('-')[0]}_${Date.now()}` // Simple unique ref

        const { error: insertError } = await supabaseAdmin
            .from('wallet_transactions')
            .insert({
                user_id: user.id,
                amount: amount,
                transaction_type: 'deposit',
                description: 'Online Top-Up (Pending)',
                status: 'pending',
                provider: 'naboopay',
                external_reference: orderId,
                balance_after: currentBalance
            })

        if (insertError) {
            console.error("❌ DB Insert Error:", insertError);
            throw insertError
        }

        // 4. Call Naboo API (Real)
        console.log("📡 Calling Naboo API...");

        const payload = {
            method_of_payment: ["wave", "orange_money"],
            products: [{
                name: "Wallet Top-up",
                category: "digital_service",
                amount: Number(amount),
                quantity: 1,
                description: "Kanteen Deposit"
            }],
            success_url: 'kanteen://wallet',
            error_url: 'kanteen://wallet?status=error',
            is_escrow: false,
            is_merchant: false
        };

        console.log("📤 Sending Body:", JSON.stringify(payload));

        const nabooResponse = await fetch('https://api.naboopay.com/api/v2/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('NABOO_API_KEY')}`
            },
            body: JSON.stringify(payload)
        })

        if (!nabooResponse.ok) {
            const errorText = await nabooResponse.text();
            console.error("❌ Naboo Error:", errorText);

            // Try to parse error if JSON
            try {
                const errObj = JSON.parse(errorText);
                throw new Error(errObj.message || `Naboo API Error: ${errorText}`);
            } catch (e) {
                throw new Error(`Naboo API Error: ${errorText}`);
            }
        }

        const nabooData = await nabooResponse.json();
        const checkoutUrl = nabooData.checkout_url;
        console.log("✅ Checkout URL Generated:", checkoutUrl);

        return new Response(JSON.stringify({ url: checkoutUrl, orderId: orderId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("🔥 CRITICAL FAILURE:", error.message);
        return new Response(JSON.stringify({ error: error.message, details: "Check Supabase Logs" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400, // Return 400 even for system errors so client can parse body easily? Or 500. User asked for JSON.
        })
    }
})
