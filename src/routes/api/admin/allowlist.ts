import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/allowlist")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("hotmart_purchases")
          .select("*")
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
        return Response.json(data);
      },
      POST: async ({ request }) => {
        const body = await request.json();
        const email = body.email;
        
        if (!email) {
          return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("hotmart_purchases")
          .delete()
          .eq("buyer_email", email);
          
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
        return Response.json({ success: true });
      }
    }
  }
});
