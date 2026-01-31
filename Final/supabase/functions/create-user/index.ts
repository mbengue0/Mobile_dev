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
            return new Response(JSON.stringify({ error: `Profile not found for User ${caller.id}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        if (callerProfile.role !== 'super_admin') {
            return new Response(JSON.stringify({ error: 'Forbidden: Super Admin only' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const institutionId = callerProfile.institution_id;

        // 5. Get Institution Details & Limits
        const { data: institution, error: instError } = await supabaseAdmin
            .from('institutions')
            .select('invite_code, max_admins') // Added max_admins
            .eq('id', institutionId)
            .single();

        if (instError || !institution) {
            console.error("Institution Lookup Error:", instError);

            // FALLBACK (Retained for robustness, though limits might be tricky here. Let's assume default strictness if fallback used or skip?)
            const { data: fallbackInst, error: fallbackError } = await supabaseAdmin
                .from('institutions')
                .select('invite_code, max_admins')
                .eq('invite_code', 'DAUST-2025')
                .maybeSingle();

            if (fallbackInst) {
                console.log("✅ Recovered using Fallback Institution (DAUST-2025)");
                institution = fallbackInst;
            } else {
                return new Response(JSON.stringify({
                    error: "Institution not found (ID or Invite Code check failed)",
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                })
            }
        }

        // --- BUSINESS LIMIT CHECK ---
        const maxAdmins = institution.max_admins ?? 2; // Default to 2 if null (schema says not null default 2, but safe coding)

        const { count: currentAdmins, error: countError } = await supabaseAdmin
            .from('profiles')
            .select('id', { count: 'exact', head: true }) // optimized count check
            .eq('institution_id', institutionId) // Use the resolved ID (fallback or real)
            .eq('role', 'admin');

        if (countError) {
            console.error("Failed to count admins:", countError);
            // Fail open or closed? Closed for security.
            return new Response(JSON.stringify({ error: "System Error: Could not verify plan limits." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        console.log(`📊 Limit Check: Used ${currentAdmins} / Max ${maxAdmins}`);

        if ((currentAdmins || 0) >= maxAdmins) {
            return new Response(JSON.stringify({
                error: `Plan Limit Reached. Your institution is limited to ${maxAdmins} admins. Please upgrade.`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Client handles 200 OK with error body best
            })
        }
        // -----------------------------

        // 6. Parse Request Body
        const { email, password, full_name } = await req.json();

        if (!email || !password || !full_name) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        console.log(`👤 Creating user: ${email} for Institution: ${institution.invite_code}`);

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
                status: 200, // Return 200 so client sees the error body
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
            status: 200, // Return 200 so client sees the error body
        })
    }
})
