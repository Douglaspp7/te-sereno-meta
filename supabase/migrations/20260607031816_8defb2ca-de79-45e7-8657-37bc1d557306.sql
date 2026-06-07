-- 1) Column-level privilege hardening on public.profiles
-- Revoke broad UPDATE from authenticated, then grant UPDATE only on the safe columns.
REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  display_name,
  email,
  age,
  sex,
  height_cm,
  current_weight,
  start_weight,
  goal_weight,
  activity_level,
  main_goal,
  main_difficulty,
  onboarding_completed,
  plan_started_at,
  start_date,
  updated_at
) ON public.profiles TO authenticated;

-- Service role keeps full access.
GRANT ALL ON public.profiles TO service_role;

-- 2) Make hotmart_purchases lock-down explicit with a deny-all policy
-- (RLS is already enabled with no policies, but an explicit policy is clearer
-- and protects against future accidental permissive policies being added.)
DROP POLICY IF EXISTS "No client access to hotmart_purchases" ON public.hotmart_purchases;
CREATE POLICY "No client access to hotmart_purchases"
  ON public.hotmart_purchases
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Same lock-down for hotmart_allowlist which also contains buyer emails.
DROP POLICY IF EXISTS "No client access to hotmart_allowlist" ON public.hotmart_allowlist;
CREATE POLICY "No client access to hotmart_allowlist"
  ON public.hotmart_allowlist
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

GRANT ALL ON public.hotmart_purchases TO service_role;
GRANT ALL ON public.hotmart_allowlist TO service_role;
