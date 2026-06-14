'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { GeminiMealSuggestion } from '../lib/gemini';

export interface SavedMeal extends GeminiMealSuggestion {
  id: string;
  savedAt: string;
  budget: number;
  currency: string;
}

interface SavedMealsContextValue {
  savedMeals: SavedMeal[];
  suggestions: GeminiMealSuggestion[];
  budget: number | null;
  setSuggestions: (meals: GeminiMealSuggestion[], budget: number, currency: string) => void;
  saveMeal: (meal: GeminiMealSuggestion, budget: number, currency: string) => void;
  unsaveMeal: (id: string) => void;
  isSaved: (title: string) => boolean;
}

const SavedMealsContext = createContext<SavedMealsContextValue>({
  savedMeals: [],
  suggestions: [],
  budget: null,
  setSuggestions: () => {},
  saveMeal: () => {},
  unsaveMeal: () => {},
  isSaved: () => false,
});

export function useSavedMeals() {
  return useContext(SavedMealsContext);
}

const SAVED_KEY = 'jisort_saved_meals';
const SUGGESTIONS_KEY = 'jisort_last_suggestions';

export function SavedMealsProvider({ children }: { children: ReactNode }) {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [suggestions, setSuggestionsState] = useState<GeminiMealSuggestion[]>([]);
  const [budget, setBudgetState] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSavedMeals(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem(SUGGESTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSuggestionsState(parsed.meals || []);
        if (parsed.budget) setBudgetState(parsed.budget);
      }
    } catch {}
  }, []);

  const setSuggestions = useCallback((meals: GeminiMealSuggestion[], budgetAmt: number, currency: string) => {
    setSuggestionsState(meals);
    setBudgetState(budgetAmt);
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify({ meals, budget: budgetAmt, currency, generatedAt: new Date().toISOString() }));
  }, []);

  const saveMeal = useCallback((meal: GeminiMealSuggestion, budget: number, currency: string) => {
    setSavedMeals(prev => {
      if (prev.some(m => m.title === meal.title)) return prev;
      const saved: SavedMeal = {
        ...meal,
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        budget,
        currency,
      };
      const updated = [saved, ...prev];
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unsaveMeal = useCallback((id: string) => {
    setSavedMeals(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isSaved = useCallback((title: string) => {
    return savedMeals.some(m => m.title === title);
  }, [savedMeals]);

  return (
    <SavedMealsContext.Provider value={{ savedMeals, suggestions, budget, setSuggestions, saveMeal, unsaveMeal, isSaved }}>
      {children}
    </SavedMealsContext.Provider>
  );
}
