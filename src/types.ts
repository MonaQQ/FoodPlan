export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type TrafficLight = 'green' | 'yellow' | 'red';

export type FoodNature = 'vegetarian' | 'meat' | 'soup' | 'staple';

export type DateTag = 'weekday' | 'weekend' | 'festival';

export interface CookingStep {
  title: string;
  duration: string;
  detail: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  trafficLight: TrafficLight;
  type: FoodNature;
  seasons: Season[];
  dateTags: DateTag[];
  description: string;
  nutrients: string[];
  ingredients: string[];
  cookingMethod: string;
  bestTime: string;
  cookingSteps: CookingStep[];
  isFavorite?: boolean;
}

export interface CustomFoodItem extends FoodItem {
  origin: 'user';
}

export interface WeeklyPlanDay {
  date: string;
  foodIds: string[];
}

export interface WeeklyPlan {
  startDate: string;
  dailyCount: number;
  days: WeeklyPlanDay[];
}

export interface FoodDetailDraft {
  ingredients: string[];
  cookingMethod: string;
  cookingSteps: CookingStep[];
}

export interface SpinnerOption {
  id: string;
  label: string;
  calories?: number;
  origin: 'system' | 'user';
  meta?: {
    trafficLight?: TrafficLight;
    type?: FoodNature;
    isFavorite?: boolean;
  };
}

export interface SpinRecord {
  id: string;
  option: SpinnerOption;
  source: 'daily' | 'custom';
  timestamp: string;
}
