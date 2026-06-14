import { useState, useCallback } from 'react';
import type { CreateRecipeRequest, RecipeIngredient, RecipeStep } from '../types';

export const useRecipeForm = (initialState?: Partial<CreateRecipeRequest>) => {
  const [recipe, setRecipe] = useState<CreateRecipeRequest>({
    title: '',
    description: '',
    cuisine: '',
    category: '',
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    servings: 1,
    difficulty: 'medium',
    ingredients: [],
    steps: [],
    tags: [],
    dietary_tags: [],
    tips: [],
    is_public: true,
    ...initialState
  });

  // Core update function - optimized and stable
  const updateRecipe = useCallback(<K extends keyof CreateRecipeRequest>(field: K, value: CreateRecipeRequest[K]) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  }, []);

  // Ingredient management
  const addIngredient = useCallback(() => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: 1, unit: 'cups', notes: '', costPerUnit: undefined }]
    }));
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof RecipeIngredient, value: string | number | undefined) => {
    setRecipe(prev => {
      const updated = [...prev.ingredients];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ingredients: updated };
    });
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  }, []);

  // Step management
  const addStep = useCallback(() => {
    setRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, { instruction: '', duration_minutes: undefined }]
    }));
  }, []);

  const updateStep = useCallback((index: number, field: keyof Omit<RecipeStep, 'step_number'>, value: string | number | undefined) => {
    setRecipe(prev => {
      const updated = [...prev.steps];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, steps: updated };
    });
  }, []);

  const removeStep = useCallback((index: number) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  }, []);

  // Tag management
  const addTag = useCallback((tag: string) => {
    setRecipe(prev => {
      if (tag && !prev.tags.includes(tag.trim())) {
        return { ...prev, tags: [...prev.tags, tag.trim()] };
      }
      return prev;
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setRecipe(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  }, []);

  // Reset function
  const resetForm = useCallback(() => {
    setRecipe({
      title: '',
      description: '',
      cuisine: '',
      category: '',
      prep_time_minutes: 0,
      cook_time_minutes: 0,
      servings: 1,
      difficulty: 'medium',
      ingredients: [],
      steps: [],
      tags: [],
      dietary_tags: [],
      tips: [],
      is_public: true
    });
  }, []);

  return {
    recipe,
    updateRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addStep,
    updateStep,
    removeStep,
    addTag,
    removeTag,
    resetForm
  };
};
