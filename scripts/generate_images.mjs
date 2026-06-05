import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_KEY = process.env.OPENAI_API_KEY || "";

const recipes = [
  { id: 'desayuno_1', name: 'Avena clásica con frutos rojos' },
  { id: 'desayuno_2', name: 'Huevos revueltos con espinacas' },
  { id: 'desayuno_3', name: 'Tostada de aguacate y huevo' },
  { id: 'desayuno_4', name: 'Batido verde detox proteico' },
  { id: 'desayuno_5', name: 'Yogur griego con nueces' },
  { id: 'desayuno_6', name: 'Pancakes de avena y plátano' },
  { id: 'desayuno_7', name: 'Chía pudding con leche de coco' },
  { id: 'desayuno_8', name: 'Tortilla de claras con pavo' },
  { id: 'desayuno_9', name: 'Tazón de queso cottage y fresas' },
  { id: 'desayuno_10', name: 'Tostada integral con crema de cacahuete' },
  { id: 'desayuno_11', name: 'Huevos duros con tomates cherry' },
  { id: 'desayuno_12', name: 'Avena horneada con manzana' },
  { id: 'desayuno_13', name: 'Batido de frutos rojos y espinaca' },
  { id: 'desayuno_14', name: 'Omelette de champiñones' },
  { id: 'desayuno_15', name: 'Muffins de huevo y verduras' },
  { id: 'desayuno_16', name: 'Porridge de avena y cacao' },
  { id: 'desayuno_17', name: 'Tostada con hummus y tomate' },
  { id: 'desayuno_18', name: 'Wrap integral de pavo y lechuga' },
  { id: 'desayuno_19', name: 'Smoothie bowl de mango' },
  { id: 'desayuno_20', name: 'Huevos revueltos con tomate y albahaca' },
  { id: 'desayuno_21', name: 'Kéfir con trozos de fruta' },
  
  { id: 'almuerzo_1', name: 'Pollo a la plancha con quinoa' },
  { id: 'almuerzo_2', name: 'Ensalada de Atún y aguacate' },
  { id: 'almuerzo_3', name: 'Ternera salteada con brócoli' },
  { id: 'almuerzo_4', name: 'Bowl de lentejas y arroz' },
  { id: 'almuerzo_5', name: 'Pasta integral con pollo y tomate' },
  { id: 'almuerzo_6', name: 'Salmón con batata asada' },
  { id: 'almuerzo_7', name: 'Ensalada de garbanzos' },
  { id: 'almuerzo_8', name: 'Fajitas saludables de pollo' },
  { id: 'almuerzo_9', name: 'Pescado blanco al papillote' },
  { id: 'almuerzo_10', name: 'Guiso ligero de pavo' },
  { id: 'almuerzo_11', name: 'Poke bowl de tofu' },
  { id: 'almuerzo_12', name: 'Berenjena rellena de carne picada' },
  { id: 'almuerzo_13', name: 'Wrap de salmón ahumado' },
  { id: 'almuerzo_14', name: 'Arroz frito saludable de coliflor' },
  { id: 'almuerzo_15', name: 'Albóndigas de pollo en salsa' },
  { id: 'almuerzo_16', name: 'Ensalada César saludable' },
  { id: 'almuerzo_17', name: 'Pimientos rellenos de quinoa' },
  { id: 'almuerzo_18', name: 'Lomo de cerdo con puré de manzana' },
  { id: 'almuerzo_19', name: 'Cazuela de alubias blancas' },
  { id: 'almuerzo_20', name: 'Pechuga pavo con verduras asadas' },
  { id: 'almuerzo_21', name: 'Revuelto de gulas y gambas' },

  { id: 'cena_1', name: 'Salmón al horno con espárragos' },
  { id: 'cena_2', name: 'Sopa de verduras depurativa' },
  { id: 'cena_3', name: 'Tortilla francesa con champiñones' },
  { id: 'cena_4', name: 'Ensalada Caprese' },
  { id: 'cena_5', name: 'Calabacines rellenos de atún' },
  { id: 'cena_6', name: 'Pechuga a la plancha con pepino' },
  { id: 'cena_7', name: 'Crema de calabaza' },
  { id: 'cena_8', name: 'Espaguetis de calabacín con pavo' },
  { id: 'cena_9', name: 'Tartar de salmón y aguacate' },
  { id: 'cena_10', name: 'Ensalada de espinacas y queso fresco' },
  { id: 'cena_11', name: 'Hamburguesa de pollo sin pan' },
  { id: 'cena_12', name: 'Merluza a la romana al horno' },
  { id: 'cena_13', name: 'Gazpacho andaluz' },
  { id: 'cena_14', name: 'Tortilla de calabacín' },
  { id: 'cena_15', name: 'Brochetas de pavo y verduras' },
  { id: 'cena_16', name: 'Ceviche de pescado blanco' },
  { id: 'cena_17', name: 'Guisantes con jamón' },
  { id: 'cena_18', name: 'Cazuela de sepia y gambas' },
  { id: 'cena_19', name: 'Champiñones rellenos de pavo' },
  { id: 'cena_20', name: 'Ensalada tibia de judías verdes' },
  { id: 'cena_21', name: 'Sopa de miso con tofu' }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(recipe, retries = 5) {
  const prompt = `Ultra realistic food photography, ${recipe.name}, healthy meal, premium wellness application aesthetic, natural lighting, photorealistic, 4k. Highly detailed, cinematic light, beautiful plating.`;
  const url = "https://api.openai.com/v1/images/generations";

  console.log(`Generating image for: ${recipe.name}...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!res.ok) {
      if (res.status === 429 && retries > 0) {
         console.log(`Rate limit hit for ${recipe.name}. Waiting 20s...`);
         await delay(20000);
         return generateImage(recipe, retries - 1);
      }
      const errorText = await res.text();
      throw new Error(`API Error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    const imageUrl = data.data[0].url;
    
    console.log(`Downloading image for: ${recipe.name}...`);
    const imgRes = await fetch(imageUrl);
    const buffer = await imgRes.arrayBuffer();
    
    const outputPath = path.join(process.cwd(), 'public', 'images', `r_${recipe.id}.png`);
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`Saved: ${outputPath}`);
    return true;
  } catch (err) {
    console.error(`Error generating image for ${recipe.name}:`, err.message);
    return false;
  }
}

async function updateSql() {
  const sqlPath = path.join(process.cwd(), 'supabase', '63_recipes_seed.sql');
  let sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Replace image paths in SQL. Right now they are e.g. /images/avena_frutos_rojos.png
  // The structure is guaranteed to match the order we used before, but it's safer to just do a string replace per line if we can.
  // Actually, wait, let's just rewrite the SQL file entirely using the base file.
  // The current file has e.g. '/images/avena_frutos_rojos.png'
  // Let's replace the lines matching the names.
  
  for (const recipe of recipes) {
    // Regex to match the tuple containing the recipe name and replace the 4th value (image_url)
    const regex = new RegExp(`(gen_random_uuid\\(\\),\\s*'${recipe.name}',\\s*'[^']+',\\s*')[^']+('.*)`, 'g');
    sqlContent = sqlContent.replace(regex, `$1/images/r_${recipe.id}.png$2`);
  }

  fs.writeFileSync(sqlPath, sqlContent);
  console.log("SQL file updated with new image paths.");
}

async function main() {
  // Concurrency limit to avoid rate limits
  const CONCURRENCY = 3;
  let activePromises = [];
  
  for (let i = 0; i < recipes.length; i++) {
    const p = generateImage(recipes[i]).then(() => {
      activePromises = activePromises.filter(prom => prom !== p);
    });
    activePromises.push(p);
    
    if (activePromises.length >= CONCURRENCY) {
      await Promise.race(activePromises);
    }
    
    // Add small delay to respect RPM limits
    await delay(1000);
  }
  
  await Promise.all(activePromises);
  console.log("All images generated and downloaded!");
  
  await updateSql();
}

main().catch(console.error);
