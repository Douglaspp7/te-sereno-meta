import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  event_name: z.string().min(1).max(64).regex(/^[A-Za-z0-9_]+$/),
  session_id: z.string().min(1).max(128).nullable().optional(),
  utm_source: z.string().max(255).nullable().optional(),
  utm_medium: z.string().max(255).nullable().optional(),
  utm_campaign: z.string().max(255).nullable().optional(),
  utm_content: z.string().max(255).nullable().optional(),
  utm_term: z.string().max(255).nullable().optional(),
  page_url: z.string().max(2048).nullable().optional(),
  referrer: z.string().max(2048).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = Schema.parse(body);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const ua = request.headers.get("user-agent") ?? null;
          const { error } = await supabaseAdmin.from("tracking_events").insert({
            event_name: data.event_name,
            session_id: data.session_id ?? null,
            utm_source: data.utm_source ?? null,
            utm_medium: data.utm_medium ?? null,
            utm_campaign: data.utm_campaign ?? null,
            utm_content: data.utm_content ?? null,
            utm_term: data.utm_term ?? null,
            page_url: data.page_url ?? null,
            referrer: data.referrer ?? null,
            user_agent: ua,
            metadata: (data.metadata ?? null) as any,
          });
          if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          }
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Bad request" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      OPTIONS: async () => new Response(null, { status: 204 }),
    },
  },
});
