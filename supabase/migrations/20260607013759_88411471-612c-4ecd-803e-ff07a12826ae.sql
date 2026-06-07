DROP POLICY IF EXISTS "users can see own allowlist entry" ON public.hotmart_allowlist;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.hotmart_allowlist FROM authenticated, anon;