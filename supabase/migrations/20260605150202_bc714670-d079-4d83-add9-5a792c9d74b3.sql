UPDATE public.days SET breakfast_recipe_id = NULL, lunch_recipe_id = NULL, dinner_recipe_id = NULL;
DELETE FROM public.recipes WHERE image_url NOT LIKE '/images/r_%';