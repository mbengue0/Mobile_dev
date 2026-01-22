// @ts-nocheck
// This function acts as a bridge.
// Naboo requires HTTPS URLs for success/error callbacks.
// The App uses a custom scheme (kanteen://).
// Flow: Naboo -> HTTPS (This Function) -> 302 Redirect -> kanteen:// (App)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req: Request) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'unknown';

    // Construct the deep link
    const deepLink = `kanteen://wallet?status=${status}`;

    // Return a 302 Redirect to the app
    return new Response(null, {
        status: 302,
        headers: {
            'Location': deepLink,
        },
    });
})
