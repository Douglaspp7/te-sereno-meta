-- Add rich content columns to recipes table
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS cooking_tips JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS substitutions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS nutritional_benefits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS weight_loss_benefits JSONB DEFAULT '[]'::jsonb;
