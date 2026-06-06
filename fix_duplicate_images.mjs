import fs from 'fs';
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

  const seenUrls = new Set();
  let updatedCount = 0;

  for (const recipe of recipes) {
    if (!recipe.image_url || recipe.image_url === '/alimentacion_3d.png') {
      continue;
    }

    if (seenUrls.has(recipe.image_url)) {
      console.log(`Duplicate URL found for recipe "${recipe.name}": ${recipe.image_url}`);
      const newUrl = `/images/recipes/${recipe.id}.jpg`;
      console.log(`  -> Assigning new unique URL: ${newUrl}`);
      
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
      seenUrls.add(recipe.image_url);
    }
  }

  console.log(`Finished fixing duplicate URLs. Updated ${updatedCount} recipes.`);
}

run();
