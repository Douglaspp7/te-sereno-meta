
-- 1. Adiciona campos à profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_plan text,
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS hotmart_transaction_id text,
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Allowlist de compradores Hotmart
CREATE TABLE IF NOT EXISTS public.hotmart_allowlist (
  email text PRIMARY KEY,
  transaction_id text,
  plan text,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.hotmart_allowlist TO service_role;
GRANT SELECT ON public.hotmart_allowlist TO authenticated;

ALTER TABLE public.hotmart_allowlist ENABLE ROW LEVEL SECURITY;

-- Authenticated users só podem ver a própria entrada (pelo email)
CREATE POLICY "users can see own allowlist entry"
  ON public.hotmart_allowlist
  FOR SELECT
  TO authenticated
  USING (lower(email) = lower((auth.jwt() ->> 'email')));

CREATE TRIGGER hotmart_allowlist_touch
  BEFORE UPDATE ON public.hotmart_allowlist
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Trigger handle_new_user atualizado
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(NEW.email);
  v_allow public.hotmart_allowlist%ROWTYPE;
  v_status text := 'inactive';
  v_plan text := NULL;
  v_started timestamptz := NULL;
  v_tx text := NULL;
  v_admin boolean := false;
BEGIN
  -- Admin hard-coded
  IF v_email = 'douglasp7@hotmail.com' THEN
    v_admin := true;
    v_status := 'active';
  ELSE
    SELECT * INTO v_allow FROM public.hotmart_allowlist WHERE lower(email) = v_email LIMIT 1;
    IF FOUND AND v_allow.status = 'active' THEN
      v_status := 'active';
      v_plan := v_allow.plan;
      v_started := v_allow.purchased_at;
      v_tx := v_allow.transaction_id;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, display_name,
    subscription_status, subscription_plan, subscription_started_at,
    hotmart_transaction_id, is_admin
  )
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    v_status, v_plan, v_started, v_tx, v_admin
  );
  RETURN NEW;
END;
$function$;

-- 4. Atualiza profiles existentes: tudo ativo até webhook entrar em ação
-- (para não quebrar usuários atuais)
UPDATE public.profiles SET subscription_status = 'active' WHERE subscription_status = 'inactive';

-- 5. Garante admin
UPDATE public.profiles
SET is_admin = true, subscription_status = 'active'
WHERE lower(email) = 'douglasp7@hotmail.com';
