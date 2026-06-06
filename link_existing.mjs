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
  const recipesDir = path.join(process.cwd(), 'public', 'images', 'recipes');
  if (!fs.existsSync(recipesDir)) return;
  
  const files = fs.readdirSync(recipesDir);
  let count = 0;

  for (const file of files) {
    if (file.endsWith('.jpg')) {
      const id = file.replace('.jpg', '');
      const stat = fs.statSync(path.join(recipesDir, file));
      
      // only link large files (> 100KB)
      if (stat.size > 100000) {
        const urlPath = `/images/recipes/${file}`;
        
        const { error } = await supabase
          .from('recipes')
          .update({ image_url: urlPath })
          .eq('id', id);
          
        if (!error) {
          console.log(`Linked recipe ${id} to ${urlPath}`);
          count++;
        } else {
          console.error(`Failed to link ${id}:`, error);
        }
      }
    }
  }
  
  console.log(`Successfully linked ${count} existing photos!`);
}

run();
