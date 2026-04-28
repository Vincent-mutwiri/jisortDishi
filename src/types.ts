export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  dietary_preferences: string[];
  budget_preference: number;
  currency: string;
  created_at: string;
}

export type StorageType = 'fridge' | 'pantry' | 'store';

export interface StorageUnit {
  storage_id: string;
  user_id: string;
  type: StorageType;
  name?: string;
  created_at: string;
}

export interface PantryItem {
  item_id: string;
  storage_id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  date_added: string;
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  recipe_id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  estimated_cost: number;
  preparation_time: number;
  created_by: string;
  price?: number;
  is_public: boolean;
  created_at: string;
}

export interface MealSuggestion {
  suggestion_id: string;
  user_id: string;
  recipe_id: string;
  budget_used: number;
  based_on_items: string[];
  generated_at: string;
  recipe?: Recipe;
}
