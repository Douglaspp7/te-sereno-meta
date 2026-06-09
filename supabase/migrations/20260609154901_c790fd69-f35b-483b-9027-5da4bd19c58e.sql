
-- 1) Strengthen profile privilege-escalation trigger to cover is_admin & subscription fields
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    RAISE EXCEPTION 'is_admin can only be modified by the server';
  END IF;
  IF NEW.premium_access IS DISTINCT FROM OLD.premium_access THEN
    RAISE EXCEPTION 'premium_access can only be modified by the server';
  END IF;
  IF NEW.points IS DISTINCT FROM OLD.points THEN
    RAISE EXCEPTION 'points can only be modified by the server';
  END IF;
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'subscription_status can only be modified by the server';
  END IF;
  IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan THEN
    RAISE EXCEPTION 'subscription_plan can only be modified by the server';
  END IF;
  IF NEW.subscription_started_at IS DISTINCT FROM OLD.subscription_started_at THEN
    RAISE EXCEPTION 'subscription_started_at can only be modified by the server';
  END IF;
  IF NEW.hotmart_transaction_id IS DISTINCT FROM OLD.hotmart_transaction_id THEN
    RAISE EXCEPTION 'hotmart_transaction_id can only be modified by the server';
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger is actually attached to profiles
DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2) Convert hotmart deny policies to RESTRICTIVE hard blocks
DROP POLICY IF EXISTS "No client access to hotmart_allowlist" ON public.hotmart_allowlist;
CREATE POLICY "Deny all client access to hotmart_allowlist"
  ON public.hotmart_allowlist
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "No client access to hotmart_purchases" ON public.hotmart_purchases;
CREATE POLICY "Deny all client access to hotmart_purchases"
  ON public.hotmart_purchases
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- 3) Remove public read on videos bucket; only authenticated users may read.
-- The bucket is private; serve signed URLs server-side when needed.
DROP POLICY IF EXISTS "Public read videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read videos" ON storage.objects;
CREATE POLICY "Authenticated read videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');
