import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, hottok",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Recebido payload da Hotmart:", JSON.stringify(payload, null, 2));

    // Hotmart envia o token de segurança no header ou no payload
    const hottok = req.headers.get("x-hotmart-hottok") || req.headers.get("hottok") || payload.hottok;
    const expectedToken = Deno.env.get("HOTMART_HOTTOK");

    if (!expectedToken) {
      console.error("Variável HOTMART_HOTTOK não configurada no Supabase.");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (hottok !== expectedToken) {
      console.warn("Token hottok inválido recebido.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = payload.event;
    const data = payload.data;
    
    if (!data || !data.buyer || !data.buyer.email) {
      console.error("Payload não contém o email do comprador.");
      return new Response(JSON.stringify({ error: "Missing buyer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = data.buyer.email.toLowerCase();
    
    // Iniciar cliente do Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lógica com base no evento
    // Eventos mais comuns da Hotmart V2: PURCHASE_APPROVED, PURCHASE_CANCELED, PURCHASE_REFUNDED
    if (event === "PURCHASE_APPROVED") {
      // Extrair o telefone (pode vir em phone ou checkoutPhone)
      const phone = data.buyer.checkoutPhone || data.buyer.phone || null;

      // 1. Tentar atualizar o profile se o usuário já existir
      const { data: profileData } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: 'premium',
          subscription_started_at: new Date().toISOString(),
          phone: phone
        })
        .eq('email', email)
        .select();

      // 2. Se o profile não existe, salvar na tabela pendente
      if (!profileData || profileData.length === 0) {
        const { error: insertError } = await supabase
          .from('hotmart_purchases')
          .upsert({
            buyer_email: email,
            transaction_id: data.transaction || 'unknown',
            status: 'approved',
            plan_type: 'premium',
            phone: phone
          });
          
        if (insertError) {
          console.error("Erro ao registrar compra pendente:", insertError);
        } else {
          console.log(`Compra registrada como pendente para novo usuário: ${email}`);
        }
      } else {
        console.log(`Conta de usuário atualizada para VIP: ${email}`);
      }

    } else if (event === "PURCHASE_CANCELED" || event === "PURCHASE_REFUNDED" || event === "PURCHASE_CHARGEBACK") {
      // Tentar atualizar o profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'inactive'
        })
        .eq('email', email);
        
      // Atualizar também a tabela de compras, caso ele ainda nem tenha criado conta
      await supabase
        .from('hotmart_purchases')
        .update({ status: 'refunded' })
        .eq('buyer_email', email);

      console.log(`Acesso revogado para ${email} (Evento: ${event})`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
