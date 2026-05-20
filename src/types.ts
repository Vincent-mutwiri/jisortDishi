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

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeStep {
  step_number: number;
  instruction: string;
  duration_minutes?: number;
}

export interface Recipe {
  recipe_id: string;
  title: string;
  description: string;
  cuisine: string;
  category: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tags: string[];
  dietary_tags: string[];
  tips?: string[];
  estimated_cost: number;
  created_by: string;
  is_public: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  cuisine: string;
  category: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Omit<RecipeIngredient, 'name'>[]; // name will be derived from pantry items or user input
  steps: Omit<RecipeStep, 'step_number'>[];
  tags: string[];
  dietary_tags: string[];
  tips?: string[];
  is_public: boolean;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  recipe_id: string;
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

// Auth Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  auth_method: string;
}

export interface RegisterResponse {
  success: boolean;
  user: AuthUser;
}

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
  profile: UserProfile;
}

export interface ForgotPasswordResponse {
  success: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
}
