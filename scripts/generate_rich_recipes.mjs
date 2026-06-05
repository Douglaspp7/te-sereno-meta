import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_KEY = process.env.OPENAI_API_KEY || "";

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateRichContent(recipeName, mealType) {
  const prompt = `Eres un chef nutricionista experto de una app premium de bienestar (estilo Lifesum/Apple Health).
Para la receta "${recipeName}" (${mealType}), genera el contenido estructurado en JSON estricto.

Reglas obligatorias:
1. "description": Texto motivacional y apetitoso (1-2 frases).
2. "ingredients": Un JSON de secciones. Ejemplo: {"Principal": ["..."], "Opcional": ["..."]}. Usa cantidades realistas.
3. "instructions": Array de strings con MÍNIMO 6 pasos detallados y profesionales de preparación.
4. "cooking_tips": Array de 2-3 tips profesionales de cocina.
5. "substitutions": Array de 2-3 sustituciones saludables.
6. "nutritional_benefits": Array de 2-3 beneficios nutricionales.
7. "weight_loss_benefits": Array de 2-3 formas en que ayuda a perder peso.

Tu respuesta DEBE ser ÚNICAMENTE un JSON válido, sin Markdown ni bloques de código, con las llaves principales exactas: description, ingredients, instructions, cooking_tips, substitutions, nutritional_benefits, weight_loss_benefits.`;

  const url = "https://api.openai.com/v1/chat/completions";
  console.log(`Generating rich content for: ${recipeName}...`);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error for ${recipeName}: ${res.status} ${errorText}`);
      await delay(5000);
      return generateRichContent(recipeName, mealType);
    }

    const data = await res.json();
    const content = data.choices[0].message.content.trim();
    // Limpiar markdown residual si existe
    const cleanContent = content.replace(/^```json/g, '').replace(/```$/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (err) {
    console.error(`Error processing ${recipeName}:`, err.message);
    await delay(3000);
    return generateRichContent(recipeName, mealType); // retry
  }
}

async function main() {
  const seedPath = path.join(process.cwd(), 'supabase', '63_recipes_seed.sql');
  const sqlContent = fs.readFileSync(seedPath, 'utf8');
  
  const lines = sqlContent.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Identificar líneas que contienen recetas
    if (line.trim().startsWith('(gen_random_uuid(),')) {
      // Parsear la línea para extraer el nombre y otros campos
      // Formato: (gen_random_uuid(), 'Nombre', 'Tipo', 'url', cal, prot, carb, fat, prep, 'ingredientes'::jsonb, 'instrucciones'::jsonb)
      const parts = line.match(/\(.*?\)|'.*?'|[^,]+/g).map(s => s.trim()).filter(s => s);
      // parts[1] is 'Nombre'
      // parts[2] is 'Tipo'
      
      const recipeName = parts[1].replace(/'/g, '');
      const mealType = parts[2].replace(/'/g, '');
      
      // Encontrar el resto de variables
      const imgUrl = parts[3];
      const cal = parts[4];
      const prot = parts[5];
      const carb = parts[6];
      const fat = parts[7];
      const prep = parts[8];
      
      const richData = await generateRichContent(recipeName, mealType);
      
      const ingredientsJson = JSON.stringify(richData.ingredients).replace(/'/g, "''");
      const instructionsJson = JSON.stringify(richData.instructions).replace(/'/g, "''");
      const description = richData.description.replace(/'/g, "''");
      const cookingTips = JSON.stringify(richData.cooking_tips).replace(/'/g, "''");
      const subs = JSON.stringify(richData.substitutions).replace(/'/g, "''");
      const nutribens = JSON.stringify(richData.nutritional_benefits).replace(/'/g, "''");
      const weightbens = JSON.stringify(richData.weight_loss_benefits).replace(/'/g, "''");
      
      // Construir la nueva línea. 
      // Nota: El INSERT INTO también debe ser actualizado en el archivo SQL final, lo haremos manualmente o al final.
      // Aquí estamos generando la tupla ampliada:
      const newLine = `(gen_random_uuid(), '${recipeName}', '${mealType}', ${imgUrl}, ${cal}, ${prot}, ${carb}, ${fat}, ${prep}, '${ingredientsJson}'::jsonb, '${instructionsJson}'::jsonb, '${description}', '${cookingTips}'::jsonb, '${subs}'::jsonb, '${nutribens}'::jsonb, '${weightbens}'::jsonb)${line.trim().endsWith(',') ? ',' : ';'}`;
      
      newLines.push(newLine);
      await delay(1000); // 1 sec delay entre requests para evitar limits
    } else {
       // Si es el INSERT INTO viejo, lo modificamos
       if (line.includes('INSERT INTO public.recipes (id, name, meal_type, image_url, calories, proteins, carbs, fats, prep_time, ingredients, instructions)')) {
          newLines.push(`INSERT INTO public.recipes (id, name, meal_type, image_url, calories, proteins, carbs, fats, prep_time, ingredients, instructions, description, cooking_tips, substitutions, nutritional_benefits, weight_loss_benefits)`);
       } else {
          newLines.push(line);
       }
    }
  }
  
  const finalSqlPath = path.join(process.cwd(), 'supabase', '63_recipes_seed_rich.sql');
  fs.writeFileSync(finalSqlPath, newLines.join('\n'));
  console.log('✅ 63_recipes_seed_rich.sql generado con éxito.');
}

main().catch(console.error);
