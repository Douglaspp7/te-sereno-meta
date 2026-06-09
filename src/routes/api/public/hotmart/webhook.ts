import { createFileRoute } from "@tanstack/react-router";

// Hotmart webhook receiver.
// Configure em Hotmart → Ferramentas → Postback (Webhook):
//   URL: https://mireto21.com/api/public/hotmart/webhook
//   Versão: 2.0.0
// O token (Hottok) precisa estar configurado como secret HOTMART_HOTTOK.

const ACTIVATING_EVENTS = new Set([
  "PURCHASE_APPROVED",
  "PURCHASE_COMPLETE",
  "PURCHASE_PROTEST",
]);

const DEACTIVATING_EVENTS = new Set([
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_CANCELED",
  "PURCHASE_EXPIRED",
  "SUBSCRIPTION_CANCELLATION",
]);

export const Route = createFileRoute("/api/public/hotmart/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.HOTMART_HOTTOK;
        if (!expected) {
          return new Response("HOTMART_HOTTOK not configured", { status: 500 });
        }

        const url = new URL(request.url);
        const headerToken =
          request.headers.get("x-hotmart-hottok") ||
          request.headers.get("X-HOTMART-HOTTOK") ||
          url.searchParams.get("hottok");

        const bodyText = await request.text();
        let payload: any = {};
        try {
          payload = bodyText ? JSON.parse(bodyText) : {};
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const bodyToken = payload?.hottok || payload?.data?.hottok;
        const token = headerToken || bodyToken;
        if (token !== expected) {
          return new Response("invalid hottok", { status: 401 });
        }

        const event: string = payload?.event || payload?.data?.event || "";
        const buyerEmail: string | undefined =
          payload?.data?.buyer?.email ||
          payload?.buyer?.email ||
          payload?.data?.purchase?.buyer?.email;
        const transactionId: string | undefined =
          payload?.data?.purchase?.transaction ||
          payload?.data?.transaction ||
          payload?.transaction;
        const plan: string | undefined =
          payload?.data?.subscription?.plan?.name ||
          payload?.data?.purchase?.offer?.code ||
          payload?.data?.product?.name;

        if (!buyerEmail) {
          return new Response("missing buyer email", { status: 400 });
        }

        const email = buyerEmail.toLowerCase();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (ACTIVATING_EVENTS.has(event)) {
          await supabaseAdmin
            .from("hotmart_purchases")
            .upsert(
              {
                buyer_email: email,
                transaction_id: transactionId ?? null,
                plan: plan ?? null,
                status: "active",
                purchased_at: new Date().toISOString(),
                raw_payload: payload,
              },
              { onConflict: "buyer_email" },
            );

          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_plan: plan ?? null,
              subscription_started_at: new Date().toISOString(),
              hotmart_transaction_id: transactionId ?? null,
            })
            .ilike("email", email);

          // Funnel analytics: record the Purchase event for conversion reports.
          await supabaseAdmin.from("tracking_events").insert({
            event_name: "Purchase",
            session_id: null,
            metadata: { email, transaction_id: transactionId ?? null, plan: plan ?? null } as any,
          });

          return Response.json({ ok: true, action: "activated", email });
        }

        if (DEACTIVATING_EVENTS.has(event)) {
          await supabaseAdmin
            .from("hotmart_purchases")
            .upsert(
              {
                buyer_email: email,
                transaction_id: transactionId ?? null,
                status: event === "PURCHASE_REFUNDED" ? "refunded" : "cancelled",
                raw_payload: payload,
              },
              { onConflict: "buyer_email" },
            );

          await supabaseAdmin
            .from("profiles")
            .update({ subscription_status: "expired" })
            .ilike("email", email);

          return Response.json({ ok: true, action: "deactivated", email });
        }

        return Response.json({ ok: true, action: "ignored", event });
      },
    },
  },
});
