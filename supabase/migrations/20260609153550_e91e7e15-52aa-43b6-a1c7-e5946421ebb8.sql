-- Add RESTRICTIVE deny-all policy on tracking_events for anon/authenticated.
-- All legitimate writes happen via supabaseAdmin (service_role) in /api/public/track,
-- which bypasses RLS, so this lockdown is safe.
DROP POLICY IF EXISTS "deny_all_client_access" ON public.tracking_events;
CREATE POLICY "deny_all_client_access"
ON public.tracking_events
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);