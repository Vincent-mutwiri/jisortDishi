import type { PantryItem, Recipe, UserProfile } from '../types';
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
  addPantryItem: (item: { name: string; quantity: number; unit: string; expiry?: string }) => request<PantryItem>('/api/pantry', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  deletePantryItem: (itemId: string) => request<{ ok: true }>(`/api/pantry/${itemId}`, {
    method: 'DELETE',
  }),
  getRecipes: () => request<Recipe[]>('/api/recipes'),
  addRecipe: (recipe: {
    title: string;
    description: string;
    ingredients: string;
    steps: string;
    cost: number;
    time: number;
    isPublic: boolean;
  }) => request<Recipe>('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  }),
  getSuggestions: (payload: {
    budget: number;
    items: string[];
    preferences: string[];
    currency: string;
  }) => request<GeminiMealSuggestion[]>('/api/suggestions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};
