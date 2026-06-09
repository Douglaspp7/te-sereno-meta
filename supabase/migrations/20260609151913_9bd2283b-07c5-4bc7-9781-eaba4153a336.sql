
CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  page_url text,
  referrer text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracking_events_event_name ON public.tracking_events(event_name);
CREATE INDEX idx_tracking_events_created_at ON public.tracking_events(created_at DESC);
CREATE INDEX idx_tracking_events_session_id ON public.tracking_events(session_id);

GRANT ALL ON public.tracking_events TO service_role;

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- No public access; writes happen via server route using service role.
CREATE POLICY "no_public_access" ON public.tracking_events
  FOR ALL USING (false) WITH CHECK (false);
