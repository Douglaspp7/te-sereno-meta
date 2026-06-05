export type ParsedIngredient = {
  original: string;
  name: string;
  quantity: string;
  category: string;
  mealsUsedIn: { day: number; mealName: string; recipeName: string }[];
};

const CATEGORIES = {
  "Proteínas": ["pollo", "pavo", "res", "carne", "salmón", "pescado", "atún", "huevo", "claras", "cerdo"],
  "Verduras": ["espinaca", "brócoli", "lechuga", "tomate", "cebolla", "ajo", "zanahoria", "pimiento", "calabacín", "espárrago", "aguacate", "pepino", "champiñón"],
  "Frutas": ["manzana", "plátano", "fresa", "arándano", "frutos rojos", "limón", "naranja", "kiwi", "uva", "mango"],
  "Cereales": ["avena", "arroz", "quinoa", "pasta", "pan", "tortilla", "garbanzo", "lenteja", "frijol"],
  "Lácteos": ["leche", "yogur", "queso", "kéfir", "mantequilla"],
  "Snacks & Semillas": ["almendra", "nuez", "chía", "lino", "cacao", "chocolate", "maní"],
};

export function parseIngredients(days: any[]): ParsedIngredient[] {
  const ingredientMap = new Map<string, ParsedIngredient>();

  const getMealData = (mealData: any) => Array.isArray(mealData) ? mealData[0] : mealData;

  days.forEach((day) => {
    const meals = [
      { key: "breakfast", label: "Desayuno", data: getMealData(day.breakfast) },
      { key: "lunch", label: "Almuerzo", data: getMealData(day.lunch) },
      { key: "dinner", label: "Cena", data: getMealData(day.dinner) },
    ];

    meals.forEach((meal) => {
      if (!meal.data || !meal.data.ingredients) return;

      let ingredientsList: string[] = [];
      if (Array.isArray(meal.data.ingredients)) {
        ingredientsList = meal.data.ingredients;
      } else if (typeof meal.data.ingredients === 'object') {
        const obj = meal.data.ingredients;
        if (obj.Principal && Array.isArray(obj.Principal)) ingredientsList.push(...obj.Principal);
        if (obj.Opcional && Array.isArray(obj.Opcional)) ingredientsList.push(...obj.Opcional);
      }

      ingredientsList.forEach((ing: string) => {
        // Clean ingredient string
        const cleanStr = ing.toLowerCase().trim();
        
        // Find category
        let category = "Otros";
        let baseName = cleanStr;

        for (const [cat, keywords] of Object.entries(CATEGORIES)) {
          if (keywords.some((kw) => cleanStr.includes(kw))) {
            category = cat;
            // Use the first matching keyword as the base name to group similar items
            const matchedKw = keywords.find((kw) => cleanStr.includes(kw)) || cleanStr;
            // Capitalize first letter
            baseName = matchedKw.charAt(0).toUpperCase() + matchedKw.slice(1);
            break;
          }
        }

        if (category === "Otros") {
           // Fallback base name logic for "Otros"
           baseName = cleanStr.split(" ").slice(0, 2).join(" ");
           baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        }

        // We group by baseName to consolidate quantities (rough approximation)
        if (ingredientMap.has(baseName)) {
          const existing = ingredientMap.get(baseName)!;
          existing.mealsUsedIn.push({
            day: day.day_number,
            mealName: meal.label,
            recipeName: meal.data.name,
          });
          // Append the original string as a quantity note if it's different
          if (!existing.original.includes(ing)) {
             existing.original += ` + ${ing}`;
          }
        } else {
          ingredientMap.set(baseName, {
            original: ing,
            name: baseName,
            quantity: "", // Will just show the original strings for now
            category,
            mealsUsedIn: [{
              day: day.day_number,
              mealName: meal.label,
              recipeName: meal.data.name,
            }]
          });
        }
      });
    });
  });

  // Convert map to array and sort by category
  return Array.from(ingredientMap.values()).sort((a, b) => {
    if (a.category === b.category) return a.name.localeCompare(b.name);
    return a.category.localeCompare(b.category);
  });
}
