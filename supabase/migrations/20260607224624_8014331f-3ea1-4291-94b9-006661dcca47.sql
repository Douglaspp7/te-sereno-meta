ALTER TABLE public.hotmart_purchases
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS purchased_at timestamptz,
  ADD COLUMN IF NOT EXISTS raw_payload jsonb;

ALTER TABLE public.hotmart_purchases
  DROP CONSTRAINT IF EXISTS hotmart_purchases_buyer_email_key;

ALTER TABLE public.hotmart_purchases
  ADD CONSTRAINT hotmart_purchases_buyer_email_key UNIQUE (buyer_email);