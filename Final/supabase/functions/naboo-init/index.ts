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

        // 2. Initialize Admin Client (Required for privileged cleanup)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log("🔑 Checking API Keys...", Deno.env.get('NABOO_API_KEY') ? "Present" : "MISSING");

        const { amount } = await req.json()
        console.log("📦 Request Payload:", { amount });

        if (!amount || amount < 500) { // Check min amount 500 per updated requirement
            return new Response(JSON.stringify({ error: 'Invalid amount (Minimum 500 FCFA)' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 2b. Anti-Spam / Cleanup Logic (Use Admin Client to bypass RLS)
        // Find ALL pending deposit transactions for this user
        const { data: pendingTxs, error: fetchError } = await supabaseAdmin
            .from('wallet_transactions')
            .select('id, created_at')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .eq('transaction_type', 'deposit');

        if (fetchError) {
            console.error("⚠️ Failed to fetch pending txs:", fetchError);
        }

        if (pendingTxs && pendingTxs.length > 0) {
            console.log("🧹 Cleaning up old pending transactions:", pendingTxs.length, "IDs:", pendingTxs.map(t => t.id));

            // Loop through all found pending transactions
            for (const tx of pendingTxs) {
                const { error: updateError } = await supabaseAdmin
                    .from('wallet_transactions')
                    .update({
                        status: 'cancelled',
                        description: 'User started a new payment (Auto-cancelled)'
                    })
                    .eq('id', tx.id);

                if (updateError) {
                    console.error("❌ Failed to cleanup tx:", tx.id, updateError);
                } else {
                    console.log("✅ Cancelled old tx:", tx.id);
                }
            }
        } else {
            console.log("✅ No pending transactions found to cleanup.");
        }

        // 3. Create New Transaction Record
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
                price: Number(amount), // Changed from 'amount' to 'price'
                quantity: 1,
                description: "Kanteen Deposit"
            }],
            success_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/naboo-redirect?status=success`,
            error_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/naboo-redirect?status=error`,
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
