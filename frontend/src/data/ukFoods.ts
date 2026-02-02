// UK Food Composition Database (CoFID)
// Source: McCance and Widdowson's Composition of Foods Integrated Dataset 2021
// https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid

export type LocalFood = {
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
};

export const UK_FOODS: LocalFood[] = [
  {
    "name": "Almonds, flaked and ground",
    "protein": 21.1,
    "fat": 55.8,
    "carbs": 6.9,
    "calories": 612
  },
  {
    "name": "Almonds, toasted",
    "protein": 21,
    "fat": 52.5,
    "carbs": 5.9,
    "calories": 579
  },
  {
    "name": "Almonds, whole kernels",
    "protein": 21.2,
    "fat": 49.9,
    "carbs": 5.3,
    "calories": 554
  },
  {
    "name": "Apple juice concentrate, unsweetened, commerical",
    "protein": 0.5,
    "fat": 0.6,
    "carbs": 57.6,
    "calories": 223
  },
  {
    "name": "Apple juice, clear, ambient and chilled",
    "protein": 0.1,
    "fat": 0,
    "carbs": 9.7,
    "calories": 37
  },
  {
    "name": "Apple sauce, homemade",
    "protein": 0.3,
    "fat": 0.2,
    "carbs": 20.2,
    "calories": 79
  },
  {
    "name": "Apples, cooking, baked with sugar, flesh only",
    "protein": 0.2,
    "fat": 0.4,
    "carbs": 17.1,
    "calories": 69
  },
  {
    "name": "Apples, cooking, baked without sugar, flesh only",
    "protein": 0.2,
    "fat": 0.4,
    "carbs": 11.4,
    "calories": 47
  },
  {
    "name": "Apples, cooking, raw, flesh only, peeled",
    "protein": 0.3,
    "fat": 0.3,
    "carbs": 8.9,
    "calories": 37
  },
  {
    "name": "Apples, cooking, stewed with sugar, flesh only",
    "protein": 0.2,
    "fat": 0.3,
    "carbs": 20.8,
    "calories": 81
  },
  {
    "name": "Apples, cooking, stewed without sugar, flesh only",
    "protein": 0.2,
    "fat": 0.3,
    "carbs": 9.7,
    "calories": 40
  },
  {
    "name": "Apples, eating, dried",
    "protein": 2,
    "fat": 0.5,
    "carbs": 60.1,
    "calories": 238
  },
  {
    "name": "Apples, eating, raw, flesh and skin",
    "protein": 0.6,
    "fat": 0.5,
    "carbs": 11.6,
    "calories": 51
  },
  {
    "name": "Apricots, dried, stewed with sugar",
    "protein": 1.9,
    "fat": 0.3,
    "carbs": 22,
    "calories": 92
  },
  {
    "name": "Apricots, dried, stewed without sugar",
    "protein": 2,
    "fat": 0.3,
    "carbs": 17.8,
    "calories": 77
  },
  {
    "name": "Apricots, stewed with sugar",
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 18.3,
    "calories": 72
  },
  {
    "name": "Apricots, stewed without sugar",
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 6.2,
    "calories": 27
  },
  {
    "name": "Aubergine, fried in butter",
    "protein": 1.2,
    "fat": 31.9,
    "carbs": 2.8,
    "calories": 302
  },
  {
    "name": "Aubergine, stuffed with lentils and vegetables",
    "protein": 2,
    "fat": 4.6,
    "carbs": 3.9,
    "calories": 64
  },
  {
    "name": "Aubergine, stuffed with rice",
    "protein": 1.9,
    "fat": 2.1,
    "carbs": 15.9,
    "calories": 86
  },
  {
    "name": "Aubergine, stuffed with vegetables, cheese topping",
    "protein": 5,
    "fat": 9.7,
    "carbs": 3.6,
    "calories": 119
  },
  {
    "name": "Avocado, Fuerte, flesh only",
    "protein": 2.1,
    "fat": 19.3,
    "carbs": 1.9,
    "calories": 189
  },
  {
    "name": "Avocado, Hass, flesh only",
    "protein": 1.8,
    "fat": 17.4,
    "carbs": 1.8,
    "calories": 171
  },
  {
    "name": "Bacon loin steaks, lean, grilled",
    "protein": 28.9,
    "fat": 4.3,
    "carbs": 1.1,
    "calories": 158
  },
  {
    "name": "Bacon rashers, back, dry-cured, grilled",
    "protein": 28.4,
    "fat": 15.9,
    "carbs": 0,
    "calories": 257
  },
  {
    "name": "Bacon rashers, back, dry-fried",
    "protein": 24.2,
    "fat": 22,
    "carbs": 0,
    "calories": 295
  },
  {
    "name": "Bacon rashers, back, fat trimmed, grilled",
    "protein": 25.7,
    "fat": 12.3,
    "carbs": 0,
    "calories": 214
  },
  {
    "name": "Bacon rashers, back, fat trimmed, raw",
    "protein": 18.8,
    "fat": 6.7,
    "carbs": 0,
    "calories": 136
  },
  {
    "name": "Bacon rashers, back, grilled",
    "protein": 23.2,
    "fat": 21.6,
    "carbs": 0,
    "calories": 287
  },
  {
    "name": "Bacon rashers, back, grilled crispy",
    "protein": 36,
    "fat": 18.8,
    "carbs": 0,
    "calories": 313
  },
  {
    "name": "Bacon rashers, back, microwaved",
    "protein": 24.2,
    "fat": 23.3,
    "carbs": 0,
    "calories": 307
  },
  {
    "name": "Bacon rashers, back, raw",
    "protein": 16.5,
    "fat": 16.5,
    "carbs": 0,
    "calories": 215
  },
  {
    "name": "Bacon rashers, back, reduced salt, grilled",
    "protein": 24.1,
    "fat": 20.6,
    "carbs": 0,
    "calories": 282
  },
  {
    "name": "Bacon rashers, back, smoked, grilled",
    "protein": 23.4,
    "fat": 22.1,
    "carbs": 0,
    "calories": 293
  },
  {
    "name": "Bacon rashers, back, sweetcure, grilled",
    "protein": 23.8,
    "fat": 17.4,
    "carbs": 1.6,
    "calories": 258
  },
  {
    "name": "Bacon rashers, back, 'tendersweet', grilled",
    "protein": 26.4,
    "fat": 11.9,
    "carbs": 0,
    "calories": 213
  },
  {
    "name": "Bacon rashers, middle, fried in corn oil",
    "protein": 23.4,
    "fat": 28.5,
    "carbs": 0,
    "calories": 350
  },
  {
    "name": "Bacon rashers, middle, grilled",
    "protein": 24.8,
    "fat": 23.1,
    "carbs": 0,
    "calories": 307
  },
  {
    "name": "Bacon rashers, middle, raw",
    "protein": 15.2,
    "fat": 20,
    "carbs": 0,
    "calories": 241
  },
  {
    "name": "Bacon rashers, streaky, fried in corn oil",
    "protein": 23.8,
    "fat": 26.6,
    "carbs": 0,
    "calories": 335
  },
  {
    "name": "Bacon rashers, streaky, grilled",
    "protein": 23.8,
    "fat": 26.9,
    "carbs": 0,
    "calories": 337
  },
  {
    "name": "Bacon rashers, streaky, raw",
    "protein": 15.8,
    "fat": 23.6,
    "carbs": 0,
    "calories": 276
  },
  {
    "name": "Bacon, fat only, average, cooked",
    "protein": 9.3,
    "fat": 72.8,
    "carbs": 0,
    "calories": 692
  },
  {
    "name": "Bacon, fat only, average, raw",
    "protein": 4.8,
    "fat": 80.9,
    "carbs": 0,
    "calories": 747
  },
  {
    "name": "Baked beans, canned in barbecue sauce",
    "protein": 5.3,
    "fat": 0.4,
    "carbs": 14,
    "calories": 77
  },
  {
    "name": "Baked beans, canned in tomato sauce",
    "protein": 5,
    "fat": 0.5,
    "carbs": 15,
    "calories": 81
  },
  {
    "name": "Baked beans, canned in tomato sauce, reduced sugar, reduced salt",
    "protein": 5,
    "fat": 0.5,
    "carbs": 13.5,
    "calories": 75
  },
  {
    "name": "Baked beans, canned in tomato sauce, with pork sausages",
    "protein": 6,
    "fat": 4.5,
    "carbs": 11,
    "calories": 98
  },
  {
    "name": "Banana bread, homemade",
    "protein": 4.4,
    "fat": 12.4,
    "carbs": 53.9,
    "calories": 331
  },
  {
    "name": "Banana split, homemade",
    "protein": 2.3,
    "fat": 11.8,
    "carbs": 23.9,
    "calories": 205
  },
  {
    "name": "Bananas, flesh only",
    "protein": 1.2,
    "fat": 0.1,
    "carbs": 20.3,
    "calories": 81
  },
  {
    "name": "Barcelona nuts, Kernel only",
    "protein": 10.9,
    "fat": 64,
    "carbs": 5.2,
    "calories": 639
  },
  {
    "name": "Bean loaf, mixed beans, homemade",
    "protein": 6.6,
    "fat": 7.2,
    "carbs": 15.1,
    "calories": 148
  },
  {
    "name": "Beanburger, butter bean, fried in rapeseed oil, homemade",
    "protein": 5.7,
    "fat": 10.6,
    "carbs": 20.2,
    "calories": 194
  },
  {
    "name": "Beans, aduki, whole, dried, boiled in unsalted water",
    "protein": 9.3,
    "fat": 0.2,
    "carbs": 22.5,
    "calories": 123
  },
  {
    "name": "Beans, aduki, whole, dried, raw",
    "protein": 19.9,
    "fat": 0.5,
    "carbs": 50.1,
    "calories": 272
  },
  {
    "name": "Beans, balor, ends trimmed, raw",
    "protein": 2.7,
    "fat": 0.1,
    "carbs": 3,
    "calories": 23
  },
  {
    "name": "Beans, blackeye, whole, dried, boiled in unsalted water",
    "protein": 8.8,
    "fat": 0.7,
    "carbs": 19.9,
    "calories": 116
  },
  {
    "name": "Beans, blackeye, whole, dried, raw",
    "protein": 23.5,
    "fat": 1.6,
    "carbs": 54.1,
    "calories": 311
  },
  {
    "name": "Beans, broad, dried, raw",
    "protein": 26.1,
    "fat": 2.1,
    "carbs": 32.5,
    "calories": 245
  },
  {
    "name": "Beans, broad, whole, boiled in unsalted water",
    "protein": 9,
    "fat": 1,
    "carbs": 12.3,
    "calories": 91
  },
  {
    "name": "Beans, broad, whole, raw",
    "protein": 5.7,
    "fat": 1,
    "carbs": 7.2,
    "calories": 59
  },
  {
    "name": "Beans, butter, canned, re-heated, drained",
    "protein": 5.9,
    "fat": 0.5,
    "carbs": 13,
    "calories": 77
  },
  {
    "name": "Beans, butter, dried, boiled in unsalted water",
    "protein": 8.1,
    "fat": 1.1,
    "carbs": 16.8,
    "calories": 105
  },
  {
    "name": "Beans, butter, dried, raw",
    "protein": 19.1,
    "fat": 1.7,
    "carbs": 52.9,
    "calories": 290
  },
  {
    "name": "Beans, cannellini, canned, re-heated, drained",
    "protein": 7.6,
    "fat": 1.6,
    "carbs": 15.9,
    "calories": 104
  },
  {
    "name": "Beans, chick peas, canned, re-heated, drained",
    "protein": 8.4,
    "fat": 3,
    "carbs": 18.3,
    "calories": 129
  },
  {
    "name": "Beans, chick peas, Kabuli, split, dried, boiled in unsalted water",
    "protein": 7.7,
    "fat": 2,
    "carbs": 17.4,
    "calories": 114
  },
  {
    "name": "Beans, chick peas, Kabuli, split, dried, raw",
    "protein": 22.7,
    "fat": 5.4,
    "carbs": 49.6,
    "calories": 325
  },
  {
    "name": "Beans, chick peas, Kabuli, whole, dried, boiled in unsalted water",
    "protein": 8.4,
    "fat": 3,
    "carbs": 18.3,
    "calories": 129
  },
  {
    "name": "Beans, chick peas, Kabuli, whole, dried, raw",
    "protein": 21.3,
    "fat": 5.4,
    "carbs": 49.6,
    "calories": 320
  },
  {
    "name": "Beans, cluster, raw",
    "protein": 2.6,
    "fat": 0.1,
    "carbs": 3,
    "calories": 23
  },
  {
    "name": "Beans, edamame, frozen, boiled in unsalted water",
    "protein": 12.2,
    "fat": 7.6,
    "carbs": 6.5,
    "calories": 142
  },
  {
    "name": "Beans, green, boiled in unsalted water",
    "protein": 2.1,
    "fat": 0.3,
    "carbs": 4,
    "calories": 26
  },
  {
    "name": "Beans, green, raw",
    "protein": 2.1,
    "fat": 0.4,
    "carbs": 3.1,
    "calories": 24
  },
  {
    "name": "Beans, haricot, canned, re-heated, drained",
    "protein": 7.1,
    "fat": 1,
    "carbs": 15.6,
    "calories": 96
  },
  {
    "name": "Beans, haricot, whole, dried, boiled in unsalted water",
    "protein": 6.6,
    "fat": 0.5,
    "carbs": 17.2,
    "calories": 95
  },
  {
    "name": "Beans, haricot, whole, dried, raw",
    "protein": 21.4,
    "fat": 1.6,
    "carbs": 49.7,
    "calories": 286
  },
  {
    "name": "Beans, mung, dahl, dried, boiled in unsalted water",
    "protein": 7.8,
    "fat": 0.4,
    "carbs": 15.3,
    "calories": 92
  },
  {
    "name": "Beans, mung, dahl, dried, raw",
    "protein": 26.8,
    "fat": 1.1,
    "carbs": 46.3,
    "calories": 291
  },
  {
    "name": "Beans, mung, whole, dried, boiled in unsalted water",
    "protein": 8.6,
    "fat": 0.7,
    "carbs": 15.8,
    "calories": 100
  },
  {
    "name": "Beans, mung, whole, dried, raw",
    "protein": 23.9,
    "fat": 1.1,
    "carbs": 46.3,
    "calories": 279
  },
  {
    "name": "Beans, papri, raw",
    "protein": 5.4,
    "fat": 0.3,
    "carbs": 4.2,
    "calories": 40
  },
  {
    "name": "Beans, pigeon peas, dahl, dried, boiled in unsalted water",
    "protein": 8.7,
    "fat": 0.5,
    "carbs": 21.2,
    "calories": 118
  },
  {
    "name": "Beans, pigeon peas, dahl, dried, raw",
    "protein": 21.8,
    "fat": 1.9,
    "carbs": 58.6,
    "calories": 324
  },
  {
    "name": "Beans, pigeon peas, whole, dried, boiled in unsalted water",
    "protein": 8.5,
    "fat": 0.5,
    "carbs": 21.2,
    "calories": 117
  },
  {
    "name": "Beans, pigeon peas, whole, dried, raw",
    "protein": 20,
    "fat": 1.9,
    "carbs": 58.6,
    "calories": 317
  },
  {
    "name": "Beans, pinto, dried, boiled in unsalted water",
    "protein": 8.9,
    "fat": 0.7,
    "carbs": 23.9,
    "calories": 137
  },
  {
    "name": "Beans, pinto, dried, raw",
    "protein": 21.1,
    "fat": 1.6,
    "carbs": 57.1,
    "calories": 327
  },
  {
    "name": "Beans, pinto, re-fried beans",
    "protein": 6.2,
    "fat": 1.1,
    "carbs": 15.3,
    "calories": 107
  },
  {
    "name": "Beans, red kidney, canned in water, re-heated, drained",
    "protein": 8.6,
    "fat": 1,
    "carbs": 15.1,
    "calories": 100
  },
  {
    "name": "Beans, red kidney, dried, boiled in unsalted water",
    "protein": 8.6,
    "fat": 1,
    "carbs": 15.1,
    "calories": 100
  },
  {
    "name": "Beans, red kidney, dried, raw",
    "protein": 22.1,
    "fat": 1.4,
    "carbs": 44.1,
    "calories": 266
  },
  {
    "name": "Beans, runner, boiled in unsalted water",
    "protein": 1.1,
    "fat": 0.5,
    "carbs": 1.9,
    "calories": 16
  },
  {
    "name": "Beans, runner, raw",
    "protein": 1.6,
    "fat": 0.4,
    "carbs": 3.2,
    "calories": 22
  },
  {
    "name": "Beans, soya, dried, boiled in unsalted water",
    "protein": 14,
    "fat": 7.3,
    "carbs": 5.1,
    "calories": 141
  },
  {
    "name": "Beans, soya, dried, raw",
    "protein": 35.9,
    "fat": 18.6,
    "carbs": 15.8,
    "calories": 370
  },
  {
    "name": "Beans, sword, raw",
    "protein": 2.5,
    "fat": 0.3,
    "carbs": 7.2,
    "calories": 41
  },
  {
    "name": "Beansprouts, mung, boiled in unsalted water",
    "protein": 2.5,
    "fat": 0.5,
    "carbs": 2.8,
    "calories": 25
  },
  {
    "name": "Beansprouts, mung, raw",
    "protein": 2.9,
    "fat": 0.5,
    "carbs": 4,
    "calories": 31
  },
  {
    "name": "Beansprouts, mung, stir-fried in rapeseed oil",
    "protein": 1.9,
    "fat": 6.1,
    "carbs": 2.5,
    "calories": 72
  },
  {
    "name": "Beef bourguignon, homemade",
    "protein": 13.8,
    "fat": 6.2,
    "carbs": 2.5,
    "calories": 140
  },
  {
    "name": "Beef bourguignonne, made with lean beef, homemade",
    "protein": 14.1,
    "fat": 4.2,
    "carbs": 2.5,
    "calories": 105
  },
  {
    "name": "Beef extract",
    "protein": 40.4,
    "fat": 0.6,
    "carbs": 3.2,
    "calories": 179
  },
  {
    "name": "Beef olives, homemade",
    "protein": 13.9,
    "fat": 11,
    "carbs": 1.6,
    "calories": 159
  },
  {
    "name": "Beef steak pudding, homemade",
    "protein": 11.5,
    "fat": 10.2,
    "carbs": 18.7,
    "calories": 207
  },
  {
    "name": "Beef Stroganoff, homemade",
    "protein": 15.3,
    "fat": 11.2,
    "carbs": 2.5,
    "calories": 171
  },
  {
    "name": "Beef Wellington, homemade",
    "protein": 16.3,
    "fat": 25.5,
    "carbs": 16.2,
    "calories": 356
  },
  {
    "name": "Beef, braising steak, braised, lean and fat",
    "protein": 32.9,
    "fat": 12.7,
    "carbs": 0,
    "calories": 246
  },
  {
    "name": "Beef, braising steak, braised, lean only",
    "protein": 34.4,
    "fat": 9.7,
    "carbs": 0,
    "calories": 225
  },
  {
    "name": "Beef, braising steak, raw, lean",
    "protein": 21.8,
    "fat": 5.7,
    "carbs": 0,
    "calories": 139
  },
  {
    "name": "Beef, braising steak, raw, lean and fat",
    "protein": 20.7,
    "fat": 8.6,
    "carbs": 0,
    "calories": 160
  },
  {
    "name": "Beef, braising steak, slow cooked, lean",
    "protein": 31.4,
    "fat": 7.9,
    "carbs": 0,
    "calories": 197
  },
  {
    "name": "Beef, braising steak, slow cooked, lean and fat",
    "protein": 29,
    "fat": 11.2,
    "carbs": 0,
    "calories": 217
  },
  {
    "name": "Beef, brisket, boiled, lean",
    "protein": 31.4,
    "fat": 11,
    "carbs": 0,
    "calories": 225
  },
  {
    "name": "Beef, brisket, boiled, lean and fat",
    "protein": 27.8,
    "fat": 17.4,
    "carbs": 0,
    "calories": 268
  },
  {
    "name": "Beef, brisket, raw, lean",
    "protein": 21.1,
    "fat": 6.1,
    "carbs": 0,
    "calories": 139
  },
  {
    "name": "Beef, brisket, raw, lean and fat",
    "protein": 18.4,
    "fat": 16,
    "carbs": 0,
    "calories": 218
  },
  {
    "name": "Beef, fat, average, cooked",
    "protein": 15.5,
    "fat": 52.3,
    "carbs": 0,
    "calories": 533
  },
  {
    "name": "Beef, fat, average, raw",
    "protein": 18.9,
    "fat": 53.6,
    "carbs": 0,
    "calories": 558
  },
  {
    "name": "Beef, fat, average, raw, extra trimmed",
    "protein": 6.8,
    "fat": 72.2,
    "carbs": 0,
    "calories": 677
  },
  {
    "name": "Beef, fillet steak, fried in corn oil, lean",
    "protein": 28.2,
    "fat": 7.9,
    "carbs": 0,
    "calories": 184
  },
  {
    "name": "Beef, fillet steak, fried in corn oil, lean and fat",
    "protein": 28,
    "fat": 8.9,
    "carbs": 0,
    "calories": 192
  },
  {
    "name": "Beef, fillet steak, from steakhouse, lean",
    "protein": 28.7,
    "fat": 7,
    "carbs": 0,
    "calories": 178
  },
  {
    "name": "Beef, fillet steak, from steakhouse, lean and fat",
    "protein": 28.5,
    "fat": 7.8,
    "carbs": 0,
    "calories": 184
  },
  {
    "name": "Beef, fillet steak, grilled, lean",
    "protein": 29.1,
    "fat": 8,
    "carbs": 0,
    "calories": 188
  },
  {
    "name": "Beef, fillet steak, grilled, lean and fat",
    "protein": 28.7,
    "fat": 9.5,
    "carbs": 0,
    "calories": 200
  },
  {
    "name": "Beef, fillet steak, raw, lean",
    "protein": 21.2,
    "fat": 6.1,
    "carbs": 0,
    "calories": 140
  },
  {
    "name": "Beef, fillet steak, raw, lean and fat",
    "protein": 20.9,
    "fat": 7.9,
    "carbs": 0,
    "calories": 155
  },
  {
    "name": "Beef, flank, pot-roasted, lean",
    "protein": 31.8,
    "fat": 14,
    "carbs": 0,
    "calories": 253
  },
  {
    "name": "Beef, flank, pot-roasted, lean and fat",
    "protein": 27.1,
    "fat": 22.3,
    "carbs": 0,
    "calories": 309
  },
  {
    "name": "Beef, flank, raw, lean",
    "protein": 22.7,
    "fat": 9.3,
    "carbs": 0,
    "calories": 175
  },
  {
    "name": "Beef, flank, raw, lean and fat",
    "protein": 19.7,
    "fat": 20.8,
    "carbs": 0,
    "calories": 266
  },
  {
    "name": "Beef, fore-rib/rib-roast, microwaved, lean",
    "protein": 35,
    "fat": 11.4,
    "carbs": 0,
    "calories": 243
  },
  {
    "name": "Beef, fore-rib/rib-roast, microwaved, lean and fat",
    "protein": 30.4,
    "fat": 20.5,
    "carbs": 0,
    "calories": 306
  },
  {
    "name": "Beef, fore-rib/rib-roast, raw, lean",
    "protein": 21.5,
    "fat": 6.5,
    "carbs": 0,
    "calories": 145
  },
  {
    "name": "Beef, fore-rib/rib-roast, raw, lean and fat",
    "protein": 18.8,
    "fat": 19.8,
    "carbs": 0,
    "calories": 253
  },
  {
    "name": "Beef, fore-rib/rib-roast, roasted, lean",
    "protein": 33.3,
    "fat": 11.4,
    "carbs": 0,
    "calories": 236
  },
  {
    "name": "Beef, fore-rib/rib-roast, roasted, lean and fat",
    "protein": 29.1,
    "fat": 20.4,
    "carbs": 0,
    "calories": 300
  },
  {
    "name": "Beef, lean, average, raw",
    "protein": 22.5,
    "fat": 4.3,
    "carbs": 0,
    "calories": 129
  },
  {
    "name": "Beef, lean, average, raw, extra trimmed",
    "protein": 21.6,
    "fat": 5.1,
    "carbs": 0,
    "calories": 132
  },
  {
    "name": "Beef, mince patties, barbecued",
    "protein": 29.6,
    "fat": 16.2,
    "carbs": 0,
    "calories": 264
  },
  {
    "name": "Beef, mince, extra lean, stewed",
    "protein": 24.7,
    "fat": 4.2,
    "carbs": 0,
    "calories": 137
  },
  {
    "name": "Beef, mince, frozen, stewed",
    "protein": 19.3,
    "fat": 14.1,
    "carbs": 0,
    "calories": 204
  },
  {
    "name": "Beef, mince, microwaved",
    "protein": 26.4,
    "fat": 17.5,
    "carbs": 0,
    "calories": 263
  },
  {
    "name": "Beef, mince, raw",
    "protein": 19.7,
    "fat": 16.2,
    "carbs": 0,
    "calories": 225
  },
  {
    "name": "Beef, mince, raw, extra lean",
    "protein": 21.9,
    "fat": 4.2,
    "carbs": 0,
    "calories": 130
  },
  {
    "name": "Beef, mince, stewed",
    "protein": 10.9,
    "fat": 9.9,
    "carbs": 2.5,
    "calories": 139
  },
  {
    "name": "Beef, mince, stewed",
    "protein": 21.8,
    "fat": 13.5,
    "carbs": 0,
    "calories": 209
  },
  {
    "name": "Beef, mince, with vegetables, stewed",
    "protein": 9.2,
    "fat": 7.2,
    "carbs": 5.7,
    "calories": 122
  },
  {
    "name": "Beef, minced, stewed with onions, extra lean",
    "protein": 12.1,
    "fat": 3.6,
    "carbs": 2.5,
    "calories": 113
  },
  {
    "name": "Beef, rump steak, barbecued, lean",
    "protein": 31.2,
    "fat": 5.7,
    "carbs": 0,
    "calories": 176
  },
  {
    "name": "Beef, rump steak, barbecued, lean and fat",
    "protein": 29.5,
    "fat": 9.4,
    "carbs": 0,
    "calories": 203
  },
  {
    "name": "Beef, rump steak, fried in corn oil, lean and fat",
    "protein": 28.4,
    "fat": 12.7,
    "carbs": 0,
    "calories": 228
  },
  {
    "name": "Beef, rump steak, fried in corn oil, lean only",
    "protein": 30.9,
    "fat": 6.6,
    "carbs": 0,
    "calories": 183
  },
  {
    "name": "Beef, rump steak, from steakhouse, lean and fat",
    "protein": 27.5,
    "fat": 11.4,
    "carbs": 0,
    "calories": 213
  },
  {
    "name": "Beef, rump steak, from steakhouse, lean only",
    "protein": 29.8,
    "fat": 4.7,
    "carbs": 0,
    "calories": 162
  },
  {
    "name": "Beef, rump steak, grilled, lean only",
    "protein": 31,
    "fat": 5.9,
    "carbs": 0,
    "calories": 177
  },
  {
    "name": "Beef, rump steak, raw, lean",
    "protein": 22,
    "fat": 4.1,
    "carbs": 0,
    "calories": 125
  },
  {
    "name": "Beef, rump steak, raw, lean and fat",
    "protein": 20.7,
    "fat": 10.1,
    "carbs": 0,
    "calories": 174
  },
  {
    "name": "Beef, rump steak, strips, stir-fried in corn oil, lean",
    "protein": 32.3,
    "fat": 8.8,
    "carbs": 0,
    "calories": 208
  },
  {
    "name": "Beef, rump steak, strips, stir-fried in corn oil, lean and fat",
    "protein": 29.7,
    "fat": 14.4,
    "carbs": 0,
    "calories": 248
  },
  {
    "name": "Beef, silverside, pot-roasted, lean",
    "protein": 34,
    "fat": 6.3,
    "carbs": 0,
    "calories": 193
  },
  {
    "name": "Beef, silverside, pot-roasted, lean and fat",
    "protein": 31,
    "fat": 13.7,
    "carbs": 0,
    "calories": 247
  },
  {
    "name": "Beef, silverside, raw, lean",
    "protein": 23.8,
    "fat": 4.3,
    "carbs": 0,
    "calories": 134
  },
  {
    "name": "Beef, silverside, raw, lean and fat",
    "protein": 20.4,
    "fat": 14.8,
    "carbs": 0,
    "calories": 215
  },
  {
    "name": "Beef, silverside, salted, boiled, lean",
    "protein": 30.4,
    "fat": 6.9,
    "carbs": 0,
    "calories": 184
  },
  {
    "name": "Beef, silverside, salted, boiled, lean and fat",
    "protein": 27.9,
    "fat": 12.5,
    "carbs": 0,
    "calories": 224
  },
  {
    "name": "Beef, silverside, salted, raw, lean",
    "protein": 19.2,
    "fat": 7,
    "carbs": 0,
    "calories": 140
  },
  {
    "name": "Beef, silverside, salted, raw, lean and fat",
    "protein": 16.3,
    "fat": 18,
    "carbs": 0,
    "calories": 227
  },
  {
    "name": "Beef, sirloin joint, roasted, lean",
    "protein": 32.4,
    "fat": 6.5,
    "carbs": 0,
    "calories": 188
  },
  {
    "name": "Beef, sirloin joint, roasted, lean and fat",
    "protein": 29.8,
    "fat": 12.6,
    "carbs": 0,
    "calories": 233
  },
  {
    "name": "Beef, sirloin steak, fried in corn oil, lean",
    "protein": 28.8,
    "fat": 8.2,
    "carbs": 0,
    "calories": 189
  },
  {
    "name": "Beef, sirloin steak, fried in corn oil, lean and fat",
    "protein": 26.8,
    "fat": 14,
    "carbs": 0,
    "calories": 233
  },
  {
    "name": "Beef, sirloin steak, from steakhouse, lean",
    "protein": 31.5,
    "fat": 5.1,
    "carbs": 0,
    "calories": 172
  },
  {
    "name": "Beef, sirloin steak, from steakhouse, lean and fat",
    "protein": 29.6,
    "fat": 10.7,
    "carbs": 0,
    "calories": 215
  },
  {
    "name": "Beef, sirloin steak, grilled medium-rare, lean",
    "protein": 26.6,
    "fat": 7.7,
    "carbs": 0,
    "calories": 176
  },
  {
    "name": "Beef, sirloin steak, grilled medium-rare, lean and fat",
    "protein": 24.8,
    "fat": 12.6,
    "carbs": 0,
    "calories": 213
  },
  {
    "name": "Beef, sirloin steak, grilled rare, lean",
    "protein": 26.4,
    "fat": 6.7,
    "carbs": 0,
    "calories": 166
  },
  {
    "name": "Beef, sirloin steak, grilled rare, lean and fat",
    "protein": 25.1,
    "fat": 12.8,
    "carbs": 0,
    "calories": 216
  },
  {
    "name": "Beef, sirloin steak, grilled well-done, lean",
    "protein": 33.9,
    "fat": 9.9,
    "carbs": 0,
    "calories": 225
  },
  {
    "name": "Beef, sirloin steak, grilled well-done, lean and fat",
    "protein": 31.8,
    "fat": 14.4,
    "carbs": 0,
    "calories": 257
  },
  {
    "name": "Beef, sirloin steak, raw, lean",
    "protein": 23.5,
    "fat": 4.5,
    "carbs": 0,
    "calories": 135
  },
  {
    "name": "Beef, sirloin steak, raw, lean and fat",
    "protein": 21.6,
    "fat": 12.7,
    "carbs": 0,
    "calories": 201
  },
  {
    "name": "Beef, stewing steak, frozen, stewed, lean",
    "protein": 29.7,
    "fat": 8.5,
    "carbs": 0,
    "calories": 195
  },
  {
    "name": "Beef, stewing steak, frozen, stewed, lean and fat",
    "protein": 26.9,
    "fat": 11.6,
    "carbs": 0,
    "calories": 212
  },
  {
    "name": "Beef, stewing steak, pressure cooked, lean",
    "protein": 35.1,
    "fat": 6.5,
    "carbs": 0,
    "calories": 199
  },
  {
    "name": "Beef, stewing steak, pressure cooked, lean and fat",
    "protein": 34,
    "fat": 9,
    "carbs": 0,
    "calories": 217
  },
  {
    "name": "Beef, stewing steak, raw, lean",
    "protein": 22.6,
    "fat": 3.5,
    "carbs": 0,
    "calories": 122
  },
  {
    "name": "Beef, stewing steak, raw, lean and fat",
    "protein": 22.1,
    "fat": 6.4,
    "carbs": 0,
    "calories": 146
  },
  {
    "name": "Beef, stewing steak, stewed, lean",
    "protein": 32,
    "fat": 6.3,
    "carbs": 0,
    "calories": 185
  },
  {
    "name": "Beef, stewing steak, stewed, lean and fat",
    "protein": 29.2,
    "fat": 9.6,
    "carbs": 0,
    "calories": 203
  },
  {
    "name": "Beef, stir-fried with green peppers, homemade",
    "protein": 11.8,
    "fat": 8,
    "carbs": 6.1,
    "calories": 145
  },
  {
    "name": "Beef, topside, microwaved, lean",
    "protein": 35,
    "fat": 4.6,
    "carbs": 0,
    "calories": 181
  },
  {
    "name": "Beef, topside, microwaved, lean and fat",
    "protein": 32.1,
    "fat": 11.1,
    "carbs": 0,
    "calories": 228
  },
  {
    "name": "Beef, topside, raw, lean",
    "protein": 23,
    "fat": 2.7,
    "carbs": 0,
    "calories": 116
  },
  {
    "name": "Beef, topside, raw, lean and fat",
    "protein": 20.4,
    "fat": 12.9,
    "carbs": 0,
    "calories": 198
  },
  {
    "name": "Beef, topside, roasted medium-rare, lean",
    "protein": 32.2,
    "fat": 5.1,
    "carbs": 0,
    "calories": 175
  },
  {
    "name": "Beef, topside, roasted medium-rare, lean and fat",
    "protein": 29.9,
    "fat": 11.4,
    "carbs": 0,
    "calories": 222
  },
  {
    "name": "Beef, topside, roasted well-done, lean",
    "protein": 36.2,
    "fat": 6.3,
    "carbs": 0,
    "calories": 202
  },
  {
    "name": "Beef, topside, roasted well-done, lean and fat",
    "protein": 32.8,
    "fat": 12.5,
    "carbs": 0,
    "calories": 244
  },
  {
    "name": "Betel nuts",
    "protein": 5.2,
    "fat": 10.2,
    "carbs": 56.7,
    "calories": 339
  },
  {
    "name": "Bhaji, aubergine and potato, homemade",
    "protein": 1.8,
    "fat": 8.8,
    "carbs": 13.4,
    "calories": 135
  },
  {
    "name": "Bhaji, aubergine, pea, potato and cauliflower, homemade",
    "protein": 2.9,
    "fat": 2.5,
    "carbs": 10.7,
    "calories": 72
  },
  {
    "name": "Bhaji, cabbage and pea, with butter ghee, homemade",
    "protein": 3.4,
    "fat": 14.2,
    "carbs": 9.7,
    "calories": 177
  },
  {
    "name": "Bhaji, cabbage and potato, with butter, homemade",
    "protein": 2.7,
    "fat": 5.6,
    "carbs": 9.7,
    "calories": 98
  },
  {
    "name": "Bhaji, cabbage and potato, with rapeseed oil, homemade",
    "protein": 2.2,
    "fat": 7,
    "carbs": 9.1,
    "calories": 106
  },
  {
    "name": "Bhaji, cabbage and potato, with vegetable oil",
    "protein": 2.7,
    "fat": 6.8,
    "carbs": 9.6,
    "calories": 108
  },
  {
    "name": "Bhaji, cabbage and spinach",
    "protein": 3.6,
    "fat": 17.1,
    "carbs": 7.8,
    "calories": 198
  },
  {
    "name": "Bhaji, carrot, potato and pea, with butter, homemade",
    "protein": 2.2,
    "fat": 6.6,
    "carbs": 12.9,
    "calories": 116
  },
  {
    "name": "Bhaji, carrot, potato and pea, with vegetable oil, homemade",
    "protein": 2.1,
    "fat": 7.9,
    "carbs": 12.9,
    "calories": 128
  },
  {
    "name": "Bhaji, cauliflower and potato, homemade",
    "protein": 3.3,
    "fat": 6.8,
    "carbs": 10.1,
    "calories": 106
  },
  {
    "name": "Bhaji, cauliflower, potato and pea, with butter",
    "protein": 3.5,
    "fat": 11.3,
    "carbs": 8.2,
    "calories": 145
  },
  {
    "name": "Bhaji, cauliflower, potato and pea, with vegetable oil",
    "protein": 3.4,
    "fat": 13.7,
    "carbs": 8.2,
    "calories": 166
  },
  {
    "name": "Bhaji, karela, with butter ghee, homemade",
    "protein": 1.8,
    "fat": 10.6,
    "carbs": 1.2,
    "calories": 103
  },
  {
    "name": "Bhaji, mustard leaves and spinach, homemade",
    "protein": 3.1,
    "fat": 6.5,
    "carbs": 3.8,
    "calories": 84
  },
  {
    "name": "Bhaji, okra, Bangladeshi, with butter ghee, homemade",
    "protein": 2.4,
    "fat": 6.2,
    "carbs": 7.7,
    "calories": 97
  },
  {
    "name": "Bhaji, potato and fenugreek leaves, homemade",
    "protein": 3.7,
    "fat": 15.9,
    "carbs": 18.8,
    "calories": 222
  },
  {
    "name": "Bhaji, potato and green pepper, homemade",
    "protein": 1.5,
    "fat": 9,
    "carbs": 12.7,
    "calories": 134
  },
  {
    "name": "Bhaji, potato and onion, homemade",
    "protein": 2.1,
    "fat": 10.1,
    "carbs": 16.7,
    "calories": 162
  },
  {
    "name": "Bhaji, potato, onion and mushroom, homemade",
    "protein": 1.7,
    "fat": 17.3,
    "carbs": 12.1,
    "calories": 211
  },
  {
    "name": "Bhaji, potato, spinach and cauliflower, homemade",
    "protein": 2.2,
    "fat": 15.1,
    "carbs": 7.1,
    "calories": 169
  },
  {
    "name": "Bhaji, potato, with butter ghee, homemade",
    "protein": 2.2,
    "fat": 9.8,
    "carbs": 16.6,
    "calories": 161
  },
  {
    "name": "Bhaji, potato, with vegetable oil, homemade",
    "protein": 2.2,
    "fat": 10,
    "carbs": 16.6,
    "calories": 161
  },
  {
    "name": "Bhaji, spinach and potato, homemade",
    "protein": 3.6,
    "fat": 14.1,
    "carbs": 13.4,
    "calories": 192
  },
  {
    "name": "Bhaji, spinach, homemade",
    "protein": 3.3,
    "fat": 6.9,
    "carbs": 2.5,
    "calories": 83
  },
  {
    "name": "Bhaji, vegetable, Punjabi, with butter",
    "protein": 3.5,
    "fat": 7.2,
    "carbs": 8.2,
    "calories": 108
  },
  {
    "name": "Bhaji, vegetable, with butter, homemade",
    "protein": 1.9,
    "fat": 15.3,
    "carbs": 10.3,
    "calories": 185
  },
  {
    "name": "Biryani, chicken, takeaway",
    "protein": 8.5,
    "fat": 7.4,
    "carbs": 16.6,
    "calories": 163
  },
  {
    "name": "Biscuits, cheese flavoured",
    "protein": 10.5,
    "fat": 28.1,
    "carbs": 53.2,
    "calories": 494
  },
  {
    "name": "Biscuits, digestive, with oats, plain",
    "protein": 6.4,
    "fat": 22.9,
    "carbs": 66.4,
    "calories": 480
  },
  {
    "name": "Biscuits, ginger nuts",
    "protein": 4.8,
    "fat": 15.7,
    "carbs": 75.3,
    "calories": 443
  },
  {
    "name": "Blackberries, raw",
    "protein": 1.1,
    "fat": 0.2,
    "carbs": 5.6,
    "calories": 27
  },
  {
    "name": "Blackberries, stewed with sugar",
    "protein": 0.7,
    "fat": 0.2,
    "carbs": 13.8,
    "calories": 56
  },
  {
    "name": "Blackberries, stewed without sugar",
    "protein": 0.8,
    "fat": 0.2,
    "carbs": 4.4,
    "calories": 21
  },
  {
    "name": "Blackberry and apple, stewed with sugar",
    "protein": 0.4,
    "fat": 0.2,
    "carbs": 15.8,
    "calories": 63
  },
  {
    "name": "Blackberry and apple, stewed without sugar",
    "protein": 0.5,
    "fat": 0.2,
    "carbs": 6.4,
    "calories": 28
  },
  {
    "name": "Blackcurrants, stewed with sugar",
    "protein": 0.7,
    "fat": 0,
    "carbs": 15,
    "calories": 58
  },
  {
    "name": "Blackcurrants, stewed without sugar",
    "protein": 0.8,
    "fat": 0,
    "carbs": 5.6,
    "calories": 24
  },
  {
    "name": "Blueberries",
    "protein": 0.9,
    "fat": 0.2,
    "carbs": 9.1,
    "calories": 40
  },
  {
    "name": "Bolognese sauce (with meat), made with extra lean minced beef, homemade",
    "protein": 13,
    "fat": 4.9,
    "carbs": 2.8,
    "calories": 108
  },
  {
    "name": "Brain, lamb, boiled",
    "protein": 11.6,
    "fat": 8.8,
    "carbs": 0,
    "calories": 126
  },
  {
    "name": "Brazil nuts, kernel only",
    "protein": 14.3,
    "fat": 68.2,
    "carbs": 3.1,
    "calories": 683
  },
  {
    "name": "Bread pudding, homemade",
    "protein": 5.9,
    "fat": 7.7,
    "carbs": 48,
    "calories": 289
  },
  {
    "name": "Bread rolls, brown, crusty",
    "protein": 10.3,
    "fat": 2.8,
    "carbs": 50.4,
    "calories": 255
  },
  {
    "name": "Bread rolls, brown, soft",
    "protein": 9.9,
    "fat": 3.2,
    "carbs": 44.8,
    "calories": 236
  },
  {
    "name": "Bread rolls, malted wheat",
    "protein": 10,
    "fat": 4.2,
    "carbs": 42.7,
    "calories": 238
  },
  {
    "name": "Bread rolls, white, crusty",
    "protein": 9.2,
    "fat": 2.2,
    "carbs": 54.9,
    "calories": 262
  },
  {
    "name": "Bread rolls, white, soft",
    "protein": 9.3,
    "fat": 2.6,
    "carbs": 51.5,
    "calories": 254
  },
  {
    "name": "Bread rolls, wholemeal",
    "protein": 10.4,
    "fat": 3.3,
    "carbs": 46.1,
    "calories": 244
  },
  {
    "name": "Bread sauce, made with semi-skimmed milk, HOMEMADE",
    "protein": 4,
    "fat": 2.5,
    "carbs": 15.6,
    "calories": 97
  },
  {
    "name": "Bread sauce, made with skimmed milk, homemade",
    "protein": 4.2,
    "fat": 1.4,
    "carbs": 15.5,
    "calories": 88
  },
  {
    "name": "Bread sauce, made with whole milk, homemade",
    "protein": 4.1,
    "fat": 3.7,
    "carbs": 15.4,
    "calories": 108
  },
  {
    "name": "Bread, brown, average",
    "protein": 7.9,
    "fat": 2,
    "carbs": 42.1,
    "calories": 207
  },
  {
    "name": "Bread, brown, toasted",
    "protein": 10.1,
    "fat": 2.6,
    "carbs": 54,
    "calories": 266
  },
  {
    "name": "Bread, ciabatta",
    "protein": 10.2,
    "fat": 3.9,
    "carbs": 52,
    "calories": 271
  },
  {
    "name": "Bread, garlic and herb, retail",
    "protein": 7,
    "fat": 16.7,
    "carbs": 45.1,
    "calories": 348
  },
  {
    "name": "Bread, malt, fruited",
    "protein": 7.8,
    "fat": 2.3,
    "carbs": 64.9,
    "calories": 295
  },
  {
    "name": "Bread, malted wheat",
    "protein": 9.6,
    "fat": 2.3,
    "carbs": 47.4,
    "calories": 237
  },
  {
    "name": "Bread, naan, peshwari naan, takeaway and retail",
    "protein": 7.6,
    "fat": 7.9,
    "carbs": 39.8,
    "calories": 251
  },
  {
    "name": "Bread, naan, retail",
    "protein": 7.8,
    "fat": 7.3,
    "carbs": 50.2,
    "calories": 285
  },
  {
    "name": "Bread, pitta, white",
    "protein": 9.1,
    "fat": 1.3,
    "carbs": 55.1,
    "calories": 255
  },
  {
    "name": "Bread, seeded",
    "protein": 9.9,
    "fat": 7.4,
    "carbs": 43.8,
    "calories": 270
  },
  {
    "name": "Bread, soda, made with white flour, homemade",
    "protein": 7.6,
    "fat": 1.6,
    "carbs": 57.3,
    "calories": 261
  },
  {
    "name": "Bread, wheatgerm",
    "protein": 11.1,
    "fat": 3.1,
    "carbs": 39.5,
    "calories": 220
  },
  {
    "name": "Bread, white, average",
    "protein": 8.7,
    "fat": 2.1,
    "carbs": 48.7,
    "calories": 236
  },
  {
    "name": "Bread, white, crusty bloomer, unsliced, fresh, large",
    "protein": 9.2,
    "fat": 1.6,
    "carbs": 52.3,
    "calories": 247
  },
  {
    "name": "Bread, white, Danish style",
    "protein": 9.1,
    "fat": 2.7,
    "carbs": 44.5,
    "calories": 228
  },
  {
    "name": "Bread, white, farmhouse or split tin",
    "protein": 9,
    "fat": 2,
    "carbs": 49.9,
    "calories": 241
  },
  {
    "name": "Bread, white, French stick",
    "protein": 9,
    "fat": 1.9,
    "carbs": 56.1,
    "calories": 263
  },
  {
    "name": "Bread, white, premium",
    "protein": 8.3,
    "fat": 2.3,
    "carbs": 47,
    "calories": 230
  },
  {
    "name": "Bread, white, sliced",
    "protein": 7.9,
    "fat": 1.6,
    "carbs": 46.1,
    "calories": 219
  },
  {
    "name": "Bread, white, sliced, fried in rapeseed oil",
    "protein": 8.1,
    "fat": 32.2,
    "carbs": 46.8,
    "calories": 498
  },
  {
    "name": "Bread, white, toasted",
    "protein": 9.7,
    "fat": 2,
    "carbs": 56.2,
    "calories": 267
  },
  {
    "name": "Bread, white, 'with added fibre'",
    "protein": 8.7,
    "fat": 2.2,
    "carbs": 45.1,
    "calories": 224
  },
  {
    "name": "Bread, white, 'with added fibre', toasted",
    "protein": 10.4,
    "fat": 2.6,
    "carbs": 53.7,
    "calories": 266
  },
  {
    "name": "Bread, wholemeal, average",
    "protein": 9.4,
    "fat": 2.5,
    "carbs": 42,
    "calories": 217
  },
  {
    "name": "Bread, wholemeal, toasted",
    "protein": 11.2,
    "fat": 2.9,
    "carbs": 49.2,
    "calories": 255
  },
  {
    "name": "Breadfruit, boiled in unsalted water",
    "protein": 1.6,
    "fat": 0.4,
    "carbs": 29,
    "calories": 119
  },
  {
    "name": "Breadfruit, raw",
    "protein": 1.3,
    "fat": 0.3,
    "carbs": 23.1,
    "calories": 95
  },
  {
    "name": "Breadnut seeds, dried",
    "protein": 8.6,
    "fat": 1.7,
    "carbs": 73.8,
    "calories": 367
  },
  {
    "name": "Breadsticks, plain",
    "protein": 10.9,
    "fat": 8.1,
    "carbs": 72.9,
    "calories": 389
  },
  {
    "name": "Breakfast cereal, bran flakes, fortified",
    "protein": 9.6,
    "fat": 2.2,
    "carbs": 73.3,
    "calories": 333
  },
  {
    "name": "Breakfast cereal, bran type cereal, fortified",
    "protein": 12.4,
    "fat": 3.4,
    "carbs": 49.7,
    "calories": 267
  },
  {
    "name": "Breakfast cereal, cornflakes, crunchy / honey nut coated, fortified",
    "protein": 5.3,
    "fat": 4.2,
    "carbs": 86.6,
    "calories": 384
  },
  {
    "name": "Breakfast cereal, cornflakes, fortified",
    "protein": 7.1,
    "fat": 0.8,
    "carbs": 90.9,
    "calories": 376
  },
  {
    "name": "Breakfast cereal, cornflakes, frosted, fortified",
    "protein": 4.7,
    "fat": 0.5,
    "carbs": 87,
    "calories": 350
  },
  {
    "name": "Breakfast cereal, cornflakes, unfortified",
    "protein": 7.1,
    "fat": 0.8,
    "carbs": 91.4,
    "calories": 378
  },
  {
    "name": "Breakfast cereal, crunchy clusters type, without nuts, unfortified",
    "protein": 7.2,
    "fat": 11.6,
    "carbs": 71,
    "calories": 399
  },
  {
    "name": "Breakfast cereal, crunchy/crispy muesli type cereal, with nuts, unfortified",
    "protein": 8.4,
    "fat": 20.5,
    "carbs": 61.9,
    "calories": 450
  },
  {
    "name": "Breakfast cereal, fruit and fibre type, fortified",
    "protein": 8,
    "fat": 5.8,
    "carbs": 70.3,
    "calories": 348
  },
  {
    "name": "Breakfast cereal, honey loops and hoops, including Honey and Nut Cheerios, fortified",
    "protein": 6.6,
    "fat": 3.1,
    "carbs": 78.7,
    "calories": 349
  },
  {
    "name": "Breakfast cereal, instant hot oat, plain, raw, fortified",
    "protein": 11,
    "fat": 7.3,
    "carbs": 64.6,
    "calories": 352
  },
  {
    "name": "Breakfast cereal, malted flake, fortified",
    "protein": 11.8,
    "fat": 1.4,
    "carbs": 83.4,
    "calories": 373
  },
  {
    "name": "Breakfast cereal, malted wheat, fortified",
    "protein": 8.7,
    "fat": 2.3,
    "carbs": 75.7,
    "calories": 339
  },
  {
    "name": "Breakfast cereal, multigrain hoops, fortified",
    "protein": 7.9,
    "fat": 3.8,
    "carbs": 80.7,
    "calories": 368
  },
  {
    "name": "Breakfast cereal, Oat, instant, flavoured, unfortified, made up with semi-skimmed milk",
    "protein": 4.4,
    "fat": 2.4,
    "carbs": 15.6,
    "calories": 98
  },
  {
    "name": "Breakfast cereal, oat, instant, plain, fortified, cooked, made up with semi-skimmed milk",
    "protein": 4.9,
    "fat": 2.5,
    "carbs": 14.2,
    "calories": 95
  },
  {
    "name": "Breakfast cereal, puffed wheat, honey coated, fortified",
    "protein": 4.7,
    "fat": 1.2,
    "carbs": 86.8,
    "calories": 355
  },
  {
    "name": "Breakfast cereal, puffed wheat, unfortified",
    "protein": 13.2,
    "fat": 2,
    "carbs": 72,
    "calories": 341
  },
  {
    "name": "Breakfast cereal, rice, chocolate flavoured, fortified",
    "protein": 4.6,
    "fat": 2.3,
    "carbs": 89.6,
    "calories": 375
  },
  {
    "name": "Breakfast cereal, rice, toasted/crisp, fortified",
    "protein": 5.7,
    "fat": 1,
    "carbs": 91.2,
    "calories": 374
  },
  {
    "name": "Breakfast cereal, Ricicles, Kellogg's",
    "protein": 3.8,
    "fat": 0.4,
    "carbs": 95.4,
    "calories": 377
  },
  {
    "name": "Breakfast cereal, shredded wheat type with fruit, unfortified",
    "protein": 8.4,
    "fat": 1.7,
    "carbs": 74,
    "calories": 326
  },
  {
    "name": "Breakfast cereal, shredded wheat type, unfortified",
    "protein": 10.9,
    "fat": 2.5,
    "carbs": 71.2,
    "calories": 333
  },
  {
    "name": "Breakfast cereal, Shredded Wheat, honey nut, Nestle",
    "protein": 9.8,
    "fat": 5.4,
    "carbs": 72.8,
    "calories": 361
  },
  {
    "name": "Breakfast cereal, wheat and multigrain, chocolate flavoured, fortified",
    "protein": 6.5,
    "fat": 4.1,
    "carbs": 83.2,
    "calories": 375
  },
  {
    "name": "Breakfast cereal, wheat biscuits, Weetabix type, fortified",
    "protein": 10.5,
    "fat": 1.9,
    "carbs": 72.7,
    "calories": 332
  },
  {
    "name": "Breakfast cereal, wheat biscuits, Weetabix type, unfortified",
    "protein": 10.5,
    "fat": 1.9,
    "carbs": 72.7,
    "calories": 332
  },
  {
    "name": "Broccoli in cheese sauce, made with semi-skimmed milk, homemade",
    "protein": 7.3,
    "fat": 7.5,
    "carbs": 5.9,
    "calories": 118
  },
  {
    "name": "Broccoli in cheese sauce, made with skimmed milk, homemade",
    "protein": 7.3,
    "fat": 6.9,
    "carbs": 5.9,
    "calories": 114
  },
  {
    "name": "Broccoli in cheese sauce, made with whole milk, homemade",
    "protein": 7.3,
    "fat": 8.2,
    "carbs": 5.8,
    "calories": 124
  },
  {
    "name": "Broccoli, green, boiled in salted water",
    "protein": 3.3,
    "fat": 0.5,
    "carbs": 2.8,
    "calories": 28
  },
  {
    "name": "Broccoli, green, boiled in unsalted water",
    "protein": 3.3,
    "fat": 0.5,
    "carbs": 2.8,
    "calories": 28
  },
  {
    "name": "Broccoli, green, raw",
    "protein": 4.3,
    "fat": 0.6,
    "carbs": 3.2,
    "calories": 34
  },
  {
    "name": "Broccoli, green, steamed",
    "protein": 4.1,
    "fat": 0.5,
    "carbs": 3.5,
    "calories": 34
  },
  {
    "name": "Broccoli, purple sprouting, boiled in unsalted water",
    "protein": 2.1,
    "fat": 0.6,
    "carbs": 1.3,
    "calories": 19
  },
  {
    "name": "Broccoli, purple sprouting, raw",
    "protein": 3.9,
    "fat": 1.1,
    "carbs": 2.6,
    "calories": 35
  },
  {
    "name": "Brown sauce, reduced salt/sugar",
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 20,
    "calories": 88
  },
  {
    "name": "Buckwheat, groats",
    "protein": 8.1,
    "fat": 1.5,
    "carbs": 84.9,
    "calories": 364
  },
  {
    "name": "Burger, beef, 62-85% beef, raw",
    "protein": 15.9,
    "fat": 15.2,
    "carbs": 4.9,
    "calories": 219
  },
  {
    "name": "Burger, beef, 62-85%, beef, grilled",
    "protein": 18.3,
    "fat": 13.8,
    "carbs": 8.5,
    "calories": 229
  },
  {
    "name": "Burger, beef, 98-99% beef, fried in vegetable oil",
    "protein": 28.5,
    "fat": 23.9,
    "carbs": 0.1,
    "calories": 329
  },
  {
    "name": "Burger, beef, 98-99% beef, grilled",
    "protein": 26.5,
    "fat": 24.4,
    "carbs": 0.1,
    "calories": 326
  },
  {
    "name": "Burger, beef, 98-99% beef, raw",
    "protein": 17.1,
    "fat": 24.7,
    "carbs": 0.1,
    "calories": 291
  },
  {
    "name": "Burger, beef, fried in rapeseed oil, homemade",
    "protein": 23.9,
    "fat": 21.9,
    "carbs": 1.1,
    "calories": 297
  },
  {
    "name": "Burger, beef, grilled, homemade",
    "protein": 25,
    "fat": 20.3,
    "carbs": 1.1,
    "calories": 288
  },
  {
    "name": "Burger, beef, with bun, fried in rapeseed oil, homemade",
    "protein": 21,
    "fat": 18.6,
    "carbs": 10.3,
    "calories": 291
  },
  {
    "name": "Burger, beef, with bun, grilled, homemade",
    "protein": 21.9,
    "fat": 17.4,
    "carbs": 10.3,
    "calories": 283
  },
  {
    "name": "Burger, cheeseburger, takeaway",
    "protein": 13.6,
    "fat": 10.4,
    "carbs": 28.3,
    "calories": 254
  },
  {
    "name": "Burger, chicken, takeaway",
    "protein": 12.5,
    "fat": 10.8,
    "carbs": 23.4,
    "calories": 235
  },
  {
    "name": "Burger, chicken/turkey, coated, retail, grilled",
    "protein": 14.2,
    "fat": 15.5,
    "carbs": 18.7,
    "calories": 266
  },
  {
    "name": "Burger, hamburger, takeaway",
    "protein": 13.5,
    "fat": 8.3,
    "carbs": 31.2,
    "calories": 246
  },
  {
    "name": "Burger, Quarter Pounder with cheese, takeaway",
    "protein": 16.3,
    "fat": 13.2,
    "carbs": 21.2,
    "calories": 263
  },
  {
    "name": "Butter, salted",
    "protein": 0.6,
    "fat": 82.2,
    "carbs": 0.6,
    "calories": 744
  },
  {
    "name": "Butter, spreadable (75-80% fat)",
    "protein": 0.4,
    "fat": 79.1,
    "carbs": 0.5,
    "calories": 715
  },
  {
    "name": "Butter, spreadable, light (60% fat)",
    "protein": 0.5,
    "fat": 60.2,
    "carbs": 0.8,
    "calories": 547
  },
  {
    "name": "Butter, unsalted",
    "protein": 0.6,
    "fat": 82.2,
    "carbs": 0.6,
    "calories": 744
  },
  {
    "name": "Butteroil, unsalted",
    "protein": 0.6,
    "fat": 99.3,
    "carbs": 0,
    "calories": 896
  },
  {
    "name": "Cabbage leaves, stuffed with lamb and rice, homemade",
    "protein": 7.1,
    "fat": 4.2,
    "carbs": 8.3,
    "calories": 100
  },
  {
    "name": "Cabbage, red, cooked with apple",
    "protein": 0.9,
    "fat": 2.6,
    "carbs": 7.9,
    "calories": 57
  },
  {
    "name": "Cake, carrot, iced, retail",
    "protein": 4.2,
    "fat": 20.2,
    "carbs": 46.8,
    "calories": 374
  },
  {
    "name": "Cake, carrot, with topping, homemade",
    "protein": 4,
    "fat": 21.1,
    "carbs": 37.7,
    "calories": 346
  },
  {
    "name": "Cake, chocolate, with butter icing, homemade",
    "protein": 5.8,
    "fat": 25.2,
    "carbs": 53.8,
    "calories": 452
  },
  {
    "name": "Cake, coconut, homemade",
    "protein": 6.7,
    "fat": 22.1,
    "carbs": 52.6,
    "calories": 423
  },
  {
    "name": "Cake, sponge, with butter icing, homemade",
    "protein": 4.5,
    "fat": 27.3,
    "carbs": 56.2,
    "calories": 476
  },
  {
    "name": "Cake, sponge, with jam and butter cream, retail",
    "protein": 3.7,
    "fat": 14.8,
    "carbs": 55.1,
    "calories": 354
  },
  {
    "name": "Cannelloni, spinach, homemade",
    "protein": 5.2,
    "fat": 6.9,
    "carbs": 15.4,
    "calories": 140
  },
  {
    "name": "Carbonnade of Beef, homemade",
    "protein": 12.7,
    "fat": 6.5,
    "carbs": 5.2,
    "calories": 134
  },
  {
    "name": "Carrot juice",
    "protein": 0.5,
    "fat": 0.1,
    "carbs": 5.7,
    "calories": 24
  },
  {
    "name": "Carrots, old, boiled in unsalted water",
    "protein": 0.5,
    "fat": 0.5,
    "carbs": 6,
    "calories": 29
  },
  {
    "name": "Carrots, old, microwaved",
    "protein": 0.6,
    "fat": 0.2,
    "carbs": 7.5,
    "calories": 32
  },
  {
    "name": "Carrots, old, raw",
    "protein": 0.5,
    "fat": 0.4,
    "carbs": 7.7,
    "calories": 34
  },
  {
    "name": "Carrots, young, boiled in unsalted water",
    "protein": 0.6,
    "fat": 0.4,
    "carbs": 4.4,
    "calories": 22
  },
  {
    "name": "Carrots, young, canned in water, re-heated, drained",
    "protein": 0.5,
    "fat": 0.3,
    "carbs": 4.2,
    "calories": 20
  },
  {
    "name": "Carrots, young, raw",
    "protein": 0.7,
    "fat": 0.5,
    "carbs": 6,
    "calories": 30
  },
  {
    "name": "Cashew fruit, flesh only",
    "protein": 0.9,
    "fat": 0.4,
    "carbs": 6.8,
    "calories": 33
  },
  {
    "name": "Cashew nuts, kernel only, plain",
    "protein": 17.7,
    "fat": 48.2,
    "carbs": 18.1,
    "calories": 573
  },
  {
    "name": "Cashew nuts, kernel only, roasted and salted",
    "protein": 20.5,
    "fat": 50.9,
    "carbs": 18.8,
    "calories": 611
  },
  {
    "name": "Casserole, beef, made with cook-in sauce",
    "protein": 15,
    "fat": 6.6,
    "carbs": 4.8,
    "calories": 137
  },
  {
    "name": "Casserole, pork and apple, homemade",
    "protein": 11,
    "fat": 2.9,
    "carbs": 7.5,
    "calories": 100
  },
  {
    "name": "Casserole, pork, made with cook-in sauce",
    "protein": 17,
    "fat": 7.9,
    "carbs": 4,
    "calories": 154
  },
  {
    "name": "Casserole, sausage, homemade",
    "protein": 11.9,
    "fat": 10.9,
    "carbs": 5.2,
    "calories": 165
  },
  {
    "name": "Casserole, sweet potato and green banana, homemade",
    "protein": 1.2,
    "fat": 6.5,
    "carbs": 31.2,
    "calories": 181
  },
  {
    "name": "Catfish, flesh only, steamed",
    "protein": 21.4,
    "fat": 3.7,
    "carbs": 0,
    "calories": 119
  },
  {
    "name": "Catfish, raw",
    "protein": 17.6,
    "fat": 2.8,
    "carbs": 0,
    "calories": 96
  },
  {
    "name": "Cauliflower cheese, made with semi-skimmed milk, homemade",
    "protein": 5.3,
    "fat": 5.9,
    "carbs": 6.2,
    "calories": 97
  },
  {
    "name": "Cauliflower cheese, made with skimmed milk, homemade",
    "protein": 5.3,
    "fat": 5.6,
    "carbs": 6.2,
    "calories": 94
  },
  {
    "name": "Cauliflower cheese, made with whole milk, homemade",
    "protein": 5.3,
    "fat": 6.4,
    "carbs": 6.1,
    "calories": 102
  },
  {
    "name": "Cauliflower cheese, retail",
    "protein": 4.2,
    "fat": 5.8,
    "carbs": 5,
    "calories": 88
  },
  {
    "name": "Cauliflower in white sauce, made with semi-skimmed milk, homemade",
    "protein": 2.7,
    "fat": 3.2,
    "carbs": 6,
    "calories": 63
  },
  {
    "name": "Cauliflower in white sauce, made with skimmed milk, homemade",
    "protein": 2.8,
    "fat": 2.8,
    "carbs": 6,
    "calories": 58
  },
  {
    "name": "Cauliflower in white sauce, made with whole milk, homemade",
    "protein": 2.7,
    "fat": 4.2,
    "carbs": 6.2,
    "calories": 72
  },
  {
    "name": "Cereal bars, with fruit and/or nuts, no chocolate, unfortified",
    "protein": 5.6,
    "fat": 10.7,
    "carbs": 62.9,
    "calories": 354
  },
  {
    "name": "Cereal bars, with fruit and/or nuts, with chocolate, unfortified",
    "protein": 6,
    "fat": 18.3,
    "carbs": 66,
    "calories": 436
  },
  {
    "name": "Cheese and onion rolls, pastry, retail",
    "protein": 8.2,
    "fat": 20,
    "carbs": 30.4,
    "calories": 327
  },
  {
    "name": "Cheese pudding, homemade",
    "protein": 10.6,
    "fat": 9.3,
    "carbs": 11.7,
    "calories": 170
  },
  {
    "name": "Cheese sauce, made with semi-skimmed milk, homemade",
    "protein": 8.2,
    "fat": 12.8,
    "carbs": 9,
    "calories": 182
  },
  {
    "name": "Cheese sauce, made with skimmed milk, homemade",
    "protein": 8.2,
    "fat": 11.6,
    "carbs": 9.1,
    "calories": 172
  },
  {
    "name": "Cheese sauce, made with whole milk, homemade",
    "protein": 8.2,
    "fat": 14.6,
    "carbs": 8.9,
    "calories": 197
  },
  {
    "name": "Cheese sauce, packet mix, made up with semi-skimmed milk, homemade",
    "protein": 5.8,
    "fat": 5.2,
    "carbs": 9.7,
    "calories": 106
  },
  {
    "name": "Cheese sauce, packet mix, made up with skimmed milk, homemade",
    "protein": 5.6,
    "fat": 2.4,
    "carbs": 9.2,
    "calories": 79
  },
  {
    "name": "Cheese sauce, packet mix, made up with whole milk, homemade",
    "protein": 5.5,
    "fat": 5.7,
    "carbs": 9,
    "calories": 108
  },
  {
    "name": "Cheese spread, plain",
    "protein": 11.3,
    "fat": 18.6,
    "carbs": 6.5,
    "calories": 237
  },
  {
    "name": "Cheese spread, plain, reduced fat",
    "protein": 15,
    "fat": 7.2,
    "carbs": 7.9,
    "calories": 154
  },
  {
    "name": "Cheese straws/twists, retail",
    "protein": 14.1,
    "fat": 30.3,
    "carbs": 48.3,
    "calories": 510
  },
  {
    "name": "Cheese, Brie, rind only",
    "protein": 16.5,
    "fat": 26.4,
    "carbs": 0,
    "calories": 304
  },
  {
    "name": "Cheese, Brie, with outer rind removed",
    "protein": 20.3,
    "fat": 29.1,
    "carbs": 0,
    "calories": 343
  },
  {
    "name": "Cheese, Caerphilly",
    "protein": 23.2,
    "fat": 31.3,
    "carbs": 0.1,
    "calories": 375
  },
  {
    "name": "Cheese, Camembert",
    "protein": 21.5,
    "fat": 22.7,
    "carbs": 0,
    "calories": 290
  },
  {
    "name": "Cheese, Cheddar type, '30% less fat'",
    "protein": 27.9,
    "fat": 22.1,
    "carbs": 0.8,
    "calories": 314
  },
  {
    "name": "Cheese, Cheddar type, half fat",
    "protein": 32.7,
    "fat": 15.8,
    "carbs": 0,
    "calories": 273
  },
  {
    "name": "Cheese, Cheddar, English",
    "protein": 25.4,
    "fat": 34.9,
    "carbs": 0.1,
    "calories": 416
  },
  {
    "name": "Cheese, cottage, plain",
    "protein": 9.4,
    "fat": 6,
    "carbs": 3.1,
    "calories": 103
  },
  {
    "name": "Cheese, cottage, plain, reduced fat",
    "protein": 10.6,
    "fat": 1.5,
    "carbs": 3.3,
    "calories": 68
  },
  {
    "name": "Cheese, Danish blue",
    "protein": 20.5,
    "fat": 28.9,
    "carbs": 0,
    "calories": 342
  },
  {
    "name": "Cheese, Derby",
    "protein": 24.2,
    "fat": 33.9,
    "carbs": 0.1,
    "calories": 402
  },
  {
    "name": "Cheese, Dolcelatte, rind removed",
    "protein": 18,
    "fat": 35.8,
    "carbs": 0,
    "calories": 394
  },
  {
    "name": "Cheese, Double Gloucester",
    "protein": 24.4,
    "fat": 35,
    "carbs": 0.1,
    "calories": 413
  },
  {
    "name": "Cheese, Edam",
    "protein": 26.7,
    "fat": 26,
    "carbs": 0,
    "calories": 341
  },
  {
    "name": "Cheese, Emmental",
    "protein": 30.2,
    "fat": 30.9,
    "carbs": 0,
    "calories": 399
  },
  {
    "name": "Cheese, Feta",
    "protein": 15.6,
    "fat": 20.2,
    "carbs": 1.5,
    "calories": 250
  },
  {
    "name": "Cheese, goats milk, full fat, soft, white rind",
    "protein": 21.1,
    "fat": 25.8,
    "carbs": 1,
    "calories": 320
  },
  {
    "name": "Cheese, Gouda",
    "protein": 25.3,
    "fat": 30.6,
    "carbs": 0,
    "calories": 377
  },
  {
    "name": "Cheese, Gruyere",
    "protein": 27.2,
    "fat": 33.3,
    "carbs": 0,
    "calories": 409
  },
  {
    "name": "Cheese, Halloumi",
    "protein": 23.9,
    "fat": 23.5,
    "carbs": 1.7,
    "calories": 313
  },
  {
    "name": "Cheese, hard, average",
    "protein": 24.9,
    "fat": 34.5,
    "carbs": 0.1,
    "calories": 411
  },
  {
    "name": "Cheese, Lancashire",
    "protein": 24.1,
    "fat": 31.7,
    "carbs": 0.1,
    "calories": 382
  },
  {
    "name": "Cheese, Mascarpone",
    "protein": 4.6,
    "fat": 44.5,
    "carbs": 4.3,
    "calories": 435
  },
  {
    "name": "Cheese, Mozzarella, fresh",
    "protein": 18.6,
    "fat": 20.3,
    "carbs": 0,
    "calories": 257
  },
  {
    "name": "Cheese, Paneer",
    "protein": 26,
    "fat": 24.5,
    "carbs": 0.9,
    "calories": 328
  },
  {
    "name": "Cheese, Parmesan, fresh",
    "protein": 36.2,
    "fat": 29.7,
    "carbs": 0.9,
    "calories": 415
  },
  {
    "name": "Cheese, Port Salut, St Paulin type",
    "protein": 25.5,
    "fat": 25.7,
    "carbs": 0,
    "calories": 333
  },
  {
    "name": "Cheese, processed, plain",
    "protein": 17.8,
    "fat": 23,
    "carbs": 5,
    "calories": 297
  },
  {
    "name": "Cheese, processed, slices, reduced fat",
    "protein": 16.7,
    "fat": 9.6,
    "carbs": 9.7,
    "calories": 190
  },
  {
    "name": "Cheese, processed, smoked",
    "protein": 20.5,
    "fat": 24.5,
    "carbs": 0.2,
    "calories": 303
  },
  {
    "name": "Cheese, Quark",
    "protein": 14.6,
    "fat": 0,
    "carbs": 4,
    "calories": 74
  },
  {
    "name": "Cheese, Red Leicester",
    "protein": 25,
    "fat": 33.6,
    "carbs": 0.1,
    "calories": 403
  },
  {
    "name": "Cheese, Red Windsor",
    "protein": 24.4,
    "fat": 33.7,
    "carbs": 0,
    "calories": 401
  },
  {
    "name": "Cheese, Ricotta",
    "protein": 9.4,
    "fat": 11,
    "carbs": 2,
    "calories": 144
  },
  {
    "name": "Cheese, Roquefort",
    "protein": 19.7,
    "fat": 32.9,
    "carbs": 0,
    "calories": 375
  },
  {
    "name": "Cheese, Sage Derby",
    "protein": 24.2,
    "fat": 33.9,
    "carbs": 0.1,
    "calories": 402
  },
  {
    "name": "Cheese, spreadable, full fat, soft, white",
    "protein": 5.3,
    "fat": 24.4,
    "carbs": 3,
    "calories": 252
  },
  {
    "name": "Cheese, spreadable, medium fat, soft, white",
    "protein": 9.8,
    "fat": 11.2,
    "carbs": 3.5,
    "calories": 153
  },
  {
    "name": "Cheese, spreadable, soft white, low fat",
    "protein": 11.9,
    "fat": 3.6,
    "carbs": 5,
    "calories": 99
  },
  {
    "name": "Cheese, Stilton, blue",
    "protein": 23.7,
    "fat": 35,
    "carbs": 0.1,
    "calories": 410
  },
  {
    "name": "Cheese, Stilton, white",
    "protein": 19.9,
    "fat": 31.3,
    "carbs": 0.1,
    "calories": 362
  },
  {
    "name": "Cheese, Wensleydale",
    "protein": 23.7,
    "fat": 31.8,
    "carbs": 0.1,
    "calories": 381
  },
  {
    "name": "Cheese, White Cheshire",
    "protein": 23.4,
    "fat": 31.8,
    "carbs": 0.1,
    "calories": 380
  },
  {
    "name": "Cheese, white, average",
    "protein": 23.7,
    "fat": 31.8,
    "carbs": 0.1,
    "calories": 381
  },
  {
    "name": "Cheesecake, fruit, frozen",
    "protein": 4,
    "fat": 16.2,
    "carbs": 35.2,
    "calories": 294
  },
  {
    "name": "Cheesecake, fruit, individual",
    "protein": 6.1,
    "fat": 12.3,
    "carbs": 34.5,
    "calories": 264
  },
  {
    "name": "Cheesecake, homemade",
    "protein": 6.2,
    "fat": 22.8,
    "carbs": 25.4,
    "calories": 325
  },
  {
    "name": "Cherries, stewed with sugar",
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 21,
    "calories": 82
  },
  {
    "name": "Cherries, stewed without sugar",
    "protein": 0.8,
    "fat": 0.1,
    "carbs": 10.1,
    "calories": 42
  },
  {
    "name": "Chestnuts, dried",
    "protein": 3.7,
    "fat": 5.1,
    "carbs": 69,
    "calories": 319
  },
  {
    "name": "Chestnuts, kernel only, raw",
    "protein": 2,
    "fat": 2.7,
    "carbs": 36.6,
    "calories": 170
  },
  {
    "name": "Chicken breast/steak, coated, baked",
    "protein": 17.7,
    "fat": 11.6,
    "carbs": 15.8,
    "calories": 234
  },
  {
    "name": "Chicken chasseur, homemade",
    "protein": 13.5,
    "fat": 1.5,
    "carbs": 2.3,
    "calories": 78
  },
  {
    "name": "Chicken fricassee, homemade",
    "protein": 10,
    "fat": 6.1,
    "carbs": 2.8,
    "calories": 115
  },
  {
    "name": "Chicken fricassee, reduced fat, homemade",
    "protein": 10.2,
    "fat": 4.2,
    "carbs": 3.2,
    "calories": 101
  },
  {
    "name": "Chicken in white sauce, made with semi-skimmed milk",
    "protein": 17,
    "fat": 7.7,
    "carbs": 5,
    "calories": 156
  },
  {
    "name": "Chicken in white sauce, made with whole milk",
    "protein": 17,
    "fat": 9,
    "carbs": 5.2,
    "calories": 168
  },
  {
    "name": "Chicken pieces, coated, takeaway",
    "protein": 18.5,
    "fat": 14.1,
    "carbs": 17.6,
    "calories": 267
  },
  {
    "name": "Chicken portions, battered, deep fried, takeaway",
    "protein": 24.8,
    "fat": 12.8,
    "carbs": 4.8,
    "calories": 233
  },
  {
    "name": "Chicken satay, takeaway",
    "protein": 21.7,
    "fat": 10.3,
    "carbs": 3,
    "calories": 191
  },
  {
    "name": "Chicken slices",
    "protein": 23.2,
    "fat": 1.5,
    "carbs": 2,
    "calories": 114
  },
  {
    "name": "Chicken soup, cream of, canned, condensed, as served",
    "protein": 1.3,
    "fat": 2.9,
    "carbs": 3,
    "calories": 43
  },
  {
    "name": "Chicken wings, marinated, meat and skin, barbecued",
    "protein": 27.4,
    "fat": 16.6,
    "carbs": 4.1,
    "calories": 274
  },
  {
    "name": "Chicken, breast, casseroled, meat and skin",
    "protein": 26.9,
    "fat": 8.5,
    "carbs": 0,
    "calories": 184
  },
  {
    "name": "Chicken, breast, casseroled, meat only",
    "protein": 28.4,
    "fat": 5.2,
    "carbs": 0,
    "calories": 160
  },
  {
    "name": "Chicken, breast, grilled with skin, meat only",
    "protein": 29.8,
    "fat": 3.1,
    "carbs": 0,
    "calories": 147
  },
  {
    "name": "Chicken, breast, grilled without skin, meat only",
    "protein": 32,
    "fat": 2.2,
    "carbs": 0,
    "calories": 148
  },
  {
    "name": "Chicken, breast, grilled, meat and skin",
    "protein": 28.9,
    "fat": 6.4,
    "carbs": 0,
    "calories": 173
  },
  {
    "name": "Chicken, breast, strips, stir-fried in corn oil",
    "protein": 29.7,
    "fat": 4.6,
    "carbs": 0,
    "calories": 161
  },
  {
    "name": "Chicken, corn-fed, raw, dark meat only",
    "protein": 19.5,
    "fat": 7.2,
    "carbs": 0,
    "calories": 143
  },
  {
    "name": "Chicken, corn-fed, raw, light meat only",
    "protein": 23,
    "fat": 2.8,
    "carbs": 0,
    "calories": 118
  },
  {
    "name": "Chicken, corn-fed, raw, meat only",
    "protein": 21.4,
    "fat": 4.8,
    "carbs": 0,
    "calories": 129
  },
  {
    "name": "Chicken, corn-fed, raw, skin only",
    "protein": 10.1,
    "fat": 52.7,
    "carbs": 0,
    "calories": 514
  },
  {
    "name": "Chicken, corn-fed, roasted, dark meat only",
    "protein": 24,
    "fat": 9.8,
    "carbs": 0,
    "calories": 185
  },
  {
    "name": "Chicken, corn-fed, roasted, light meat only",
    "protein": 25.8,
    "fat": 4.2,
    "carbs": 0,
    "calories": 141
  },
  {
    "name": "Chicken, corn-fed, roasted, meat only",
    "protein": 24.9,
    "fat": 7.2,
    "carbs": 0,
    "calories": 164
  },
  {
    "name": "Chicken, dark meat, raw",
    "protein": 20.9,
    "fat": 2.8,
    "carbs": 0,
    "calories": 109
  },
  {
    "name": "Chicken, dark meat, roasted",
    "protein": 24.4,
    "fat": 10.9,
    "carbs": 0,
    "calories": 196
  },
  {
    "name": "Chicken, drumsticks, casseroled, meat and skin",
    "protein": 22.3,
    "fat": 14.2,
    "carbs": 0,
    "calories": 217
  },
  {
    "name": "Chicken, drumsticks, casseroled, meat only",
    "protein": 24.3,
    "fat": 9.7,
    "carbs": 0,
    "calories": 185
  },
  {
    "name": "Chicken, drumsticks, roasted, meat and skin",
    "protein": 25.8,
    "fat": 9.1,
    "carbs": 0,
    "calories": 185
  },
  {
    "name": "Chicken, drumsticks, roasted, meat only",
    "protein": 26.6,
    "fat": 5.1,
    "carbs": 0,
    "calories": 152
  },
  {
    "name": "Chicken, leg quarter, casseroled, meat and skin",
    "protein": 22.9,
    "fat": 13.9,
    "carbs": 0,
    "calories": 217
  },
  {
    "name": "Chicken, leg quarter, casseroled, meat only",
    "protein": 25,
    "fat": 8.4,
    "carbs": 0,
    "calories": 176
  },
  {
    "name": "Chicken, leg quarter, raw, meat and skin",
    "protein": 18.3,
    "fat": 13.3,
    "carbs": 0,
    "calories": 193
  },
  {
    "name": "Chicken, leg quarter, roasted, meat and skin",
    "protein": 20.9,
    "fat": 16.9,
    "carbs": 0,
    "calories": 236
  },
  {
    "name": "Chicken, light meat, raw",
    "protein": 24,
    "fat": 1.1,
    "carbs": 0,
    "calories": 106
  },
  {
    "name": "Chicken, light meat, roasted",
    "protein": 30.2,
    "fat": 3.6,
    "carbs": 0,
    "calories": 153
  },
  {
    "name": "Chicken, meat, average, raw",
    "protein": 22.3,
    "fat": 2.1,
    "carbs": 0,
    "calories": 108
  },
  {
    "name": "Chicken, meat, average, roasted",
    "protein": 27.3,
    "fat": 7.5,
    "carbs": 0,
    "calories": 177
  },
  {
    "name": "Chicken, portions, not coated, deep-fried, meat and skin",
    "protein": 26.9,
    "fat": 16.8,
    "carbs": 0,
    "calories": 259
  },
  {
    "name": "Chicken, skin, casseroled",
    "protein": 13.4,
    "fat": 39.3,
    "carbs": 0,
    "calories": 407
  },
  {
    "name": "Chicken, skin, raw",
    "protein": 9.7,
    "fat": 48.3,
    "carbs": 0,
    "calories": 474
  },
  {
    "name": "Chicken, skin, roasted/grilled, dry",
    "protein": 21.5,
    "fat": 46.1,
    "carbs": 0,
    "calories": 501
  },
  {
    "name": "Chicken, skin, roasted/grilled, moist",
    "protein": 17,
    "fat": 42.6,
    "carbs": 0,
    "calories": 452
  },
  {
    "name": "Chicken, stir-fried with mushrooms and cashew nuts, homemade",
    "protein": 18.4,
    "fat": 7,
    "carbs": 4.8,
    "calories": 160
  },
  {
    "name": "Chicken, stir-fried with peppers in black bean sauce, homemade",
    "protein": 19,
    "fat": 4.2,
    "carbs": 2.7,
    "calories": 124
  },
  {
    "name": "Chicken, stir-fried with rice and vegetables, retail, reheated",
    "protein": 6.5,
    "fat": 4.6,
    "carbs": 17.1,
    "calories": 132
  },
  {
    "name": "Chicken, thighs, casseroled, meat and skin",
    "protein": 21.5,
    "fat": 16.3,
    "carbs": 0,
    "calories": 233
  },
  {
    "name": "Chicken, thighs, casseroled, meat only, diced",
    "protein": 25.6,
    "fat": 8.6,
    "carbs": 0,
    "calories": 180
  },
  {
    "name": "Chicken, whole, corn-fed, raw, meat and skin",
    "protein": 18.8,
    "fat": 15.9,
    "carbs": 0,
    "calories": 218
  },
  {
    "name": "Chicken, whole, corn-fed, roasted, meat and skin",
    "protein": 24,
    "fat": 13.2,
    "carbs": 0,
    "calories": 215
  },
  {
    "name": "Chicken, whole, raw, meat and skin",
    "protein": 19.1,
    "fat": 13.8,
    "carbs": 0,
    "calories": 201
  },
  {
    "name": "Chicken, whole, roasted, meat and skin",
    "protein": 26.3,
    "fat": 12.5,
    "carbs": 0,
    "calories": 218
  },
  {
    "name": "Chicken, wing quarter, casseroled, meat and skin",
    "protein": 24.4,
    "fat": 12.5,
    "carbs": 0,
    "calories": 210
  },
  {
    "name": "Chicken, wing quarter, casseroled, meat only",
    "protein": 26.9,
    "fat": 6.3,
    "carbs": 0,
    "calories": 164
  },
  {
    "name": "Chicken, wing quarter, raw, meat and skin",
    "protein": 20.3,
    "fat": 12.4,
    "carbs": 0,
    "calories": 193
  },
  {
    "name": "Chicken, wing quarter, roasted, meat and skin",
    "protein": 24.8,
    "fat": 14.1,
    "carbs": 0,
    "calories": 226
  },
  {
    "name": "Chicken/turkey pasties/slices, puff pastry",
    "protein": 8.1,
    "fat": 18.5,
    "carbs": 23.9,
    "calories": 289
  },
  {
    "name": "Chicken/turkey pieces, coated, baked",
    "protein": 14.4,
    "fat": 13.9,
    "carbs": 19.6,
    "calories": 256
  },
  {
    "name": "Chilli con carne, retail, reheated, with rice",
    "protein": 5.8,
    "fat": 2.7,
    "carbs": 18.1,
    "calories": 116
  },
  {
    "name": "Chocolate covered bar with caramel and cereal",
    "protein": 5.2,
    "fat": 25.8,
    "carbs": 66.2,
    "calories": 501
  },
  {
    "name": "Chocolate, milk",
    "protein": 7.3,
    "fat": 31.1,
    "carbs": 56,
    "calories": 519
  },
  {
    "name": "Chow mein, beef, retail, reheated",
    "protein": 6.7,
    "fat": 6,
    "carbs": 14.7,
    "calories": 136
  },
  {
    "name": "Chow mein, chicken, takeaway",
    "protein": 8.5,
    "fat": 7.2,
    "carbs": 12.7,
    "calories": 147
  },
  {
    "name": "Chow mein, pork and chicken, homemade",
    "protein": 9.2,
    "fat": 1.9,
    "carbs": 5.8,
    "calories": 72
  },
  {
    "name": "Chutney, apple, homemade",
    "protein": 0.8,
    "fat": 0.2,
    "carbs": 49.2,
    "calories": 190
  },
  {
    "name": "Chutney, mango, sweet",
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 48.3,
    "calories": 189
  },
  {
    "name": "Chutney, tomato",
    "protein": 1.2,
    "fat": 0.2,
    "carbs": 31,
    "calories": 128
  },
  {
    "name": "Chutney, tomato, homemade",
    "protein": 1,
    "fat": 0.2,
    "carbs": 40.8,
    "calories": 166
  },
  {
    "name": "Cocoa butter",
    "protein": 0,
    "fat": 99.5,
    "carbs": 0,
    "calories": 896
  },
  {
    "name": "Cocoa powder, made up with semi-skimmed milk",
    "protein": 3.7,
    "fat": 2,
    "carbs": 6.7,
    "calories": 58
  },
  {
    "name": "Cocoa powder, made up with skimmed milk",
    "protein": 3.7,
    "fat": 0.6,
    "carbs": 6.7,
    "calories": 46
  },
  {
    "name": "Cocoa powder, made up with whole milk",
    "protein": 3.6,
    "fat": 3.9,
    "carbs": 6.6,
    "calories": 74
  },
  {
    "name": "Coconut ice, homemade",
    "protein": 1.8,
    "fat": 12.3,
    "carbs": 67.1,
    "calories": 369
  },
  {
    "name": "Coconut milk",
    "protein": 0.3,
    "fat": 0.3,
    "carbs": 4.9,
    "calories": 22
  },
  {
    "name": "Coconut milk, reduced fat, retail",
    "protein": 0.7,
    "fat": 7.7,
    "carbs": 2,
    "calories": 79
  },
  {
    "name": "Coconut milk, retail",
    "protein": 1.1,
    "fat": 16.9,
    "carbs": 3.3,
    "calories": 169
  },
  {
    "name": "Coconut, desiccated",
    "protein": 5.6,
    "fat": 62,
    "carbs": 6.4,
    "calories": 604
  },
  {
    "name": "Coconut, flesh only, fresh",
    "protein": 3.2,
    "fat": 36,
    "carbs": 3.7,
    "calories": 351
  },
  {
    "name": "Cod, dried, salted, boiled",
    "protein": 32.5,
    "fat": 0.9,
    "carbs": 0,
    "calories": 138
  },
  {
    "name": "Cod, flesh only, baked",
    "protein": 23.9,
    "fat": 0.5,
    "carbs": 0,
    "calories": 100
  },
  {
    "name": "Cod, flesh only, grilled",
    "protein": 24.6,
    "fat": 0.8,
    "carbs": 0,
    "calories": 106
  },
  {
    "name": "Cod, flesh only, microwaved",
    "protein": 23.5,
    "fat": 0.4,
    "carbs": 0,
    "calories": 98
  },
  {
    "name": "Cod, flesh only, poached in milk, butter and salt added",
    "protein": 20.9,
    "fat": 1.1,
    "carbs": 0,
    "calories": 94
  },
  {
    "name": "Cod, flesh only, raw",
    "protein": 17.5,
    "fat": 0.6,
    "carbs": 0,
    "calories": 75
  },
  {
    "name": "Cod, flesh only, salted and smoked, raw",
    "protein": 18.3,
    "fat": 0.6,
    "carbs": 0,
    "calories": 79
  },
  {
    "name": "Cod, flesh only, steamed",
    "protein": 22.8,
    "fat": 0.8,
    "carbs": 0,
    "calories": 98
  },
  {
    "name": "Cod, in batter, baked",
    "protein": 12.3,
    "fat": 11.8,
    "carbs": 19.7,
    "calories": 229
  },
  {
    "name": "Cod, in batter, fried in dripping, takeaway",
    "protein": 16.8,
    "fat": 14.7,
    "carbs": 10.7,
    "calories": 240
  },
  {
    "name": "Cod, in batter, fried in rapeseed oil",
    "protein": 12.6,
    "fat": 17.9,
    "carbs": 19.5,
    "calories": 285
  },
  {
    "name": "Cod, in batter, fried in sunflower oil, takeaway",
    "protein": 16.8,
    "fat": 14.7,
    "carbs": 19.5,
    "calories": 240
  },
  {
    "name": "Cod, in batter, fried, takeaway",
    "protein": 16.8,
    "fat": 14.7,
    "carbs": 10.7,
    "calories": 240
  },
  {
    "name": "Cod, in breadcrumbs, baked",
    "protein": 13.7,
    "fat": 8.3,
    "carbs": 19.8,
    "calories": 204
  },
  {
    "name": "Coffee, infusion, average, with semi-skimmed milk",
    "protein": 0.6,
    "fat": 0.2,
    "carbs": 0.7,
    "calories": 7
  },
  {
    "name": "Coffee, infusion, average, with whole milk",
    "protein": 0.5,
    "fat": 0.4,
    "carbs": 0.5,
    "calories": 7
  },
  {
    "name": "Coffee, instant, made up with water and semi-skimmed milk",
    "protein": 0.6,
    "fat": 0.2,
    "carbs": 0.7,
    "calories": 7
  },
  {
    "name": "Coffee, instant, made up with water and whole milk",
    "protein": 0.5,
    "fat": 0.4,
    "carbs": 0.6,
    "calories": 8
  },
  {
    "name": "Complan powder, sweet, made up with semi-skimmed milk",
    "protein": 6.1,
    "fat": 4.5,
    "carbs": 17.8,
    "calories": 132
  },
  {
    "name": "Complan powder, sweet, made up with skimmed milk",
    "protein": 6.1,
    "fat": 3.4,
    "carbs": 17.9,
    "calories": 122
  },
  {
    "name": "Complan powder, sweet, made up with whole milk",
    "protein": 6.1,
    "fat": 6,
    "carbs": 17.7,
    "calories": 145
  },
  {
    "name": "Corned beef hash, homemade",
    "protein": 10.5,
    "fat": 5.9,
    "carbs": 12.3,
    "calories": 141
  },
  {
    "name": "Corned beef, canned",
    "protein": 25.9,
    "fat": 10.9,
    "carbs": 1,
    "calories": 205
  },
  {
    "name": "Coronation chicken, homemade",
    "protein": 16.6,
    "fat": 31.4,
    "carbs": 3.5,
    "calories": 362
  },
  {
    "name": "Coronation chicken, reduced fat, homemade",
    "protein": 16.6,
    "fat": 14.8,
    "carbs": 4.2,
    "calories": 216
  },
  {
    "name": "Courgette, fried in butter",
    "protein": 2.6,
    "fat": 4.8,
    "carbs": 2.6,
    "calories": 63
  },
  {
    "name": "Courgettes with eggs, homemade",
    "protein": 3.9,
    "fat": 9.7,
    "carbs": 2.2,
    "calories": 112
  },
  {
    "name": "Cranberries",
    "protein": 0.4,
    "fat": 0.1,
    "carbs": 3.4,
    "calories": 15
  },
  {
    "name": "Crayfish, raw",
    "protein": 14.9,
    "fat": 0.8,
    "carbs": 0,
    "calories": 67
  },
  {
    "name": "Creme egg",
    "protein": 4,
    "fat": 15.9,
    "carbs": 71,
    "calories": 425
  },
  {
    "name": "Crispbread, rye",
    "protein": 8.6,
    "fat": 1.4,
    "carbs": 63.4,
    "calories": 284
  },
  {
    "name": "Crumble, apple, homemade",
    "protein": 1.7,
    "fat": 6.4,
    "carbs": 35,
    "calories": 201
  },
  {
    "name": "Crumble, vegetable, with tinned tomatoes, homemade",
    "protein": 3.1,
    "fat": 9.6,
    "carbs": 20.1,
    "calories": 174
  },
  {
    "name": "Crumble, vegetable, with tinned tomatoes, wholemeal, homemade",
    "protein": 3.6,
    "fat": 9.7,
    "carbs": 18.1,
    "calories": 170
  },
  {
    "name": "Curry, beef and spinach, homemade",
    "protein": 11.4,
    "fat": 4.4,
    "carbs": 3.6,
    "calories": 94
  },
  {
    "name": "Curry, beef, homemade",
    "protein": 17.7,
    "fat": 15.4,
    "carbs": 1.2,
    "calories": 209
  },
  {
    "name": "Curry, beef, reduced fat, homemade",
    "protein": 18.8,
    "fat": 7.1,
    "carbs": 1.3,
    "calories": 139
  },
  {
    "name": "Curry, beef, retail, reheated",
    "protein": 13.5,
    "fat": 6.6,
    "carbs": 6.3,
    "calories": 137
  },
  {
    "name": "Curry, beef, retail, reheated, with rice",
    "protein": 9.5,
    "fat": 4.6,
    "carbs": 18.2,
    "calories": 147
  },
  {
    "name": "Curry, Bombay potato, homemade",
    "protein": 1.8,
    "fat": 6.7,
    "carbs": 13.8,
    "calories": 118
  },
  {
    "name": "Curry, cauliflower and potato, homemade",
    "protein": 2.6,
    "fat": 2,
    "carbs": 6.7,
    "calories": 60
  },
  {
    "name": "Curry, chick pea dahl and spinach, with butter, homemade",
    "protein": 6.4,
    "fat": 12,
    "carbs": 12.9,
    "calories": 182
  },
  {
    "name": "Curry, chick pea dahl and spinach, with vegetable oil, homemade",
    "protein": 6.3,
    "fat": 14.2,
    "carbs": 12.8,
    "calories": 201
  },
  {
    "name": "Curry, chick pea, whole and potato, homemade",
    "protein": 5.9,
    "fat": 5.4,
    "carbs": 12.6,
    "calories": 119
  },
  {
    "name": "Curry, chick pea, whole and tomato, Gujerati, with butter ghee, homemade",
    "protein": 7.7,
    "fat": 14.4,
    "carbs": 20.1,
    "calories": 237
  },
  {
    "name": "Curry, chick pea, whole and tomato, Gujerati, with vegetable oil, homemade",
    "protein": 7.7,
    "fat": 14.7,
    "carbs": 20.1,
    "calories": 238
  },
  {
    "name": "Curry, chick pea, whole and tomato, Punjabi, with butter, homemade",
    "protein": 5.6,
    "fat": 4.3,
    "carbs": 12.4,
    "calories": 107
  },
  {
    "name": "Curry, chick pea, whole and tomato, Punjabi, with vegetable oil, homemade",
    "protein": 5.6,
    "fat": 4.9,
    "carbs": 12.4,
    "calories": 112
  },
  {
    "name": "Curry, chicken balti, retail",
    "protein": 10.5,
    "fat": 5,
    "carbs": 4.8,
    "calories": 105
  },
  {
    "name": "Curry, chicken korma, homemade",
    "protein": 14.6,
    "fat": 5.1,
    "carbs": 4.6,
    "calories": 127
  },
  {
    "name": "Curry, chicken tandoori, retail, reheated",
    "protein": 27.4,
    "fat": 10.8,
    "carbs": 2,
    "calories": 214
  },
  {
    "name": "Curry, chicken tikka masala, retail, reheated",
    "protein": 12.4,
    "fat": 9.8,
    "carbs": 4.9,
    "calories": 156
  },
  {
    "name": "Curry, chicken vindaloo, homemade",
    "protein": 18.5,
    "fat": 12.5,
    "carbs": 2.6,
    "calories": 192
  },
  {
    "name": "Curry, chicken vindaloo, reduced fat, homemade",
    "protein": 19.6,
    "fat": 4.1,
    "carbs": 2.7,
    "calories": 121
  },
  {
    "name": "Curry, chicken, average, retail, reheated",
    "protein": 12.1,
    "fat": 8.9,
    "carbs": 5.4,
    "calories": 149
  },
  {
    "name": "Curry, chicken, average, retail, reheated with rice",
    "protein": 8.5,
    "fat": 5.8,
    "carbs": 18.2,
    "calories": 154
  },
  {
    "name": "Curry, chicken, average, takeaway",
    "protein": 11.7,
    "fat": 9.8,
    "carbs": 2.5,
    "calories": 145
  },
  {
    "name": "Curry, chicken, made with cook-in sauce",
    "protein": 18.6,
    "fat": 5.4,
    "carbs": 5.5,
    "calories": 144
  },
  {
    "name": "Curry, chicken, Thai green, takeaway and restaurant",
    "protein": 8.8,
    "fat": 8.7,
    "carbs": 1.5,
    "calories": 119
  },
  {
    "name": "Curry, courgette and potato, homemade",
    "protein": 1.8,
    "fat": 5.9,
    "carbs": 9.6,
    "calories": 96
  },
  {
    "name": "Curry, egg and potato, homemade",
    "protein": 7.5,
    "fat": 9.3,
    "carbs": 6.5,
    "calories": 138
  },
  {
    "name": "Curry, egg, in sweet sauce, UK type, homemade",
    "protein": 6.3,
    "fat": 7.3,
    "carbs": 5.9,
    "calories": 112
  },
  {
    "name": "Curry, egg, with butter, homemade",
    "protein": 5.4,
    "fat": 10.6,
    "carbs": 4.7,
    "calories": 135
  },
  {
    "name": "Curry, egg, with rapeseed oil, homemade",
    "protein": 5.3,
    "fat": 12.2,
    "carbs": 4.7,
    "calories": 149
  },
  {
    "name": "Curry, fish and vegetable, Bangladeshi, homemade",
    "protein": 9.1,
    "fat": 8.7,
    "carbs": 1.4,
    "calories": 118
  },
  {
    "name": "Curry, fish, Bangladeshi, homemade",
    "protein": 12.4,
    "fat": 8,
    "carbs": 1.5,
    "calories": 125
  },
  {
    "name": "Curry, fish, homemade",
    "protein": 11.3,
    "fat": 9.6,
    "carbs": 1.9,
    "calories": 139
  },
  {
    "name": "Curry, haddock, Bengali, homemade",
    "protein": 11.4,
    "fat": 22,
    "carbs": 4.2,
    "calories": 263
  },
  {
    "name": "Curry, lamb biryani, homemade",
    "protein": 7.1,
    "fat": 9.2,
    "carbs": 20.9,
    "calories": 195
  },
  {
    "name": "Curry, lamb biryani, reduced fat, homemade",
    "protein": 7.4,
    "fat": 3.7,
    "carbs": 21.9,
    "calories": 150
  },
  {
    "name": "Curry, lamb rogan josh, homemade",
    "protein": 14.4,
    "fat": 9.1,
    "carbs": 3.9,
    "calories": 149
  },
  {
    "name": "Curry, lamb vindaloo, homemade",
    "protein": 19.8,
    "fat": 12.9,
    "carbs": 2.7,
    "calories": 199
  },
  {
    "name": "Curry, lamb, made with cook-in sauce",
    "protein": 15.5,
    "fat": 17.7,
    "carbs": 5.5,
    "calories": 242
  },
  {
    "name": "Curry, lentil, red/masoor dahl and tomato, Punjabi, homemade",
    "protein": 3.2,
    "fat": 5.5,
    "carbs": 8.5,
    "calories": 93
  },
  {
    "name": "Curry, lentil, red/masoor dahl and tomato, with butter, homemade",
    "protein": 4.3,
    "fat": 5.3,
    "carbs": 10.6,
    "calories": 104
  },
  {
    "name": "Curry, lentil, red/masoor dahl and tomato, with vegetable oil, homemade",
    "protein": 4.3,
    "fat": 6.3,
    "carbs": 10.6,
    "calories": 113
  },
  {
    "name": "Curry, lentil, red/masoor dahl, mung bean dahl and tomato, homemade",
    "protein": 4.4,
    "fat": 4.3,
    "carbs": 9.7,
    "calories": 92
  },
  {
    "name": "Curry, lentil, red/masoor dahl, with butter, homemade",
    "protein": 7.6,
    "fat": 6.6,
    "carbs": 19.3,
    "calories": 161
  },
  {
    "name": "Curry, mung bean dahl and spinach, homemade",
    "protein": 7.8,
    "fat": 2.9,
    "carbs": 12.3,
    "calories": 102
  },
  {
    "name": "Curry, mung bean dahl and tomato, homemade",
    "protein": 5.6,
    "fat": 3.6,
    "carbs": 11.2,
    "calories": 95
  },
  {
    "name": "Curry, pea and potato, homemade",
    "protein": 2.5,
    "fat": 11,
    "carbs": 10.2,
    "calories": 147
  },
  {
    "name": "Curry, pigeon pea dahl and tomato, homemade",
    "protein": 2.3,
    "fat": 2.2,
    "carbs": 7.3,
    "calories": 56
  },
  {
    "name": "Curry, pigeon pea dahl with tomatoes and peanuts, homemade",
    "protein": 6.9,
    "fat": 3.3,
    "carbs": 16.9,
    "calories": 121
  },
  {
    "name": "Curry, pigeon pea dahl, with butter, homemade",
    "protein": 4.6,
    "fat": 4.7,
    "carbs": 13.5,
    "calories": 108
  },
  {
    "name": "Curry, potato and pea, homemade",
    "protein": 2.7,
    "fat": 3.7,
    "carbs": 13,
    "calories": 92
  },
  {
    "name": "Curry, potato, Gujerati, homemade",
    "protein": 1.5,
    "fat": 5.4,
    "carbs": 11.8,
    "calories": 94
  },
  {
    "name": "Curry, potato, Punjabi, homemade",
    "protein": 1.8,
    "fat": 4,
    "carbs": 13.8,
    "calories": 94
  },
  {
    "name": "Curry, spinach and potato, masala, homemade",
    "protein": 2.2,
    "fat": 8.2,
    "carbs": 7.4,
    "calories": 110
  },
  {
    "name": "Curry, tinda gourd and potato, homemade",
    "protein": 1.6,
    "fat": 3.9,
    "carbs": 8.5,
    "calories": 74
  },
  {
    "name": "Curry, vegetable, ready meal, without rice, cooked",
    "protein": 2.1,
    "fat": 6,
    "carbs": 8.4,
    "calories": 94
  },
  {
    "name": "Curry, vegetable, retail, with rice",
    "protein": 3,
    "fat": 4.1,
    "carbs": 20.2,
    "calories": 125
  },
  {
    "name": "Curry, vegetable, with yogurt, UK type, homemade",
    "protein": 2.2,
    "fat": 4,
    "carbs": 4.7,
    "calories": 64
  },
  {
    "name": "Custard apple/Bullock's heart, flesh only",
    "protein": 1.5,
    "fat": 0.4,
    "carbs": 16.1,
    "calories": 70
  },
  {
    "name": "Custard, egg",
    "protein": 5.9,
    "fat": 3.4,
    "carbs": 10.9,
    "calories": 95
  },
  {
    "name": "Custard, made up with semi-skimmed milk",
    "protein": 4,
    "fat": 2,
    "carbs": 16.4,
    "calories": 95
  },
  {
    "name": "Custard, made up with skimmed milk",
    "protein": 4,
    "fat": 0.3,
    "carbs": 16.5,
    "calories": 81
  },
  {
    "name": "Custard, made up with whole milk",
    "protein": 4,
    "fat": 4.2,
    "carbs": 16.3,
    "calories": 114
  },
  {
    "name": "Cuttlefish, raw",
    "protein": 16.1,
    "fat": 0.7,
    "carbs": 0,
    "calories": 71
  },
  {
    "name": "Damsons, stewed with sugar",
    "protein": 0.4,
    "fat": 0,
    "carbs": 19.3,
    "calories": 74
  },
  {
    "name": "Damsons, stewed without sugar",
    "protein": 0.5,
    "fat": 0,
    "carbs": 8.7,
    "calories": 34
  },
  {
    "name": "Doner kebab in pitta bread with salad",
    "protein": 14.1,
    "fat": 16,
    "carbs": 12.5,
    "calories": 248
  },
  {
    "name": "Doughnuts, ring, iced",
    "protein": 5.8,
    "fat": 25.7,
    "carbs": 42.3,
    "calories": 413
  },
  {
    "name": "Doughnuts, with jam",
    "protein": 5.4,
    "fat": 13.1,
    "carbs": 48.4,
    "calories": 321
  },
  {
    "name": "Dressing, blue cheese",
    "protein": 2,
    "fat": 35.9,
    "carbs": 9.8,
    "calories": 368
  },
  {
    "name": "Dressing, yogurt, homemade",
    "protein": 5.3,
    "fat": 2.7,
    "carbs": 7.1,
    "calories": 72
  },
  {
    "name": "Drinking chocolate powder, made up with semi-skimmed milk",
    "protein": 3.7,
    "fat": 2,
    "carbs": 10.9,
    "calories": 74
  },
  {
    "name": "Drinking chocolate powder, made up with skimmed milk",
    "protein": 3.7,
    "fat": 0.7,
    "carbs": 10.9,
    "calories": 62
  },
  {
    "name": "Drinking chocolate powder, made up with whole milk",
    "protein": 3.6,
    "fat": 3.8,
    "carbs": 10.8,
    "calories": 89
  },
  {
    "name": "Dripping, beef",
    "protein": 0,
    "fat": 99,
    "carbs": 0,
    "calories": 891
  },
  {
    "name": "Duck a l'orange, excluding fat and skin, homemade",
    "protein": 11.2,
    "fat": 6.5,
    "carbs": 4,
    "calories": 122
  },
  {
    "name": "Duck a l'orange, including fat and skin, homemade",
    "protein": 9.8,
    "fat": 20,
    "carbs": 3.7,
    "calories": 236
  },
  {
    "name": "Duck with pineapple, homemade",
    "protein": 13.8,
    "fat": 25.5,
    "carbs": 6.7,
    "calories": 313
  },
  {
    "name": "Egg fu yung",
    "protein": 10.2,
    "fat": 19.3,
    "carbs": 2.5,
    "calories": 229
  },
  {
    "name": "Egg nog, homemade",
    "protein": 4,
    "fat": 2.3,
    "carbs": 9.6,
    "calories": 98
  },
  {
    "name": "Eggs, chicken, scrambled, with semi-skimmed milk",
    "protein": 11,
    "fat": 21.2,
    "carbs": 0.7,
    "calories": 237
  },
  {
    "name": "Eggs, chicken, white, boiled",
    "protein": 13,
    "fat": 0,
    "carbs": 0,
    "calories": 52
  },
  {
    "name": "Eggs, chicken, white, dried",
    "protein": 81.7,
    "fat": 0,
    "carbs": 0,
    "calories": 327
  },
  {
    "name": "Eggs, chicken, white, raw",
    "protein": 10.8,
    "fat": 0,
    "carbs": 0,
    "calories": 43
  },
  {
    "name": "Eggs, chicken, whole, boiled",
    "protein": 14.1,
    "fat": 9.6,
    "carbs": 0,
    "calories": 143
  },
  {
    "name": "Eggs, chicken, whole, dried",
    "protein": 48.6,
    "fat": 34.7,
    "carbs": 0,
    "calories": 507
  },
  {
    "name": "Eggs, chicken, whole, fried in sunflower oil",
    "protein": 14.7,
    "fat": 15.7,
    "carbs": 0,
    "calories": 200
  },
  {
    "name": "Eggs, chicken, whole, fried, without fat",
    "protein": 16,
    "fat": 11.4,
    "carbs": 0,
    "calories": 167
  },
  {
    "name": "Eggs, chicken, whole, poached",
    "protein": 13.3,
    "fat": 10.6,
    "carbs": 0,
    "calories": 149
  },
  {
    "name": "Eggs, chicken, whole, raw",
    "protein": 12.6,
    "fat": 9,
    "carbs": 0,
    "calories": 131
  },
  {
    "name": "Eggs, chicken, whole, scrambled, without milk",
    "protein": 14.6,
    "fat": 10.4,
    "carbs": 0,
    "calories": 152
  },
  {
    "name": "Eggs, chicken, yolk, boiled",
    "protein": 16.7,
    "fat": 32.6,
    "carbs": 0,
    "calories": 360
  },
  {
    "name": "Eggs, chicken, yolk, raw",
    "protein": 16.4,
    "fat": 31.3,
    "carbs": 0,
    "calories": 347
  },
  {
    "name": "Eggs, duck, boiled and salted",
    "protein": 14.6,
    "fat": 15.5,
    "carbs": 0,
    "calories": 198
  },
  {
    "name": "Eggs, duck, whole, raw",
    "protein": 14.3,
    "fat": 11.8,
    "carbs": 0,
    "calories": 163
  },
  {
    "name": "Eggs, quail, whole, raw",
    "protein": 12.9,
    "fat": 11.1,
    "carbs": 0,
    "calories": 151
  },
  {
    "name": "Eggs, turkey, whole, raw",
    "protein": 13.7,
    "fat": 12.2,
    "carbs": 0,
    "calories": 165
  },
  {
    "name": "Elderberries, whole fruit",
    "protein": 0.7,
    "fat": 0.5,
    "carbs": 7.4,
    "calories": 35
  },
  {
    "name": "Enchiladas, beef, homemade",
    "protein": 9.6,
    "fat": 8.2,
    "carbs": 11.1,
    "calories": 153
  },
  {
    "name": "Fajita, chicken, meat only, takeaway and restaurant",
    "protein": 16.8,
    "fat": 6.3,
    "carbs": 0.3,
    "calories": 125
  },
  {
    "name": "Fat spread, low fat (26-39%), not polyunsaturated, with olive oil",
    "protein": 0.1,
    "fat": 38.9,
    "carbs": 0.5,
    "calories": 353
  },
  {
    "name": "Fat spread, reduced fat (41-62%), not polyunsaturated, with olive oil",
    "protein": 0.2,
    "fat": 59.1,
    "carbs": 1.1,
    "calories": 537
  },
  {
    "name": "Figs, dried, stewed with sugar",
    "protein": 1.9,
    "fat": 0.8,
    "carbs": 34.3,
    "calories": 143
  },
  {
    "name": "Figs, dried, stewed without sugar",
    "protein": 2,
    "fat": 0.9,
    "carbs": 29.4,
    "calories": 126
  },
  {
    "name": "Fish balls, steamed",
    "protein": 11.8,
    "fat": 0.5,
    "carbs": 5.5,
    "calories": 74
  },
  {
    "name": "Fish fingers, cod, fried in rapeseed oil",
    "protein": 13,
    "fat": 12.6,
    "carbs": 19.9,
    "calories": 240
  },
  {
    "name": "Fish fingers, cod, fried in sunflower oil",
    "protein": 13,
    "fat": 12.6,
    "carbs": 19.9,
    "calories": 240
  },
  {
    "name": "Fish fingers, cod, grilled/baked",
    "protein": 14.3,
    "fat": 9.2,
    "carbs": 22,
    "calories": 223
  },
  {
    "name": "Fish fingers, pollock, grilled",
    "protein": 13.9,
    "fat": 9.2,
    "carbs": 20,
    "calories": 213
  },
  {
    "name": "Fish fingers, salmon, grilled/baked",
    "protein": 17.2,
    "fat": 11.2,
    "carbs": 20.7,
    "calories": 247
  },
  {
    "name": "Fish paste",
    "protein": 15.3,
    "fat": 10.5,
    "carbs": 3.7,
    "calories": 170
  },
  {
    "name": "Fishcakes, cod, homemade",
    "protein": 11.3,
    "fat": 14.7,
    "carbs": 15.2,
    "calories": 235
  },
  {
    "name": "Fishcakes, salmon, coated in breadcrumbs, baked",
    "protein": 11.4,
    "fat": 13.7,
    "carbs": 20.4,
    "calories": 245
  },
  {
    "name": "Fishcakes, salmon, homemade",
    "protein": 11.4,
    "fat": 20.5,
    "carbs": 15.2,
    "calories": 287
  },
  {
    "name": "Fishcakes, white fish, coated in breadcrumbs, baked",
    "protein": 9.3,
    "fat": 9.4,
    "carbs": 22.6,
    "calories": 206
  },
  {
    "name": "Flan, cheese and mushroom, homemade",
    "protein": 10.8,
    "fat": 19.9,
    "carbs": 16,
    "calories": 282
  },
  {
    "name": "Flan, cheese and mushroom, wholemeal, homemade",
    "protein": 11.3,
    "fat": 18.1,
    "carbs": 17.1,
    "calories": 272
  },
  {
    "name": "Flan, cheese, onion and potato, homemade",
    "protein": 13,
    "fat": 26.2,
    "carbs": 18,
    "calories": 355
  },
  {
    "name": "Flan, cheese, onion and potato, wholemeal, homemade",
    "protein": 13.6,
    "fat": 24.3,
    "carbs": 19.1,
    "calories": 345
  },
  {
    "name": "Flan, lentil and tomato, homemade",
    "protein": 7.4,
    "fat": 5.7,
    "carbs": 23.6,
    "calories": 169
  },
  {
    "name": "Flan, lentil and tomato, wholemeal, homemade",
    "protein": 7.7,
    "fat": 5.8,
    "carbs": 22,
    "calories": 165
  },
  {
    "name": "Flan, spinach, homemade",
    "protein": 8.6,
    "fat": 14.7,
    "carbs": 13.4,
    "calories": 211
  },
  {
    "name": "Flan, spinach, wholemeal, homemade",
    "protein": 9,
    "fat": 13.4,
    "carbs": 11.3,
    "calories": 206
  },
  {
    "name": "Flour, rice",
    "protein": 6.4,
    "fat": 0.8,
    "carbs": 80.1,
    "calories": 366
  },
  {
    "name": "Flour, wheat, bread/strong, white",
    "protein": 11.3,
    "fat": 1.2,
    "carbs": 79.2,
    "calories": 353
  },
  {
    "name": "Flour, wheat, brown, bread/strong",
    "protein": 13.4,
    "fat": 1.9,
    "carbs": 72,
    "calories": 341
  },
  {
    "name": "Flour, wheat, wholemeal, bread/strong",
    "protein": 14.2,
    "fat": 2.2,
    "carbs": 66.7,
    "calories": 327
  },
  {
    "name": "Flying fish, raw",
    "protein": 21,
    "fat": 0.3,
    "carbs": 0,
    "calories": 86
  },
  {
    "name": "Fruit juice drink, carbonated, no added sugar, ready to drink",
    "protein": 0,
    "fat": 0,
    "carbs": 0.6,
    "calories": 2
  },
  {
    "name": "Fruit juice drink, no added sugar, ready to drink",
    "protein": 0.2,
    "fat": 0,
    "carbs": 0.9,
    "calories": 4
  },
  {
    "name": "Fruit juice drink/squash, no sugar added, diluted",
    "protein": 0,
    "fat": 0,
    "carbs": 0.3,
    "calories": 1
  },
  {
    "name": "Fruit juice drink/squash, no sugar added, undiluted",
    "protein": 0.1,
    "fat": 0,
    "carbs": 1.4,
    "calories": 6
  },
  {
    "name": "Fu-fu, sweet potato, homemade",
    "protein": 1.6,
    "fat": 0.3,
    "carbs": 25.9,
    "calories": 109
  },
  {
    "name": "Ghee, butter",
    "protein": 0.1,
    "fat": 97.6,
    "carbs": 0,
    "calories": 878
  },
  {
    "name": "Giblets, chicken, boiled",
    "protein": 22.9,
    "fat": 7.1,
    "carbs": 0,
    "calories": 156
  },
  {
    "name": "Giblets, chicken, raw",
    "protein": 17.1,
    "fat": 8.2,
    "carbs": 0,
    "calories": 142
  },
  {
    "name": "Giblets, turkey, boiled",
    "protein": 28.1,
    "fat": 8.8,
    "carbs": 0,
    "calories": 192
  },
  {
    "name": "Gingerbread, homemade",
    "protein": 5.6,
    "fat": 11.3,
    "carbs": 65.9,
    "calories": 371
  },
  {
    "name": "Gooseberries, cooking, raw",
    "protein": 1.1,
    "fat": 0.4,
    "carbs": 3,
    "calories": 19
  },
  {
    "name": "Gooseberries, cooking, stewed with sugar",
    "protein": 0.7,
    "fat": 0.3,
    "carbs": 12.9,
    "calories": 54
  },
  {
    "name": "Gooseberries, cooking, stewed without sugar",
    "protein": 0.9,
    "fat": 0.3,
    "carbs": 2.5,
    "calories": 16
  },
  {
    "name": "Gooseberries, dessert, raw",
    "protein": 0.7,
    "fat": 0.3,
    "carbs": 9.2,
    "calories": 40
  },
  {
    "name": "Green beans, dried",
    "protein": 21.6,
    "fat": 4.4,
    "carbs": 31.9,
    "calories": 246
  },
  {
    "name": "Greengages, stewed with sugar",
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 20.7,
    "calories": 81
  },
  {
    "name": "Greengages, stones, removed, stewed without sugar",
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 8.7,
    "calories": 36
  },
  {
    "name": "Grenadillas, flesh and seeds",
    "protein": 2.8,
    "fat": 0.3,
    "carbs": 7.5,
    "calories": 42
  },
  {
    "name": "Haddock, coated in crumbs, frozen, fried in blended oil",
    "protein": 14.7,
    "fat": 10,
    "carbs": 12.6,
    "calories": 196
  },
  {
    "name": "Haddock, coated in crumbs, frozen, raw",
    "protein": 13.8,
    "fat": 5.2,
    "carbs": 10.5,
    "calories": 141
  },
  {
    "name": "Haddock, fillets, flesh only, in flour, fried in dripping",
    "protein": 21.1,
    "fat": 4.1,
    "carbs": 4.5,
    "calories": 138
  },
  {
    "name": "Haddock, fillets, flesh only, in flour, fried in sunflower oil",
    "protein": 21.1,
    "fat": 4.1,
    "carbs": 4.5,
    "calories": 138
  },
  {
    "name": "Haddock, flesh only, grilled",
    "protein": 23.9,
    "fat": 0.3,
    "carbs": 0,
    "calories": 98
  },
  {
    "name": "Haddock, flesh only, poached",
    "protein": 22.8,
    "fat": 0.5,
    "carbs": 0,
    "calories": 96
  },
  {
    "name": "Haddock, flesh only, raw",
    "protein": 17.8,
    "fat": 0.4,
    "carbs": 0,
    "calories": 75
  },
  {
    "name": "Haddock, flesh only, smoked, poached",
    "protein": 21.8,
    "fat": 0.5,
    "carbs": 0,
    "calories": 92
  },
  {
    "name": "Haddock, flesh only, smoked, raw",
    "protein": 19.7,
    "fat": 0.5,
    "carbs": 0,
    "calories": 83
  },
  {
    "name": "Haddock, flesh only, smoked, steamed",
    "protein": 22.5,
    "fat": 0.5,
    "carbs": 0,
    "calories": 95
  },
  {
    "name": "Haddock, flesh only, steamed",
    "protein": 21.8,
    "fat": 0.6,
    "carbs": 0,
    "calories": 93
  },
  {
    "name": "Haddock, in batter, fried in blended oil",
    "protein": 17.1,
    "fat": 14,
    "carbs": 10,
    "calories": 232
  },
  {
    "name": "Haddock, in batter, fried in dripping",
    "protein": 17.1,
    "fat": 14,
    "carbs": 10,
    "calories": 232
  },
  {
    "name": "Haddock, in batter, fried in retail blend oil",
    "protein": 17.1,
    "fat": 14,
    "carbs": 10,
    "calories": 232
  },
  {
    "name": "Haddock, in batter, fried in sunflower oil",
    "protein": 17.1,
    "fat": 14,
    "carbs": 10,
    "calories": 232
  },
  {
    "name": "Halva, carrot, homemade",
    "protein": 4.8,
    "fat": 16.6,
    "carbs": 44,
    "calories": 354
  },
  {
    "name": "Ham",
    "protein": 18.4,
    "fat": 3.3,
    "carbs": 1,
    "calories": 107
  },
  {
    "name": "Ham, gammon joint, boiled",
    "protein": 23.3,
    "fat": 12.3,
    "carbs": 0,
    "calories": 204
  },
  {
    "name": "Ham, gammon joint, raw",
    "protein": 17.5,
    "fat": 7.5,
    "carbs": 0,
    "calories": 138
  },
  {
    "name": "Ham, gammon rashers, grilled",
    "protein": 27.5,
    "fat": 9.9,
    "carbs": 0,
    "calories": 199
  },
  {
    "name": "Hazelnuts, kernel only",
    "protein": 14.1,
    "fat": 63.5,
    "carbs": 6,
    "calories": 650
  },
  {
    "name": "Heart, lamb, raw",
    "protein": 17.1,
    "fat": 6.8,
    "carbs": 0,
    "calories": 129
  },
  {
    "name": "Heart, lamb, roasted",
    "protein": 25.3,
    "fat": 13.9,
    "carbs": 0,
    "calories": 226
  },
  {
    "name": "High juice drink, no added sugar, undiluted",
    "protein": 0.3,
    "fat": 0,
    "carbs": 4.6,
    "calories": 18
  },
  {
    "name": "Honey",
    "protein": 0.4,
    "fat": 0,
    "carbs": 76.4,
    "calories": 288
  },
  {
    "name": "Honey and comb",
    "protein": 0.6,
    "fat": 4.6,
    "carbs": 74.4,
    "calories": 281
  },
  {
    "name": "Horlicks powder, made up with semi-skimmed milk",
    "protein": 4.1,
    "fat": 1.8,
    "carbs": 13.5,
    "calories": 83
  },
  {
    "name": "Horlicks powder, made up with skimmed milk",
    "protein": 4.1,
    "fat": 0.6,
    "carbs": 13.5,
    "calories": 72
  },
  {
    "name": "Horlicks powder, made up with whole milk",
    "protein": 4.1,
    "fat": 3.5,
    "carbs": 13.3,
    "calories": 98
  },
  {
    "name": "Hot pot, lamb/beef with potatoes, retail, reheated",
    "protein": 7.2,
    "fat": 4.4,
    "carbs": 10.6,
    "calories": 108
  },
  {
    "name": "Icing, butter, homemade",
    "protein": 0.2,
    "fat": 29.4,
    "carbs": 63.4,
    "calories": 507
  },
  {
    "name": "Instant dessert powder, made up with skimmed milk",
    "protein": 3.3,
    "fat": 3.2,
    "carbs": 14.4,
    "calories": 96
  },
  {
    "name": "Instant dessert powder, made up with whole milk",
    "protein": 3.2,
    "fat": 6,
    "carbs": 14.3,
    "calories": 121
  },
  {
    "name": "Jackfish, raw",
    "protein": 21.7,
    "fat": 2.4,
    "carbs": 0,
    "calories": 108
  },
  {
    "name": "Jam, fruit with edible seeds",
    "protein": 0.6,
    "fat": 0,
    "carbs": 69,
    "calories": 261
  },
  {
    "name": "Jam, reduced sugar",
    "protein": 0.5,
    "fat": 0.1,
    "carbs": 31.9,
    "calories": 123
  },
  {
    "name": "Jelly, made with skimmed milk",
    "protein": 2.6,
    "fat": 0,
    "carbs": 16.8,
    "calories": 73
  },
  {
    "name": "Jelly, sugar free, made with water",
    "protein": 1.6,
    "fat": 0,
    "carbs": 0,
    "calories": 6
  },
  {
    "name": "Kebabs, pork and pineapple, homemade",
    "protein": 14.4,
    "fat": 9.9,
    "carbs": 5.9,
    "calories": 170
  },
  {
    "name": "Kheema, beef, homemade",
    "protein": 11.7,
    "fat": 10.8,
    "carbs": 4.6,
    "calories": 160
  },
  {
    "name": "Kheema, lamb, homemade",
    "protein": 11,
    "fat": 13.4,
    "carbs": 4,
    "calories": 178
  },
  {
    "name": "Kheema, lamb, reduced fat, homemade",
    "protein": 11.4,
    "fat": 9.4,
    "carbs": 3.2,
    "calories": 142
  },
  {
    "name": "Khichadi, with butter ghee",
    "protein": 4.8,
    "fat": 5.2,
    "carbs": 27.3,
    "calories": 169
  },
  {
    "name": "Kidney, lamb, fried in corn oil",
    "protein": 23.7,
    "fat": 10.3,
    "carbs": 0,
    "calories": 188
  },
  {
    "name": "Kidney, lamb, raw",
    "protein": 17,
    "fat": 2.6,
    "carbs": 0,
    "calories": 91
  },
  {
    "name": "Kippers, flesh only, boil in the bag, with butter, cooked",
    "protein": 18.6,
    "fat": 13.2,
    "carbs": 0,
    "calories": 193
  },
  {
    "name": "Kofta, beef, homemade",
    "protein": 25.3,
    "fat": 20.5,
    "carbs": 1.3,
    "calories": 290
  },
  {
    "name": "Kofta, lamb, coated with breadcrumbs, homemade",
    "protein": 23.8,
    "fat": 16,
    "carbs": 9.7,
    "calories": 277
  },
  {
    "name": "Lamb stir-fried with vegetables, homemade",
    "protein": 16.4,
    "fat": 18.4,
    "carbs": 2.3,
    "calories": 244
  },
  {
    "name": "Lamb, average, raw, lean and fat",
    "protein": 19,
    "fat": 12.3,
    "carbs": 0,
    "calories": 187
  },
  {
    "name": "Lamb, best end neck cutlets, barbecued, lean",
    "protein": 27.7,
    "fat": 13.9,
    "carbs": 0,
    "calories": 236
  },
  {
    "name": "Lamb, best end neck cutlets, barbecued, lean and fat",
    "protein": 24.3,
    "fat": 27.2,
    "carbs": 0,
    "calories": 342
  },
  {
    "name": "Lamb, best end neck cutlets, grilled, lean",
    "protein": 28.5,
    "fat": 13.8,
    "carbs": 0,
    "calories": 238
  },
  {
    "name": "Lamb, best end neck cutlets, grilled, lean and fat",
    "protein": 24.5,
    "fat": 29.9,
    "carbs": 0,
    "calories": 367
  },
  {
    "name": "Lamb, best end neck cutlets, raw, lean and fat",
    "protein": 16.3,
    "fat": 27.9,
    "carbs": 0,
    "calories": 316
  },
  {
    "name": "Lamb, breast, raw, lean",
    "protein": 19.6,
    "fat": 11.2,
    "carbs": 0,
    "calories": 179
  },
  {
    "name": "Lamb, breast, raw, lean and fat",
    "protein": 16.2,
    "fat": 24.7,
    "carbs": 0,
    "calories": 287
  },
  {
    "name": "Lamb, breast, roasted, lean",
    "protein": 26.7,
    "fat": 18.5,
    "carbs": 0,
    "calories": 273
  },
  {
    "name": "Lamb, breast, roasted, lean and fat",
    "protein": 22.4,
    "fat": 29.9,
    "carbs": 0,
    "calories": 359
  },
  {
    "name": "Lamb, chump chops, fried, lean",
    "protein": 28.1,
    "fat": 11.2,
    "carbs": 0,
    "calories": 213
  },
  {
    "name": "Lamb, chump chops, fried, lean and fat",
    "protein": 24.7,
    "fat": 23.2,
    "carbs": 0,
    "calories": 308
  },
  {
    "name": "Lamb, chump chops, raw, lean and fat",
    "protein": 18.3,
    "fat": 18.8,
    "carbs": 0,
    "calories": 242
  },
  {
    "name": "Lamb, chump steaks, fried, lean and fat",
    "protein": 24.8,
    "fat": 20.4,
    "carbs": 0,
    "calories": 283
  },
  {
    "name": "Lamb, chump steaks, raw, lean and fat",
    "protein": 18.6,
    "fat": 16.4,
    "carbs": 0,
    "calories": 222
  },
  {
    "name": "Lamb, fat, average, cooked",
    "protein": 15.4,
    "fat": 56.3,
    "carbs": 0,
    "calories": 568
  },
  {
    "name": "Lamb, fat, average, raw",
    "protein": 13.3,
    "fat": 51.6,
    "carbs": 0,
    "calories": 518
  },
  {
    "name": "Lamb, fat, raw, average, extra trimmed",
    "protein": 6.5,
    "fat": 77.2,
    "carbs": 0,
    "calories": 721
  },
  {
    "name": "Lamb, lean only, raw, average",
    "protein": 20.2,
    "fat": 8,
    "carbs": 0,
    "calories": 153
  },
  {
    "name": "Lamb, lean only, raw, average, extra trimmed",
    "protein": 20,
    "fat": 7.5,
    "carbs": 0,
    "calories": 148
  },
  {
    "name": "Lamb, leg chops, grilled, lean and fat",
    "protein": 28.3,
    "fat": 12,
    "carbs": 0,
    "calories": 221
  },
  {
    "name": "Lamb, leg joint, roasted, lean",
    "protein": 30.8,
    "fat": 9.6,
    "carbs": 0,
    "calories": 210
  },
  {
    "name": "Lamb, leg joint, roasted, lean and fat",
    "protein": 29.7,
    "fat": 13,
    "carbs": 0,
    "calories": 236
  },
  {
    "name": "Lamb, leg steaks, grilled, lean",
    "protein": 29.2,
    "fat": 9,
    "carbs": 0,
    "calories": 198
  },
  {
    "name": "Lamb, leg steaks, grilled, lean and fat",
    "protein": 28,
    "fat": 13.2,
    "carbs": 0,
    "calories": 231
  },
  {
    "name": "Lamb, leg, half fillet, braised, lean",
    "protein": 27.3,
    "fat": 10.5,
    "carbs": 0,
    "calories": 204
  },
  {
    "name": "Lamb, leg, half fillet, braised, lean and fat",
    "protein": 25.6,
    "fat": 17.1,
    "carbs": 0,
    "calories": 256
  },
  {
    "name": "Lamb, leg, half knuckle, pot-roasted, lean",
    "protein": 29.4,
    "fat": 9.3,
    "carbs": 0,
    "calories": 201
  },
  {
    "name": "Lamb, leg, half knuckle, pot-roasted, lean and fat",
    "protein": 28.1,
    "fat": 13.8,
    "carbs": 0,
    "calories": 237
  },
  {
    "name": "Lamb, leg, whole, roasted well done, lean",
    "protein": 31.3,
    "fat": 9.2,
    "carbs": 0,
    "calories": 208
  },
  {
    "name": "Lamb, leg, whole, roasted well done, lean and fat",
    "protein": 29.8,
    "fat": 13.6,
    "carbs": 0,
    "calories": 242
  },
  {
    "name": "Lamb, leg, whole, roasted, lean and fat",
    "protein": 28.1,
    "fat": 14.2,
    "carbs": 0,
    "calories": 240
  },
  {
    "name": "Lamb, leg, whole, roasted, lean only",
    "protein": 29.7,
    "fat": 9.4,
    "carbs": 0,
    "calories": 203
  },
  {
    "name": "Lamb, loin chops, grilled, lean",
    "protein": 29.2,
    "fat": 10.7,
    "carbs": 0,
    "calories": 213
  },
  {
    "name": "Lamb, loin chops, grilled, lean and fat",
    "protein": 26.5,
    "fat": 22.1,
    "carbs": 0,
    "calories": 305
  },
  {
    "name": "Lamb, loin chops, microwaved, lean",
    "protein": 32.4,
    "fat": 12.5,
    "carbs": 0,
    "calories": 242
  },
  {
    "name": "Lamb, loin chops, microwaved, lean and fat",
    "protein": 27.5,
    "fat": 26.9,
    "carbs": 0,
    "calories": 352
  },
  {
    "name": "Lamb, loin chops, raw, lean and fat",
    "protein": 17.6,
    "fat": 23,
    "carbs": 0,
    "calories": 277
  },
  {
    "name": "Lamb, loin chops, roasted, lean",
    "protein": 34.4,
    "fat": 13.3,
    "carbs": 0,
    "calories": 257
  },
  {
    "name": "Lamb, loin chops, roasted, lean and fat",
    "protein": 29.1,
    "fat": 26.9,
    "carbs": 0,
    "calories": 359
  },
  {
    "name": "Lamb, loin joint, raw, lean and fat",
    "protein": 16.9,
    "fat": 26.6,
    "carbs": 0,
    "calories": 307
  },
  {
    "name": "Lamb, loin joint, roasted, lean",
    "protein": 28.2,
    "fat": 10.7,
    "carbs": 0,
    "calories": 209
  },
  {
    "name": "Lamb, loin joint, roasted, lean and fat",
    "protein": 25.3,
    "fat": 22.4,
    "carbs": 0,
    "calories": 303
  },
  {
    "name": "Lamb, mince, raw",
    "protein": 19.1,
    "fat": 13.3,
    "carbs": 0,
    "calories": 196
  },
  {
    "name": "Lamb, mince, stewed",
    "protein": 24.4,
    "fat": 12.3,
    "carbs": 0,
    "calories": 208
  },
  {
    "name": "Lamb, mince, stewed with onions",
    "protein": 10.6,
    "fat": 8.5,
    "carbs": 2.8,
    "calories": 129
  },
  {
    "name": "Lamb, neck fillet, raw, lean",
    "protein": 19.4,
    "fat": 13.9,
    "carbs": 0,
    "calories": 203
  },
  {
    "name": "Lamb, neck fillet, raw, lean and fat",
    "protein": 18.4,
    "fat": 17.6,
    "carbs": 0,
    "calories": 232
  },
  {
    "name": "Lamb, neck fillet, slices, grilled, lean",
    "protein": 27.9,
    "fat": 19.1,
    "carbs": 0,
    "calories": 284
  },
  {
    "name": "Lamb, neck fillet, slices, grilled, lean and fat",
    "protein": 26.3,
    "fat": 21.9,
    "carbs": 0,
    "calories": 302
  },
  {
    "name": "Lamb, neck fillet, strips, stir-fried  in corn oil, lean",
    "protein": 24.4,
    "fat": 20,
    "carbs": 0,
    "calories": 278
  },
  {
    "name": "Lamb, neck fillet, strips, stir-fried in corn oil, lean and fat",
    "protein": 23.2,
    "fat": 23.1,
    "carbs": 0,
    "calories": 301
  },
  {
    "name": "Lamb, New Zealand, leg, whole, chilled, roasted, lean",
    "protein": 28.8,
    "fat": 10.2,
    "carbs": 0,
    "calories": 207
  },
  {
    "name": "Lamb, New Zealand, leg, whole, chilled, roasted, lean and fat",
    "protein": 28,
    "fat": 13.1,
    "carbs": 0,
    "calories": 230
  },
  {
    "name": "Lamb, New Zealand, leg, whole, frozen, roasted, lean",
    "protein": 30.6,
    "fat": 9.3,
    "carbs": 0,
    "calories": 206
  },
  {
    "name": "Lamb, New Zealand, leg, whole, frozen, roasted, lean and fat",
    "protein": 29,
    "fat": 14.1,
    "carbs": 0,
    "calories": 243
  },
  {
    "name": "Lamb, New Zealand, loin chops, frozen, grilled, lean",
    "protein": 31.4,
    "fat": 13.7,
    "carbs": 0,
    "calories": 249
  },
  {
    "name": "Lamb, New Zealand, loin chops, frozen, grilled, lean and fat",
    "protein": 26.9,
    "fat": 28.5,
    "carbs": 0,
    "calories": 364
  },
  {
    "name": "Lamb, New Zealand, mince, frozen, stewed",
    "protein": 20.9,
    "fat": 17.7,
    "carbs": 0,
    "calories": 243
  },
  {
    "name": "Lamb, New Zealand, shoulder, whole, frozen, roasted, lean",
    "protein": 27.6,
    "fat": 15.6,
    "carbs": 0,
    "calories": 251
  },
  {
    "name": "Lamb, New Zealand, shoulder, whole, frozen, roasted, lean and fat",
    "protein": 24.6,
    "fat": 27.9,
    "carbs": 0,
    "calories": 350
  },
  {
    "name": "Lamb, rack of, lean, roasted",
    "protein": 27.1,
    "fat": 13,
    "carbs": 0,
    "calories": 225
  },
  {
    "name": "Lamb, rack of, raw, lean and fat",
    "protein": 17.3,
    "fat": 23.8,
    "carbs": 0,
    "calories": 283
  },
  {
    "name": "Lamb, rack of, roasted, lean and fat",
    "protein": 23,
    "fat": 30.1,
    "carbs": 0,
    "calories": 363
  },
  {
    "name": "Lamb, shoulder joint, roasted, lean",
    "protein": 28.4,
    "fat": 13.5,
    "carbs": 0,
    "calories": 235
  },
  {
    "name": "Lamb, shoulder joint, roasted, lean and fat",
    "protein": 25.9,
    "fat": 19.8,
    "carbs": 0,
    "calories": 282
  },
  {
    "name": "Lamb, shoulder, diced, kebabs, grilled, lean and fat",
    "protein": 28.5,
    "fat": 19.3,
    "carbs": 0,
    "calories": 288
  },
  {
    "name": "Lamb, shoulder, half bladeside, pot-roasted, lean",
    "protein": 26.2,
    "fat": 14.3,
    "carbs": 0,
    "calories": 234
  },
  {
    "name": "Lamb, shoulder, half bladeside, pot-roasted, lean and fat",
    "protein": 23.5,
    "fat": 25.6,
    "carbs": 0,
    "calories": 324
  },
  {
    "name": "Lamb, shoulder, half knuckle, braised, lean",
    "protein": 25.1,
    "fat": 12.4,
    "carbs": 0,
    "calories": 212
  },
  {
    "name": "Lamb, shoulder, half knuckle, braised, lean and fat",
    "protein": 22.9,
    "fat": 23.4,
    "carbs": 0,
    "calories": 302
  },
  {
    "name": "Lamb, shoulder, raw, lean and fat",
    "protein": 17.6,
    "fat": 18.3,
    "carbs": 0,
    "calories": 235
  },
  {
    "name": "Lamb, shoulder, whole, roasted, lean",
    "protein": 27.2,
    "fat": 12.1,
    "carbs": 0,
    "calories": 218
  },
  {
    "name": "Lamb, shoulder, whole, roasted, lean and fat",
    "protein": 24.7,
    "fat": 22.1,
    "carbs": 0,
    "calories": 298
  },
  {
    "name": "Lamb, stewing, pressure cooked, lean",
    "protein": 28.7,
    "fat": 14.8,
    "carbs": 0,
    "calories": 248
  },
  {
    "name": "Lamb, stewing, pressure cooked, lean and fat",
    "protein": 25.7,
    "fat": 20.9,
    "carbs": 0,
    "calories": 291
  },
  {
    "name": "Lamb, stewing, raw, lean and fat",
    "protein": 22.5,
    "fat": 12.6,
    "carbs": 0,
    "calories": 203
  },
  {
    "name": "Lamb, stewing, stewed, lean",
    "protein": 26.6,
    "fat": 14.8,
    "carbs": 0,
    "calories": 240
  },
  {
    "name": "Lamb, stewing, stewed, lean and fat",
    "protein": 24.4,
    "fat": 20.1,
    "carbs": 0,
    "calories": 279
  },
  {
    "name": "Lamb's heart casserole, homemade",
    "protein": 11.8,
    "fat": 8.1,
    "carbs": 9.9,
    "calories": 161
  },
  {
    "name": "Lasagne, homemade, with extra lean minced beef",
    "protein": 10.1,
    "fat": 7,
    "carbs": 15.2,
    "calories": 160
  },
  {
    "name": "Lasagne, spinach, wholemeal, homemade",
    "protein": 4.2,
    "fat": 3.1,
    "carbs": 13,
    "calories": 93
  },
  {
    "name": "Laverbread",
    "protein": 3.2,
    "fat": 3.7,
    "carbs": 1.6,
    "calories": 52
  },
  {
    "name": "Leeks in cheese sauce, made with semi-skimmed milk, homemade",
    "protein": 4,
    "fat": 5.5,
    "carbs": 4.6,
    "calories": 82
  },
  {
    "name": "Leeks in cheese sauce, made with skimmed milk, homemade",
    "protein": 4,
    "fat": 5,
    "carbs": 4.6,
    "calories": 79
  },
  {
    "name": "Leeks in cheese sauce, made with whole milk, homemade",
    "protein": 4,
    "fat": 6,
    "carbs": 4.5,
    "calories": 87
  },
  {
    "name": "Lemon chicken, homemade",
    "protein": 16.9,
    "fat": 6.2,
    "carbs": 7.1,
    "calories": 150
  },
  {
    "name": "Lentil and nut roast, with egg, homemade",
    "protein": 10.8,
    "fat": 12.1,
    "carbs": 17.6,
    "calories": 218
  },
  {
    "name": "Lentil and potato pie, homemade",
    "protein": 5.3,
    "fat": 2.2,
    "carbs": 18.6,
    "calories": 111
  },
  {
    "name": "Lentil and rice roast, homemade",
    "protein": 5.1,
    "fat": 1.8,
    "carbs": 25.2,
    "calories": 131
  },
  {
    "name": "Lentil and rice roast, with egg, homemade",
    "protein": 5.5,
    "fat": 2.1,
    "carbs": 24.1,
    "calories": 131
  },
  {
    "name": "Lentil roast, with egg, homemade",
    "protein": 8.2,
    "fat": 3.6,
    "carbs": 20.3,
    "calories": 141
  },
  {
    "name": "Lentils, green and brown, whole, dried, boiled in unsalted water",
    "protein": 7.8,
    "fat": 0.7,
    "carbs": 14.5,
    "calories": 92
  },
  {
    "name": "Lentils, green and brown, whole, dried, raw",
    "protein": 24.3,
    "fat": 1.9,
    "carbs": 48.8,
    "calories": 297
  },
  {
    "name": "Lentils, red, split, dried, boiled in unsalted water",
    "protein": 8.1,
    "fat": 0.7,
    "carbs": 16.9,
    "calories": 102
  },
  {
    "name": "Lentils, red, split, dried, raw",
    "protein": 25.6,
    "fat": 1.8,
    "carbs": 51.2,
    "calories": 311
  },
  {
    "name": "Liquorice allsorts",
    "protein": 3.7,
    "fat": 5.2,
    "carbs": 76.7,
    "calories": 349
  },
  {
    "name": "Liver and bacon, fried, homemade",
    "protein": 28.9,
    "fat": 14.7,
    "carbs": 0,
    "calories": 247
  },
  {
    "name": "Liver sausage",
    "protein": 13.4,
    "fat": 16.7,
    "carbs": 6,
    "calories": 226
  },
  {
    "name": "Liver, chicken, fried in corn oil",
    "protein": 22.1,
    "fat": 8.9,
    "carbs": 0,
    "calories": 169
  },
  {
    "name": "Liver, chicken, raw",
    "protein": 17.7,
    "fat": 2.3,
    "carbs": 0,
    "calories": 92
  },
  {
    "name": "Liver, lamb, fried in corn oil",
    "protein": 30.1,
    "fat": 12.9,
    "carbs": 0,
    "calories": 237
  },
  {
    "name": "Liver, lamb, raw",
    "protein": 20.3,
    "fat": 6.2,
    "carbs": 0,
    "calories": 137
  },
  {
    "name": "Loganberries, raw",
    "protein": 1.1,
    "fat": 0,
    "carbs": 3.4,
    "calories": 17
  },
  {
    "name": "Loganberries, stewed with sugar",
    "protein": 0.8,
    "fat": 0,
    "carbs": 12.5,
    "calories": 50
  },
  {
    "name": "Loganberries, stewed without sugar",
    "protein": 0.9,
    "fat": 0,
    "carbs": 2.9,
    "calories": 14
  },
  {
    "name": "Macadamia nuts, salted",
    "protein": 7.9,
    "fat": 77.6,
    "carbs": 4.8,
    "calories": 748
  },
  {
    "name": "Macaroni cheese, homemade",
    "protein": 7.8,
    "fat": 8.6,
    "carbs": 19.8,
    "calories": 183
  },
  {
    "name": "Mackerel, flesh only, grilled",
    "protein": 20.3,
    "fat": 22.4,
    "carbs": 0,
    "calories": 283
  },
  {
    "name": "Mackerel, flesh only, raw",
    "protein": 18,
    "fat": 17.9,
    "carbs": 0,
    "calories": 233
  },
  {
    "name": "Mackerel, flesh only, smoked",
    "protein": 21.1,
    "fat": 24.1,
    "carbs": 0,
    "calories": 301
  },
  {
    "name": "Mammie apple, flesh only",
    "protein": 0.5,
    "fat": 0.4,
    "carbs": 14.4,
    "calories": 60
  },
  {
    "name": "Mandarin oranges, canned in juice, whole contents",
    "protein": 0.7,
    "fat": 0,
    "carbs": 7.7,
    "calories": 32
  },
  {
    "name": "Mango, unripe, green flesh, raw",
    "protein": 0.5,
    "fat": 0.2,
    "carbs": 11.2,
    "calories": 46
  },
  {
    "name": "Mangoes, ripe, flesh only, raw",
    "protein": 0.7,
    "fat": 0.6,
    "carbs": 10.7,
    "calories": 48
  },
  {
    "name": "Mangosteen, flesh only",
    "protein": 0.6,
    "fat": 0.5,
    "carbs": 16.4,
    "calories": 73
  },
  {
    "name": "Meatballs, pork and beef, in tomato sauce, homemade",
    "protein": 10,
    "fat": 7.2,
    "carbs": 4.6,
    "calories": 123
  },
  {
    "name": "Melon seeds",
    "protein": 28.5,
    "fat": 47.7,
    "carbs": 9.9,
    "calories": 583
  },
  {
    "name": "Melon, Honeydew, flesh only, weighed whole",
    "protein": 0.3,
    "fat": 0.1,
    "carbs": 4,
    "calories": 17
  },
  {
    "name": "Milk bread, homemade",
    "protein": 8.8,
    "fat": 7,
    "carbs": 50.8,
    "calories": 289
  },
  {
    "name": "Milk drink, fermented, with probiotics",
    "protein": 3,
    "fat": 1.2,
    "carbs": 12.7,
    "calories": 70
  },
  {
    "name": "Milk shake, powder",
    "protein": 1.3,
    "fat": 1.6,
    "carbs": 98.3,
    "calories": 388
  },
  {
    "name": "Milk shake, powder, made up with semi-skimmed milk",
    "protein": 3.3,
    "fat": 1.7,
    "carbs": 11.2,
    "calories": 70
  },
  {
    "name": "Milk shake, powder, made up with skimmed milk",
    "protein": 3.3,
    "fat": 0.3,
    "carbs": 11.3,
    "calories": 59
  },
  {
    "name": "Milk shake, powder, made up with whole milk",
    "protein": 3.3,
    "fat": 3.5,
    "carbs": 11.1,
    "calories": 86
  },
  {
    "name": "Milk, 1% fat, pasteurised",
    "protein": 3.5,
    "fat": 1,
    "carbs": 4.8,
    "calories": 41
  },
  {
    "name": "Milk, Channel Islands, whole, pasteurised",
    "protein": 3.5,
    "fat": 4.7,
    "carbs": 4.3,
    "calories": 72
  },
  {
    "name": "Milk, Channel islands, whole, summer",
    "protein": 3.9,
    "fat": 4.7,
    "carbs": 4.1,
    "calories": 73
  },
  {
    "name": "Milk, Channel islands, whole, winter",
    "protein": 3.2,
    "fat": 4.7,
    "carbs": 4.4,
    "calories": 72
  },
  {
    "name": "Milk, condensed, whole, sweetened",
    "protein": 7.4,
    "fat": 8,
    "carbs": 55.5,
    "calories": 310
  },
  {
    "name": "Milk, evaporated, light",
    "protein": 7.8,
    "fat": 4.1,
    "carbs": 10.3,
    "calories": 107
  },
  {
    "name": "Milk, evaporated, whole",
    "protein": 8.4,
    "fat": 9.4,
    "carbs": 12.7,
    "calories": 166
  },
  {
    "name": "Milk, flavoured, pasteurised, chocolate",
    "protein": 3.6,
    "fat": 1.5,
    "carbs": 11.7,
    "calories": 72
  },
  {
    "name": "Milk, flavoured, pasteurised, strawberry, banana",
    "protein": 3.6,
    "fat": 1.5,
    "carbs": 9.6,
    "calories": 64
  },
  {
    "name": "Milk, goats, pasteurised",
    "protein": 3.1,
    "fat": 3.7,
    "carbs": 4.4,
    "calories": 62
  },
  {
    "name": "Milk, human, colostrum",
    "protein": 2,
    "fat": 2.6,
    "carbs": 6.6,
    "calories": 56
  },
  {
    "name": "Milk, human, mature",
    "protein": 1.3,
    "fat": 4.1,
    "carbs": 7.2,
    "calories": 69
  },
  {
    "name": "Milk, human, transitional",
    "protein": 1.5,
    "fat": 3.7,
    "carbs": 6.9,
    "calories": 67
  },
  {
    "name": "Milk, semi-skimmed, pasteurised, average",
    "protein": 3.5,
    "fat": 1.7,
    "carbs": 4.7,
    "calories": 46
  },
  {
    "name": "Milk, semi-skimmed, pasteurised, summer and autumn",
    "protein": 3.5,
    "fat": 1.7,
    "carbs": 4.5,
    "calories": 46
  },
  {
    "name": "Milk, semi-skimmed, pasteurised, winter and spring",
    "protein": 3.4,
    "fat": 1.7,
    "carbs": 4.9,
    "calories": 47
  },
  {
    "name": "Milk, semi-skimmed, UHT",
    "protein": 3.3,
    "fat": 1.6,
    "carbs": 4.9,
    "calories": 46
  },
  {
    "name": "Milk, sheeps, raw",
    "protein": 5.4,
    "fat": 5.8,
    "carbs": 5.1,
    "calories": 93
  },
  {
    "name": "Milk, skimmed, dried, fortified",
    "protein": 36.1,
    "fat": 0.6,
    "carbs": 52.9,
    "calories": 348
  },
  {
    "name": "Milk, skimmed, pasteurised, average",
    "protein": 3.5,
    "fat": 0.3,
    "carbs": 4.8,
    "calories": 34
  },
  {
    "name": "Milk, skimmed, pasteurised, summer",
    "protein": 3.5,
    "fat": 0.2,
    "carbs": 4.4,
    "calories": 32
  },
  {
    "name": "Milk, skimmed, pasteurised, winter",
    "protein": 3.5,
    "fat": 0.2,
    "carbs": 4.2,
    "calories": 32
  },
  {
    "name": "Milk, skimmed, UHT",
    "protein": 3.4,
    "fat": 0.1,
    "carbs": 4.9,
    "calories": 33
  },
  {
    "name": "Milk, soya, non-dairy alternative to milk, sweetened, fortified",
    "protein": 3.1,
    "fat": 2.4,
    "carbs": 2.5,
    "calories": 43
  },
  {
    "name": "Milk, soya, non-dairy alternative to milk, unsweetened, fortified",
    "protein": 2.4,
    "fat": 1.6,
    "carbs": 0.5,
    "calories": 26
  },
  {
    "name": "Milk, whole, pasteurised, average",
    "protein": 3.4,
    "fat": 3.6,
    "carbs": 4.6,
    "calories": 63
  },
  {
    "name": "Milk, whole, pasteurised, summer and autumn",
    "protein": 3.4,
    "fat": 3.6,
    "carbs": 4.1,
    "calories": 61
  },
  {
    "name": "Milk, whole, pasteurised, winter and spring",
    "protein": 3.3,
    "fat": 3.6,
    "carbs": 5,
    "calories": 64
  },
  {
    "name": "Milk, whole, UHT",
    "protein": 3.2,
    "fat": 3.9,
    "carbs": 4.8,
    "calories": 66
  },
  {
    "name": "Milkshake, thick, takeaway",
    "protein": 3.7,
    "fat": 1.8,
    "carbs": 15.3,
    "calories": 88
  },
  {
    "name": "Milky Way and own brand equivalents",
    "protein": 3.8,
    "fat": 15.7,
    "carbs": 76.6,
    "calories": 444
  },
  {
    "name": "Mince pies, homemade, individual",
    "protein": 4.2,
    "fat": 23.5,
    "carbs": 55.5,
    "calories": 436
  },
  {
    "name": "Mince pies, retail",
    "protein": 3.8,
    "fat": 14.9,
    "carbs": 60.7,
    "calories": 377
  },
  {
    "name": "Mincemeat",
    "protein": 0.6,
    "fat": 4.3,
    "carbs": 62.1,
    "calories": 274
  },
  {
    "name": "Mincemeat, vegetarian, homemade",
    "protein": 1.7,
    "fat": 9.5,
    "carbs": 43.8,
    "calories": 306
  },
  {
    "name": "Minibreads, toasted, retail",
    "protein": 10.5,
    "fat": 13.6,
    "carbs": 68.9,
    "calories": 423
  },
  {
    "name": "Monkfish, flesh only, grilled",
    "protein": 22.7,
    "fat": 0.6,
    "carbs": 0,
    "calories": 96
  },
  {
    "name": "Monkfish, flesh only, raw",
    "protein": 15.7,
    "fat": 0.4,
    "carbs": 0,
    "calories": 66
  },
  {
    "name": "Muesli, Swiss style, no added sugar or salt, unfortified",
    "protein": 9.8,
    "fat": 5.9,
    "carbs": 70.7,
    "calories": 357
  },
  {
    "name": "Mulberries, whole fruit, raw",
    "protein": 1.3,
    "fat": 0,
    "carbs": 8.1,
    "calories": 36
  },
  {
    "name": "Mulberries, whole fruit, stewed with sugar",
    "protein": 1,
    "fat": 0,
    "carbs": 16.2,
    "calories": 65
  },
  {
    "name": "Mulberries, whole fruit, stewed without sugar",
    "protein": 1.1,
    "fat": 0,
    "carbs": 6.9,
    "calories": 30
  },
  {
    "name": "Mushrooms, white, fried in salted butter",
    "protein": 1.4,
    "fat": 11,
    "carbs": 0.4,
    "calories": 106
  },
  {
    "name": "Noodles, egg, dried, raw",
    "protein": 12,
    "fat": 2,
    "carbs": 72.6,
    "calories": 338
  },
  {
    "name": "Noodles, egg, fine, dried, boiled in unsalted water",
    "protein": 4.7,
    "fat": 0.8,
    "carbs": 27.5,
    "calories": 129
  },
  {
    "name": "Noodles, egg, fried with spring onions, homemade",
    "protein": 5,
    "fat": 12.2,
    "carbs": 30.5,
    "calories": 244
  },
  {
    "name": "Noodles, egg, medium, dried, boiled in unsalted water",
    "protein": 5.8,
    "fat": 1,
    "carbs": 35.7,
    "calories": 166
  },
  {
    "name": "Noodles, egg, thick, dried, boiled in unsalted water",
    "protein": 5,
    "fat": 0.9,
    "carbs": 30.7,
    "calories": 143
  },
  {
    "name": "Noodles, rice, fine, dried, boiled in unsalted water",
    "protein": 1.9,
    "fat": 0.2,
    "carbs": 21.3,
    "calories": 89
  },
  {
    "name": "Nut and rice roast, mixed nuts with egg, homemade",
    "protein": 12.1,
    "fat": 21.9,
    "carbs": 23.5,
    "calories": 333
  },
  {
    "name": "Nut and rice roast, mixed nuts, homemade",
    "protein": 12,
    "fat": 22.6,
    "carbs": 25.2,
    "calories": 346
  },
  {
    "name": "Nut and seed roast, mixed nuts and sunflower seeds with egg, homemade",
    "protein": 13,
    "fat": 23.9,
    "carbs": 18.1,
    "calories": 335
  },
  {
    "name": "Nut and seed roast, mixed nuts and sunflower seeds, homemade",
    "protein": 12.9,
    "fat": 24.9,
    "carbs": 19.6,
    "calories": 349
  },
  {
    "name": "Nut and vegetable roast, mixed nuts with egg, homemade",
    "protein": 11.3,
    "fat": 21.2,
    "carbs": 18.3,
    "calories": 304
  },
  {
    "name": "Nut and vegetable roast, mixed nuts, homemade",
    "protein": 11.1,
    "fat": 21.9,
    "carbs": 19.6,
    "calories": 314
  },
  {
    "name": "Nut roast, mixed nuts with egg, homemade",
    "protein": 13.3,
    "fat": 24.7,
    "carbs": 16.9,
    "calories": 338
  },
  {
    "name": "Nut, mushroom and rice roast, homemade",
    "protein": 7.8,
    "fat": 15.3,
    "carbs": 24.3,
    "calories": 260
  },
  {
    "name": "Nuts, mixed",
    "protein": 23.8,
    "fat": 49.1,
    "carbs": 11.6,
    "calories": 581
  },
  {
    "name": "Oil, coconut",
    "protein": 0,
    "fat": 99.9,
    "carbs": 0,
    "calories": 899
  },
  {
    "name": "Oil, cod liver",
    "protein": 0,
    "fat": 99.9,
    "carbs": 0,
    "calories": 899
  },
  {
    "name": "Oil, peanut (groundnut)",
    "protein": 0,
    "fat": 99.9,
    "carbs": 0,
    "calories": 899
  },
  {
    "name": "Okra with tomatoes and onion, Greek, homemade",
    "protein": 2.8,
    "fat": 16.7,
    "carbs": 5,
    "calories": 180
  },
  {
    "name": "Okra with tomatoes and onion, West Indian, homemade",
    "protein": 3,
    "fat": 7.7,
    "carbs": 4.7,
    "calories": 98
  },
  {
    "name": "Omelette, cheese, homemade",
    "protein": 15.9,
    "fat": 22.7,
    "carbs": 0,
    "calories": 268
  },
  {
    "name": "Onion sauce, made with semi-skimmed milk, homemade",
    "protein": 3,
    "fat": 4.7,
    "carbs": 9,
    "calories": 88
  },
  {
    "name": "Onion sauce, made with skimmed milk, homemade",
    "protein": 3.1,
    "fat": 3.8,
    "carbs": 9,
    "calories": 80
  },
  {
    "name": "Onion sauce, made with whole milk, homemade",
    "protein": 3.3,
    "fat": 5.5,
    "carbs": 7.8,
    "calories": 91
  },
  {
    "name": "Onions, fried in butter",
    "protein": 1.2,
    "fat": 5.3,
    "carbs": 11.2,
    "calories": 95
  },
  {
    "name": "Orange juice, ambient, UHT",
    "protein": 0.6,
    "fat": 0,
    "carbs": 8.5,
    "calories": 34
  },
  {
    "name": "Orange juice, chilled",
    "protein": 0.9,
    "fat": 0,
    "carbs": 8.6,
    "calories": 36
  },
  {
    "name": "Orange juice, freshly squeezed",
    "protein": 0.6,
    "fat": 0,
    "carbs": 8.1,
    "calories": 33
  },
  {
    "name": "Orange juice, freshly squeezed, weighed as whole fruit",
    "protein": 0.3,
    "fat": 0,
    "carbs": 3.7,
    "calories": 15
  },
  {
    "name": "Orange roughy, raw",
    "protein": 14.7,
    "fat": 7,
    "carbs": 0,
    "calories": 126
  },
  {
    "name": "Oranges, flesh only",
    "protein": 0.8,
    "fat": 0.2,
    "carbs": 8.2,
    "calories": 36
  },
  {
    "name": "Ovaltine powder, made up with semi-skimmed milk",
    "protein": 3.9,
    "fat": 1.7,
    "carbs": 13.4,
    "calories": 81
  },
  {
    "name": "Ovaltine powder, made up with skimmed milk",
    "protein": 3.9,
    "fat": 0.4,
    "carbs": 13.5,
    "calories": 70
  },
  {
    "name": "Ovaltine powder, made up with whole milk",
    "protein": 3.8,
    "fat": 3.4,
    "carbs": 13.3,
    "calories": 96
  },
  {
    "name": "Pakora/bhajia, potato and cauliflower, fried in vegetable oil, homemade",
    "protein": 8.6,
    "fat": 22.3,
    "carbs": 23.9,
    "calories": 325
  },
  {
    "name": "Pakora/bhajia, potato, carrot and pea, fried in vegetable oil, homemade",
    "protein": 12.5,
    "fat": 22.7,
    "carbs": 28.9,
    "calories": 355
  },
  {
    "name": "Pakora/bhajia, potato, fried in vegetable oil, homemade",
    "protein": 9.2,
    "fat": 19.6,
    "carbs": 28.4,
    "calories": 315
  },
  {
    "name": "Pakora/bhajia, spinach, fried in vegetable oil, homemade",
    "protein": 14.6,
    "fat": 22.2,
    "carbs": 30,
    "calories": 360
  },
  {
    "name": "Pancakes, savoury, made with semi-skimmed milk, homemade",
    "protein": 6.9,
    "fat": 8.4,
    "carbs": 26.6,
    "calories": 203
  },
  {
    "name": "Pancakes, savoury, made with skimmed milk, homemade",
    "protein": 6.9,
    "fat": 7.3,
    "carbs": 26.7,
    "calories": 193
  },
  {
    "name": "Pancakes, savoury, wholemeal, made with whole milk, homemade",
    "protein": 7.6,
    "fat": 10.1,
    "carbs": 23.4,
    "calories": 209
  },
  {
    "name": "Pancakes, sweet, made with semi skimmed milk, homemade",
    "protein": 6.3,
    "fat": 7.4,
    "carbs": 37.9,
    "calories": 234
  },
  {
    "name": "Pancakes, sweet, made with skimmed milk, homemade",
    "protein": 6.3,
    "fat": 7.4,
    "carbs": 37.9,
    "calories": 234
  },
  {
    "name": "Pancakes, sweet, made with whole milk, homemade",
    "protein": 6.3,
    "fat": 9.7,
    "carbs": 37.8,
    "calories": 254
  },
  {
    "name": "Parrot fish, raw",
    "protein": 19.9,
    "fat": 0.4,
    "carbs": 0,
    "calories": 83
  },
  {
    "name": "Pasta and sauce mixes, dried, raw",
    "protein": 12.8,
    "fat": 4.9,
    "carbs": 70,
    "calories": 358
  },
  {
    "name": "Pasta shapes, coloured, flavoured, dried, raw",
    "protein": 11,
    "fat": 1.6,
    "carbs": 75.4,
    "calories": 341
  },
  {
    "name": "Pasta with ham and mushroom sauce, homemade",
    "protein": 5.7,
    "fat": 5.3,
    "carbs": 16.2,
    "calories": 132
  },
  {
    "name": "Pasta with meat and tomato sauce, homemade",
    "protein": 6.6,
    "fat": 4.1,
    "carbs": 20.4,
    "calories": 140
  },
  {
    "name": "Pasta, egg, fresh, filled with cheese and tomato, boiled in unsalted water",
    "protein": 8.7,
    "fat": 5.9,
    "carbs": 28.1,
    "calories": 193
  },
  {
    "name": "Pasta, egg, fresh, filled with cheese only, boiled in unsalted water",
    "protein": 10.5,
    "fat": 6.7,
    "carbs": 30.2,
    "calories": 216
  },
  {
    "name": "Pasta, egg, fresh, filled with green vegetables/herbs and cheese, boiled in unsalted water",
    "protein": 8.7,
    "fat": 5.8,
    "carbs": 28.7,
    "calories": 195
  },
  {
    "name": "Pasta, egg, fresh, filled with meat, boiled in unsalted water",
    "protein": 10.1,
    "fat": 4.7,
    "carbs": 31.3,
    "calories": 200
  },
  {
    "name": "Pasta, egg, fresh, filled with mushrooms, boiled in unsalted water",
    "protein": 8.1,
    "fat": 4.3,
    "carbs": 27.1,
    "calories": 173
  },
  {
    "name": "Pasta, egg, fresh, raw",
    "protein": 10.6,
    "fat": 2.9,
    "carbs": 57,
    "calories": 282
  },
  {
    "name": "Pasta, egg, white, dried, raw",
    "protein": 12.9,
    "fat": 3.6,
    "carbs": 74.8,
    "calories": 365
  },
  {
    "name": "Pasta, egg, white, tagliatelle, fresh, boiled in unsalted water",
    "protein": 5.8,
    "fat": 1.6,
    "carbs": 30.6,
    "calories": 152
  },
  {
    "name": "Pasta, plain, fresh, boiled",
    "protein": 6.6,
    "fat": 1.5,
    "carbs": 31.8,
    "calories": 159
  },
  {
    "name": "Pasta, ravioli, meat filling, canned in tomato sauce",
    "protein": 2.3,
    "fat": 1.4,
    "carbs": 14.8,
    "calories": 77
  },
  {
    "name": "Pasta, spaghetti, canned, in tomato sauce",
    "protein": 2.1,
    "fat": 0.3,
    "carbs": 16.2,
    "calories": 72
  },
  {
    "name": "Pasta, white,  twists, fusilli, dried, boiled in unsalted water",
    "protein": 4.8,
    "fat": 0.4,
    "carbs": 32.9,
    "calories": 146
  },
  {
    "name": "Pasta, white, dried, boiled in unsalted water",
    "protein": 5.5,
    "fat": 0.8,
    "carbs": 37.2,
    "calories": 169
  },
  {
    "name": "Pasta, white, dried, raw",
    "protein": 11.3,
    "fat": 1.6,
    "carbs": 75.6,
    "calories": 343
  },
  {
    "name": "Pasta, white, spaghetti, dried, boiled in unsalted water",
    "protein": 4.4,
    "fat": 0.6,
    "carbs": 31.5,
    "calories": 141
  },
  {
    "name": "Pasta, white, twists, fusilli, dried, boiled in salted water",
    "protein": 5,
    "fat": 0.7,
    "carbs": 32.9,
    "calories": 150
  },
  {
    "name": "Pasta, wholewheat, spaghetti, dried, boiled in unsalted water",
    "protein": 5.2,
    "fat": 1.1,
    "carbs": 27.5,
    "calories": 134
  },
  {
    "name": "Pasta, wholewheat, spaghetti, dried, raw",
    "protein": 12.6,
    "fat": 2.5,
    "carbs": 68.3,
    "calories": 329
  },
  {
    "name": "Pastry, cheese, shortcrust, homemade",
    "protein": 13.2,
    "fat": 32.4,
    "carbs": 39.2,
    "calories": 491
  },
  {
    "name": "Pate, tuna",
    "protein": 16.2,
    "fat": 26.8,
    "carbs": 1.5,
    "calories": 312
  },
  {
    "name": "Peanut brittle, homemade",
    "protein": 8.6,
    "fat": 19,
    "carbs": 73.8,
    "calories": 483
  },
  {
    "name": "Peanut butter, smooth",
    "protein": 22.8,
    "fat": 51.8,
    "carbs": 13.1,
    "calories": 607
  },
  {
    "name": "Peanuts and raisins",
    "protein": 15.4,
    "fat": 25.9,
    "carbs": 37.5,
    "calories": 436
  },
  {
    "name": "Peanuts, dry roasted",
    "protein": 25.7,
    "fat": 49.8,
    "carbs": 10.3,
    "calories": 590
  },
  {
    "name": "Peanuts, kernel only, plain, unsalted",
    "protein": 25.8,
    "fat": 46,
    "carbs": 12.5,
    "calories": 564
  },
  {
    "name": "Peanuts, raisins and chocolate chips",
    "protein": 12.4,
    "fat": 25.4,
    "carbs": 44.4,
    "calories": 445
  },
  {
    "name": "Peanuts, roasted and salted",
    "protein": 24.7,
    "fat": 53,
    "carbs": 7.1,
    "calories": 602
  },
  {
    "name": "Pears, average, stewed with sugar",
    "protein": 0.2,
    "fat": 0.1,
    "carbs": 18.8,
    "calories": 72
  },
  {
    "name": "Pears, average, stewed without sugar",
    "protein": 0.3,
    "fat": 0.1,
    "carbs": 9.8,
    "calories": 38
  },
  {
    "name": "Peas, boiled in unsalted water",
    "protein": 6.7,
    "fat": 1.6,
    "carbs": 10,
    "calories": 79
  },
  {
    "name": "Peas, canned in water, re-heated, drained",
    "protein": 5.3,
    "fat": 0.9,
    "carbs": 8,
    "calories": 59
  },
  {
    "name": "Peas, dried, boiled in unsalted water",
    "protein": 6.9,
    "fat": 0.8,
    "carbs": 19.9,
    "calories": 109
  },
  {
    "name": "Peas, dried, raw",
    "protein": 21.6,
    "fat": 2.4,
    "carbs": 52,
    "calories": 303
  },
  {
    "name": "Peas, frozen, boiled in unsalted water",
    "protein": 5.5,
    "fat": 0.7,
    "carbs": 11.2,
    "calories": 70
  },
  {
    "name": "Peas, frozen, microwaved",
    "protein": 5.7,
    "fat": 0.9,
    "carbs": 10.8,
    "calories": 71
  },
  {
    "name": "Peas, frozen, raw",
    "protein": 5.3,
    "fat": 0.7,
    "carbs": 10.7,
    "calories": 68
  },
  {
    "name": "Peas, mange-tout, boiled in unsalted water",
    "protein": 3.3,
    "fat": 0.4,
    "carbs": 4.2,
    "calories": 32
  },
  {
    "name": "Peas, mange-tout, raw",
    "protein": 3.6,
    "fat": 0.2,
    "carbs": 4.2,
    "calories": 32
  },
  {
    "name": "Peas, mange-tout, stir-fried in rapeseed oil",
    "protein": 2.8,
    "fat": 4.9,
    "carbs": 3.6,
    "calories": 69
  },
  {
    "name": "Peas, marrowfat, canned, re-heated, drained",
    "protein": 6.9,
    "fat": 0.8,
    "carbs": 13.8,
    "calories": 87
  },
  {
    "name": "Peas, mushy, canned, re-heated",
    "protein": 5.8,
    "fat": 0.7,
    "carbs": 13.8,
    "calories": 81
  },
  {
    "name": "Peas, raw",
    "protein": 6.9,
    "fat": 1.5,
    "carbs": 11.3,
    "calories": 83
  },
  {
    "name": "Peas, split, dried, boiled in unsalted water",
    "protein": 8.3,
    "fat": 0.9,
    "carbs": 22.7,
    "calories": 126
  },
  {
    "name": "Peas, split, dried, raw",
    "protein": 22.1,
    "fat": 2.4,
    "carbs": 58.2,
    "calories": 328
  },
  {
    "name": "Peas, sugar-snap, boiled in unsalted water",
    "protein": 3.1,
    "fat": 0.3,
    "carbs": 4.7,
    "calories": 33
  },
  {
    "name": "Peas, sugar-snap, raw",
    "protein": 3.4,
    "fat": 0.2,
    "carbs": 5,
    "calories": 34
  },
  {
    "name": "Pecan nuts, kernel only",
    "protein": 9.2,
    "fat": 70.1,
    "carbs": 5.8,
    "calories": 689
  },
  {
    "name": "Peppers, green, stuffed with rice, homemade",
    "protein": 1.7,
    "fat": 1.9,
    "carbs": 14.4,
    "calories": 77
  },
  {
    "name": "Peppers, green, stuffed with vegetables, cheese topping, homemade",
    "protein": 2.6,
    "fat": 5.6,
    "carbs": 5.2,
    "calories": 80
  },
  {
    "name": "Peppers, stuffed with beef, rice and vegetables, homemade",
    "protein": 6.2,
    "fat": 4.3,
    "carbs": 9.2,
    "calories": 99
  },
  {
    "name": "Pie, apple, one crust, homemade",
    "protein": 1.8,
    "fat": 9.2,
    "carbs": 29,
    "calories": 198
  },
  {
    "name": "Pie, apple, pastry top and bottom, homemade",
    "protein": 2.9,
    "fat": 15.2,
    "carbs": 32.1,
    "calories": 268
  },
  {
    "name": "Pie, apple, pastry, double crust, deep filled, retail",
    "protein": 3.3,
    "fat": 10.9,
    "carbs": 38.5,
    "calories": 256
  },
  {
    "name": "Pie, apple, pastry, double crust, retail",
    "protein": 3.8,
    "fat": 12.9,
    "carbs": 30.3,
    "calories": 245
  },
  {
    "name": "Pie, apple, wholemeal, one crust, homemade",
    "protein": 2.3,
    "fat": 7.7,
    "carbs": 29.9,
    "calories": 190
  },
  {
    "name": "Pie, apple, wholemeal, pastry top and bottom, homemade",
    "protein": 3.6,
    "fat": 12.7,
    "carbs": 33.6,
    "calories": 254
  },
  {
    "name": "Pie, beef, puff or shortcrust pastry, family size, retail",
    "protein": 8.9,
    "fat": 13,
    "carbs": 18.1,
    "calories": 220
  },
  {
    "name": "Pie, beef, puff or shortcrust pastry, individual, retail",
    "protein": 9.2,
    "fat": 17.7,
    "carbs": 25.5,
    "calories": 292
  },
  {
    "name": "Pie, cheese and potato, homemade",
    "protein": 5,
    "fat": 7.2,
    "carbs": 12.6,
    "calories": 132
  },
  {
    "name": "Pie, chicken and mushroom, single crust, homemade",
    "protein": 13.6,
    "fat": 10.4,
    "carbs": 14.3,
    "calories": 202
  },
  {
    "name": "Pie, chicken, individual, baked",
    "protein": 9,
    "fat": 17.7,
    "carbs": 24.6,
    "calories": 288
  },
  {
    "name": "Pie, Cottage, homemade",
    "protein": 6.3,
    "fat": 6.3,
    "carbs": 10.4,
    "calories": 126
  },
  {
    "name": "Pie, Cottage/Shepherd's, reheated",
    "protein": 4.5,
    "fat": 5.4,
    "carbs": 11.9,
    "calories": 111
  },
  {
    "name": "Pie, fish, white fish, homemade",
    "protein": 8.6,
    "fat": 2.1,
    "carbs": 12.7,
    "calories": 101
  },
  {
    "name": "Pie, fish, white fish, retail, baked",
    "protein": 6.6,
    "fat": 4.8,
    "carbs": 14.4,
    "calories": 124
  },
  {
    "name": "Pie, lentil and cheese, homemade",
    "protein": 11,
    "fat": 9.3,
    "carbs": 14.5,
    "calories": 182
  },
  {
    "name": "Pie, spinach, homemade",
    "protein": 6.2,
    "fat": 13.3,
    "carbs": 8.6,
    "calories": 177
  },
  {
    "name": "Pie, steak and kidney, double crust, homemade",
    "protein": 14.6,
    "fat": 18.1,
    "carbs": 22.2,
    "calories": 305
  },
  {
    "name": "Pie, steak and kidney, single crust, homemade",
    "protein": 17,
    "fat": 13.1,
    "carbs": 15.3,
    "calories": 243
  },
  {
    "name": "Pie, turkey, single crust, homemade",
    "protein": 13.8,
    "fat": 10.4,
    "carbs": 14.9,
    "calories": 205
  },
  {
    "name": "Pilaf, rice with spinach, homemade",
    "protein": 3.7,
    "fat": 1.9,
    "carbs": 17.8,
    "calories": 104
  },
  {
    "name": "Pilaf, rice with tomato, homemade",
    "protein": 2.9,
    "fat": 2.6,
    "carbs": 27.9,
    "calories": 147
  },
  {
    "name": "Pilau, egg and potato, brown rice, homemade",
    "protein": 4.7,
    "fat": 2.8,
    "carbs": 19.5,
    "calories": 117
  },
  {
    "name": "Pilau, egg and potato, homemade",
    "protein": 4.4,
    "fat": 2.5,
    "carbs": 22.4,
    "calories": 124
  },
  {
    "name": "Pine nuts, kernel only",
    "protein": 14,
    "fat": 68.6,
    "carbs": 4,
    "calories": 688
  },
  {
    "name": "Pineapple juice, unsweetened",
    "protein": 0.3,
    "fat": 0.1,
    "carbs": 10.5,
    "calories": 41
  },
  {
    "name": "Pineapple, canned in juice, whole contents",
    "protein": 0.3,
    "fat": 0,
    "carbs": 12.2,
    "calories": 47
  },
  {
    "name": "Pineapple, canned in syrup, whole contents",
    "protein": 0.5,
    "fat": 0,
    "carbs": 16.5,
    "calories": 64
  },
  {
    "name": "Pineapple, dried",
    "protein": 3.3,
    "fat": 0.7,
    "carbs": 75.7,
    "calories": 303
  },
  {
    "name": "Pineapple, flesh only, raw",
    "protein": 0.5,
    "fat": 0.1,
    "carbs": 11.4,
    "calories": 45
  },
  {
    "name": "Pistachio nuts, kernel only, roasted and salted",
    "protein": 17.9,
    "fat": 55.4,
    "carbs": 8.2,
    "calories": 601
  },
  {
    "name": "Pizza, cheese and tomato, retail",
    "protein": 12.2,
    "fat": 9.8,
    "carbs": 36.1,
    "calories": 272
  },
  {
    "name": "Pizza, chicken topped, retail",
    "protein": 13.4,
    "fat": 8.3,
    "carbs": 31.3,
    "calories": 246
  },
  {
    "name": "Pizza, fish topped, takeaway",
    "protein": 13.3,
    "fat": 7.5,
    "carbs": 28,
    "calories": 226
  },
  {
    "name": "Pizza, ham and pineapple, retail",
    "protein": 13.5,
    "fat": 8.6,
    "carbs": 34.4,
    "calories": 260
  },
  {
    "name": "Pizza, tomato, homemade",
    "protein": 3.3,
    "fat": 10.6,
    "carbs": 22.6,
    "calories": 193
  },
  {
    "name": "Plaice, in breadcrumbs, baked",
    "protein": 14.4,
    "fat": 11.6,
    "carbs": 21.5,
    "calories": 243
  },
  {
    "name": "Plums, average, flesh and skin, stewed without sugar",
    "protein": 0.5,
    "fat": 0.1,
    "carbs": 7.3,
    "calories": 30
  },
  {
    "name": "Plums, average, stewed with sugar, flesh and skin",
    "protein": 0.5,
    "fat": 0.1,
    "carbs": 17.9,
    "calories": 70
  },
  {
    "name": "Plums, Victoria, stewed without sugar",
    "protein": 0.5,
    "fat": 0.1,
    "carbs": 8.3,
    "calories": 34
  },
  {
    "name": "Pork chops in mustard and cream, homemade",
    "protein": 15.5,
    "fat": 19.4,
    "carbs": 1,
    "calories": 263
  },
  {
    "name": "Pork pie, individual",
    "protein": 9.9,
    "fat": 26,
    "carbs": 25.7,
    "calories": 370
  },
  {
    "name": "Pork scratchings",
    "protein": 47.9,
    "fat": 46,
    "carbs": 0.2,
    "calories": 606
  },
  {
    "name": "Pork, belly joint, roasted, lean and fat",
    "protein": 25.1,
    "fat": 21.4,
    "carbs": 0,
    "calories": 293
  },
  {
    "name": "Pork, belly joint/slices, grilled, lean and fat",
    "protein": 27.4,
    "fat": 23.4,
    "carbs": 0,
    "calories": 320
  },
  {
    "name": "Pork, belly joint/slices, raw, lean and fat",
    "protein": 19.1,
    "fat": 20.2,
    "carbs": 0,
    "calories": 258
  },
  {
    "name": "Pork, crackling, cooked",
    "protein": 36.2,
    "fat": 45,
    "carbs": 0,
    "calories": 550
  },
  {
    "name": "Pork, diced, casseroled, lean",
    "protein": 36.8,
    "fat": 5.3,
    "carbs": 0,
    "calories": 195
  },
  {
    "name": "Pork, diced, casseroled, lean and fat",
    "protein": 36.3,
    "fat": 6.4,
    "carbs": 0,
    "calories": 203
  },
  {
    "name": "Pork, diced, kebabs, grilled, lean",
    "protein": 37.9,
    "fat": 5.4,
    "carbs": 0,
    "calories": 200
  },
  {
    "name": "Pork, diced, kebabs, grilled, lean and fat",
    "protein": 37.4,
    "fat": 6.5,
    "carbs": 0,
    "calories": 208
  },
  {
    "name": "Pork, diced, raw, lean",
    "protein": 23.1,
    "fat": 3.3,
    "carbs": 0,
    "calories": 122
  },
  {
    "name": "Pork, diced, raw, lean and fat",
    "protein": 22.8,
    "fat": 4.5,
    "carbs": 0,
    "calories": 132
  },
  {
    "name": "Pork, fat, average, cooked",
    "protein": 14.2,
    "fat": 50.9,
    "carbs": 0,
    "calories": 515
  },
  {
    "name": "Pork, fat, average, raw",
    "protein": 10.1,
    "fat": 56.4,
    "carbs": 0,
    "calories": 548
  },
  {
    "name": "Pork, fillet medallions, grilled lean",
    "protein": 36.3,
    "fat": 0.8,
    "carbs": 0,
    "calories": 152
  },
  {
    "name": "Pork, fillet medallions, grilled, lean and fat",
    "protein": 35.9,
    "fat": 1.9,
    "carbs": 0,
    "calories": 161
  },
  {
    "name": "Pork, fillet medallions, raw, lean",
    "protein": 22.8,
    "fat": 0.5,
    "carbs": 0,
    "calories": 96
  },
  {
    "name": "Pork, fillet medallions, raw, lean and fat",
    "protein": 22.6,
    "fat": 1.8,
    "carbs": 0,
    "calories": 106
  },
  {
    "name": "Pork, fillet strips, stir-fried in rapeseed oil, lean",
    "protein": 35.8,
    "fat": 2.7,
    "carbs": 0,
    "calories": 168
  },
  {
    "name": "Pork, hand, shoulder joint, raw, lean",
    "protein": 20.8,
    "fat": 4.2,
    "carbs": 0,
    "calories": 121
  },
  {
    "name": "Pork, hand, shoulder joint, raw, lean and fat",
    "protein": 18.1,
    "fat": 16.2,
    "carbs": 0,
    "calories": 218
  },
  {
    "name": "Pork, hand, shoulder joint, roasted, lean",
    "protein": 30.8,
    "fat": 8.8,
    "carbs": 0,
    "calories": 202
  },
  {
    "name": "Pork, hand, shoulder joint, roasted, lean and fat",
    "protein": 27.5,
    "fat": 16.5,
    "carbs": 0,
    "calories": 259
  },
  {
    "name": "Pork, lean, average, raw",
    "protein": 22.2,
    "fat": 3.1,
    "carbs": 0,
    "calories": 116
  },
  {
    "name": "Pork, leg joint, raw, lean",
    "protein": 23.1,
    "fat": 3.3,
    "carbs": 0,
    "calories": 122
  },
  {
    "name": "Pork, leg joint, raw, lean and fat",
    "protein": 19.9,
    "fat": 15,
    "carbs": 0,
    "calories": 215
  },
  {
    "name": "Pork, leg joint, raw, lean and fat, trimmed",
    "protein": 22.4,
    "fat": 5.8,
    "carbs": 0,
    "calories": 142
  },
  {
    "name": "Pork, leg joint, roasted, lean and fat",
    "protein": 29.6,
    "fat": 15.9,
    "carbs": 0,
    "calories": 261
  },
  {
    "name": "Pork, leg joint, roasted, lean and fat, trimmed",
    "protein": 32.5,
    "fat": 8.1,
    "carbs": 0,
    "calories": 203
  },
  {
    "name": "Pork, leg joint, roasted, lean",
    "protein": 33.3,
    "fat": 5.9,
    "carbs": 0,
    "calories": 186
  },
  {
    "name": "Pork, loin chops, grilled, lean",
    "protein": 35.1,
    "fat": 5.9,
    "carbs": 0,
    "calories": 194
  },
  {
    "name": "Pork, loin chops, grilled, lean and fat",
    "protein": 33.3,
    "fat": 11.5,
    "carbs": 0,
    "calories": 237
  },
  {
    "name": "Pork, loin chops, raw, lean and fat",
    "protein": 21.3,
    "fat": 11.7,
    "carbs": 0,
    "calories": 191
  },
  {
    "name": "Pork, loin chops, roasted, lean",
    "protein": 39.6,
    "fat": 4.2,
    "carbs": 0,
    "calories": 196
  },
  {
    "name": "Pork, loin chops, roasted, lean and fat",
    "protein": 36.2,
    "fat": 11.4,
    "carbs": 0,
    "calories": 247
  },
  {
    "name": "Pork, loin medallions, raw, lean",
    "protein": 24.8,
    "fat": 1.9,
    "carbs": 0,
    "calories": 116
  },
  {
    "name": "Pork, loin medallions, raw, lean and fat",
    "protein": 23,
    "fat": 5.4,
    "carbs": 0,
    "calories": 141
  },
  {
    "name": "Pork, loin medallions, raw, lean and fat, trimmed",
    "protein": 23.4,
    "fat": 3.1,
    "carbs": 0,
    "calories": 122
  },
  {
    "name": "Pork, loin steaks, fried in rapeseed oil, lean",
    "protein": 33.9,
    "fat": 4.7,
    "carbs": 0,
    "calories": 178
  },
  {
    "name": "Pork, loin steaks, fried in rapeseed oil, lean and fat",
    "protein": 31.7,
    "fat": 12,
    "carbs": 0,
    "calories": 235
  },
  {
    "name": "Pork, loin steaks, grilled, lean",
    "protein": 35.1,
    "fat": 5.9,
    "carbs": 0,
    "calories": 194
  },
  {
    "name": "Pork, loin steaks, grilled, lean and fat",
    "protein": 32.7,
    "fat": 12.9,
    "carbs": 0,
    "calories": 247
  },
  {
    "name": "Pork, loin steaks, grilled, lean and fat, trimmed",
    "protein": 34.4,
    "fat": 8,
    "carbs": 0,
    "calories": 210
  },
  {
    "name": "Pork, loin steaks, raw, lean",
    "protein": 23.2,
    "fat": 1.9,
    "carbs": 0,
    "calories": 110
  },
  {
    "name": "Pork, loin steaks, raw, lean and fat",
    "protein": 21.4,
    "fat": 11.2,
    "carbs": 0,
    "calories": 187
  },
  {
    "name": "Pork, loin steaks, raw, lean and fat, trimmed",
    "protein": 22.5,
    "fat": 5.5,
    "carbs": 0,
    "calories": 140
  },
  {
    "name": "Pork, loin steaks, stewed, lean",
    "protein": 33.2,
    "fat": 2.7,
    "carbs": 0,
    "calories": 157
  },
  {
    "name": "Pork, loin steaks, stewed, lean and fat",
    "protein": 31.3,
    "fat": 9.7,
    "carbs": 0,
    "calories": 212
  },
  {
    "name": "Pork, mince, raw",
    "protein": 19.2,
    "fat": 9.7,
    "carbs": 0,
    "calories": 164
  },
  {
    "name": "Pork, mince, stewed",
    "protein": 24.4,
    "fat": 10.4,
    "carbs": 0,
    "calories": 191
  },
  {
    "name": "Pork, shoulder chops (collar), braised, lean",
    "protein": 30.5,
    "fat": 10.1,
    "carbs": 0,
    "calories": 213
  },
  {
    "name": "Pork, shoulder chops (collar), braised, lean and fat",
    "protein": 28.1,
    "fat": 15,
    "carbs": 0,
    "calories": 247
  },
  {
    "name": "Pork, shoulder chops (collar), raw, lean and fat",
    "protein": 18.5,
    "fat": 12.4,
    "carbs": 0,
    "calories": 186
  },
  {
    "name": "Pork, shoulder joint (collar), pot-roasted, lean",
    "protein": 30,
    "fat": 9,
    "carbs": 0,
    "calories": 201
  },
  {
    "name": "Pork, shoulder joint (collar), pot-roasted, lean and fat",
    "protein": 24.4,
    "fat": 18,
    "carbs": 0,
    "calories": 260
  },
  {
    "name": "Pork, shoulder joint (collar), raw, lean and fat",
    "protein": 17.6,
    "fat": 16.4,
    "carbs": 0,
    "calories": 218
  },
  {
    "name": "Pork, shoulder steaks (collar), grilled, lean and fat",
    "protein": 29.2,
    "fat": 19.5,
    "carbs": 0,
    "calories": 292
  },
  {
    "name": "Pork, shoulder steaks (collar), raw, lean and fat",
    "protein": 18.7,
    "fat": 10.4,
    "carbs": 0,
    "calories": 168
  },
  {
    "name": "Pork, spare ribs, 'barbecue style', homemade",
    "protein": 20.8,
    "fat": 22.3,
    "carbs": 4.9,
    "calories": 302
  },
  {
    "name": "Pork, spare ribs, 'barbecue style', meat only, retail, reheated",
    "protein": 26.3,
    "fat": 17.1,
    "carbs": 5.8,
    "calories": 281
  },
  {
    "name": "Pork, spare ribs, in black bean sauce, meat and sauce only, homemade",
    "protein": 14.3,
    "fat": 14.5,
    "carbs": 5.8,
    "calories": 216
  },
  {
    "name": "Pork, spare ribs, raw, lean and fat",
    "protein": 18.7,
    "fat": 13.4,
    "carbs": 0,
    "calories": 195
  },
  {
    "name": "Pork, stir-fried with vegetables, homemade",
    "protein": 16.4,
    "fat": 2.9,
    "carbs": 2.6,
    "calories": 103
  },
  {
    "name": "Pork, sweet and sour, made with lean pork, homemade",
    "protein": 14.5,
    "fat": 6.3,
    "carbs": 11,
    "calories": 162
  },
  {
    "name": "Pork, sweet and sour, made with sweet and sour cook in sauce",
    "protein": 15.3,
    "fat": 4.9,
    "carbs": 11.4,
    "calories": 148
  },
  {
    "name": "Pork, trotters and tails, boiled with added salt",
    "protein": 19.8,
    "fat": 22.3,
    "carbs": 0,
    "calories": 280
  },
  {
    "name": "Porridge oats, unfortified",
    "protein": 10.9,
    "fat": 8.1,
    "carbs": 70.7,
    "calories": 381
  },
  {
    "name": "Porridge oats, unfortified, cooked, made up with semi-skimmed milk",
    "protein": 4.6,
    "fat": 2.3,
    "carbs": 12.1,
    "calories": 84
  },
  {
    "name": "Porridge, made with milk and water",
    "protein": 3.1,
    "fat": 1.9,
    "carbs": 11.2,
    "calories": 72
  },
  {
    "name": "Porridge, made with water",
    "protein": 1.4,
    "fat": 1,
    "carbs": 8.8,
    "calories": 47
  },
  {
    "name": "Porridge, made with whole milk",
    "protein": 4.9,
    "fat": 4.7,
    "carbs": 13.3,
    "calories": 112
  },
  {
    "name": "Potato cakes, fried in rapeseed oil",
    "protein": 3.9,
    "fat": 8.4,
    "carbs": 31.4,
    "calories": 210
  },
  {
    "name": "Potato chips, crinkle cut, frozen, fried in corn oil",
    "protein": 3.6,
    "fat": 16.7,
    "carbs": 33.4,
    "calories": 290
  },
  {
    "name": "Potato chips, fine cut, from fast food outlets",
    "protein": 3.5,
    "fat": 14.2,
    "carbs": 39.7,
    "calories": 290
  },
  {
    "name": "Potato chips, fine cut, frozen, fried in blended vegetable oil",
    "protein": 4.5,
    "fat": 21.3,
    "carbs": 41.2,
    "calories": 364
  },
  {
    "name": "Potato chips, fine cut, frozen, fried in corn oil",
    "protein": 4.5,
    "fat": 21.3,
    "carbs": 41.2,
    "calories": 364
  },
  {
    "name": "Potato chips, fine cut, frozen, fried in dripping",
    "protein": 4.5,
    "fat": 21.3,
    "carbs": 41.2,
    "calories": 364
  },
  {
    "name": "Potato chips, fried in beef dripping, from takeaway fish and chip shops",
    "protein": 3.5,
    "fat": 8.4,
    "carbs": 33.2,
    "calories": 214
  },
  {
    "name": "Potato chips, fried in commercial oil, from takeaway fish and chip shops",
    "protein": 3.5,
    "fat": 8.4,
    "carbs": 33.2,
    "calories": 214
  },
  {
    "name": "Potato chips, fried in palm oil, from takeaway fish and chip shops",
    "protein": 3.5,
    "fat": 8.4,
    "carbs": 33.2,
    "calories": 214
  },
  {
    "name": "Potato chips, fried in rapeseed oil, from takeaway fish and chip shops",
    "protein": 3.5,
    "fat": 8.4,
    "carbs": 33.2,
    "calories": 214
  },
  {
    "name": "Potato chips, homemade, fried in corn oil",
    "protein": 3.2,
    "fat": 6.7,
    "carbs": 33.1,
    "calories": 197
  },
  {
    "name": "Potato chips, homemade, fried in dripping",
    "protein": 3.2,
    "fat": 6.7,
    "carbs": 33.1,
    "calories": 197
  },
  {
    "name": "Potato chips, homemade, fried in rapeseed oil",
    "protein": 3.6,
    "fat": 6.7,
    "carbs": 34.1,
    "calories": 202
  },
  {
    "name": "Potato chips, homemade, fried in sunflower oil",
    "protein": 3.2,
    "fat": 6.7,
    "carbs": 33.1,
    "calories": 197
  },
  {
    "name": "Potato chips, microwave, cooked",
    "protein": 3.6,
    "fat": 9.6,
    "carbs": 32.1,
    "calories": 221
  },
  {
    "name": "Potato chips, oven ready, no batter, baked",
    "protein": 3.2,
    "fat": 4.9,
    "carbs": 35.3,
    "calories": 189
  },
  {
    "name": "Potato chips, oven ready, with batter, baked",
    "protein": 3.4,
    "fat": 6.1,
    "carbs": 35.6,
    "calories": 202
  },
  {
    "name": "Potato chips, straight cut, frozen, fried in blended oil",
    "protein": 4.1,
    "fat": 13.5,
    "carbs": 36,
    "calories": 273
  },
  {
    "name": "Potato chips, straight cut, frozen, fried in corn oil",
    "protein": 4.1,
    "fat": 13.5,
    "carbs": 36,
    "calories": 273
  },
  {
    "name": "Potato chips, straight cut, frozen, fried in dripping",
    "protein": 4.1,
    "fat": 13.5,
    "carbs": 36,
    "calories": 273
  },
  {
    "name": "Potato chips, thick cut, frozen, fried in corn oil",
    "protein": 3.6,
    "fat": 10.2,
    "carbs": 34,
    "calories": 234
  },
  {
    "name": "Potato crisps, fried in sunflower oil",
    "protein": 6.2,
    "fat": 28.8,
    "carbs": 55.8,
    "calories": 493
  },
  {
    "name": "Potato crisps, low fat",
    "protein": 6.6,
    "fat": 21.5,
    "carbs": 63.5,
    "calories": 458
  },
  {
    "name": "Potato croquettes, fried in blended oil",
    "protein": 3.7,
    "fat": 13.1,
    "carbs": 21.6,
    "calories": 214
  },
  {
    "name": "Potato powder, instant, made up with semi-skimmed milk",
    "protein": 2.4,
    "fat": 0.5,
    "carbs": 14.2,
    "calories": 67
  },
  {
    "name": "Potato powder, instant, made up with skimmed milk",
    "protein": 2.4,
    "fat": 0.1,
    "carbs": 14.2,
    "calories": 66
  },
  {
    "name": "Potato powder, instant, made up with water",
    "protein": 1.5,
    "fat": 0.1,
    "carbs": 13.5,
    "calories": 57
  },
  {
    "name": "Potato powder, instant, made up with whole milk",
    "protein": 2.4,
    "fat": 1.2,
    "carbs": 14.8,
    "calories": 76
  },
  {
    "name": "Potato powder, instant, raw",
    "protein": 8.4,
    "fat": 0.6,
    "carbs": 74.9,
    "calories": 320
  },
  {
    "name": "Potato products, shaped, frozen, baked",
    "protein": 2.5,
    "fat": 8.3,
    "carbs": 28.1,
    "calories": 190
  },
  {
    "name": "Potato rings",
    "protein": 3.6,
    "fat": 22.4,
    "carbs": 70.5,
    "calories": 480
  },
  {
    "name": "Potato snacks, pringle-type, fried in vegetable oil",
    "protein": 4.3,
    "fat": 31.8,
    "carbs": 57.4,
    "calories": 519
  },
  {
    "name": "Potato wedges, retail, cooked",
    "protein": 2.8,
    "fat": 5.5,
    "carbs": 30.6,
    "calories": 176
  },
  {
    "name": "Potato, leek and celery bake",
    "protein": 4.4,
    "fat": 6.5,
    "carbs": 12.6,
    "calories": 122
  },
  {
    "name": "Potatoes with onions and eggs, fried",
    "protein": 7.8,
    "fat": 23.8,
    "carbs": 19.1,
    "calories": 316
  },
  {
    "name": "Potatoes, duchesse",
    "protein": 3.1,
    "fat": 5.1,
    "carbs": 17.5,
    "calories": 124
  },
  {
    "name": "Potatoes, new and salad, boiled in salted water, flesh and skin",
    "protein": 1.8,
    "fat": 0.1,
    "carbs": 14.9,
    "calories": 68
  },
  {
    "name": "Potatoes, new and salad, boiled in unsalted water, flesh and skin",
    "protein": 1.8,
    "fat": 0.1,
    "carbs": 14.9,
    "calories": 68
  },
  {
    "name": "Potatoes, new and salad, flesh only, raw",
    "protein": 1.7,
    "fat": 0.1,
    "carbs": 16.1,
    "calories": 68
  },
  {
    "name": "Potatoes, new, frozen, `roast' in corn oil",
    "protein": 2.5,
    "fat": 6.6,
    "carbs": 23.4,
    "calories": 157
  },
  {
    "name": "Potatoes, old, baked, flesh and skin",
    "protein": 2.5,
    "fat": 0.2,
    "carbs": 22.6,
    "calories": 97
  },
  {
    "name": "Potatoes, old, baked, flesh only",
    "protein": 2.2,
    "fat": 0.1,
    "carbs": 18,
    "calories": 77
  },
  {
    "name": "Potatoes, old, boiled in salted water, flesh only",
    "protein": 1.8,
    "fat": 0.1,
    "carbs": 17.5,
    "calories": 74
  },
  {
    "name": "Potatoes, old, boiled in unsalted water, flesh only",
    "protein": 1.8,
    "fat": 0.1,
    "carbs": 17.5,
    "calories": 74
  },
  {
    "name": "Potatoes, old, mashed with butter",
    "protein": 1.9,
    "fat": 3.9,
    "carbs": 15.9,
    "calories": 102
  },
  {
    "name": "Potatoes, old, mashed with reduced fat spread",
    "protein": 1.8,
    "fat": 2.8,
    "carbs": 15.9,
    "calories": 93
  },
  {
    "name": "Potatoes, old, microwaved, flesh and skin",
    "protein": 2.6,
    "fat": 0.1,
    "carbs": 21.5,
    "calories": 92
  },
  {
    "name": "Potatoes, old, potato wedges, with skin, cooked in sunflower oil, homemade",
    "protein": 2.9,
    "fat": 3.8,
    "carbs": 26.5,
    "calories": 145
  },
  {
    "name": "Potatoes, old, raw, flesh only",
    "protein": 1.9,
    "fat": 0.1,
    "carbs": 19.6,
    "calories": 82
  },
  {
    "name": "Potatoes, old, roasted in corn oil",
    "protein": 2.6,
    "fat": 5.7,
    "carbs": 26.4,
    "calories": 161
  },
  {
    "name": "Potatoes, old, roasted in lard",
    "protein": 2.6,
    "fat": 5.7,
    "carbs": 26.4,
    "calories": 161
  },
  {
    "name": "Potatoes, old, roasted in rapeseed oil",
    "protein": 2.6,
    "fat": 5.7,
    "carbs": 26.4,
    "calories": 161
  },
  {
    "name": "Potatoes, old, roasted in sunflower oil, flesh only",
    "protein": 2.6,
    "fat": 5.7,
    "carbs": 26.4,
    "calories": 161
  },
  {
    "name": "Potatoes, old, wedges, with skin, homemade, cooked in rapeseed oil",
    "protein": 2.9,
    "fat": 3.8,
    "carbs": 26.5,
    "calories": 145
  },
  {
    "name": "Prawns, king, grilled from raw",
    "protein": 23.5,
    "fat": 0.9,
    "carbs": 0,
    "calories": 102
  },
  {
    "name": "Prawns, king, purchased cooked",
    "protein": 16.2,
    "fat": 0.4,
    "carbs": 0,
    "calories": 68
  },
  {
    "name": "Prawns, king, raw",
    "protein": 17.6,
    "fat": 0.7,
    "carbs": 0,
    "calories": 77
  },
  {
    "name": "Prawns, standard, dried",
    "protein": 83.1,
    "fat": 4.9,
    "carbs": 0,
    "calories": 377
  },
  {
    "name": "Prawns, standard, purchased cooked",
    "protein": 15.4,
    "fat": 0.9,
    "carbs": 0,
    "calories": 70
  },
  {
    "name": "Prickly pears, flesh and seeds",
    "protein": 0.7,
    "fat": 0.3,
    "carbs": 11.5,
    "calories": 49
  },
  {
    "name": "Prunes, flesh and skin, stewed with sugar",
    "protein": 1.3,
    "fat": 0.2,
    "carbs": 25.5,
    "calories": 103
  },
  {
    "name": "Prunes, flesh and skin, stewed without sugar",
    "protein": 1.4,
    "fat": 0.3,
    "carbs": 19.5,
    "calories": 81
  },
  {
    "name": "Pudding, bread and butter, homemade",
    "protein": 6.3,
    "fat": 5.3,
    "carbs": 17,
    "calories": 137
  },
  {
    "name": "Pudding, rice, canned",
    "protein": 3.3,
    "fat": 1.3,
    "carbs": 16.1,
    "calories": 85
  },
  {
    "name": "Pudding, rice, canned, low fat",
    "protein": 3.5,
    "fat": 0.8,
    "carbs": 16,
    "calories": 81
  },
  {
    "name": "Pudding, rice, homemade, with semi-skimmed milk",
    "protein": 4.2,
    "fat": 4.4,
    "carbs": 19,
    "calories": 127
  },
  {
    "name": "Pudding, rice, homemade, with skimmed milk",
    "protein": 4.3,
    "fat": 2.9,
    "carbs": 19.1,
    "calories": 114
  },
  {
    "name": "Pudding, rice, homemade, with whole milk",
    "protein": 4.2,
    "fat": 6.5,
    "carbs": 18.9,
    "calories": 145
  },
  {
    "name": "Pumpkin seeds",
    "protein": 24.4,
    "fat": 45.6,
    "carbs": 15.2,
    "calories": 565
  },
  {
    "name": "Quiche, cheese and egg, homemade",
    "protein": 12.5,
    "fat": 22.3,
    "carbs": 14.6,
    "calories": 305
  },
  {
    "name": "Quiche, cheese and egg, wholemeal, homemade",
    "protein": 13,
    "fat": 20.4,
    "carbs": 15.6,
    "calories": 294
  },
  {
    "name": "Quinoa, raw",
    "protein": 13.8,
    "fat": 5,
    "carbs": 55.7,
    "calories": 309
  },
  {
    "name": "Raita, yogurt and gram flour, homemade",
    "protein": 3.3,
    "fat": 6.6,
    "carbs": 8.1,
    "calories": 103
  },
  {
    "name": "Raspberries, raw",
    "protein": 0.8,
    "fat": 0.3,
    "carbs": 5.1,
    "calories": 25
  },
  {
    "name": "Raspberries, stewed with sugar",
    "protein": 1.2,
    "fat": 0.3,
    "carbs": 15,
    "calories": 63
  },
  {
    "name": "Raspberries, stewed without sugar",
    "protein": 1.4,
    "fat": 0.3,
    "carbs": 4.4,
    "calories": 24
  },
  {
    "name": "Red rice, boiled in unsalted water",
    "protein": 3,
    "fat": 1.2,
    "carbs": 28.2,
    "calories": 129
  },
  {
    "name": "Redcurrants, stewed with sugar",
    "protein": 0.9,
    "fat": 0,
    "carbs": 13.3,
    "calories": 53
  },
  {
    "name": "Redcurrants, stewed without sugar",
    "protein": 0.9,
    "fat": 0,
    "carbs": 3.8,
    "calories": 17
  },
  {
    "name": "Redfish, raw",
    "protein": 18.4,
    "fat": 2.7,
    "carbs": 0,
    "calories": 98
  },
  {
    "name": "Re-fried beans",
    "protein": 7.1,
    "fat": 8.6,
    "carbs": 15,
    "calories": 169
  },
  {
    "name": "Relish, tomato based",
    "protein": 1.2,
    "fat": 0.1,
    "carbs": 27.6,
    "calories": 114
  },
  {
    "name": "Rhubarb, stems only, stewed with sugar",
    "protein": 0.9,
    "fat": 0.1,
    "carbs": 11.5,
    "calories": 48
  },
  {
    "name": "Rhubarb, stems only, stewed without sugar",
    "protein": 1,
    "fat": 0.6,
    "carbs": 1.2,
    "calories": 14
  },
  {
    "name": "Rice and black-eye beans",
    "protein": 5.6,
    "fat": 2.2,
    "carbs": 34.1,
    "calories": 170
  },
  {
    "name": "Rice and black-eye beans, brown rice",
    "protein": 5.9,
    "fat": 2.4,
    "carbs": 31.6,
    "calories": 164
  },
  {
    "name": "Rice and pigeon peas",
    "protein": 4.9,
    "fat": 2.2,
    "carbs": 33.1,
    "calories": 163
  },
  {
    "name": "Rice and pigeon peas, brown rice",
    "protein": 5.2,
    "fat": 2.3,
    "carbs": 30.8,
    "calories": 157
  },
  {
    "name": "Rice and red kidney beans",
    "protein": 5.2,
    "fat": 2.1,
    "carbs": 31.5,
    "calories": 158
  },
  {
    "name": "Rice and red kidney beans, brown rice",
    "protein": 5.5,
    "fat": 2.3,
    "carbs": 29.1,
    "calories": 152
  },
  {
    "name": "Rice and split peas",
    "protein": 5.8,
    "fat": 2.5,
    "carbs": 37.3,
    "calories": 186
  },
  {
    "name": "Rice and split peas, brown rice",
    "protein": 6.2,
    "fat": 2.7,
    "carbs": 34.7,
    "calories": 179
  },
  {
    "name": "Rice, brown, basmati, boiled in unsalted water",
    "protein": 3.3,
    "fat": 1.1,
    "carbs": 28.7,
    "calories": 131
  },
  {
    "name": "Rice, brown, basmati, raw",
    "protein": 8.9,
    "fat": 3.1,
    "carbs": 77.6,
    "calories": 355
  },
  {
    "name": "Rice, brown, easy cook, boiled in unsalted water",
    "protein": 3.2,
    "fat": 1.3,
    "carbs": 35.3,
    "calories": 157
  },
  {
    "name": "Rice, brown, easy cook, raw",
    "protein": 7.5,
    "fat": 3.1,
    "carbs": 82.1,
    "calories": 366
  },
  {
    "name": "Rice, brown, wholegrain, boiled in unsalted water",
    "protein": 3.6,
    "fat": 0.9,
    "carbs": 29.2,
    "calories": 132
  },
  {
    "name": "Rice, brown, wholegrain, raw",
    "protein": 7.7,
    "fat": 1.5,
    "carbs": 77,
    "calories": 333
  },
  {
    "name": "Rice, egg fried, ready cooked, re-heated, retail, not takeaway",
    "protein": 3.9,
    "fat": 5.3,
    "carbs": 28.1,
    "calories": 169
  },
  {
    "name": "Rice, egg fried, takeaway",
    "protein": 4.3,
    "fat": 4.9,
    "carbs": 33.3,
    "calories": 186
  },
  {
    "name": "Rice, pilau, plain, homemade",
    "protein": 2.5,
    "fat": 3.7,
    "carbs": 24.3,
    "calories": 134
  },
  {
    "name": "Rice, ready-cooked, \"plain\", re-heated",
    "protein": 4.1,
    "fat": 1.9,
    "carbs": 33.9,
    "calories": 161
  },
  {
    "name": "Rice, red, raw",
    "protein": 7,
    "fat": 2.9,
    "carbs": 80.4,
    "calories": 356
  },
  {
    "name": "Rice, savoury, including chicken, beef, mushroom and vegetable varieties, dried, cooked",
    "protein": 3.7,
    "fat": 1.4,
    "carbs": 34,
    "calories": 155
  },
  {
    "name": "Rice, savoury, including chicken, beef, mushroom and vegetable varieties, dried, uncooked",
    "protein": 8,
    "fat": 2.7,
    "carbs": 83.3,
    "calories": 369
  },
  {
    "name": "Rice, Thai fragrant, boiled in unsalted water",
    "protein": 2.3,
    "fat": 0.4,
    "carbs": 32.1,
    "calories": 133
  },
  {
    "name": "Rice, Thai fragrant, raw",
    "protein": 6.4,
    "fat": 1.1,
    "carbs": 84.5,
    "calories": 352
  },
  {
    "name": "Rice, white, basmati, boiled in unsalted water",
    "protein": 2.8,
    "fat": 0.7,
    "carbs": 26.5,
    "calories": 117
  },
  {
    "name": "Rice, white, basmati, easy cook, boiled in unsalted water",
    "protein": 3.5,
    "fat": 0.4,
    "carbs": 32.2,
    "calories": 138
  },
  {
    "name": "Rice, white, basmati, easy cook, raw",
    "protein": 8.1,
    "fat": 0.4,
    "carbs": 83.8,
    "calories": 350
  },
  {
    "name": "Rice, white, basmati, raw",
    "protein": 8.1,
    "fat": 0.5,
    "carbs": 83.7,
    "calories": 351
  },
  {
    "name": "Rice, white, Italian \"Arborio\" risotto, boiled in unsalted water",
    "protein": 3.2,
    "fat": 0.5,
    "carbs": 32.2,
    "calories": 138
  },
  {
    "name": "Rice, white, Italian Arborio risotto, raw",
    "protein": 6.4,
    "fat": 1,
    "carbs": 85.2,
    "calories": 354
  },
  {
    "name": "Rice, white, long grain, boiled in unsalted water",
    "protein": 2.8,
    "fat": 0.4,
    "carbs": 31.1,
    "calories": 131
  },
  {
    "name": "Rice, white, long grain, easy cook, boiled in unsalted water",
    "protein": 3,
    "fat": 0.4,
    "carbs": 34.7,
    "calories": 146
  },
  {
    "name": "Rice, white, long grain, easy cook, raw",
    "protein": 7,
    "fat": 1.1,
    "carbs": 82.3,
    "calories": 347
  },
  {
    "name": "Rice, white, long grain, raw",
    "protein": 6.7,
    "fat": 1,
    "carbs": 85.1,
    "calories": 355
  },
  {
    "name": "Rice, white, pudding, raw",
    "protein": 5.6,
    "fat": 0.9,
    "carbs": 85.6,
    "calories": 352
  },
  {
    "name": "Rice, wild, boiled in unsalted water",
    "protein": 5.3,
    "fat": 0.6,
    "carbs": 31.7,
    "calories": 145
  },
  {
    "name": "Rice, wild, raw",
    "protein": 12.2,
    "fat": 1.1,
    "carbs": 75.8,
    "calories": 343
  },
  {
    "name": "Risotto, chicken, homemade",
    "protein": 8.9,
    "fat": 3.3,
    "carbs": 25.3,
    "calories": 173
  },
  {
    "name": "Risotto, vegetable, brown rice",
    "protein": 4,
    "fat": 6.2,
    "carbs": 17.3,
    "calories": 136
  },
  {
    "name": "Risotto, white rice, vegetable, homemade",
    "protein": 3.8,
    "fat": 6.1,
    "carbs": 18.5,
    "calories": 139
  },
  {
    "name": "Rissoles, brown rice, fried in sunflower oil",
    "protein": 5.6,
    "fat": 8.8,
    "carbs": 30.8,
    "calories": 216
  },
  {
    "name": "Rissoles, brown rice, fried in vegetable oil",
    "protein": 5.6,
    "fat": 8.8,
    "carbs": 30.8,
    "calories": 216
  },
  {
    "name": "Rock Salmon/Dogfish, in batter, fried in blended oil",
    "protein": 14.7,
    "fat": 21.9,
    "carbs": 10.3,
    "calories": 295
  },
  {
    "name": "Rock Salmon/Dogfish, in batter, fried in dripping",
    "protein": 14.7,
    "fat": 21.9,
    "carbs": 10.3,
    "calories": 295
  },
  {
    "name": "Rock Salmon/Dogfish, in batter, fried in retail blend oil",
    "protein": 14.7,
    "fat": 21.9,
    "carbs": 10.3,
    "calories": 295
  },
  {
    "name": "Rock Salmon/Dogfish, in batter, fried in sunflower oil",
    "protein": 14.7,
    "fat": 21.9,
    "carbs": 10.3,
    "calories": 295
  },
  {
    "name": "Rock Salmon/Dogfish, raw",
    "protein": 16.6,
    "fat": 9.7,
    "carbs": 0,
    "calories": 154
  },
  {
    "name": "Roe, cod, hard, coated in batter, fried",
    "protein": 12.4,
    "fat": 11.8,
    "carbs": 8.9,
    "calories": 189
  },
  {
    "name": "Roe, cod, hard, raw",
    "protein": 21.7,
    "fat": 1.9,
    "carbs": 0,
    "calories": 104
  },
  {
    "name": "Roulade, spinach",
    "protein": 10.1,
    "fat": 13.3,
    "carbs": 4.5,
    "calories": 182
  },
  {
    "name": "Salad, pasta, vegetables and mayonnaise",
    "protein": 3.7,
    "fat": 7.9,
    "carbs": 17.5,
    "calories": 150
  },
  {
    "name": "Salad, potato, with French dressing",
    "protein": 1.5,
    "fat": 5,
    "carbs": 15.8,
    "calories": 111
  },
  {
    "name": "Salad, potato, with mayonnaise",
    "protein": 1.6,
    "fat": 20.6,
    "carbs": 12.7,
    "calories": 239
  },
  {
    "name": "Salad, potato, with mayonnaise, retail",
    "protein": 1.5,
    "fat": 11.8,
    "carbs": 12.3,
    "calories": 158
  },
  {
    "name": "Salad, rice, brown",
    "protein": 3.5,
    "fat": 7.3,
    "carbs": 21.6,
    "calories": 160
  },
  {
    "name": "Salad, rice, homemade",
    "protein": 3.1,
    "fat": 7,
    "carbs": 24.5,
    "calories": 168
  },
  {
    "name": "Salad, tomato and onion",
    "protein": 0.6,
    "fat": 2.7,
    "carbs": 4.9,
    "calories": 45
  },
  {
    "name": "Salad, wholemeal pasta, with vegetables and mayonnaise",
    "protein": 3.1,
    "fat": 7.5,
    "carbs": 13.8,
    "calories": 131
  },
  {
    "name": "Salmon en croute, retail",
    "protein": 11.8,
    "fat": 19.1,
    "carbs": 18,
    "calories": 288
  },
  {
    "name": "Salmon, farmed, flesh only, baked",
    "protein": 25.2,
    "fat": 14.6,
    "carbs": 0,
    "calories": 232
  },
  {
    "name": "Salmon, farmed, flesh only, grilled",
    "protein": 24.6,
    "fat": 15.6,
    "carbs": 0,
    "calories": 239
  },
  {
    "name": "Salmon, farmed, flesh only, raw",
    "protein": 20.4,
    "fat": 15,
    "carbs": 0,
    "calories": 217
  },
  {
    "name": "Salmon, farmed, flesh only, steamed",
    "protein": 23.6,
    "fat": 18.5,
    "carbs": 0,
    "calories": 261
  },
  {
    "name": "Salmon, pink, canned in brine, drained",
    "protein": 23.6,
    "fat": 4.8,
    "carbs": 0,
    "calories": 138
  },
  {
    "name": "Salmon, red, canned in brine, drained",
    "protein": 23.5,
    "fat": 7.3,
    "carbs": 0,
    "calories": 160
  },
  {
    "name": "Salmon, red, canned in brine, skinless and boneless, drained",
    "protein": 23.2,
    "fat": 6.7,
    "carbs": 0,
    "calories": 153
  },
  {
    "name": "Salmon, smoked (cold-smoked)",
    "protein": 22.8,
    "fat": 10.1,
    "carbs": 0.5,
    "calories": 184
  },
  {
    "name": "Salmon, smoked (hot-smoked)",
    "protein": 25.4,
    "fat": 8.8,
    "carbs": 1.3,
    "calories": 186
  },
  {
    "name": "Salmon, wild, baked",
    "protein": 26.5,
    "fat": 12.1,
    "carbs": 0,
    "calories": 215
  },
  {
    "name": "Salmon, wild, flesh only, raw",
    "protein": 22.1,
    "fat": 10.1,
    "carbs": 0,
    "calories": 179
  },
  {
    "name": "Salmon, wild, grilled",
    "protein": 25.9,
    "fat": 11.8,
    "carbs": 0,
    "calories": 210
  },
  {
    "name": "Salmon, wild, steamed",
    "protein": 25.3,
    "fat": 11.6,
    "carbs": 0,
    "calories": 206
  },
  {
    "name": "Salted fish, Chinese, bones removed, steamed",
    "protein": 33.9,
    "fat": 2.2,
    "carbs": 0,
    "calories": 155
  },
  {
    "name": "Samosas, lamb, baked, homemade",
    "protein": 11.1,
    "fat": 17.5,
    "carbs": 23.1,
    "calories": 288
  },
  {
    "name": "Samosas, lamb, deep fried in rapeseed oil, homemade",
    "protein": 8.1,
    "fat": 31.5,
    "carbs": 16.9,
    "calories": 379
  },
  {
    "name": "Sandwich, white bread, bacon, lettuce and tomato",
    "protein": 8.2,
    "fat": 11.9,
    "carbs": 24.1,
    "calories": 230
  },
  {
    "name": "Sandwich, white bread, cheddar cheese and pickle",
    "protein": 12,
    "fat": 14.4,
    "carbs": 27.7,
    "calories": 282
  },
  {
    "name": "Sandwich, white bread, chicken salad",
    "protein": 10.7,
    "fat": 4.9,
    "carbs": 22.5,
    "calories": 172
  },
  {
    "name": "Sandwich, white bread, egg mayonnaise",
    "protein": 8.8,
    "fat": 11.2,
    "carbs": 28.5,
    "calories": 243
  },
  {
    "name": "Sandwich, white bread, ham salad",
    "protein": 8.2,
    "fat": 4.1,
    "carbs": 25,
    "calories": 163
  },
  {
    "name": "Sandwich, white bread, tuna mayonnaise",
    "protein": 12.5,
    "fat": 10.2,
    "carbs": 25.3,
    "calories": 237
  },
  {
    "name": "Sardines, canned in brine, drained",
    "protein": 22.1,
    "fat": 9.1,
    "carbs": 0,
    "calories": 170
  },
  {
    "name": "Sardines, canned in olive oil, drained",
    "protein": 23.3,
    "fat": 14.1,
    "carbs": 0,
    "calories": 220
  },
  {
    "name": "Sardines, canned in sunflower oil, drained",
    "protein": 23.3,
    "fat": 14.1,
    "carbs": 0,
    "calories": 220
  },
  {
    "name": "Sardines, canned in tomato sauce, whole contents",
    "protein": 18.5,
    "fat": 10.8,
    "carbs": 0.9,
    "calories": 175
  },
  {
    "name": "Sardines, flesh only, grilled",
    "protein": 25.4,
    "fat": 7.8,
    "carbs": 0,
    "calories": 172
  },
  {
    "name": "Sardines, flesh only, raw",
    "protein": 19.8,
    "fat": 6.1,
    "carbs": 0,
    "calories": 134
  },
  {
    "name": "Sauce, cheese, packet mix, dry",
    "protein": 19.3,
    "fat": 28.4,
    "carbs": 40.9,
    "calories": 486
  },
  {
    "name": "Sauce, curry, onion, with butter, homemade",
    "protein": 1.2,
    "fat": 24.7,
    "carbs": 6.6,
    "calories": 252
  },
  {
    "name": "Sauce, curry, tomato and onion, homemade",
    "protein": 1.7,
    "fat": 19.2,
    "carbs": 6.1,
    "calories": 201
  },
  {
    "name": "Sauce, duck a l'orange",
    "protein": 0.5,
    "fat": 3.7,
    "carbs": 7.1,
    "calories": 66
  },
  {
    "name": "Sauce, pasta, carbonara type",
    "protein": 4.9,
    "fat": 13,
    "carbs": 3.8,
    "calories": 151
  },
  {
    "name": "Sauce, pasta, four cheese",
    "protein": 5.1,
    "fat": 9.7,
    "carbs": 5.8,
    "calories": 129
  },
  {
    "name": "Sauce, pasta, tomato based, for bolognese",
    "protein": 1.5,
    "fat": 1.3,
    "carbs": 6.9,
    "calories": 44
  },
  {
    "name": "Sauce, pasta, tomato based, napoletana",
    "protein": 1.5,
    "fat": 3.8,
    "carbs": 6.5,
    "calories": 65
  },
  {
    "name": "Sauce, pasta, tomato based, reduced fat",
    "protein": 1.4,
    "fat": 0.3,
    "carbs": 6.7,
    "calories": 33
  },
  {
    "name": "Sauce, pasta, tomato based, with added vegetables",
    "protein": 1.4,
    "fat": 2.1,
    "carbs": 5.7,
    "calories": 46
  },
  {
    "name": "Sauce, pasta, white, with ham and mushrooms, homemade",
    "protein": 7.3,
    "fat": 10.6,
    "carbs": 1,
    "calories": 129
  },
  {
    "name": "Sauce, tomato and mushroom, homemade",
    "protein": 1.4,
    "fat": 2,
    "carbs": 6,
    "calories": 46
  },
  {
    "name": "Sauce, tomato based, homemade",
    "protein": 1.5,
    "fat": 4.5,
    "carbs": 6.5,
    "calories": 70
  },
  {
    "name": "Sauce, traditional cook in, tomato based",
    "protein": 0.9,
    "fat": 1,
    "carbs": 8.1,
    "calories": 43
  },
  {
    "name": "Sausage roll, flaky pastry, ready-to-eat, retail",
    "protein": 8.4,
    "fat": 24.1,
    "carbs": 27,
    "calories": 352
  },
  {
    "name": "Sausage rolls, short pastry, homemade",
    "protein": 9.9,
    "fat": 28.8,
    "carbs": 25.6,
    "calories": 395
  },
  {
    "name": "Sausages, beef, fried in vegetable oil",
    "protein": 17.6,
    "fat": 17.4,
    "carbs": 10.7,
    "calories": 267
  },
  {
    "name": "Sausages, beef, grilled",
    "protein": 17.2,
    "fat": 17.2,
    "carbs": 11,
    "calories": 265
  },
  {
    "name": "Sausages, beef, raw",
    "protein": 12.7,
    "fat": 19.5,
    "carbs": 8.4,
    "calories": 258
  },
  {
    "name": "Sausages, pork, chilled, fried in vegetable oil",
    "protein": 13.9,
    "fat": 23.9,
    "carbs": 9.9,
    "calories": 308
  },
  {
    "name": "Sausages, pork, chilled, grilled",
    "protein": 14.5,
    "fat": 22.1,
    "carbs": 9.8,
    "calories": 294
  },
  {
    "name": "Sausages, pork, frozen, fried in vegetable oil",
    "protein": 13.8,
    "fat": 24.8,
    "carbs": 10,
    "calories": 316
  },
  {
    "name": "Sausages, pork, frozen, grilled",
    "protein": 14.8,
    "fat": 21.2,
    "carbs": 10.5,
    "calories": 289
  },
  {
    "name": "Sausages, pork, raw",
    "protein": 11.9,
    "fat": 25,
    "carbs": 9.6,
    "calories": 309
  },
  {
    "name": "Sausages, pork, reduced fat, fried in vegetable oil",
    "protein": 14.9,
    "fat": 5.7,
    "carbs": 8.8,
    "calories": 144
  },
  {
    "name": "Sausages, pork, reduced fat, grilled",
    "protein": 16.2,
    "fat": 6.1,
    "carbs": 10.7,
    "calories": 160
  },
  {
    "name": "Sausages, pork, reduced fat, raw",
    "protein": 14.4,
    "fat": 5.6,
    "carbs": 8.7,
    "calories": 141
  },
  {
    "name": "Sausages, premium, fried in vegetable oil",
    "protein": 17.9,
    "fat": 19.5,
    "carbs": 2.5,
    "calories": 256
  },
  {
    "name": "Sausages, premium, grilled",
    "protein": 19,
    "fat": 21.1,
    "carbs": 2.3,
    "calories": 275
  },
  {
    "name": "Sausages, premium, raw",
    "protein": 13.8,
    "fat": 21,
    "carbs": 2.6,
    "calories": 254
  },
  {
    "name": "Sausages, vegetarian, baked/grilled",
    "protein": 14.9,
    "fat": 9.4,
    "carbs": 9.2,
    "calories": 179
  },
  {
    "name": "Scampi, coated in breadcrumbs, baked",
    "protein": 11.6,
    "fat": 10.5,
    "carbs": 24.3,
    "calories": 232
  },
  {
    "name": "Scampi, coated in breadcrumbs, fried in sunflower oil",
    "protein": 10.6,
    "fat": 13,
    "carbs": 22.2,
    "calories": 243
  },
  {
    "name": "Scampi, in breadcrumbs, frozen, fried in rapeseed oil",
    "protein": 10.6,
    "fat": 13,
    "carbs": 22.2,
    "calories": 243
  },
  {
    "name": "Scones, cheese, homemade",
    "protein": 10.1,
    "fat": 16.4,
    "carbs": 45.3,
    "calories": 358
  },
  {
    "name": "Scones, potato, homemade",
    "protein": 4.8,
    "fat": 13.6,
    "carbs": 36.8,
    "calories": 279
  },
  {
    "name": "Scotch eggs, retail",
    "protein": 12,
    "fat": 16,
    "carbs": 13.1,
    "calories": 241
  },
  {
    "name": "Sesame seeds",
    "protein": 18.2,
    "fat": 58,
    "carbs": 0.9,
    "calories": 598
  },
  {
    "name": "Shish kebab in pitta bread with salad",
    "protein": 13.6,
    "fat": 4.1,
    "carbs": 15.4,
    "calories": 149
  },
  {
    "name": "Shortbread",
    "protein": 5.3,
    "fat": 29,
    "carbs": 62.2,
    "calories": 515
  },
  {
    "name": "Souffle, cheese, homemade",
    "protein": 11.6,
    "fat": 16.8,
    "carbs": 10.8,
    "calories": 237
  },
  {
    "name": "Soup, broccoli and stilton, carton, chilled",
    "protein": 2.3,
    "fat": 3.1,
    "carbs": 3.8,
    "calories": 51
  },
  {
    "name": "Soup, carrot and coriander, carton, chilled",
    "protein": 0.9,
    "fat": 2.6,
    "carbs": 4.7,
    "calories": 45
  },
  {
    "name": "Soup, carrot and orange, homemade",
    "protein": 0.3,
    "fat": 0.5,
    "carbs": 3.8,
    "calories": 20
  },
  {
    "name": "Soup, chicken noodle, dried",
    "protein": 17.1,
    "fat": 4.8,
    "carbs": 56,
    "calories": 322
  },
  {
    "name": "Soup, chicken noodle, dried, as served",
    "protein": 1,
    "fat": 0.3,
    "carbs": 3.2,
    "calories": 19
  },
  {
    "name": "Soup, chicken, cream of, canned",
    "protein": 1.7,
    "fat": 3.8,
    "carbs": 4.5,
    "calories": 58
  },
  {
    "name": "Soup, chicken, cream of, canned, condensed",
    "protein": 2.6,
    "fat": 5.8,
    "carbs": 6,
    "calories": 85
  },
  {
    "name": "Soup, cream of tomato, canned",
    "protein": 0.9,
    "fat": 2,
    "carbs": 7.8,
    "calories": 51
  },
  {
    "name": "Soup, pea and ham, homemade",
    "protein": 4.1,
    "fat": 2.2,
    "carbs": 9.8,
    "calories": 73
  },
  {
    "name": "Soup, potato and leek, homemade",
    "protein": 1.5,
    "fat": 2.2,
    "carbs": 6.2,
    "calories": 56
  },
  {
    "name": "Soup, tomato, carton, chilled",
    "protein": 0.9,
    "fat": 1.9,
    "carbs": 4.3,
    "calories": 37
  },
  {
    "name": "Spinach, baby, boiled in unsalted water",
    "protein": 3.2,
    "fat": 0.7,
    "carbs": 0.2,
    "calories": 20
  },
  {
    "name": "Spinach, baby, raw",
    "protein": 2.6,
    "fat": 0.6,
    "carbs": 0.2,
    "calories": 16
  },
  {
    "name": "Spinach, dried",
    "protein": 24.3,
    "fat": 6.9,
    "carbs": 13.8,
    "calories": 211
  },
  {
    "name": "Spinach, frozen, boiled in unsalted water",
    "protein": 3.1,
    "fat": 0.8,
    "carbs": 0.5,
    "calories": 21
  },
  {
    "name": "Spinach, mature, boiled in unsalted water",
    "protein": 2.2,
    "fat": 0.8,
    "carbs": 0.8,
    "calories": 19
  },
  {
    "name": "Spinach, mature, raw",
    "protein": 2.8,
    "fat": 0.8,
    "carbs": 1.6,
    "calories": 25
  },
  {
    "name": "Squash, butternut, baked",
    "protein": 1.4,
    "fat": 0.2,
    "carbs": 8.4,
    "calories": 39
  },
  {
    "name": "Squash, butternut, boiled in unsalted water",
    "protein": 0.9,
    "fat": 0.1,
    "carbs": 5.1,
    "calories": 24
  },
  {
    "name": "Squash, butternut, raw",
    "protein": 1.1,
    "fat": 0.1,
    "carbs": 8.3,
    "calories": 36
  },
  {
    "name": "Steak and kidney pudding, homemade",
    "protein": 10.7,
    "fat": 10.9,
    "carbs": 18.6,
    "calories": 210
  },
  {
    "name": "Stew, beef, homemade",
    "protein": 11.9,
    "fat": 4.6,
    "carbs": 4.8,
    "calories": 105
  },
  {
    "name": "Stew, beef, made with lean beef, homemade",
    "protein": 12.2,
    "fat": 3.1,
    "carbs": 4.8,
    "calories": 93
  },
  {
    "name": "Stew, beef, with dumplings, homemade",
    "protein": 10.1,
    "fat": 10,
    "carbs": 16.2,
    "calories": 190
  },
  {
    "name": "Stew, Irish, made with lean lamb, homemade",
    "protein": 7.6,
    "fat": 4.9,
    "carbs": 8.6,
    "calories": 107
  },
  {
    "name": "Stir-fry beef with green peppers and blackbean sauce, takeaway",
    "protein": 10.5,
    "fat": 5.6,
    "carbs": 2.7,
    "calories": 103
  },
  {
    "name": "Stock, chicken, ready made, retail",
    "protein": 2.3,
    "fat": 0.2,
    "carbs": 0.2,
    "calories": 12
  },
  {
    "name": "Strawberries, raw",
    "protein": 0.6,
    "fat": 0.5,
    "carbs": 6.1,
    "calories": 30
  },
  {
    "name": "Sugar apple, flesh only",
    "protein": 1.6,
    "fat": 0.3,
    "carbs": 16.1,
    "calories": 69
  },
  {
    "name": "Sugar, brown",
    "protein": 0.1,
    "fat": 0,
    "carbs": 101.3,
    "calories": 380
  },
  {
    "name": "Sugar, Demerara",
    "protein": 0.5,
    "fat": 0,
    "carbs": 104.5,
    "calories": 394
  },
  {
    "name": "Sugar, icing",
    "protein": 0,
    "fat": 0,
    "carbs": 104.9,
    "calories": 393
  },
  {
    "name": "Sugar, white",
    "protein": 0,
    "fat": 0,
    "carbs": 105,
    "calories": 394
  },
  {
    "name": "Sunflower seeds",
    "protein": 19.8,
    "fat": 47.5,
    "carbs": 18.6,
    "calories": 576
  },
  {
    "name": "Sunflower seeds, toasted",
    "protein": 20.5,
    "fat": 49.2,
    "carbs": 19.3,
    "calories": 602
  },
  {
    "name": "Sushi, salmon nigiri",
    "protein": 8.7,
    "fat": 2.5,
    "carbs": 25.2,
    "calories": 152
  },
  {
    "name": "Sushi, tuna nigiri",
    "protein": 8.4,
    "fat": 2.5,
    "carbs": 30.3,
    "calories": 170
  },
  {
    "name": "Sweet and sour chicken, takeaway",
    "protein": 7.6,
    "fat": 10,
    "carbs": 19.7,
    "calories": 194
  },
  {
    "name": "Sweet and sour pork, battered, takeaway",
    "protein": 7.8,
    "fat": 13.9,
    "carbs": 22.4,
    "calories": 240
  },
  {
    "name": "Sweet and sour pork, homemade",
    "protein": 12.7,
    "fat": 8.3,
    "carbs": 11.6,
    "calories": 176
  },
  {
    "name": "Sweet potato and onion layer",
    "protein": 3.4,
    "fat": 1.8,
    "carbs": 23.3,
    "calories": 124
  },
  {
    "name": "Sweet potato, baked",
    "protein": 1.6,
    "fat": 0.4,
    "carbs": 27.9,
    "calories": 115
  },
  {
    "name": "Sweet potato, flesh only, boiled in unsalted water",
    "protein": 1.7,
    "fat": 0.2,
    "carbs": 13,
    "calories": 58
  },
  {
    "name": "Sweet potato, raw, flesh only",
    "protein": 1.2,
    "fat": 0.3,
    "carbs": 21.3,
    "calories": 87
  },
  {
    "name": "Sweet potato, steamed",
    "protein": 1.1,
    "fat": 0.3,
    "carbs": 20.4,
    "calories": 84
  },
  {
    "name": "Sweet potato, wedges, flesh and skin, baked in rapeseed oil",
    "protein": 2.9,
    "fat": 3.9,
    "carbs": 24.7,
    "calories": 139
  },
  {
    "name": "Sweetbread, lamb, fried in corn oil",
    "protein": 28.7,
    "fat": 11.4,
    "carbs": 0,
    "calories": 217
  },
  {
    "name": "Sweetbread, lamb, raw",
    "protein": 15.3,
    "fat": 7.8,
    "carbs": 0,
    "calories": 131
  },
  {
    "name": "Swordfish, flesh only, grilled",
    "protein": 22.9,
    "fat": 5.2,
    "carbs": 0,
    "calories": 139
  },
  {
    "name": "Swordfish, flesh only, raw",
    "protein": 18,
    "fat": 4.1,
    "carbs": 0,
    "calories": 109
  },
  {
    "name": "Szechuan prawns with vegetables, takeaway",
    "protein": 7.8,
    "fat": 4.7,
    "carbs": 2.5,
    "calories": 83
  },
  {
    "name": "Tamarillos, flesh and seeds",
    "protein": 2,
    "fat": 0.3,
    "carbs": 4.7,
    "calories": 28
  },
  {
    "name": "Tart, mincemeat, one crust, homemade",
    "protein": 3.1,
    "fat": 17.9,
    "carbs": 56.4,
    "calories": 385
  },
  {
    "name": "Tea, infusion, average, with semi-skimmed milk",
    "protein": 0.5,
    "fat": 0.2,
    "carbs": 0.7,
    "calories": 7
  },
  {
    "name": "Tea, infusion, average, with whole milk",
    "protein": 0.4,
    "fat": 0.4,
    "carbs": 0.5,
    "calories": 8
  },
  {
    "name": "Tigernuts",
    "protein": 4.3,
    "fat": 23.8,
    "carbs": 45.7,
    "calories": 403
  },
  {
    "name": "Toad in the hole, made with skimmed milk and reduced fat sausages, homemade",
    "protein": 13.6,
    "fat": 5.2,
    "carbs": 19.7,
    "calories": 175
  },
  {
    "name": "Tomato juice",
    "protein": 0.8,
    "fat": 0,
    "carbs": 3,
    "calories": 14
  },
  {
    "name": "Tomato ketchup",
    "protein": 1.6,
    "fat": 0.1,
    "carbs": 28.6,
    "calories": 115
  },
  {
    "name": "Tomato puree",
    "protein": 4.4,
    "fat": 0.2,
    "carbs": 12.9,
    "calories": 67
  },
  {
    "name": "Tomato sauce, homemade",
    "protein": 2.2,
    "fat": 5.5,
    "carbs": 8.6,
    "calories": 89
  },
  {
    "name": "Tomatoes, canned, whole contents",
    "protein": 1.1,
    "fat": 0.1,
    "carbs": 3.8,
    "calories": 19
  },
  {
    "name": "Tomatoes, cherry, raw",
    "protein": 1.1,
    "fat": 0.5,
    "carbs": 3.6,
    "calories": 22
  },
  {
    "name": "Tomatoes, standard, fried in corn oil",
    "protein": 0.8,
    "fat": 7.7,
    "carbs": 4.5,
    "calories": 89
  },
  {
    "name": "Tomatoes, standard, fried in rapeseed oil",
    "protein": 0.8,
    "fat": 7.7,
    "carbs": 4.5,
    "calories": 89
  },
  {
    "name": "Tomatoes, standard, grilled, flesh and seeds only",
    "protein": 0.6,
    "fat": 0.2,
    "carbs": 3.4,
    "calories": 17
  },
  {
    "name": "Tomatoes, standard, raw",
    "protein": 0.5,
    "fat": 0.1,
    "carbs": 3,
    "calories": 14
  },
  {
    "name": "Tomatoes, stuffed with rice",
    "protein": 2.1,
    "fat": 13.4,
    "carbs": 22.2,
    "calories": 212
  },
  {
    "name": "Tomatoes, stuffed with vegetables",
    "protein": 1.7,
    "fat": 6,
    "carbs": 8.9,
    "calories": 95
  },
  {
    "name": "Tongue, lamb, raw",
    "protein": 15.3,
    "fat": 14.6,
    "carbs": 0,
    "calories": 193
  },
  {
    "name": "Tripe, dressed, stewed in milk",
    "protein": 14.8,
    "fat": 4.5,
    "carbs": 0,
    "calories": 100
  },
  {
    "name": "Tuna, canned in brine, drained",
    "protein": 24.9,
    "fat": 1,
    "carbs": 0,
    "calories": 109
  },
  {
    "name": "Tuna, canned in sunflower oil, drained",
    "protein": 25.4,
    "fat": 6.4,
    "carbs": 0,
    "calories": 159
  },
  {
    "name": "Tuna, flesh only, baked",
    "protein": 32.3,
    "fat": 0.8,
    "carbs": 0,
    "calories": 136
  },
  {
    "name": "Tuna, flesh only, raw",
    "protein": 25.2,
    "fat": 0.7,
    "carbs": 0,
    "calories": 107
  },
  {
    "name": "Turkey and pasta bake, homemade",
    "protein": 12,
    "fat": 5.6,
    "carbs": 7.2,
    "calories": 130
  },
  {
    "name": "Turkey slices",
    "protein": 23,
    "fat": 1.9,
    "carbs": 1.2,
    "calories": 114
  },
  {
    "name": "Turkey, breast, fillet, grilled, meat only",
    "protein": 35,
    "fat": 1.7,
    "carbs": 0,
    "calories": 155
  },
  {
    "name": "Turkey, dark meat, raw",
    "protein": 20.4,
    "fat": 2.5,
    "carbs": 0,
    "calories": 104
  },
  {
    "name": "Turkey, dark meat, roasted",
    "protein": 29.4,
    "fat": 6.6,
    "carbs": 0,
    "calories": 177
  },
  {
    "name": "Turkey, drumsticks, roasted, meat and skin",
    "protein": 27.4,
    "fat": 8.5,
    "carbs": 0,
    "calories": 186
  },
  {
    "name": "Turkey, drumsticks, roasted, meat only",
    "protein": 27.5,
    "fat": 5.8,
    "carbs": 0,
    "calories": 162
  },
  {
    "name": "Turkey, light meat, raw",
    "protein": 24.4,
    "fat": 0.8,
    "carbs": 0,
    "calories": 105
  },
  {
    "name": "Turkey, light meat, roasted",
    "protein": 33.7,
    "fat": 2,
    "carbs": 0,
    "calories": 153
  },
  {
    "name": "Turkey, meat, average, raw",
    "protein": 22.6,
    "fat": 1.6,
    "carbs": 0,
    "calories": 105
  },
  {
    "name": "Turkey, meat, average, roasted",
    "protein": 31.2,
    "fat": 4.6,
    "carbs": 0,
    "calories": 166
  },
  {
    "name": "Turkey, mince, stewed",
    "protein": 28.6,
    "fat": 6.8,
    "carbs": 0,
    "calories": 176
  },
  {
    "name": "Turkey, self-basting, light meat, roasted",
    "protein": 31.7,
    "fat": 4,
    "carbs": 0,
    "calories": 163
  },
  {
    "name": "Turkey, skin, dry, roasted",
    "protein": 29.9,
    "fat": 40.2,
    "carbs": 0,
    "calories": 481
  },
  {
    "name": "Turkey, skin, moist, roasted",
    "protein": 21.6,
    "fat": 31.7,
    "carbs": 0,
    "calories": 372
  },
  {
    "name": "Turkey, skin, raw",
    "protein": 14,
    "fat": 30.7,
    "carbs": 0,
    "calories": 332
  },
  {
    "name": "Turkey, stir-fried with vegetables, homemade",
    "protein": 11.1,
    "fat": 2.3,
    "carbs": 3.6,
    "calories": 82
  },
  {
    "name": "Turkey, strips, stir-fried in corn oil",
    "protein": 31,
    "fat": 4.5,
    "carbs": 0,
    "calories": 164
  },
  {
    "name": "Turkey, thighs, diced, casseroled, meat only",
    "protein": 28.3,
    "fat": 7.5,
    "carbs": 0,
    "calories": 181
  },
  {
    "name": "Turkey, whole, raw",
    "protein": 21.6,
    "fat": 5.2,
    "carbs": 0,
    "calories": 133
  },
  {
    "name": "Turkey, whole, roasted, meat and skin",
    "protein": 30.9,
    "fat": 7.4,
    "carbs": 0,
    "calories": 190
  },
  {
    "name": "Turkish delight, with nuts, homemade",
    "protein": 4.1,
    "fat": 2.6,
    "carbs": 82,
    "calories": 348
  },
  {
    "name": "Turkish delight, without nuts",
    "protein": 0.6,
    "fat": 0,
    "carbs": 77.9,
    "calories": 295
  },
  {
    "name": "Veal, mince, raw",
    "protein": 20.3,
    "fat": 7,
    "carbs": 0,
    "calories": 144
  },
  {
    "name": "Veal, mince, stewed",
    "protein": 26.3,
    "fat": 11.1,
    "carbs": 0,
    "calories": 205
  },
  {
    "name": "Vegetable and cheese grill/burger, in crumbs, baked/grilled",
    "protein": 7,
    "fat": 14,
    "carbs": 23,
    "calories": 240
  },
  {
    "name": "Vegetables, mixed, cooked with onion, spice and tomatoes, homemade",
    "protein": 2.4,
    "fat": 5.3,
    "carbs": 6.6,
    "calories": 82
  },
  {
    "name": "Vine leaves, stuffed with rice",
    "protein": 2.6,
    "fat": 17.8,
    "carbs": 23.8,
    "calories": 263
  },
  {
    "name": "Walnuts, kernel only",
    "protein": 14.7,
    "fat": 68.5,
    "carbs": 3.3,
    "calories": 688
  },
  {
    "name": "Water chestnuts, raw",
    "protein": 1.4,
    "fat": 0.2,
    "carbs": 10.4,
    "calories": 46
  },
  {
    "name": "Welsh cheesecakes, homemade",
    "protein": 5.3,
    "fat": 23.8,
    "carbs": 49.2,
    "calories": 420
  },
  {
    "name": "White fish, dried, salted",
    "protein": 34.5,
    "fat": 1.1,
    "carbs": 0,
    "calories": 148
  },
  {
    "name": "White sauce, savoury, made with semi-skimmed milk, homemade",
    "protein": 4.4,
    "fat": 8,
    "carbs": 11.1,
    "calories": 131
  },
  {
    "name": "White sauce, savoury, made with skimmed milk, homemade",
    "protein": 4.5,
    "fat": 6.5,
    "carbs": 11.1,
    "calories": 118
  },
  {
    "name": "White sauce, savoury, made with whole milk, homemade",
    "protein": 4.4,
    "fat": 10.8,
    "carbs": 11.6,
    "calories": 158
  },
  {
    "name": "White sauce, sweet, made with semi-skimmed milk, homemade",
    "protein": 4,
    "fat": 6.7,
    "carbs": 18.6,
    "calories": 146
  },
  {
    "name": "White sauce, sweet, made with skimmed milk, homemade",
    "protein": 4.1,
    "fat": 5.3,
    "carbs": 18.7,
    "calories": 134
  },
  {
    "name": "White sauce, sweet, made with whole milk, homemade",
    "protein": 4,
    "fat": 8.6,
    "carbs": 18.6,
    "calories": 163
  },
  {
    "name": "Whitecurrants, stewed with sugar",
    "protein": 1,
    "fat": 0,
    "carbs": 14.2,
    "calories": 57
  },
  {
    "name": "Whitecurrants, stewed without sugar",
    "protein": 1.1,
    "fat": 0,
    "carbs": 4.8,
    "calories": 22
  },
  {
    "name": "Yogurt, Greek style, fruit",
    "protein": 4.8,
    "fat": 8.4,
    "carbs": 11.2,
    "calories": 137
  },
  {
    "name": "Yogurt, Greek style, plain",
    "protein": 5.7,
    "fat": 10.2,
    "carbs": 4.8,
    "calories": 133
  },
  {
    "name": "Yogurt, low fat, fruit",
    "protein": 4.2,
    "fat": 1.1,
    "carbs": 13.7,
    "calories": 78
  },
  {
    "name": "Yogurt, low fat, hazelnut",
    "protein": 4.4,
    "fat": 1.5,
    "carbs": 16,
    "calories": 91
  },
  {
    "name": "Yogurt, low fat, plain",
    "protein": 4.8,
    "fat": 1,
    "carbs": 7.8,
    "calories": 57
  },
  {
    "name": "Yogurt, low fat, toffee",
    "protein": 3.8,
    "fat": 0.9,
    "carbs": 18,
    "calories": 91
  },
  {
    "name": "Yogurt, soya, non-dairy alternative to yogurt, fruit, fortified",
    "protein": 3.3,
    "fat": 2,
    "carbs": 11,
    "calories": 72
  },
  {
    "name": "Yogurt, virtually fat free/diet, fruit",
    "protein": 4.8,
    "fat": 0.2,
    "carbs": 10.1,
    "calories": 59
  },
  {
    "name": "Yogurt, virtually fat free/diet, plain",
    "protein": 5.4,
    "fat": 0.2,
    "carbs": 8.2,
    "calories": 54
  },
  {
    "name": "Yogurt, whole milk, fruit",
    "protein": 4,
    "fat": 3,
    "carbs": 17.7,
    "calories": 109
  },
  {
    "name": "Yogurt, whole milk, infant, fruit flavour",
    "protein": 3.8,
    "fat": 3.7,
    "carbs": 11.1,
    "calories": 90
  },
  {
    "name": "Yogurt, whole milk, plain",
    "protein": 5.7,
    "fat": 3,
    "carbs": 7.8,
    "calories": 79
  },
  {
    "name": "Yogurt, whole milk, twin pot, not fruit",
    "protein": 4.2,
    "fat": 5.6,
    "carbs": 21.5,
    "calories": 148
  },
  {
    "name": "Yogurt, whole milk, twin pot, thick and creamy with fruit",
    "protein": 4.1,
    "fat": 3.2,
    "carbs": 16.2,
    "calories": 106
  },
  {
    "name": "Yorkshire pudding, made with semi-skimmed milk, homemade",
    "protein": 6.7,
    "fat": 8.3,
    "carbs": 25.6,
    "calories": 197
  },
  {
    "name": "Yorkshire pudding, made with skimmed milk, homemade",
    "protein": 6.8,
    "fat": 7.4,
    "carbs": 25.9,
    "calories": 190
  },
  {
    "name": "Yorkshire pudding, made with whole milk",
    "protein": 6.7,
    "fat": 9.8,
    "carbs": 25.8,
    "calories": 211
  }
];
