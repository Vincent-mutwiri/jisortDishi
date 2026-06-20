import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import type { Recipe, RecipeIngredient, RecipeStep, CreateRecipeRequest } from '@/src/types';

type RecipeDocument = Omit<Recipe, 'created_at' | 'updated_at'> & {
  created_at: Date;
  updated_at: Date;
};

function serializeRecipe(recipe: RecipeDocument): Recipe {
  return {
    ...recipe,
    likes: recipe.likes ?? 0,
    views: recipe.views ?? 0,
    comments_count: recipe.comments_count ?? 0,
    liked_by: recipe.liked_by ?? [],
    created_at: recipe.created_at.toISOString(),
    updated_at: recipe.updated_at.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const userId = request.headers.get('x-user-id');
    
    let filter: { is_public: boolean } | { $or: ({ is_public: boolean } | { created_by: string })[] } = { is_public: true };
    
    // If user is authenticated, include their private recipes
    if (userId) {
      filter = {
        $or: [
          { is_public: true },
          { created_by: userId }
        ]
      };
    }

    const recipes = await db
      .collection<RecipeDocument>('recipes')
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json(recipes.map(serializeRecipe));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load recipes' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) throw new Error('Missing user session');

    const body: CreateRecipeRequest = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'cuisine', 'category', 'prep_time_minutes', 'cook_time_minutes', 'servings', 'difficulty'];
    for (const field of requiredFields) {
      if (!body[field as keyof CreateRecipeRequest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(body.difficulty)) {
      throw new Error('Difficulty must be easy, medium, or hard');
    }

    // Process ingredients and steps
    const ingredients: RecipeIngredient[] = body.ingredients.map((ing) => ({
      name: ing.name || '',
      quantity: ing.quantity,
      unit: ing.unit,
      notes: ing.notes,
      ...(ing.costPerUnit != null ? { costPerUnit: ing.costPerUnit } : {}),
    }));

    const steps: RecipeStep[] = body.steps.map((step, index) => ({
      step_number: index + 1,
      instruction: step.instruction,
      duration_minutes: step.duration_minutes,
    }));

    // Estimate cost from ingredient pricing if provided, otherwise 0
    const estimatedCost = ingredients.reduce((total, ing) => {
      if (ing.costPerUnit != null) return total + ing.costPerUnit * ing.quantity;
      return total;
    }, 0);

    const now = new Date();
    const recipe: RecipeDocument = {
      recipe_id: crypto.randomUUID(),
      title: body.title,
      description: body.description,
      cuisine: body.cuisine,
      category: body.category,
      prep_time_minutes: body.prep_time_minutes,
      cook_time_minutes: body.cook_time_minutes,
      servings: body.servings,
      difficulty: body.difficulty,
      ingredients,
      steps,
      tags: body.tags || [],
      dietary_tags: body.dietary_tags || [],
      tips: body.tips || [],
      estimated_cost: estimatedCost,
      created_by: userId,
      is_public: body.is_public,
      image_url: null,
      likes: 0,
      views: 0,
      comments_count: 0,
      liked_by: [],
      created_at: now,
      updated_at: now,
    };

    const db = await getDb();
    await db.collection<RecipeDocument>('recipes').insertOne(recipe);

    return NextResponse.json(serializeRecipe(recipe));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save recipe' }, { status: 400 });
  }
}
