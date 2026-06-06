import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function run() {
  console.log("Fetching recipes...");
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, name, image_url')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  let copiedCount = 0;

  for (const recipe of recipes) {
    if (!recipe.image_url || recipe.image_url === '/alimentacion_3d.png') continue;

    const expectedLocalPath = path.join(process.cwd(), 'public', recipe.image_url);
    
    // If the expected file doesn't exist, see if we have a real image in the recipes folder
    if (!fs.existsSync(expectedLocalPath)) {
      const fallbackPath = path.join(process.cwd(), 'public', 'images', 'recipes', `${recipe.id}.jpg`);
      if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).size > 100000) {
        console.log(`Copying real image for ${recipe.name} from ${fallbackPath} to ${expectedLocalPath}`);
        fs.copyFileSync(fallbackPath, expectedLocalPath);
        copiedCount++;
      } else {
        const fallbackPngPath = path.join(process.cwd(), 'public', 'images', 'recipes', `${recipe.id}.png`);
        if (fs.existsSync(fallbackPngPath) && fs.statSync(fallbackPngPath).size > 100000) {
          console.log(`Copying real image for ${recipe.name} from ${fallbackPngPath} to ${expectedLocalPath}`);
          fs.copyFileSync(fallbackPngPath, expectedLocalPath);
          copiedCount++;
        }
      }
    }
  }

  console.log(`Finished copying images. Copied ${copiedCount} files.`);
}

run();
