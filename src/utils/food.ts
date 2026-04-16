import { FoodItem, SpinnerOption } from '../types';

export function toSpinnerOption(food: FoodItem): SpinnerOption {
  return {
    id: food.id,
    label: food.name,
    calories: food.calories,
    origin: 'origin' in food && food.origin === 'user' ? 'user' : 'system',
    meta: {
      trafficLight: food.trafficLight,
      type: food.type,
      isFavorite: food.isFavorite
    }
  };
}
