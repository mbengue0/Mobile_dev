// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()

        // 1. Logic: Verify Signature (Mocked)
        // In production, check 'x-naboo-signature' header against Deno.env.get('NABOO_SECRET')
        // const signature = req.headers.get('x-naboo-signature') 
        // if (!verifySignature(signature, payload)) throw new Error('Invalid Signature')

        console.log("Webhook received:", payload)

        // 2. Event Filter
        // Assuming Naboo sends { order_id: "...", status: "success" } or similar
        // Adjust based on actual Naboo docs. 
        // For now, accepting "payment.success" or just checking status.

        if (payload.status !== 'success' && payload.event !== 'payment.success') {
            return new Response(JSON.stringify({ message: 'Ignored: Not a success event' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const orderId = payload.order_id || payload.external_reference

        if (!orderId) {
            return new Response(JSON.stringify({ error: 'Missing order_id' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 3. Idempotency & Processing (Atomic RPC)
        // We use the Service Role to bypass RLS and ensure system-level update
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data, error } = await supabaseAdmin.rpc('confirm_naboo_payment', {
            p_order_id: orderId
        })

        if (error) {
            throw error
        }

        return new Response(JSON.stringify(data), {
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
