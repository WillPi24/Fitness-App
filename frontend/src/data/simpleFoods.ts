// Curated list of common everyday foods with simple names
// Nutritional values per 100g

export type SimpleFood = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingUnit?: 'g' | 'ml';
};

export const SIMPLE_FOODS: SimpleFood[] = [
  // Chicken
  { name: 'Chicken breast (roasted)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Chicken breast (grilled)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Chicken thigh (roasted)', calories: 209, protein: 26, carbs: 0, fat: 11 },
  { name: 'Chicken drumstick (roasted)', calories: 172, protein: 28, carbs: 0, fat: 6 },
  { name: 'Chicken wing (roasted)', calories: 203, protein: 30, carbs: 0, fat: 8 },
  { name: 'Roast chicken (meat only)', calories: 190, protein: 29, carbs: 0, fat: 8 },

  // Beef
  { name: 'Beef mince 5% fat', calories: 137, protein: 21, carbs: 0, fat: 5 },
  { name: 'Beef mince 10% fat', calories: 176, protein: 20, carbs: 0, fat: 10 },
  { name: 'Beef mince 15% fat', calories: 212, protein: 19, carbs: 0, fat: 15 },
  { name: 'Beef mince 20% fat', calories: 254, protein: 17, carbs: 0, fat: 20 },
  { name: 'Beef steak (sirloin)', calories: 206, protein: 26, carbs: 0, fat: 11 },
  { name: 'Beef steak (ribeye)', calories: 250, protein: 25, carbs: 0, fat: 17 },
  { name: 'Beef steak (fillet)', calories: 196, protein: 28, carbs: 0, fat: 9 },
  { name: 'Roast beef', calories: 176, protein: 27, carbs: 0, fat: 7 },

  // Pork
  { name: 'Pork chop (grilled)', calories: 231, protein: 27, carbs: 0, fat: 13 },
  { name: 'Pork loin (roasted)', calories: 197, protein: 27, carbs: 0, fat: 9 },
  { name: 'Pork mince', calories: 212, protein: 19, carbs: 0, fat: 15 },
  { name: 'Bacon (back, grilled)', calories: 287, protein: 24, carbs: 0, fat: 21 },
  { name: 'Bacon (streaky, grilled)', calories: 382, protein: 20, carbs: 0, fat: 33 },
  { name: 'Ham (sliced)', calories: 120, protein: 18, carbs: 1, fat: 5 },
  { name: 'Pork sausage (grilled)', calories: 294, protein: 14, carbs: 7, fat: 23 },

  // Lamb
  { name: 'Lamb chop (grilled)', calories: 250, protein: 25, carbs: 0, fat: 16 },
  { name: 'Lamb mince', calories: 235, protein: 18, carbs: 0, fat: 18 },
  { name: 'Roast lamb (leg)', calories: 203, protein: 26, carbs: 0, fat: 11 },

  // Turkey
  { name: 'Turkey breast (roasted)', calories: 157, protein: 30, carbs: 0, fat: 3 },
  { name: 'Turkey mince', calories: 148, protein: 20, carbs: 0, fat: 8 },

  // Fish
  { name: 'Salmon fillet (baked)', calories: 208, protein: 25, carbs: 0, fat: 12 },
  { name: 'Salmon fillet (smoked)', calories: 183, protein: 25, carbs: 0, fat: 9 },
  { name: 'Tuna (canned in water)', calories: 108, protein: 25, carbs: 0, fat: 1 },
  { name: 'Tuna (canned in oil)', calories: 190, protein: 26, carbs: 0, fat: 9 },
  { name: 'Tuna steak (grilled)', calories: 132, protein: 29, carbs: 0, fat: 1 },
  { name: 'Cod fillet (baked)', calories: 96, protein: 21, carbs: 0, fat: 1 },
  { name: 'Haddock fillet (baked)', calories: 101, protein: 23, carbs: 0, fat: 1 },
  { name: 'Sea bass (baked)', calories: 124, protein: 24, carbs: 0, fat: 3 },
  { name: 'Prawns (cooked)', calories: 99, protein: 21, carbs: 0, fat: 1 },
  { name: 'Fish fingers (grilled)', calories: 214, protein: 13, carbs: 19, fat: 9 },

  // Eggs
  { name: 'Egg (boiled)', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { name: 'Egg (fried)', calories: 196, protein: 14, carbs: 1, fat: 15 },
  { name: 'Egg (poached)', calories: 143, protein: 12, carbs: 1, fat: 10 },
  { name: 'Egg (scrambled)', calories: 166, protein: 11, carbs: 2, fat: 12 },
  { name: 'Egg white (boiled)', calories: 52, protein: 11, carbs: 1, fat: 0 },
  { name: 'Omelette (plain)', calories: 154, protein: 11, carbs: 1, fat: 12 },

  // Dairy
  { name: 'Milk (whole)', calories: 63, protein: 3, carbs: 5, fat: 4, servingUnit: 'ml' },
  { name: 'Milk (semi-skimmed)', calories: 47, protein: 3, carbs: 5, fat: 2, servingUnit: 'ml' },
  { name: 'Milk (skimmed)', calories: 35, protein: 4, carbs: 5, fat: 0, servingUnit: 'ml' },
  { name: 'Greek yogurt (full fat)', calories: 97, protein: 9, carbs: 4, fat: 5 },
  { name: 'Greek yogurt (0% fat)', calories: 57, protein: 10, carbs: 4, fat: 0 },
  { name: 'Natural yogurt', calories: 79, protein: 5, carbs: 8, fat: 3 },
  { name: 'Cottage cheese', calories: 98, protein: 11, carbs: 3, fat: 4 },
  { name: 'Cheddar cheese', calories: 402, protein: 25, carbs: 1, fat: 33 },
  { name: 'Mozzarella cheese', calories: 280, protein: 28, carbs: 2, fat: 17 },
  { name: 'Parmesan cheese', calories: 431, protein: 38, carbs: 4, fat: 29 },
  { name: 'Feta cheese', calories: 264, protein: 14, carbs: 4, fat: 21 },
  { name: 'Cream cheese', calories: 342, protein: 6, carbs: 4, fat: 34 },
  { name: 'Butter', calories: 717, protein: 1, carbs: 0, fat: 81 },

  // Rice & Grains
  { name: 'White rice (cooked)', calories: 130, protein: 3, carbs: 28, fat: 0 },
  { name: 'Brown rice (cooked)', calories: 123, protein: 3, carbs: 26, fat: 1 },
  { name: 'Basmati rice (cooked)', calories: 121, protein: 3, carbs: 25, fat: 0 },
  { name: 'Quinoa (cooked)', calories: 120, protein: 4, carbs: 21, fat: 2 },
  { name: 'Couscous (cooked)', calories: 112, protein: 4, carbs: 23, fat: 0 },
  { name: 'Bulgur wheat (cooked)', calories: 83, protein: 3, carbs: 19, fat: 0 },

  // Pasta & Noodles
  { name: 'Pasta (cooked)', calories: 131, protein: 5, carbs: 25, fat: 1 },
  { name: 'Spaghetti (cooked)', calories: 131, protein: 5, carbs: 25, fat: 1 },
  { name: 'Penne (cooked)', calories: 131, protein: 5, carbs: 25, fat: 1 },
  { name: 'Egg noodles (cooked)', calories: 138, protein: 5, carbs: 25, fat: 2 },
  { name: 'Rice noodles (cooked)', calories: 109, protein: 1, carbs: 24, fat: 0 },

  // Bread
  { name: 'White bread', calories: 265, protein: 9, carbs: 49, fat: 3 },
  { name: 'Wholemeal bread', calories: 247, protein: 10, carbs: 42, fat: 3 },
  { name: 'Sourdough bread', calories: 256, protein: 9, carbs: 50, fat: 2 },
  { name: 'Pitta bread (white)', calories: 275, protein: 9, carbs: 55, fat: 1 },
  { name: 'Bagel (plain)', calories: 257, protein: 10, carbs: 50, fat: 1 },
  { name: 'Wrap/tortilla', calories: 312, protein: 8, carbs: 52, fat: 8 },
  { name: 'Croissant', calories: 406, protein: 8, carbs: 43, fat: 21 },

  // Potatoes
  { name: 'Potato (boiled)', calories: 87, protein: 2, carbs: 20, fat: 0 },
  { name: 'Potato (baked)', calories: 93, protein: 2, carbs: 21, fat: 0 },
  { name: 'Potato (mashed)', calories: 104, protein: 2, carbs: 15, fat: 4 },
  { name: 'Roast potatoes', calories: 149, protein: 3, carbs: 25, fat: 5 },
  { name: 'Chips/fries (oven)', calories: 164, protein: 3, carbs: 27, fat: 5 },
  { name: 'Chips/fries (fried)', calories: 274, protein: 3, carbs: 36, fat: 14 },
  { name: 'Sweet potato (baked)', calories: 90, protein: 2, carbs: 21, fat: 0 },

  // Vegetables
  { name: 'Broccoli (boiled)', calories: 35, protein: 3, carbs: 4, fat: 0 },
  { name: 'Carrots (boiled)', calories: 35, protein: 1, carbs: 8, fat: 0 },
  { name: 'Peas (boiled)', calories: 84, protein: 5, carbs: 13, fat: 0 },
  { name: 'Green beans (boiled)', calories: 31, protein: 2, carbs: 5, fat: 0 },
  { name: 'Spinach (raw)', calories: 23, protein: 3, carbs: 1, fat: 0 },
  { name: 'Spinach (cooked)', calories: 23, protein: 3, carbs: 1, fat: 0 },
  { name: 'Kale (raw)', calories: 35, protein: 3, carbs: 4, fat: 1 },
  { name: 'Mixed salad leaves', calories: 17, protein: 1, carbs: 2, fat: 0 },
  { name: 'Tomato (raw)', calories: 18, protein: 1, carbs: 3, fat: 0 },
  { name: 'Cucumber (raw)', calories: 15, protein: 1, carbs: 2, fat: 0 },
  { name: 'Peppers (raw)', calories: 26, protein: 1, carbs: 5, fat: 0 },
  { name: 'Onion (raw)', calories: 40, protein: 1, carbs: 9, fat: 0 },
  { name: 'Mushrooms (raw)', calories: 22, protein: 3, carbs: 1, fat: 0 },
  { name: 'Mushrooms (fried)', calories: 157, protein: 3, carbs: 1, fat: 16 },
  { name: 'Courgette/zucchini (raw)', calories: 17, protein: 1, carbs: 2, fat: 0 },
  { name: 'Aubergine/eggplant (raw)', calories: 25, protein: 1, carbs: 3, fat: 0 },
  { name: 'Cauliflower (boiled)', calories: 28, protein: 2, carbs: 3, fat: 0 },
  { name: 'Sweetcorn (canned)', calories: 79, protein: 3, carbs: 15, fat: 1 },
  { name: 'Baked beans', calories: 81, protein: 5, carbs: 12, fat: 0 },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 2, fat: 15 },

  // Fruit
  { name: 'Apple', calories: 52, protein: 0, carbs: 12, fat: 0 },
  { name: 'Banana', calories: 89, protein: 1, carbs: 20, fat: 0 },
  { name: 'Orange', calories: 47, protein: 1, carbs: 10, fat: 0 },
  { name: 'Grapes', calories: 67, protein: 1, carbs: 16, fat: 0 },
  { name: 'Strawberries', calories: 33, protein: 1, carbs: 6, fat: 0 },
  { name: 'Blueberries', calories: 57, protein: 1, carbs: 12, fat: 0 },
  { name: 'Raspberries', calories: 52, protein: 1, carbs: 5, fat: 1 },
  { name: 'Mango', calories: 60, protein: 1, carbs: 13, fat: 0 },
  { name: 'Pineapple', calories: 50, protein: 1, carbs: 11, fat: 0 },
  { name: 'Watermelon', calories: 30, protein: 1, carbs: 7, fat: 0 },
  { name: 'Melon (cantaloupe)', calories: 34, protein: 1, carbs: 7, fat: 0 },
  { name: 'Peach', calories: 39, protein: 1, carbs: 8, fat: 0 },
  { name: 'Pear', calories: 57, protein: 0, carbs: 13, fat: 0 },
  { name: 'Kiwi', calories: 61, protein: 1, carbs: 12, fat: 1 },

  // Nuts & Seeds
  { name: 'Almonds', calories: 579, protein: 21, carbs: 10, fat: 50 },
  { name: 'Walnuts', calories: 654, protein: 15, carbs: 7, fat: 65 },
  { name: 'Cashews', calories: 553, protein: 18, carbs: 23, fat: 44 },
  { name: 'Peanuts', calories: 567, protein: 26, carbs: 10, fat: 49 },
  { name: 'Mixed nuts', calories: 594, protein: 18, carbs: 14, fat: 52 },
  { name: 'Peanut butter', calories: 588, protein: 25, carbs: 14, fat: 50 },
  { name: 'Almond butter', calories: 614, protein: 21, carbs: 12, fat: 56 },
  { name: 'Chia seeds', calories: 486, protein: 17, carbs: 8, fat: 31 },
  { name: 'Flaxseeds', calories: 534, protein: 18, carbs: 3, fat: 42 },
  { name: 'Pumpkin seeds', calories: 559, protein: 30, carbs: 5, fat: 49 },
  { name: 'Sunflower seeds', calories: 584, protein: 21, carbs: 11, fat: 51 },

  // Legumes
  { name: 'Chickpeas (canned)', calories: 119, protein: 7, carbs: 16, fat: 2 },
  { name: 'Lentils (cooked)', calories: 116, protein: 9, carbs: 20, fat: 0 },
  { name: 'Black beans (canned)', calories: 91, protein: 6, carbs: 15, fat: 0 },
  { name: 'Kidney beans (canned)', calories: 81, protein: 6, carbs: 13, fat: 0 },
  { name: 'Edamame (shelled)', calories: 121, protein: 12, carbs: 9, fat: 5 },
  { name: 'Tofu (firm)', calories: 144, protein: 17, carbs: 3, fat: 9 },
  { name: 'Hummus', calories: 166, protein: 8, carbs: 14, fat: 10 },

  // Breakfast
  { name: 'Porridge oats (dry)', calories: 375, protein: 11, carbs: 60, fat: 8 },
  { name: 'Porridge (made with water)', calories: 71, protein: 3, carbs: 12, fat: 2 },
  { name: 'Porridge (made with milk)', calories: 113, protein: 5, carbs: 16, fat: 3 },
  { name: 'Cornflakes', calories: 357, protein: 7, carbs: 84, fat: 1 },
  { name: 'Weetabix', calories: 362, protein: 12, carbs: 69, fat: 2 },
  { name: 'Muesli', calories: 340, protein: 10, carbs: 56, fat: 8 },
  { name: 'Granola', calories: 471, protein: 10, carbs: 53, fat: 24 },

  // Snacks
  { name: 'Protein bar', calories: 350, protein: 20, carbs: 35, fat: 12 },
  { name: 'Rice cakes', calories: 387, protein: 8, carbs: 81, fat: 3 },
  { name: 'Crisps/chips', calories: 536, protein: 6, carbs: 49, fat: 35 },
  { name: 'Dark chocolate (70%+)', calories: 598, protein: 8, carbs: 32, fat: 43 },
  { name: 'Milk chocolate', calories: 535, protein: 8, carbs: 56, fat: 30 },

  // Oils & Dressings
  { name: 'Extra virgin olive oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingUnit: 'ml' },
  { name: 'Olive oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingUnit: 'ml' },
  { name: 'Coconut oil', calories: 862, protein: 0, carbs: 0, fat: 100, servingUnit: 'ml' },
  { name: 'Vegetable oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingUnit: 'ml' },

  // Drinks
  { name: 'Orange juice', calories: 45, protein: 1, carbs: 10, fat: 0, servingUnit: 'ml' },
  { name: 'Apple juice', calories: 46, protein: 0, carbs: 11, fat: 0, servingUnit: 'ml' },
  { name: 'Protein shake (whey)', calories: 120, protein: 24, carbs: 3, fat: 2, servingUnit: 'ml' },
  { name: 'Smoothie (fruit)', calories: 57, protein: 1, carbs: 13, fat: 0, servingUnit: 'ml' },
  { name: 'Oat milk', calories: 43, protein: 1, carbs: 7, fat: 1, servingUnit: 'ml' },
  { name: 'Almond milk', calories: 15, protein: 1, carbs: 0, fat: 1, servingUnit: 'ml' },
  { name: 'Soy milk', calories: 33, protein: 3, carbs: 1, fat: 2, servingUnit: 'ml' },
  { name: 'Coconut milk (carton)', calories: 20, protein: 0, carbs: 1, fat: 2, servingUnit: 'ml' },
  { name: 'Hot chocolate', calories: 77, protein: 3, carbs: 11, fat: 3, servingUnit: 'ml' },

  // Sweeteners & Spreads
  { name: 'Honey', calories: 304, protein: 0, carbs: 82, fat: 0 },
  { name: 'Maple syrup', calories: 260, protein: 0, carbs: 67, fat: 0 },
  { name: 'Golden syrup', calories: 325, protein: 0, carbs: 79, fat: 0 },
  { name: 'Sugar (white)', calories: 387, protein: 0, carbs: 100, fat: 0 },
  { name: 'Sugar (brown)', calories: 380, protein: 0, carbs: 98, fat: 0 },
  { name: 'Jam/jelly', calories: 250, protein: 0, carbs: 63, fat: 0 },
  { name: 'Marmalade', calories: 261, protein: 0, carbs: 65, fat: 0 },
  { name: 'Nutella', calories: 539, protein: 6, carbs: 58, fat: 31 },
  { name: 'Marmite', calories: 252, protein: 39, carbs: 12, fat: 0 },

  // Olives & Pickles
  { name: 'Olives (green)', calories: 145, protein: 1, carbs: 4, fat: 15 },
  { name: 'Olives (black)', calories: 115, protein: 1, carbs: 6, fat: 11 },
  { name: 'Olives (kalamata)', calories: 175, protein: 1, carbs: 3, fat: 17 },
  { name: 'Pickles/gherkins', calories: 12, protein: 0, carbs: 2, fat: 0 },
  { name: 'Sauerkraut', calories: 19, protein: 1, carbs: 3, fat: 0 },
  { name: 'Capers', calories: 23, protein: 2, carbs: 2, fat: 1 },
  { name: 'Sun-dried tomatoes', calories: 258, protein: 14, carbs: 44, fat: 3 },
  { name: 'Jalapeños (pickled)', calories: 28, protein: 1, carbs: 5, fat: 1 },

  // Condiments & Sauces
  { name: 'Mayonnaise', calories: 680, protein: 1, carbs: 1, fat: 75 },
  { name: 'Mayonnaise (light)', calories: 324, protein: 1, carbs: 7, fat: 32 },
  { name: 'Ketchup', calories: 100, protein: 1, carbs: 27, fat: 0 },
  { name: 'Mustard', calories: 66, protein: 4, carbs: 6, fat: 3 },
  { name: 'BBQ sauce', calories: 172, protein: 1, carbs: 40, fat: 0 },
  { name: 'Soy sauce', calories: 53, protein: 8, carbs: 5, fat: 0 },
  { name: 'Hot sauce', calories: 11, protein: 1, carbs: 2, fat: 0 },
  { name: 'Sriracha', calories: 93, protein: 2, carbs: 19, fat: 1 },
  { name: 'Pesto', calories: 418, protein: 10, carbs: 8, fat: 38 },
  { name: 'Salsa', calories: 36, protein: 2, carbs: 7, fat: 0 },
  { name: 'Guacamole', calories: 157, protein: 2, carbs: 8, fat: 14 },
  { name: 'Tzatziki', calories: 85, protein: 4, carbs: 4, fat: 6 },
  { name: 'Vinegar (balsamic)', calories: 88, protein: 0, carbs: 17, fat: 0 },
  { name: 'Vinegar (apple cider)', calories: 21, protein: 0, carbs: 1, fat: 0 },

  // Dried Fruit
  { name: 'Raisins', calories: 299, protein: 3, carbs: 79, fat: 0 },
  { name: 'Dates', calories: 277, protein: 2, carbs: 75, fat: 0 },
  { name: 'Dried apricots', calories: 241, protein: 3, carbs: 63, fat: 0 },
  { name: 'Dried cranberries', calories: 308, protein: 0, carbs: 82, fat: 1 },
  { name: 'Dried mango', calories: 319, protein: 2, carbs: 78, fat: 1 },
  { name: 'Prunes', calories: 240, protein: 2, carbs: 64, fat: 0 },
  { name: 'Dried figs', calories: 249, protein: 3, carbs: 64, fat: 1 },

  // More Seafood
  { name: 'Mackerel (smoked)', calories: 354, protein: 19, carbs: 0, fat: 31 },
  { name: 'Sardines (canned)', calories: 208, protein: 25, carbs: 0, fat: 11 },
  { name: 'Anchovies', calories: 210, protein: 29, carbs: 0, fat: 10 },
  { name: 'Crab meat', calories: 97, protein: 19, carbs: 0, fat: 2 },
  { name: 'Lobster', calories: 89, protein: 19, carbs: 0, fat: 1 },
  { name: 'Mussels (cooked)', calories: 172, protein: 24, carbs: 7, fat: 5 },
  { name: 'Scallops', calories: 111, protein: 21, carbs: 5, fat: 1 },
  { name: 'Squid/calamari', calories: 92, protein: 16, carbs: 3, fat: 1 },

  // More Vegetables
  { name: 'Asparagus', calories: 20, protein: 2, carbs: 2, fat: 0 },
  { name: 'Beetroot (cooked)', calories: 44, protein: 2, carbs: 10, fat: 0 },
  { name: 'Brussels sprouts', calories: 43, protein: 3, carbs: 5, fat: 0 },
  { name: 'Cabbage (raw)', calories: 25, protein: 1, carbs: 4, fat: 0 },
  { name: 'Celery', calories: 14, protein: 1, carbs: 2, fat: 0 },
  { name: 'Leek', calories: 61, protein: 2, carbs: 14, fat: 0 },
  { name: 'Lettuce (iceberg)', calories: 14, protein: 1, carbs: 2, fat: 0 },
  { name: 'Lettuce (romaine)', calories: 17, protein: 1, carbs: 2, fat: 0 },
  { name: 'Radishes', calories: 16, protein: 1, carbs: 2, fat: 0 },
  { name: 'Spring onions', calories: 32, protein: 2, carbs: 5, fat: 0 },
  { name: 'Garlic', calories: 149, protein: 6, carbs: 33, fat: 1 },
  { name: 'Ginger', calories: 80, protein: 2, carbs: 18, fat: 1 },
  { name: 'Chilli pepper', calories: 40, protein: 2, carbs: 9, fat: 0 },
  { name: 'Butternut squash', calories: 45, protein: 1, carbs: 10, fat: 0 },
  { name: 'Coleslaw', calories: 164, protein: 1, carbs: 12, fat: 13 },

  // More Fruit
  { name: 'Cherries', calories: 63, protein: 1, carbs: 13, fat: 0 },
  { name: 'Plum', calories: 46, protein: 1, carbs: 10, fat: 0 },
  { name: 'Apricot', calories: 48, protein: 1, carbs: 9, fat: 0 },
  { name: 'Grapefruit', calories: 42, protein: 1, carbs: 9, fat: 0 },
  { name: 'Lemon', calories: 29, protein: 1, carbs: 6, fat: 0 },
  { name: 'Lime', calories: 30, protein: 1, carbs: 7, fat: 0 },
  { name: 'Passion fruit', calories: 97, protein: 2, carbs: 13, fat: 1 },
  { name: 'Pomegranate', calories: 83, protein: 2, carbs: 19, fat: 1 },
  { name: 'Papaya', calories: 43, protein: 0, carbs: 10, fat: 0 },
  { name: 'Coconut (fresh)', calories: 354, protein: 3, carbs: 6, fat: 33 },
  { name: 'Coconut (desiccated)', calories: 604, protein: 6, carbs: 6, fat: 62 },

  // Ready Meals & Convenience
  { name: 'Pizza (margherita)', calories: 250, protein: 11, carbs: 28, fat: 10 },
  { name: 'Pizza (pepperoni)', calories: 280, protein: 12, carbs: 27, fat: 13 },
  { name: 'Lasagne', calories: 135, protein: 8, carbs: 12, fat: 6 },
  { name: 'Spaghetti bolognese', calories: 115, protein: 7, carbs: 11, fat: 5 },
  { name: 'Chicken curry', calories: 150, protein: 12, carbs: 8, fat: 8 },
  { name: 'Beef stew', calories: 95, protein: 9, carbs: 6, fat: 4 },
  { name: 'Fish and chips', calories: 230, protein: 12, carbs: 22, fat: 11 },
  { name: 'Burger (beef)', calories: 250, protein: 15, carbs: 20, fat: 12 },
  { name: 'Chicken nuggets', calories: 296, protein: 15, carbs: 14, fat: 20 },
  { name: 'Burrito', calories: 206, protein: 9, carbs: 25, fat: 8 },
  { name: 'Sushi (salmon nigiri)', calories: 146, protein: 8, carbs: 21, fat: 3 },
  { name: 'Sushi (california roll)', calories: 140, protein: 6, carbs: 20, fat: 4 },
  { name: 'Spring roll', calories: 154, protein: 5, carbs: 19, fat: 6 },
  { name: 'Falafel', calories: 333, protein: 13, carbs: 32, fat: 18 },
  { name: 'Soup (tomato)', calories: 30, protein: 1, carbs: 5, fat: 1, servingUnit: 'ml' },
  { name: 'Soup (chicken)', calories: 36, protein: 3, carbs: 4, fat: 1, servingUnit: 'ml' },
  { name: 'Soup (vegetable)', calories: 25, protein: 1, carbs: 4, fat: 1, servingUnit: 'ml' },

  // Flour & Baking
  { name: 'Flour (plain)', calories: 364, protein: 10, carbs: 76, fat: 1 },
  { name: 'Flour (self-raising)', calories: 355, protein: 9, carbs: 75, fat: 1 },
  { name: 'Flour (wholemeal)', calories: 340, protein: 13, carbs: 62, fat: 2 },
  { name: 'Cornflour', calories: 381, protein: 0, carbs: 91, fat: 0 },
  { name: 'Cocoa powder', calories: 228, protein: 20, carbs: 14, fat: 14 },
  { name: 'Baking powder', calories: 53, protein: 0, carbs: 28, fat: 0 },

  // More Dairy & Alternatives
  { name: 'Cream (single)', calories: 193, protein: 3, carbs: 4, fat: 19 },
  { name: 'Cream (double)', calories: 449, protein: 2, carbs: 3, fat: 48 },
  { name: 'Cream (soured)', calories: 193, protein: 3, carbs: 4, fat: 19 },
  { name: 'Creme fraiche', calories: 300, protein: 2, carbs: 3, fat: 31 },
  { name: 'Mascarpone', calories: 429, protein: 5, carbs: 4, fat: 44 },
  { name: 'Ricotta', calories: 174, protein: 11, carbs: 3, fat: 13 },
  { name: 'Halloumi', calories: 321, protein: 21, carbs: 3, fat: 25 },
  { name: 'Brie', calories: 334, protein: 21, carbs: 0, fat: 28 },
  { name: 'Camembert', calories: 300, protein: 20, carbs: 0, fat: 24 },
  { name: 'Blue cheese', calories: 353, protein: 21, carbs: 2, fat: 29 },
  { name: 'Goat cheese', calories: 364, protein: 22, carbs: 1, fat: 30 },
  { name: 'Edam', calories: 357, protein: 25, carbs: 1, fat: 28 },
  { name: 'Gouda', calories: 356, protein: 25, carbs: 2, fat: 27 },
  { name: 'Emmental', calories: 380, protein: 29, carbs: 0, fat: 30 },
  { name: 'Cheese slice (processed)', calories: 330, protein: 20, carbs: 5, fat: 26 },

  // More Snacks
  { name: 'Popcorn (plain)', calories: 375, protein: 12, carbs: 63, fat: 4 },
  { name: 'Popcorn (buttered)', calories: 535, protein: 9, carbs: 55, fat: 31 },
  { name: 'Pretzels', calories: 380, protein: 9, carbs: 80, fat: 3 },
  { name: 'Crackers', calories: 440, protein: 10, carbs: 72, fat: 13 },
  { name: 'Digestive biscuit', calories: 478, protein: 7, carbs: 66, fat: 21 },
  { name: 'Hobnob', calories: 478, protein: 7, carbs: 64, fat: 22 },
  { name: 'Shortbread', calories: 502, protein: 6, carbs: 63, fat: 26 },
  { name: 'Flapjack', calories: 453, protein: 6, carbs: 56, fat: 23 },
  { name: 'Brownie', calories: 466, protein: 6, carbs: 50, fat: 29 },
  { name: 'Muffin (blueberry)', calories: 377, protein: 6, carbs: 56, fat: 15 },
  { name: 'Scone', calories: 362, protein: 8, carbs: 49, fat: 15 },
  { name: 'Doughnut', calories: 403, protein: 5, carbs: 51, fat: 20 },
  { name: 'Croissant (chocolate)', calories: 440, protein: 8, carbs: 47, fat: 24 },
  { name: 'Pain au chocolat', calories: 420, protein: 7, carbs: 44, fat: 24 },
  { name: 'Danish pastry', calories: 374, protein: 6, carbs: 45, fat: 19 },
  { name: 'Cereal bar', calories: 400, protein: 5, carbs: 70, fat: 12 },
  { name: 'Trail mix', calories: 462, protein: 14, carbs: 44, fat: 28 },
];
