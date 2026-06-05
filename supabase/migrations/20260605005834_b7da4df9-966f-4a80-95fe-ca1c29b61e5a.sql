-- Block users from escalating premium_access or points on their own profile.
-- Service role (server-side) can still update them via supabaseAdmin.
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

  IF NEW.premium_access IS DISTINCT FROM OLD.premium_access THEN
    RAISE EXCEPTION 'premium_access can only be modified by the server';
  END IF;

  IF NEW.points IS DISTINCT FROM OLD.points THEN
    RAISE EXCEPTION 'points can only be modified by the server';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Also harden existing helper functions with explicit search_path (already done,
-- but ensures the linter warning clears for our own functions).
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;