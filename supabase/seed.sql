-- Supabase SEED FILE para MiReto21 AI
-- Importante: Recomenda-se rodar este script em um banco de dados de desenvolvimento ou limpar as tabelas antes.
-- DELETE FROM public.days;
-- DELETE FROM public.recipes;
-- DELETE FROM public.exercises;

--------------------------------------------------------------------------------
-- 1. RECEITAS (Criando UUIDs fixos para facilitar a referência)
--------------------------------------------------------------------------------
INSERT INTO public.recipes (id, name, meal_type, image_url, calories, proteins, carbs, fats, prep_time, ingredients, instructions)
VALUES 
-- Desayunos (1001-1007)
('10000000-0000-0000-0000-000000001001', 'Avena con frutos rojos', 'Desayuno', '/images/avena_frutos_rojos.png', 280, 10, 45, 8, 10, '["40g avena", "100ml leche", "frutos rojos"]'::jsonb, '["Mezclar", "Hervir 5 min"]'::jsonb),
('10000000-0000-0000-0000-000000001002', 'Huevos revueltos con espinacas', 'Desayuno', '/images/huevos_espinacas.png', 250, 18, 5, 15, 10, '["2 huevos", "espinacas", "tostada"]'::jsonb, '["Saltear espinacas", "Añadir huevos"]'::jsonb),
('10000000-0000-0000-0000-000000001003', 'Tostada de aguacate y huevo', 'Desayuno', '/images/huevos_espinacas.png', 320, 15, 20, 20, 5, '["1 pan integral", "1/2 aguacate", "1 huevo"]'::jsonb, '["Tostar pan", "Untar aguacate", "Pon el huevo"]'::jsonb),
('10000000-0000-0000-0000-000000001004', 'Batido verde detox', 'Desayuno', '/images/avena_frutos_rojos.png', 200, 5, 40, 2, 5, '["1 manzana", "espinacas", "limón", "jengibre"]'::jsonb, '["Licuar todo"]'::jsonb),
('10000000-0000-0000-0000-000000001005', 'Yogur griego con nueces', 'Desayuno', '/images/avena_frutos_rojos.png', 290, 15, 15, 20, 2, '["Yogur griego", "nueces", "miel"]'::jsonb, '["Mezclar en un bowl"]'::jsonb),

-- Almuerzos (2001-2007)
('20000000-0000-0000-0000-000000002001', 'Pollo a la plancha con quinoa', 'Almuerzo', '/images/pollo_quinoa.png', 420, 40, 45, 12, 20, '["150g pollo", "50g quinoa", "ensalada"]'::jsonb, '["Cocinar pollo", "Hervir quinoa"]'::jsonb),
('20000000-0000-0000-0000-000000002002', 'Ensalada de Atún', 'Almuerzo', '/images/ensalada_atun.png', 380, 30, 20, 15, 10, '["Atún", "lechuga", "tomate", "aguacate"]'::jsonb, '["Mezclar ingredientes", "Aliñar"]'::jsonb),
('20000000-0000-0000-0000-000000002003', 'Filete de ternera con verduras', 'Almuerzo', '/images/pollo_quinoa.png', 450, 45, 10, 25, 20, '["150g ternera", "brócoli", "zanahoria"]'::jsonb, '["Plancha la carne", "Vaporizar verduras"]'::jsonb),
('20000000-0000-0000-0000-000000002004', 'Bowl de lentejas y arroz', 'Almuerzo', '/images/pollo_quinoa.png', 410, 20, 60, 5, 25, '["100g lentejas", "50g arroz integral"]'::jsonb, '["Cocinar legumbres", "Mezclar"]'::jsonb),

-- Cenas (3001-3007)
('30000000-0000-0000-0000-000000003001', 'Salmón al horno con espárragos', 'Cena', '/images/salmon_esparragos.png', 350, 35, 10, 18, 25, '["150g salmón", "espárragos", "limón"]'::jsonb, '["Hornear a 200C por 20 min"]'::jsonb),
('30000000-0000-0000-0000-000000003002', 'Sopa de verduras y pollo', 'Cena', '/images/ensalada_atun.png', 290, 25, 30, 8, 30, '["Pollo", "caldo", "verduras mixtas"]'::jsonb, '["Hervir todo junto"]'::jsonb),
('30000000-0000-0000-0000-000000003003', 'Tortilla francesa con champiñones', 'Cena', '/images/huevos_espinacas.png', 260, 16, 5, 18, 10, '["2 huevos", "champiñones", "aceite"]'::jsonb, '["Batir huevos", "Saltear y cuajar"]'::jsonb),
('30000000-0000-0000-0000-000000003004', 'Ensalada caprese', 'Cena', '/images/ensalada_atun.png', 310, 15, 10, 22, 5, '["Tomate", "mozzarella fresca", "albahaca"]'::jsonb, '["Cortar y servir con aceite de oliva"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- 2. EXERCISES
--------------------------------------------------------------------------------
INSERT INTO public.exercises (id, name, description, duration, video_url, week)
VALUES
('40000000-0000-0000-0000-000000004001', 'Caminar 20 minutos', 'A paso ligero para activar metabolismo.', 20, '/images/caminar_20.png', 1),
('40000000-0000-0000-0000-000000004002', 'Yoga Básico', 'Estiramientos para mejorar flexibilidad.', 15, '/images/caminar_20.png', 1),
('40000000-0000-0000-0000-000000004003', 'HIIT Principiantes', 'Intervalos cortos de alta intensidad.', 15, '/images/caminar_20.png', 1),
('40000000-0000-0000-0000-000000004004', 'Entrenamiento de Core', 'Fortalecimiento de abdomen y lumbares.', 10, '/images/caminar_20.png', 2),
('40000000-0000-0000-0000-000000004005', 'Cardio sin saltos', 'Rutina cardiovascular de bajo impacto.', 25, '/images/caminar_20.png', 2)
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- 3. THE 21 DAYS CHALLENGE
--------------------------------------------------------------------------------
INSERT INTO public.days (id, day_number, title, mission, tip, water_goal, breakfast_recipe_id, lunch_recipe_id, dinner_recipe_id, exercise_id)
VALUES
-- SEMANA 1
(gen_random_uuid(), 1, 'Día 1: El comienzo', '🚫 Hoy no tomes refrescos azucarados.', 'El primer paso siempre es el más difícil. Estás construyendo la disciplina que te dará resultados.', 8,
  '10000000-0000-0000-0000-000000001001', '20000000-0000-0000-0000-000000002001', '30000000-0000-0000-0000-000000003001', '40000000-0000-0000-0000-000000004001'),

(gen_random_uuid(), 2, 'Día 2: Hidratación vital', '💧 Beber 1 vaso de agua nada más despertar.', 'Un día a la vez. Ya superaste la emoción inicial, hoy empieza la consistencia verdadera.', 8,
  '10000000-0000-0000-0000-000000001002', '20000000-0000-0000-0000-000000002002', '30000000-0000-0000-0000-000000003002', '40000000-0000-0000-0000-000000004002'),

(gen_random_uuid(), 3, 'Día 3: Conciencia plena', '🍽️ Mastica cada bocado al menos 20 veces.', 'Comer despacio permite que tu cerebro registre la saciedad a tiempo.', 8,
  '10000000-0000-0000-0000-000000001003', '20000000-0000-0000-0000-000000002003', '30000000-0000-0000-0000-000000003003', '40000000-0000-0000-0000-000000004001'),

(gen_random_uuid(), 4, 'Día 4: Menos azúcar', '❌ Cero azúcar añadido en el café o té de hoy.', 'Tu paladar se adapta en pocos días. Descubre el sabor real de tus infusiones.', 8,
  '10000000-0000-0000-0000-000000001004', '20000000-0000-0000-0000-000000002004', '30000000-0000-0000-0000-000000003004', '40000000-0000-0000-0000-000000004003'),

(gen_random_uuid(), 5, 'Día 5: Descanso activo', '🧘 Estira por 5 minutos antes de dormir.', 'El buen descanso es cuando tu cuerpo realmente quema grasa y se recupera.', 8,
  '10000000-0000-0000-0000-000000001005', '20000000-0000-0000-0000-000000002001', '30000000-0000-0000-0000-000000003001', '40000000-0000-0000-0000-000000004002'),

(gen_random_uuid(), 6, 'Día 6: Movimiento extra', '🚶 Usa las escaleras en lugar del ascensor.', 'El NEAT (actividad diaria) quema más calorías que tu entrenamiento.', 8,
  '10000000-0000-0000-0000-000000001001', '20000000-0000-0000-0000-000000002002', '30000000-0000-0000-0000-000000003002', '40000000-0000-0000-0000-000000004004'),

(gen_random_uuid(), 7, 'Día 7: Victoria semanal', '📸 Tómate una foto de progreso.', 'Un cuarto del camino recorrido. Celébralo sin usar comida como premio.', 8,
  '10000000-0000-0000-0000-000000001002', '20000000-0000-0000-0000-000000002003', '30000000-0000-0000-0000-000000003003', '40000000-0000-0000-0000-000000004005'),

-- SEMANA 2
(gen_random_uuid(), 8, 'Día 8: Cero fritos', '🚫 Hoy no consumirás nada frito.', 'Los alimentos al horno o plancha conservan mejor sus nutrientes.', 8,
  '10000000-0000-0000-0000-000000001003', '20000000-0000-0000-0000-000000002004', '30000000-0000-0000-0000-000000003004', '40000000-0000-0000-0000-000000004001'),

(gen_random_uuid(), 9, 'Día 9: Más verde', '🥗 Añade una porción extra de vegetales verdes en tu almuerzo.', 'La fibra es tu mejor aliada para mantenerte saciado por horas.', 8,
  '10000000-0000-0000-0000-000000001004', '20000000-0000-0000-0000-000000002001', '30000000-0000-0000-0000-000000003001', '40000000-0000-0000-0000-000000004002'),

(gen_random_uuid(), 10, 'Día 10: Desconexión', '📱 Cena sin pantallas (ni TV, ni móvil).', 'Estar presente mientras comes mejora la digestión radicalmente.', 8,
  '10000000-0000-0000-0000-000000001005', '20000000-0000-0000-0000-000000002002', '30000000-0000-0000-0000-000000003002', '40000000-0000-0000-0000-000000004003'),

(gen_random_uuid(), 11, 'Día 11: Fuerza interior', '💪 Realiza 20 sentadillas extra a lo largo del día.', 'El músculo es el horno donde se quema la grasa corporal.', 8,
  '10000000-0000-0000-0000-000000001001', '20000000-0000-0000-0000-000000002003', '30000000-0000-0000-0000-000000003003', '40000000-0000-0000-0000-000000004004'),

(gen_random_uuid(), 12, 'Día 12: Dulces naturales', '🍎 Si tienes antojo de dulce, come solo fruta entera.', 'Reeducar a tu cuerpo a disfrutar los azúcares naturales es clave.', 8,
  '10000000-0000-0000-0000-000000001002', '20000000-0000-0000-0000-000000002004', '30000000-0000-0000-0000-000000003004', '40000000-0000-0000-0000-000000004005'),

(gen_random_uuid(), 13, 'Día 13: Ayuno nocturno', '🌙 Deja de comer al menos 3 horas antes de dormir.', 'Un estómago ligero asegura un sueño profundo y reparador.', 8,
  '10000000-0000-0000-0000-000000001003', '20000000-0000-0000-0000-000000002001', '30000000-0000-0000-0000-000000003001', '40000000-0000-0000-0000-000000004001'),

(gen_random_uuid(), 14, 'Día 14: Dos semanas!', '👕 Pruébate esa prenda que te quedaba ajustada.', 'El peso es solo un número; la verdadera métrica es cómo te sientes.', 8,
  '10000000-0000-0000-0000-000000001004', '20000000-0000-0000-0000-000000002002', '30000000-0000-0000-0000-000000003002', '40000000-0000-0000-0000-000000004002'),

-- SEMANA 3
(gen_random_uuid(), 15, 'Día 15: Recta final', '📝 Escribe tu "por qué" y léelo en voz alta.', 'La motivación disminuye, pero tu compromiso debe mantenerse intacto.', 8,
  '10000000-0000-0000-0000-000000001005', '20000000-0000-0000-0000-000000002003', '30000000-0000-0000-0000-000000003003', '40000000-0000-0000-0000-000000004003'),

(gen_random_uuid(), 16, 'Día 16: Zero procesados', '🍞 No comas nada que venga en paquete industrial hoy.', 'La comida real no tiene ingredientes, ES el ingrediente.', 8,
  '10000000-0000-0000-0000-000000001001', '20000000-0000-0000-0000-000000002004', '30000000-0000-0000-0000-000000003004', '40000000-0000-0000-0000-000000004004'),

(gen_random_uuid(), 17, 'Día 17: Super hidratación', '💧 Intenta alcanzar los 10 vasos de agua hoy.', 'La sed a veces se disfraza de hambre.', 10,
  '10000000-0000-0000-0000-000000001002', '20000000-0000-0000-0000-000000002001', '30000000-0000-0000-0000-000000003001', '40000000-0000-0000-0000-000000004005'),

(gen_random_uuid(), 18, 'Día 18: Postura correcta', '🧍‍♀ Corrige tu postura cada vez que mires el celular.', 'Una postura erguida activa tu core y te da actitud ganadora.', 8,
  '10000000-0000-0000-0000-000000001003', '20000000-0000-0000-0000-000000002002', '30000000-0000-0000-0000-000000003002', '40000000-0000-0000-0000-000000004001'),

(gen_random_uuid(), 19, 'Día 19: Porciones visuales', '🍽️ Usa un plato más pequeño hoy para engañar a tu cerebro.', 'A menudo comemos con los ojos. Platos más pequeños, mismas sensaciones.', 8,
  '10000000-0000-0000-0000-000000001004', '20000000-0000-0000-0000-000000002003', '30000000-0000-0000-0000-000000003003', '40000000-0000-0000-0000-000000004002'),

(gen_random_uuid(), 20, 'Día 20: Gratitud corporal', '❤️ Agradece a tu cuerpo por aguantar este proceso.', 'Tu cuerpo es el vehículo de tu vida. Trátalo con amor, no con castigo.', 8,
  '10000000-0000-0000-0000-000000001005', '20000000-0000-0000-0000-000000002004', '30000000-0000-0000-0000-000000003004', '40000000-0000-0000-0000-000000004003'),

(gen_random_uuid(), 21, 'Día 21: El nuevo tú', '🎉 Celebra. Has reprogramado tus hábitos.', 'No es el fin del reto, es el primer día de tu nuevo estilo de vida.', 8,
  '10000000-0000-0000-0000-000000001001', '20000000-0000-0000-0000-000000002001', '30000000-0000-0000-0000-000000003001', '40000000-0000-0000-0000-000000004004')
ON CONFLICT (day_number) DO NOTHING;
