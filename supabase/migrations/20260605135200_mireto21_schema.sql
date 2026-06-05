-- Arquivo de migração estrutural: MiReto21 AI Schema

-- Desabilitar constraints temporariamente para garantir a deleção (opcional mas seguro em postgres)
SET session_replication_role = 'replica';

-- DROP TABLES se já existirem (para reconstrução limpa baseada na nova spec)
DROP TABLE IF EXISTS public.body_measurements CASCADE;
DROP TABLE IF EXISTS public.weight_history CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.daily_progress CASCADE; -- Antiga, deletada para manter limpo
DROP TABLE IF EXISTS public.plan_days CASCADE; -- Antiga
DROP TABLE IF EXISTS public.shopping_lists CASCADE;
DROP TABLE IF EXISTS public.days CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

SET session_replication_role = 'origin';

--------------------------------------------------------------------------------
-- 1. PROFILES
--------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INT,
  gender TEXT,
  height NUMERIC,
  starting_weight NUMERIC,
  current_weight NUMERIC,
  target_weight NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_user_profile UNIQUE(user_id)
);

-- Trigger to auto-create profile for new users (if needed, simplified here)
-- In Supabase this is often done via function/trigger on auth.users

--------------------------------------------------------------------------------
-- 2. RECIPES
--------------------------------------------------------------------------------
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL, -- Desayuno, Almuerzo, Cena, Snack
  image_url TEXT,
  calories INT,
  proteins NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  prep_time INT,
  ingredients JSONB, -- Array de strings ou objetos
  instructions JSONB, -- Array de strings (passos)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 3. EXERCISES
--------------------------------------------------------------------------------
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INT, -- Em minutos
  video_url TEXT,
  week INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 4. DAYS
--------------------------------------------------------------------------------
CREATE TABLE public.days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL UNIQUE,
  title TEXT,
  mission TEXT,
  tip TEXT,
  water_goal INT DEFAULT 8,
  breakfast_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  lunch_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  dinner_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 5. SHOPPING LISTS
--------------------------------------------------------------------------------
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INT NOT NULL UNIQUE,
  items JSONB, -- Array de categorias/itens
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 6. USER PROGRESS
--------------------------------------------------------------------------------
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  breakfast_completed BOOLEAN DEFAULT FALSE,
  lunch_completed BOOLEAN DEFAULT FALSE,
  dinner_completed BOOLEAN DEFAULT FALSE,
  mission_completed BOOLEAN DEFAULT FALSE,
  exercise_completed BOOLEAN DEFAULT FALSE,
  water_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Um progresso por usuário por dia
  CONSTRAINT unique_user_day_progress UNIQUE(user_id, day_id)
);

--------------------------------------------------------------------------------
-- 7. WEIGHT HISTORY
--------------------------------------------------------------------------------
CREATE TABLE public.weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 8. BODY MEASUREMENTS
--------------------------------------------------------------------------------
CREATE TABLE public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waist NUMERIC,
  abdomen NUMERIC,
  hips NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------
-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Profiles: Usuário só lê e atualiza o próprio
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Recipes, Exercises, Days, Shopping Lists: Leitura pública
CREATE POLICY "Anyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Anyone can view days" ON public.days FOR SELECT USING (true);
CREATE POLICY "Anyone can view shopping lists" ON public.shopping_lists FOR SELECT USING (true);

-- User Progress: Usuário só lê e atualiza o próprio
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Weight History: Usuário só lê e insere o próprio
CREATE POLICY "Users can view own weight history" ON public.weight_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight history" ON public.weight_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight history" ON public.weight_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight history" ON public.weight_history FOR DELETE USING (auth.uid() = user_id);

-- Body Measurements: Usuário só lê e insere as próprias
CREATE POLICY "Users can view own body measurements" ON public.body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own body measurements" ON public.body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body measurements" ON public.body_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body measurements" ON public.body_measurements FOR DELETE USING (auth.uid() = user_id);


--------------------------------------------------------------------------------
-- SEED INICIAL DE DADOS ESTATICOS
--------------------------------------------------------------------------------
-- As the images were generated dynamically and saved to public/images/

-- 1. Inserir Recipes
WITH inserted_recipes AS (
  INSERT INTO public.recipes (id, name, meal_type, image_url, calories, proteins, carbs, fats, prep_time, ingredients, instructions)
  VALUES 
    -- Dia 1
    (gen_random_uuid(), 'Avena con frutos rojos', 'Desayuno', '/images/avena_frutos_rojos.png', 280, 10, 45, 8, 10, '["40g de avena", "100ml de leche de almendras", "1 puñado de frutos rojos", "Canela al gusto"]'::jsonb, '["Calentar la leche.", "Añadir la avena y cocinar a fuego lento 5 min.", "Servir con frutos rojos y canela."]'::jsonb),
    (gen_random_uuid(), 'Pollo a la plancha con quinoa', 'Almuerzo', '/images/pollo_quinoa.png', 420, 40, 45, 12, 20, '["150g de pechuga de pollo", "50g de quinoa (peso en crudo)", "Ensalada mixta", "1 cda de aceite de oliva"]'::jsonb, '["Hacer el pollo a la plancha.", "Hervir la quinoa por 15 min.", "Servir con la ensalada y el aceite crudo."]'::jsonb),
    (gen_random_uuid(), 'Salmón al horno con espárragos', 'Cena', '/images/salmon_esparragos.png', 350, 35, 10, 18, 25, '["150g de salmón", "1 manojo de espárragos", "Medio limón", "Sal y pimienta"]'::jsonb, '["Precalentar el horno a 200°C.", "Hornear salmón y espárragos por 15-20 min.", "Añadir jugo de limón al sacar."]'::jsonb),
    
    -- Dia 2
    (gen_random_uuid(), 'Huevos revueltos con espinacas', 'Desayuno', '/images/huevos_espinacas.png', 250, 18, 5, 15, 10, '["2 huevos", "1 puñado grande de espinacas", "1 tostada integral"]'::jsonb, '["Saltear espinacas brevemente.", "Añadir huevos batidos.", "Servir con la tostada."]'::jsonb),
    (gen_random_uuid(), 'Ensalada de Atún', 'Almuerzo', '/images/ensalada_atun.png', 380, 30, 20, 15, 15, '["1 lata de atún al natural", "Lechuga y tomate", "1/2 aguacate", "Limón"]'::jsonb, '["Mezclar todos los ingredientes.", "Aliñar con limón y sal."]'::jsonb),
    (gen_random_uuid(), 'Sopa de verduras y pollo', 'Cena', '/images/ensalada_atun.png', 290, 25, 30, 8, 30, '["100g de pollo desmenuzado", "Caldo casero", "Zanahoria, apio, calabacín"]'::jsonb, '["Hervir verduras en el caldo.", "Añadir el pollo desmenuzado.", "Servir caliente."]'::jsonb)
  RETURNING id, name
),

-- 2. Inserir Exercises
inserted_exercises AS (
  INSERT INTO public.exercises (id, name, description, duration, video_url, week)
  VALUES 
    (gen_random_uuid(), 'Caminar 20 minutos', 'A paso ligero. Ideal para activar el metabolismo sin forzar las articulaciones.', 20, '/images/caminar_20.png', 1),
    (gen_random_uuid(), 'Yoga Básico', 'Rutina de estiramientos para mejorar flexibilidad y reducir el estrés.', 15, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120', 1)
  RETURNING id, name
)

-- 3. Inserir Days (Fazendo map com subqueries ou IDs manuais é arriscado em CTE único dependente, 
-- então para manter 100% puro SQL e seguro, inserimos via SELECT cruzando com o RETURNING)
INSERT INTO public.days (day_number, title, mission, tip, water_goal, breakfast_recipe_id, lunch_recipe_id, dinner_recipe_id, exercise_id)
SELECT 
  1, 
  'Día 1', 
  '🚫 Hoy no tomes refrescos', 
  'El primer paso siempre es el más difícil. Estás construyendo la disciplina que te dará resultados.', 
  8,
  (SELECT id FROM inserted_recipes WHERE name = 'Avena con frutos rojos'),
  (SELECT id FROM inserted_recipes WHERE name = 'Pollo a la plancha con quinoa'),
  (SELECT id FROM inserted_recipes WHERE name = 'Salmón al horno con espárragos'),
  (SELECT id FROM inserted_exercises WHERE name = 'Caminar 20 minutos')
UNION ALL
SELECT 
  2, 
  'Día 2', 
  '💧 Beber 1 vaso de agua al despertar', 
  'Un día a la vez. Ya superaste la emoción del primer día, hoy empieza la consistencia.', 
  8,
  (SELECT id FROM inserted_recipes WHERE name = 'Huevos revueltos con espinacas'),
  (SELECT id FROM inserted_recipes WHERE name = 'Ensalada de Atún'),
  (SELECT id FROM inserted_recipes WHERE name = 'Sopa de verduras y pollo'),
  (SELECT id FROM inserted_exercises WHERE name = 'Yoga Básico');
