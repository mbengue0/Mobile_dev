// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate User
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        const { amount } = await req.json()

        if (!amount || amount < 100) { // Min amount check
            return new Response(JSON.stringify({ error: 'Invalid amount (Minimum 100 FCFA)' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 2. Anti-Spam / Cleanup Logic
        // Check for existing pending transactions for this user
        const { data: pendingTx } = await supabaseClient
            .from('wallet_transactions')
            .select('id, created_at')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .eq('provider', 'naboopay')
            .order('created_at', { ascending: false })
            .limit(1)

        if (pendingTx && pendingTx.length > 0) {
            // Cancel the old one
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
        // We need a Service Role client to write to wallet_transactions if RLS is strict, 
        // OR ensure the user has INSERT permission for their own rows.
        // Assuming user has permissions or we use Service Role for higher privilege operations.
        // For safety, let's use Service Role for the DB operations to avoid RLS issues with 'pending' status if necessary.
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
                external_reference: orderId
            })

        if (insertError) {
            throw insertError
        }

        // 4. Call Naboo API
        // Replace with actual Naboo API interactions
        // This is a MOCK implementation as I don't have the real Naboo endpoint docs in context.
        // User should replace this.

        /* 
        const nabooResponse = await fetch('https://api.naboo.pay/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('NABOO_API_KEY')}` },
            body: JSON.stringify({
                order_id: orderId,
                amount: amount,
                currency: 'XOF',
                return_url: 'kanteen://wallet', // Deep link back to app
                cancel_url: 'kanteen://wallet',
            })
        })
        const nabooData = await nabooResponse.json()
        const checkoutUrl = nabooData.checkout_url
        */

        // MOCK URL for Testing
        const checkoutUrl = `https://checkout.naboo.pay/mock/${orderId}?amount=${amount}`

        return new Response(JSON.stringify({ url: checkoutUrl, orderId: orderId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
