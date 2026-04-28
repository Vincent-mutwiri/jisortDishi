import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import type { Recipe, Ingredient } from '@/src/types';

type RecipeDocument = Omit<Recipe, 'created_at'> & {
  image_url?: string | null;
  created_at: Date | string;
  updated_at?: Date;
};

function serializeRecipe(recipe: RecipeDocument): Recipe {
  return {
    recipe_id: recipe.recipe_id,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    estimated_cost: recipe.estimated_cost,
    preparation_time: recipe.preparation_time,
    created_by: recipe.created_by,
    price: recipe.price,
    is_public: recipe.is_public,
    image_url: recipe.image_url,
    created_at: recipe.created_at instanceof Date ? recipe.created_at.toISOString() : recipe.created_at,
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const recipes = await db
      .collection<RecipeDocument>('recipes')
      .find({ is_public: true })
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

    const body = await request.json();
    const now = new Date();
    const recipe = {
      recipe_id: crypto.randomUUID(),
      title: body.title,
      description: body.description,
      ingredients: String(body.ingredients || '')
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name): Ingredient => ({ name, amount: '' })),
      steps: String(body.steps || '').split('\n').map((step) => step.trim()).filter(Boolean),
      estimated_cost: Number(body.cost || 0),
      preparation_time: Number(body.time || 0),
      created_by: userId,
      is_public: body.isPublic !== false,
      image_url: body.imageUrl || null,
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
