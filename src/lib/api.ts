import type { PantryItem, Recipe, UserProfile, CreateRecipeRequest, UpdateRecipeRequest, RecipeComment, SavedAIMeal } from '../types';
import type { GeminiMealSuggestion } from './gemini';

function userIdHeader() {
  if (typeof window === 'undefined') return {};
  const userId = window.localStorage.getItem('jisort_user_id');
  return userId ? { 'x-user-id': userId } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');

  const userHeaders = userIdHeader();
  if ('x-user-id' in userHeaders && userHeaders['x-user-id']) {
    headers.set('x-user-id', userHeaders['x-user-id']);
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getProfile: () => request<UserProfile>('/api/users'),
  upsertProfile: (profile: Partial<UserProfile>) => request<UserProfile>('/api/users', {
    method: 'POST',
    body: JSON.stringify(profile),
  }),
  updateProfile: (profile: Partial<UserProfile>) => request<UserProfile>('/api/users', {
    method: 'PATCH',
    body: JSON.stringify(profile),
  }),
  getPantry: () => request<PantryItem[]>('/api/pantry'),
  addPantryItem: (item: { name: string; quantity: number; unit: string; expiry?: string; storage_type: 'fridge' | 'pantry' }) => request<PantryItem>('/api/pantry', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  deletePantryItem: (itemId: string) => request<{ ok: true }>(`/api/pantry/${itemId}`, {
    method: 'DELETE',
  }),
  getRecipes: () => request<Recipe[]>('/api/recipes'),
  createRecipe: (recipe: CreateRecipeRequest) => request<Recipe>('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  }),
  updateRecipe: (recipe: UpdateRecipeRequest) => request<Recipe>('/api/recipes', {
    method: 'PATCH',
    body: JSON.stringify(recipe),
  }),
  deleteRecipe: (recipeId: string) => request<{ ok: true }>(`/api/recipes/${recipeId}`, {
    method: 'DELETE',
  }),
  getSuggestions: (payload: {
    budget: number;
    items: string[];
    preferences: string[];
    currency: string;
    category: string;
    meal_type: string;
    people: number;
    extra_notes: string;
  }) => request<GeminiMealSuggestion[]>('/api/suggestions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  likeRecipe: (recipeId: string) =>
    request<{ liked: boolean; likes: number }>(`/api/recipes/${recipeId}/like`, { method: 'POST' }),
  viewRecipe: (recipeId: string) =>
    request<{ ok: boolean }>(`/api/recipes/${recipeId}/view`, { method: 'POST' }),
  getComments: (recipeId: string) =>
    request<RecipeComment[]>(`/api/recipes/${recipeId}/comments`),
  addComment: (recipeId: string, text: string, user_name: string) =>
    request<RecipeComment>(`/api/recipes/${recipeId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, user_name }),
    }),
  getSavedMeals: () => request<SavedAIMeal[]>('/api/meals'),
  saveMealToDb: (meal: Omit<SavedAIMeal, 'meal_id' | 'user_id' | 'saved_at'>) =>
    request<SavedAIMeal>('/api/meals', { method: 'POST', body: JSON.stringify(meal) }),
  deleteSavedMeal: (meal_id: string) =>
    request<{ ok: true }>('/api/meals', { method: 'DELETE', body: JSON.stringify({ meal_id }) }),
};
