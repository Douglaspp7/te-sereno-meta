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

  let updatedCount = 0;

  for (const recipe of recipes) {
    // Check if the current image_url exists
    let currentUrlExists = false;
    if (recipe.image_url) {
      const localPath = path.join(process.cwd(), 'public', recipe.image_url);
      if (fs.existsSync(localPath)) {
        currentUrlExists = true;
      }
    }

    if (!currentUrlExists) {
      // The image_url is missing! Does it exist in the recipes folder?
      const fallbackPath = path.join(process.cwd(), 'public', 'images', 'recipes', `${recipe.id}.jpg`);
      if (fs.existsSync(fallbackPath)) {
        const stat = fs.statSync(fallbackPath);
        if (stat.size > 100000) { // Real image
          const newUrl = `/images/recipes/${recipe.id}.jpg`;
          console.log(`Fixing DB for ${recipe.name}: missing ${recipe.image_url}, updating to ${newUrl}`);
          
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ image_url: newUrl })
            .eq('id', recipe.id);
            
          if (updateError) {
            console.error(`Failed to update ${recipe.name}:`, updateError);
          } else {
            updatedCount++;
          }
        } else {
            // Check if there is a png version
            const fallbackPngPath = path.join(process.cwd(), 'public', 'images', 'recipes', `${recipe.id}.png`);
            if (fs.existsSync(fallbackPngPath) && fs.statSync(fallbackPngPath).size > 100000) {
              const newUrl = `/images/recipes/${recipe.id}.png`;
              console.log(`Fixing DB for ${recipe.name}: missing ${recipe.image_url}, updating to ${newUrl}`);
              
              const { error: updateError } = await supabase
                .from('recipes')
                .update({ image_url: newUrl })
                .eq('id', recipe.id);
                
              if (!updateError) updatedCount++;
            }
        }
      }
    }
  }

  console.log(`Finished fixing DB URLs. Updated ${updatedCount} recipes.`);
}

run();
