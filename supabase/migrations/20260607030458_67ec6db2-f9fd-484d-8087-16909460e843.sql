CREATE TABLE IF NOT EXISTS public.hotmart_purchases (
  buyer_email text PRIMARY KEY,
  transaction_id text,
  status text NOT NULL,
  plan_type text DEFAULT 'premium',
  created_at timestamp with time zone DEFAULT now()
);

GRANT ALL ON public.hotmart_purchases TO service_role;

ALTER TABLE public.hotmart_purchases ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_hotmart_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.hotmart_purchases
    WHERE buyer_email = NEW.email AND status = 'approved'
  ) THEN
    NEW.subscription_status := 'active';
    NEW.subscription_plan := 'premium';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_check_hotmart ON public.profiles;

CREATE TRIGGER on_profile_created_check_hotmart
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_hotmart_purchase();