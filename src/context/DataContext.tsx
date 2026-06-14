'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { cachedFetch, invalidateCache, generateCacheKey } from '../lib/requestCache';
import { api } from '../lib/api';
import type { PantryItem, UserProfile, Recipe, SavedAIMeal } from '../types';

interface DataContextValue {
  // Data
  profile: UserProfile | null;
  pantry: PantryItem[];
  recipes: Recipe[];
  savedMeals: SavedAIMeal[];
  
  // Loading states
  isLoadingProfile: boolean;
  isLoadingPantry: boolean;
  isLoadingRecipes: boolean;
  isLoadingSavedMeals: boolean;
  
  // Error states
  profileError: Error | null;
  pantryError: Error | null;
  recipesError: Error | null;
  savedMealsError: Error | null;
  
  // Actions
  refreshProfile: () => Promise<void>;
  refreshPantry: () => Promise<void>;
  refreshRecipes: () => Promise<void>;
  refreshSavedMeals: () => Promise<void>;
  
  // Mutations with optimistic updates
  addPantryItem: (item: { name: string; quantity: number; unit: string; expiry?: string; storage_type: 'fridge' | 'pantry' }) => Promise<void>;
  deletePantryItem: (id: string) => Promise<void>;
  saveMeal: (meal: Omit<SavedAIMeal, 'meal_id' | 'user_id' | 'saved_at'>) => Promise<void>;
  unsaveMeal: (id: string) => Promise<void>;
  
  // Cache management
  invalidate: (pattern?: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

// Stale times for different data types
const STALE_TIMES = {
  profile: 5 * 60 * 1000,      // 5 minutes
  pantry: 2 * 60 * 1000,       // 2 minutes (changes often)
  recipes: 10 * 60 * 1000,     // 10 minutes
  savedMeals: 5 * 60 * 1000,   // 5 minutes
};

export function DataProvider({ children }: { children: ReactNode }) {
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedAIMeal[]>([]);
  
  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPantry, setIsLoadingPantry] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isLoadingSavedMeals, setIsLoadingSavedMeals] = useState(false);
  
  // Error states
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [pantryError, setPantryError] = useState<Error | null>(null);
  const [recipesError, setRecipesError] = useState<Error | null>(null);
  const [savedMealsError, setSavedMealsError] = useState<Error | null>(null);

  // Fetch functions with caching
  const refreshProfile = useCallback(async (force = false) => {
    setIsLoadingProfile(true);
    setProfileError(null);
    
    try {
      const key = generateCacheKey('/api/users/profile');
      const data = await cachedFetch(
        key,
        () => api.getProfile(),
        { staleTime: STALE_TIMES.profile, backgroundRefresh: !force }
      );
      setProfile(data);
    } catch (err) {
      setProfileError(err as Error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const refreshPantry = useCallback(async (force = false) => {
    setIsLoadingPantry(true);
    setPantryError(null);
    
    try {
      const key = generateCacheKey('/api/pantry');
      const data = await cachedFetch(
        key,
        () => api.getPantry(),
        { staleTime: STALE_TIMES.pantry, backgroundRefresh: !force }
      );
      setPantry(data);
    } catch (err) {
      setPantryError(err as Error);
    } finally {
      setIsLoadingPantry(false);
    }
  }, []);

  const refreshRecipes = useCallback(async (force = false) => {
    setIsLoadingRecipes(true);
    setRecipesError(null);
    
    try {
      const key = generateCacheKey('/api/recipes');
      const data = await cachedFetch(
        key,
        () => api.getRecipes(),
        { staleTime: STALE_TIMES.recipes, backgroundRefresh: !force }
      );
      setRecipes(data);
    } catch (err) {
      setRecipesError(err as Error);
    } finally {
      setIsLoadingRecipes(false);
    }
  }, []);

  const refreshSavedMeals = useCallback(async (force = false) => {
    setIsLoadingSavedMeals(true);
    setSavedMealsError(null);
    
    try {
      const key = generateCacheKey('/api/meals');
      const data = await cachedFetch(
        key,
        () => api.getSavedMeals(),
        { staleTime: STALE_TIMES.savedMeals, backgroundRefresh: !force }
      );
      setSavedMeals(data);
    } catch (err) {
      setSavedMealsError(err as Error);
    } finally {
      setIsLoadingSavedMeals(false);
    }
  }, []);

  // Optimistic mutations
  const addPantryItem = useCallback(async (item) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { 
      ...item, 
      item_id: tempId,
      user_id: profile?.user_id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as PantryItem;
    
    setPantry(prev => [...prev, optimisticItem]);
    
    try {
      const result = await api.addPantryItem(item);
      // Replace temp item with real one
      setPantry(prev => prev.map(p => p.item_id === tempId ? result : p));
      // Invalidate cache
      invalidateCache('/api/pantry');
    } catch (err) {
      // Rollback on error
      setPantry(prev => prev.filter(p => p.item_id !== tempId));
      throw err;
    }
  }, [profile]);

  const deletePantryItem = useCallback(async (id: string) => {
    // Store original for rollback
    const original = pantry.find(p => p.item_id === id);
    if (!original) return;
    
    // Optimistic update
    setPantry(prev => prev.filter(p => p.item_id !== id));
    
    try {
      await api.deletePantryItem(id);
      invalidateCache('/api/pantry');
    } catch (err) {
      // Rollback
      setPantry(prev => [...prev, original]);
      throw err;
    }
  }, [pantry]);

  const saveMeal = useCallback(async (meal: Omit<SavedAIMeal, 'meal_id' | 'user_id' | 'saved_at'>) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMeal: SavedAIMeal = {
      ...(meal as SavedAIMeal),
      meal_id: tempId,
      user_id: profile?.user_id || '',
      saved_at: new Date().toISOString(),
    };
    
    setSavedMeals(prev => [optimisticMeal, ...prev]);
    
    try {
      const result = await api.saveMealToDb(meal);
      // Replace temp with real
      setSavedMeals(prev => prev.map(m => m.meal_id === tempId ? result : m));
      invalidateCache('/api/meals');
    } catch (err) {
      // Rollback
      setSavedMeals(prev => prev.filter(m => m.meal_id !== tempId));
      throw err;
    }
  }, [profile]);

  const unsaveMeal = useCallback(async (id: string) => {
    // Store original for rollback
    const original = savedMeals.find(m => m.meal_id === id);
    if (!original) return;
    
    // Optimistic update
    setSavedMeals(prev => prev.filter(m => m.meal_id !== id));
    
    try {
      await api.deleteSavedMeal(id);
      invalidateCache('/api/meals');
    } catch (err) {
      // Rollback
      setSavedMeals(prev => [original, ...prev]);
      throw err;
    }
  }, [savedMeals]);

  const invalidate = useCallback((pattern?: string) => {
    invalidateCache(pattern);
  }, []);

  // Initial load
  useEffect(() => {
    refreshProfile();
    refreshPantry();
    refreshRecipes();
    refreshSavedMeals();
  }, []);

  const value: DataContextValue = {
    profile,
    pantry,
    recipes,
    savedMeals,
    isLoadingProfile,
    isLoadingPantry,
    isLoadingRecipes,
    isLoadingSavedMeals,
    profileError,
    pantryError,
    recipesError,
    savedMealsError,
    refreshProfile,
    refreshPantry,
    refreshRecipes,
    refreshSavedMeals,
    addPantryItem,
    deletePantryItem,
    saveMeal,
    unsaveMeal,
    invalidate,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
