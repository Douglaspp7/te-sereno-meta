-- SEED: 63 Recetas Únicas para MiReto21 AI (21 Desayunos, 21 Almuerzos, 21 Cenas)
-- Idioma: Español | Enfoque: Pérdida de peso saludable (Healthy weight loss)

INSERT INTO public.recipes (id, name, meal_type, image_url, calories, proteins, carbs, fats, prep_time, ingredients, instructions)
VALUES 
--------------------------------------------------------------------------------
-- 21 DESAYUNOS
--------------------------------------------------------------------------------
(gen_random_uuid(), 'Avena clásica con frutos rojos', 'Desayuno', '/images/r_desayuno_1.png', 280, 10, 45, 8, 10, '["40g avena", "100ml leche almendras", "Frutos rojos"]'::jsonb, '["Hervir leche", "Cocinar avena 5 min", "Añadir frutos rojos"]'::jsonb),
(gen_random_uuid(), 'Huevos revueltos con espinacas', 'Desayuno', '/images/r_desayuno_2.png', 250, 18, 5, 15, 10, '["2 huevos", "Espinacas frescas", "1 tostada integral"]'::jsonb, '["Saltear espinacas", "Batir y añadir huevos", "Servir con tostada"]'::jsonb),
(gen_random_uuid(), 'Tostada de aguacate y huevo', 'Desayuno', '/images/r_desayuno_3.png', 320, 15, 20, 20, 5, '["1 rebanada pan integral", "1/2 aguacate", "1 huevo a la plancha"]'::jsonb, '["Tostar el pan", "Untar aguacate", "Colocar el huevo encima"]'::jsonb),
(gen_random_uuid(), 'Batido verde detox proteico', 'Desayuno', '/images/r_desayuno_4.png', 210, 15, 30, 4, 5, '["1 manzana verde", "Espinacas", "Medio scoop proteína", "Agua"]'::jsonb, '["Licuar todos los ingredientes hasta que quede suave"]'::jsonb),
(gen_random_uuid(), 'Yogur griego con nueces', 'Desayuno', '/images/r_desayuno_5.png', 290, 15, 15, 20, 2, '["150g Yogur griego natural", "Nueces picadas", "1 cdta miel"]'::jsonb, '["Servir el yogur", "Añadir nueces y miel por encima"]'::jsonb),
(gen_random_uuid(), 'Pancakes de avena y plátano', 'Desayuno', '/images/r_desayuno_6.png', 310, 12, 45, 8, 15, '["1 plátano", "30g avena", "1 huevo"]'::jsonb, '["Licuar todo", "Hacer los pancakes en sartén antiadherente"]'::jsonb),
(gen_random_uuid(), 'Chía pudding con leche de coco', 'Desayuno', '/images/r_desayuno_7.png', 260, 8, 20, 15, 5, '["3 cdas chía", "150ml leche de coco", "Canela"]'::jsonb, '["Mezclar chía y leche", "Dejar reposar toda la noche"]'::jsonb),
(gen_random_uuid(), 'Tortilla de claras con pavo', 'Desayuno', '/images/r_desayuno_8.png', 200, 25, 5, 8, 10, '["3 claras de huevo", "1 yema", "50g pechuga pavo"]'::jsonb, '["Batir huevos", "Añadir pavo troceado", "Cocinar en sartén"]'::jsonb),
(gen_random_uuid(), 'Tazón de queso cottage y fresas', 'Desayuno', '/images/r_desayuno_9.png', 220, 20, 15, 5, 2, '["150g queso cottage", "Fresas frescas picadas"]'::jsonb, '["Mezclar el queso cottage con las fresas"]'::jsonb),
(gen_random_uuid(), 'Tostada integral con crema de cacahuete', 'Desayuno', '/images/r_desayuno_10.png', 300, 10, 30, 15, 5, '["1 rebanada pan integral", "1 cda crema de cacahuete", "Medio plátano"]'::jsonb, '["Untar la crema en el pan", "Poner rodajas de plátano"]'::jsonb),
(gen_random_uuid(), 'Huevos duros con tomates cherry', 'Desayuno', '/images/r_desayuno_11.png', 240, 14, 10, 14, 12, '["2 huevos", "100g tomates cherry", "Orégano"]'::jsonb, '["Hervir los huevos 10 min", "Servir con tomates cortados"]'::jsonb),
(gen_random_uuid(), 'Avena horneada con manzana', 'Desayuno', '/images/r_desayuno_12.png', 330, 8, 50, 10, 25, '["40g avena", "1/2 manzana picada", "Leche de almendras", "Canela"]'::jsonb, '["Mezclar todo", "Hornear a 180C por 20 min"]'::jsonb),
(gen_random_uuid(), 'Batido de frutos rojos y espinaca', 'Desayuno', '/images/r_desayuno_13.png', 190, 5, 35, 2, 5, '["Frutos rojos congelados", "Espinaca", "Leche de almendras"]'::jsonb, '["Licuar hasta obtener una mezcla homogénea"]'::jsonb),
(gen_random_uuid(), 'Omelette de champiñones', 'Desayuno', '/images/r_desayuno_14.png', 250, 16, 5, 18, 10, '["2 huevos", "Champiñones laminados", "Aceite de oliva"]'::jsonb, '["Saltear champiñones", "Añadir huevos batidos"]'::jsonb),
(gen_random_uuid(), 'Muffins de huevo y verduras', 'Desayuno', '/images/r_desayuno_15.png', 210, 18, 5, 12, 20, '["2 huevos", "Pimientos", "Cebolla picada"]'::jsonb, '["Batir huevos con verduras", "Hornear en moldes de muffin"]'::jsonb),
(gen_random_uuid(), 'Porridge de avena y cacao', 'Desayuno', '/images/r_desayuno_16.png', 290, 10, 45, 8, 10, '["40g avena", "1 cda cacao puro", "Leche vegetal"]'::jsonb, '["Cocinar a fuego lento hasta espesar"]'::jsonb),
(gen_random_uuid(), 'Tostada con hummus y tomate', 'Desayuno', '/images/r_desayuno_17.png', 280, 8, 35, 10, 5, '["Pan integral", "2 cdas hummus", "Rodajas de tomate"]'::jsonb, '["Tostar el pan", "Untar hummus y añadir tomate"]'::jsonb),
(gen_random_uuid(), 'Wrap integral de pavo y lechuga', 'Desayuno', '/images/r_desayuno_18.png', 310, 20, 30, 10, 5, '["1 tortilla integral pequeña", "Pavo en lonchas", "Lechuga"]'::jsonb, '["Enrollar el pavo y la lechuga en la tortilla"]'::jsonb),
(gen_random_uuid(), 'Smoothie bowl de mango', 'Desayuno', '/images/r_desayuno_19.png', 260, 5, 50, 4, 5, '["Mango congelado", "Leche de coco", "Semillas por encima"]'::jsonb, '["Licuar espeso", "Servir en un bol con semillas"]'::jsonb),
(gen_random_uuid(), 'Huevos revueltos con tomate y albahaca', 'Desayuno', '/images/r_desayuno_20.png', 230, 14, 5, 16, 8, '["2 huevos", "Tomate picado", "Albahaca fresca"]'::jsonb, '["Cocinar el tomate brevemente", "Añadir huevos y revolver"]'::jsonb),
(gen_random_uuid(), 'Kéfir con trozos de fruta', 'Desayuno', '/images/r_desayuno_21.png', 210, 10, 30, 5, 2, '["200ml Kéfir", "Fruta de temporada picada"]'::jsonb, '["Servir el kéfir", "Añadir la fruta fresca"]'::jsonb),

--------------------------------------------------------------------------------
-- 21 ALMUERZOS
--------------------------------------------------------------------------------
(gen_random_uuid(), 'Pollo a la plancha con quinoa', 'Almuerzo', '/images/r_almuerzo_1.png', 420, 40, 45, 12, 20, '["150g pechuga pollo", "50g quinoa", "Verduras mixtas"]'::jsonb, '["Hacer el pollo a la plancha", "Hervir quinoa"]'::jsonb),
(gen_random_uuid(), 'Ensalada de Atún y aguacate', 'Almuerzo', '/images/r_almuerzo_2.png', 380, 30, 15, 22, 10, '["1 lata atún natural", "Lechuga", "Medio aguacate"]'::jsonb, '["Mezclar ingredientes", "Aliñar con limón"]'::jsonb),
(gen_random_uuid(), 'Ternera salteada con brócoli', 'Almuerzo', '/images/r_almuerzo_3.png', 450, 45, 10, 25, 20, '["150g ternera magra", "Brócoli", "Salsa soja baja en sodio"]'::jsonb, '["Saltear carne", "Añadir brócoli y un chorrito de soja"]'::jsonb),
(gen_random_uuid(), 'Bowl de lentejas y arroz', 'Almuerzo', '/images/r_almuerzo_4.png', 410, 20, 60, 5, 25, '["100g lentejas", "50g arroz integral", "Zanahoria"]'::jsonb, '["Cocinar legumbres y arroz", "Mezclar en un bowl"]'::jsonb),
(gen_random_uuid(), 'Pasta integral con pollo y tomate', 'Almuerzo', '/images/r_almuerzo_5.png', 430, 35, 50, 8, 20, '["60g pasta integral", "100g pollo", "Salsa tomate natural"]'::jsonb, '["Hervir pasta", "Saltear pollo", "Mezclar con salsa"]'::jsonb),
(gen_random_uuid(), 'Salmón con batata asada', 'Almuerzo', '/images/r_almuerzo_6.png', 460, 35, 40, 18, 30, '["150g salmón", "1 batata pequeña", "Especias"]'::jsonb, '["Hornear la batata y el salmón a 200C"]'::jsonb),
(gen_random_uuid(), 'Ensalada de garbanzos', 'Almuerzo', '/images/r_almuerzo_7.png', 390, 15, 45, 12, 10, '["150g garbanzos cocidos", "Tomate, pepino, cebolla", "Aceite de oliva"]'::jsonb, '["Cortar verduras", "Mezclar con garbanzos y aliñar"]'::jsonb),
(gen_random_uuid(), 'Fajitas saludables de pollo', 'Almuerzo', '/images/r_almuerzo_8.png', 440, 35, 40, 15, 20, '["150g pollo", "Pimientos y cebolla", "2 tortillas integrales pequeñas"]'::jsonb, '["Saltear tiras de pollo y pimiento", "Servir en tortilla"]'::jsonb),
(gen_random_uuid(), 'Pescado blanco al papillote', 'Almuerzo', '/images/r_almuerzo_9.png', 320, 30, 20, 10, 25, '["150g merluza", "Calabacín y zanahoria", "Patata pequeña"]'::jsonb, '["Envolver en papel aluminio", "Hornear por 20 min"]'::jsonb),
(gen_random_uuid(), 'Guiso ligero de pavo', 'Almuerzo', '/images/r_almuerzo_10.png', 380, 35, 25, 12, 30, '["150g pavo en cubos", "Patata, zanahoria, guisantes", "Caldo"]'::jsonb, '["Cocinar a fuego lento hasta ablandar verduras"]'::jsonb),
(gen_random_uuid(), 'Poke bowl de tofu', 'Almuerzo', '/images/r_almuerzo_11.png', 400, 20, 50, 14, 15, '["100g tofu firme", "Arroz integral", "Pepino, edamames"]'::jsonb, '["Marinar tofu", "Montar el bowl con arroz y vegetales"]'::jsonb),
(gen_random_uuid(), 'Berenjena rellena de carne picada', 'Almuerzo', '/images/r_almuerzo_12.png', 410, 35, 15, 20, 40, '["1 berenjena", "100g carne picada magra", "Tomate"]'::jsonb, '["Vaciar berenjena", "Rellenar con carne salteada", "Hornear"]'::jsonb),
(gen_random_uuid(), 'Wrap de salmón ahumado', 'Almuerzo', '/images/r_almuerzo_13.png', 380, 25, 35, 15, 5, '["Tortilla integral", "Salmón ahumado", "Queso crema light", "Espinacas"]'::jsonb, '["Untar queso, añadir salmón y espinacas", "Enrollar"]'::jsonb),
(gen_random_uuid(), 'Arroz frito saludable de coliflor', 'Almuerzo', '/images/r_almuerzo_14.png', 310, 25, 15, 12, 15, '["Coliflor rallada", "Pechuga de pollo", "Huevo", "Guisantes"]'::jsonb, '["Saltear coliflor como arroz", "Añadir pollo y huevo"]'::jsonb),
(gen_random_uuid(), 'Albóndigas de pollo en salsa', 'Almuerzo', '/images/r_almuerzo_15.png', 430, 40, 20, 15, 30, '["Carne picada de pollo", "Tomate triturado", "Cebolla"]'::jsonb, '["Hacer bolitas", "Cocinar en la salsa de tomate"]'::jsonb),
(gen_random_uuid(), 'Ensalada César saludable', 'Almuerzo', '/images/r_almuerzo_16.png', 370, 35, 15, 18, 15, '["Lechuga romana", "Pollo a la plancha", "Yogur (para salsa)"]'::jsonb, '["Mezclar lechuga y pollo", "Aliñar con yogur y especias"]'::jsonb),
(gen_random_uuid(), 'Pimientos rellenos de quinoa', 'Almuerzo', '/images/r_almuerzo_17.png', 350, 15, 45, 8, 35, '["Pimientos asados", "Quinoa cocida", "Maíz y frijoles"]'::jsonb, '["Rellenar pimientos", "Hornear por 20 minutos"]'::jsonb),
(gen_random_uuid(), 'Lomo de cerdo con puré de manzana', 'Almuerzo', '/images/r_almuerzo_18.png', 420, 35, 25, 18, 25, '["150g lomo magro", "1 manzana para puré sin azúcar"]'::jsonb, '["Hacer lomo a la plancha", "Cocinar manzana hasta puré"]'::jsonb),
(gen_random_uuid(), 'Cazuela de alubias blancas', 'Almuerzo', '/images/r_almuerzo_19.png', 390, 20, 50, 6, 20, '["Alubias cocidas", "Espinacas", "Ajo y pimentón"]'::jsonb, '["Hervir a fuego lento con las especias"]'::jsonb),
(gen_random_uuid(), 'Pechuga pavo con verduras asadas', 'Almuerzo', '/images/r_almuerzo_20.png', 360, 35, 20, 10, 25, '["150g pechuga pavo", "Calabaza y pimientos"]'::jsonb, '["Asar las verduras", "Plancha el pavo"]'::jsonb),
(gen_random_uuid(), 'Revuelto de gulas y gambas', 'Almuerzo', '/images/r_almuerzo_21.png', 330, 30, 5, 18, 15, '["Gambas peladas", "Gulas", "2 huevos", "Ajo"]'::jsonb, '["Saltear ajo, gambas y gulas", "Cuajar huevos"]'::jsonb),

--------------------------------------------------------------------------------
-- 21 CENAS
--------------------------------------------------------------------------------
(gen_random_uuid(), 'Salmón al horno con espárragos', 'Cena', '/images/r_cena_1.png', 350, 35, 10, 18, 25, '["150g salmón", "Espárragos trigueros", "Limón"]'::jsonb, '["Hornear a 200C por 20 min"]'::jsonb),
(gen_random_uuid(), 'Sopa de verduras depurativa', 'Cena', '/images/r_cena_2.png', 180, 5, 25, 4, 30, '["Caldo de verduras", "Apio, cebolla, col"]'::jsonb, '["Hervir todo hasta que la verdura esté suave"]'::jsonb),
(gen_random_uuid(), 'Tortilla francesa con champiñones', 'Cena', '/images/r_cena_3.png', 260, 16, 5, 18, 10, '["2 huevos", "Champiñones", "Ajo en polvo"]'::jsonb, '["Batir huevos", "Cuajar en la sartén con champiñones"]'::jsonb),
(gen_random_uuid(), 'Ensalada Caprese', 'Cena', '/images/r_cena_4.png', 310, 15, 10, 22, 5, '["Tomate natural", "Mozzarella fresca", "Albahaca"]'::jsonb, '["Cortar y servir con unas gotas de aceite"]'::jsonb),
(gen_random_uuid(), 'Calabacines rellenos de atún', 'Cena', '/images/r_cena_5.png', 280, 25, 15, 10, 30, '["1 calabacín", "1 lata de atún", "Salsa tomate"]'::jsonb, '["Vaciar calabacín", "Rellenar con mezcla de atún", "Hornear"]'::jsonb),
(gen_random_uuid(), 'Pechuga a la plancha con pepino', 'Cena', '/images/r_cena_6.png', 240, 30, 5, 8, 10, '["120g pollo", "1 pepino en rodajas", "Limón"]'::jsonb, '["Cocinar pechuga", "Acompañar con ensalada de pepino"]'::jsonb),
(gen_random_uuid(), 'Crema de calabaza', 'Cena', '/images/r_cena_7.png', 200, 4, 30, 6, 25, '["Calabaza", "Puerro", "Agua o caldo"]'::jsonb, '["Hervir y licuar hasta textura de crema"]'::jsonb),
(gen_random_uuid(), 'Espaguetis de calabacín con pavo', 'Cena', '/images/r_cena_8.png', 270, 25, 10, 12, 15, '["Calabacín en espiral", "Carne picada pavo", "Tomate"]'::jsonb, '["Saltear el pavo", "Añadir calabacín 2 min antes de servir"]'::jsonb),
(gen_random_uuid(), 'Tartar de salmón y aguacate', 'Cena', '/images/r_cena_9.png', 360, 25, 5, 25, 15, '["100g salmón fresco congelado previo", "1/2 aguacate", "Soja"]'::jsonb, '["Cortar en cubitos", "Macerar con soja y servir"]'::jsonb),
(gen_random_uuid(), 'Ensalada de espinacas y queso fresco', 'Cena', '/images/r_cena_10.png', 230, 15, 5, 15, 5, '["Espinacas", "Queso fresco Burgos", "Nueces"]'::jsonb, '["Mezclar todo en un bol"]'::jsonb),
(gen_random_uuid(), 'Hamburguesa de pollo sin pan', 'Cena', '/images/r_cena_11.png', 290, 35, 10, 12, 15, '["Carne picada de pollo", "Lechuga iceberg (como pan)"]'::jsonb, '["Hacer forma de hamburguesa", "Envolver en lechuga crujiente"]'::jsonb),
(gen_random_uuid(), 'Merluza a la romana al horno', 'Cena', '/images/r_cena_12.png', 280, 25, 15, 10, 20, '["Filete merluza", "Pizca de pan rallado integral", "Huevo"]'::jsonb, '["Empanar ligero", "Hornear para versión sana"]'::jsonb),
(gen_random_uuid(), 'Gazpacho andaluz', 'Cena', '/images/r_cena_13.png', 180, 3, 20, 10, 10, '["Tomates", "Pimiento verde", "Pepino", "Ajo", "Aceite"]'::jsonb, '["Licuar todo muy fino", "Servir muy frío"]'::jsonb),
(gen_random_uuid(), 'Tortilla de calabacín', 'Cena', '/images/r_cena_14.png', 250, 15, 8, 16, 20, '["1/2 calabacín", "2 huevos", "Cebolla"]'::jsonb, '["Pochar calabacín", "Cuajar tortilla"]'::jsonb),
(gen_random_uuid(), 'Brochetas de pavo y verduras', 'Cena', '/images/r_cena_15.png', 260, 30, 10, 8, 20, '["Pavo en dados", "Pimientos y cebolla", "Especias"]'::jsonb, '["Ensartar en palillos", "Asar a la plancha"]'::jsonb),
(gen_random_uuid(), 'Ceviche de pescado blanco', 'Cena', '/images/r_cena_16.png', 220, 30, 10, 5, 20, '["Pescado blanco crudo", "Limón", "Cebolla morada", "Cilantro"]'::jsonb, '["Marinar en limón por 15 min", "Añadir cebolla"]'::jsonb),
(gen_random_uuid(), 'Guisantes con jamón', 'Cena', '/images/r_cena_17.png', 280, 18, 25, 10, 15, '["150g guisantes cocidos", "Taquitos jamón serrano magro"]'::jsonb, '["Saltear jamón", "Añadir guisantes y calentar"]'::jsonb),
(gen_random_uuid(), 'Cazuela de sepia y gambas', 'Cena', '/images/r_cena_18.png', 250, 35, 5, 8, 20, '["Sepia limpia", "Gambas", "Ajo y perejil"]'::jsonb, '["Saltear sepia hasta dorar", "Añadir gambas y ajo"]'::jsonb),
(gen_random_uuid(), 'Champiñones rellenos de pavo', 'Cena', '/images/r_cena_19.png', 210, 20, 8, 10, 25, '["Champiñones grandes", "Pavo picado", "Cebolla"]'::jsonb, '["Vaciar champis", "Rellenar con pavo", "Hornear"]'::jsonb),
(gen_random_uuid(), 'Ensalada tibia de judías verdes', 'Cena', '/images/r_cena_20.png', 240, 12, 15, 14, 15, '["Judías verdes hervidas", "Huevo duro picado", "Aceite"]'::jsonb, '["Hervir judías", "Añadir huevo por encima"]'::jsonb),
(gen_random_uuid(), 'Sopa de miso con tofu', 'Cena', '/images/r_cena_21.png', 160, 12, 10, 6, 10, '["Caldo dashi o agua", "Pasta miso", "Cubitos de tofu firme"]'::jsonb, '["Calentar caldo, disolver miso", "Añadir tofu al apagar fuego"]'::jsonb);
