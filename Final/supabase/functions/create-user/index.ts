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
        console.log("🚀 Create User Function called");

        // 1. Initialize Supabase Client (Auth Context)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 2. Authenticate Caller
        const { data: { user: caller }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !caller) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        // 3. Initialize Admin Client (For privileged operations)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 4. Verify Super Admin Status & Get Institution
        const { data: callerProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, institution_id')
            .eq('id', caller.id)
            .single();

        if (profileError || !callerProfile) {
            return new Response(JSON.stringify({ error: 'Profile not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        if (callerProfile.role !== 'super_admin') {
            return new Response(JSON.stringify({ error: 'Forbidden: Super Admin only' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        const institutionId = callerProfile.institution_id;

        // 5. Get Institution Invite Code (Required for Trigger)
        const { data: institution, error: instError } = await supabaseAdmin
            .from('institutions')
            .select('invite_code')
            .eq('id', institutionId)
            .single();

        if (instError || !institution) {
            return new Response(JSON.stringify({ error: 'Institution not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 6. Parse Request Body
        const { email, password, full_name } = await req.json();

        if (!email || !password || !full_name) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        console.log(`👤 Creating user: ${email} for Institution: ${institutionId}`);

        // 7. Create User (Admin API)
        // We pass invite_code in metadata so the handle_new_user trigger succeeds
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm
            user_metadata: {
                full_name,
                invite_code: institution.invite_code // Vital for trigger
            }
        });

        if (createError) {
            console.error("❌ Create User Error:", createError);
            return new Response(JSON.stringify({ error: createError.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 8. Promote to Admin (Trigger creates as 'student' by default)
        // We update immediately
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', newUser.user.id);

        if (updateError) {
            console.error("⚠️ Failed to promote user:", updateError);
            // User exists but is student. We still return success but maybe with warning?
            // Or fail? Best to return success and log.
        }

        return new Response(JSON.stringify({
            success: true,
            userId: newUser.user.id,
            message: 'User created and promoted to Admin'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("🔥 System Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
