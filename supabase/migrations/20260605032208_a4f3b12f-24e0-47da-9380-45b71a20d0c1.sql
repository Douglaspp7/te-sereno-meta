
-- 1. Remover tabelas do app antigo
DROP TABLE IF EXISTS public.day_progress CASCADE;
DROP TABLE IF EXISTS public.habit_logs CASCADE;
DROP TABLE IF EXISTS public.weight_logs CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;

-- 2. Expandir profiles com campos do onboarding MiReto21 AI
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sex TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS activity_level TEXT,
  ADD COLUMN IF NOT EXISTS main_difficulty TEXT,
  ADD COLUMN IF NOT EXISTS main_goal TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;

-- 3. plan_days: os 21 dias do plano gerado pela IA
CREATE TABLE public.plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 21),
  mission TEXT,
  exercise_title TEXT,
  exercise_description TEXT,
  exercise_duration_min INTEGER,
  breakfast JSONB,
  lunch JSONB,
  dinner JSONB,
  water_goal_glasses INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_days TO authenticated;
GRANT ALL ON public.plan_days TO service_role;
ALTER TABLE public.plan_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own plan days" ON public.plan_days
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER plan_days_touch_updated_at
  BEFORE UPDATE ON public.plan_days
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. daily_progress: o que o utilizador completou em cada dia
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 21),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mission_done BOOLEAN NOT NULL DEFAULT false,
  exercise_done BOOLEAN NOT NULL DEFAULT false,
  breakfast_done BOOLEAN NOT NULL DEFAULT false,
  lunch_done BOOLEAN NOT NULL DEFAULT false,
  dinner_done BOOLEAN NOT NULL DEFAULT false,
  water_glasses INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_progress TO authenticated;
GRANT ALL ON public.daily_progress TO service_role;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own daily progress" ON public.daily_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER daily_progress_touch_updated_at
  BEFORE UPDATE ON public.daily_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
