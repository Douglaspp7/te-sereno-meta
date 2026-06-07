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
    const hottok = req.headers.get("hottok") || payload.hottok;
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
      // 1. Tentar atualizar o profile se o usuário já existir
      const { data: profileData } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: 'premium',
          subscription_started_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      // 2. Se o usuário não existir (profileData vazio), a gente pode adicionar numa tabela temporária
      // No Lovable/Supabase, a autenticação por Magic Link criará o usuário e o trigger
      // cuidará do resto. Para simplificar, poderemos usar a Edge Function para registrar a aprovação em log ou numa tabela dedicada se houver.
      console.log(`Compra aprovada processada para ${email}`);

    } else if (event === "PURCHASE_CANCELED" || event === "PURCHASE_REFUNDED" || event === "PURCHASE_CHARGEBACK") {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'inactive'
        })
        .eq('email', email);
        
      console.log(`Acesso bloqueado processado para ${email} (Evento: ${event})`);
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
