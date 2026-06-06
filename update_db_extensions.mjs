import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function main() {
  const { data: recipes, error } = await supabase.from('recipes').select('id, image_url');
  if (error) {
    console.error(error);
    return;
  }

  for (const recipe of recipes) {
    if (recipe.image_url && recipe.image_url.includes('.png')) {
      const newUrl = recipe.image_url.replace('.png', '.webp').replace('.jpg', '.webp');
      console.log(`Updating ${recipe.id}: ${newUrl}`);
      await supabase.from('recipes').update({ image_url: newUrl }).eq('id', recipe.id);
    }
  }
  console.log("DB update complete!");
}

main().catch(console.error);
