import { createFileRoute } from "@tanstack/react-router";

const EVENTS = [
  "LandingView",
  "AdClick",
  "QuizView",
  "QuizStart",
  "QuizComplete",
  "VSLView",
  "VSL75",
  "OfferView",
  "InitiateCheckout",
  "Purchase",
] as const;

export const Route = createFileRoute("/api/admin/metrics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30", 10) || 30, 1), 365);
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("tracking_events")
          .select("event_name, session_id, created_at")
          .gte("created_at", since);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        const totalCounts: Record<string, number> = {};
        const uniqueSets: Record<string, Set<string>> = {};
        for (const ev of EVENTS) {
          totalCounts[ev] = 0;
          uniqueSets[ev] = new Set();
        }

        for (const row of data ?? []) {
          const name = row.event_name as string;
          if (!(name in totalCounts)) {
            totalCounts[name] = 0;
            uniqueSets[name] = new Set();
          }
          totalCounts[name] += 1;
          if (row.session_id) uniqueSets[name].add(row.session_id);
        }

        const uniqueCounts: Record<string, number> = {};
        for (const k of Object.keys(uniqueSets)) uniqueCounts[k] = uniqueSets[k].size;

        const pct = (a: number, b: number) =>
          b > 0 ? Math.round((a / b) * 1000) / 10 : 0;

        const conversions = {
          quizStartRate: pct(uniqueCounts.QuizStart, uniqueCounts.QuizView),
          quizCompleteRate: pct(uniqueCounts.QuizComplete, uniqueCounts.QuizStart),
          vslViewRate: pct(uniqueCounts.VSLView, uniqueCounts.QuizComplete),
          vsl75Rate: pct(uniqueCounts.VSL75, uniqueCounts.VSLView),
          offerViewRate: pct(uniqueCounts.OfferView, uniqueCounts.QuizView),
          checkoutRate: pct(uniqueCounts.InitiateCheckout, uniqueCounts.OfferView),
          purchaseRate: pct(totalCounts.Purchase, uniqueCounts.InitiateCheckout),
          overall: pct(totalCounts.Purchase, uniqueCounts.QuizView),
        };

        return Response.json({
          days,
          events: EVENTS,
          totalCounts,
          uniqueCounts,
          conversions,
        });
      },
    },
  },
});
