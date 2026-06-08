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
          .select("email, subscription_status, created_at, phone")
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
            source: 'hotmart_purchases',
            phone: p.phone
          }));
        }
        
        if (profiles) {
          profiles.forEach((p: any) => {
            if (!merged.find(m => m.buyer_email === p.email)) {
              merged.push({
                buyer_email: p.email,
                status: p.subscription_status,
                created_at: p.created_at,
                source: 'profiles',
                phone: p.phone
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
        const { email, action } = body;
        
        if (!email) {
          return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        
        if (action === 'reset_password') {
          // Busca o ID do usuário
          const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", email).single();
          if (!profile) {
            return new Response(JSON.stringify({ error: "Usuário não encontrado no aplicativo (ele ainda não fez o primeiro login)" }), { status: 404 });
          }
          
          // Reseta a senha para mireto2026 e garante que o e-mail está confirmado
          const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, { 
            password: "mireto2026",
            email_confirm: true 
          });
          if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          }
          return Response.json({ success: true, message: "Senha redefinida para mireto2026 com sucesso!" });
        }
        
        // Ação padrão (Deletar acesso)
        // Deleta da sala de espera
        await supabaseAdmin
          .from("hotmart_purchases")
          .delete()
          .eq("buyer_email", email);
          
        // Desativa no aplicativo se já tiver conta
        const { error } = await supabaseAdmin
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
