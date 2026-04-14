import { FoodItem, SpinnerOption } from '../types';

export function toSpinnerOption(food: FoodItem): SpinnerOption {
  return {
    id: food.id,
    label: food.name,
    calories: food.calories,
    origin: 'system',
    meta: {
      trafficLight: food.trafficLight,
      type: food.type
    }
  };
}
