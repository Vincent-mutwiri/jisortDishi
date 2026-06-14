import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import type { RecipeComment } from '@/src/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const comments = await db
      .collection<RecipeComment>('recipe_comments')
      .find({ recipe_id: params.id })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json(comments.map(c => ({
      ...c,
      _id: undefined,
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, user_name } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Comment text required' }, { status: 400 });

    const db = await getDb();

    const comment: RecipeComment = {
      comment_id: crypto.randomUUID(),
      recipe_id: params.id,
      user_id: userId,
      user_name: user_name || 'Anonymous',
      text: text.trim(),
      created_at: new Date().toISOString(),
    };

    await db.collection('recipe_comments').insertOne(comment);

    // Increment comments_count on the recipe
    await db.collection('recipes').updateOne(
      { recipe_id: params.id },
      { $inc: { comments_count: 1 } }
    );

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
