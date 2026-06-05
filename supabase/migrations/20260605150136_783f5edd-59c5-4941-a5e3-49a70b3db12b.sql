ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS cooking_tips jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS substitutions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS nutritional_benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS weight_loss_benefits jsonb NOT NULL DEFAULT '[]'::jsonb;