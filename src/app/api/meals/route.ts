import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import type { SavedAIMeal } from '@/src/types';

function requireUserId(req: NextRequest): string {
  const id = req.headers.get('x-user-id');
  if (!id) throw new Error('Unauthorized');
  return id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const db = await getDb();
    const meals = await db
      .collection<SavedAIMeal>('saved_ai_meals')
      .find({ user_id: userId })
      .sort({ saved_at: -1 })
      .toArray();

    return NextResponse.json(meals.map(m => ({ ...m, _id: undefined })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const db = await getDb();

    // Check for duplicate (same title for same user)
    const existing = await db.collection('saved_ai_meals').findOne({ user_id: userId, title: body.title });
    if (existing) {
      return NextResponse.json({ error: 'Already saved' }, { status: 409 });
    }

    const meal: SavedAIMeal = {
      meal_id: crypto.randomUUID(),
      user_id: userId,
      title: body.title,
      description: body.description,
      suggested_ingredients: body.suggested_ingredients || [],
      steps: body.steps || [],
      estimated_total_cost: body.estimated_total_cost || 0,
      prep_time_mins: body.prep_time_mins || 0,
      nutritional_info: body.nutritional_info || '',
      budget: body.budget || 0,
      currency: body.currency || 'KES',
      saved_at: new Date().toISOString(),
    };

    await db.collection('saved_ai_meals').insertOne(meal);
    return NextResponse.json(meal);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const { meal_id } = await request.json();
    const db = await getDb();

    await db.collection('saved_ai_meals').deleteOne({ meal_id, user_id: userId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 400 });
  }
}
