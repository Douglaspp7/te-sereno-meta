
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  image_url TEXT,
  calories INTEGER NOT NULL DEFAULT 0,
  proteins NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fats NUMERIC NOT NULL DEFAULT 0,
  prep_time INTEGER NOT NULL DEFAULT 0,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipes TO anon, authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes are public" ON public.recipes FOR SELECT USING (true);

CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  week INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercises TO anon, authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercises are public" ON public.exercises FOR SELECT USING (true);

CREATE TABLE public.days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  mission TEXT NOT NULL,
  tip TEXT,
  water_goal INTEGER NOT NULL DEFAULT 8,
  breakfast_recipe_id UUID REFERENCES public.recipes(id),
  lunch_recipe_id UUID REFERENCES public.recipes(id),
  dinner_recipe_id UUID REFERENCES public.recipes(id),
  exercise_id UUID REFERENCES public.exercises(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.days TO anon, authenticated;
GRANT ALL ON public.days TO service_role;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "days are public" ON public.days FOR SELECT USING (true);

CREATE TRIGGER trg_recipes_touch BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_exercises_touch BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_days_touch BEFORE UPDATE ON public.days
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
