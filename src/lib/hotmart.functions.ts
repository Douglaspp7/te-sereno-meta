import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Verifica se o usuário logado tem uma compra ativa na allowlist Hotmart.
 * Se tiver, ativa o profile e retorna { activated: true }.
 */
export const checkHotmartPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const email = (claims?.email as string | undefined)?.toLowerCase();
    if (!email) return { activated: false, reason: "no_email" as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Admin hard-coded
    if (email === "douglasp7@hotmail.com") {
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "active", is_admin: true })
        .eq("id", userId);
      return { activated: true } as const;
    }

    const { data: entry } = await supabaseAdmin
      .from("hotmart_allowlist")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    if (!entry || entry.status !== "active") {
      return { activated: false, reason: "not_found" as const };
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_plan: entry.plan,
        subscription_started_at: entry.purchased_at,
        hotmart_transaction_id: entry.transaction_id,
      })
      .eq("id", userId);

    return { activated: true } as const;
  });
