import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/allowlist")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: purchases, error: err1 } = await supabaseAdmin
          .from("hotmart_purchases")
          .select("*")
          
        const { data: profiles, error: err2 } = await supabaseAdmin
          .from("profiles")
          .select("email, subscription_status, created_at")
          .eq("subscription_status", "active")
        
        if (err1 || err2) {
          return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
        }
        
        const merged: any[] = [];
        
        if (purchases) {
          purchases.forEach((p: any) => merged.push({
            buyer_email: p.buyer_email,
            status: p.status,
            created_at: p.created_at || p.purchased_at,
            source: 'hotmart_purchases'
          }));
        }
        
        if (profiles) {
          profiles.forEach((p: any) => {
            if (!merged.find(m => m.buyer_email === p.email)) {
              merged.push({
                buyer_email: p.email,
                status: p.subscription_status,
                created_at: p.created_at,
                source: 'profiles'
              });
            }
          });
        }
        
        // Sort by newest first
        merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        return Response.json(merged);
      },
      POST: async ({ request }) => {
        const body = await request.json();
        const email = body.email;
        
        if (!email) {
          return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        
        // Deleta da sala de espera
        const { error } = await supabaseAdmin
          .from("hotmart_purchases")
          .delete()
          .eq("buyer_email", email);
          
        // Desativa no aplicativo se já tiver conta
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "inactive" })
          .eq("email", email);
          
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
        return Response.json({ success: true });
      }
    }
  }
});
