import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const recipeId = params.id;
    const db = await getDb();
    const col = db.collection('recipes');

    const recipe = await col.findOne({ recipe_id: recipeId });
    if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

    const likedBy: string[] = recipe.liked_by || [];
    const alreadyLiked = likedBy.includes(userId);

    if (alreadyLiked) {
      const newLikedBy = likedBy.filter((id: string) => id !== userId);
      const newLikes = Math.max(0, (recipe.likes || 1) - 1);
      await col.updateOne({ recipe_id: recipeId }, { $set: { liked_by: newLikedBy, likes: newLikes } });
      return NextResponse.json({ liked: false, likes: newLikes });
    } else {
      const newLikedBy = [...likedBy, userId];
      const newLikes = (recipe.likes || 0) + 1;
      await col.updateOne({ recipe_id: recipeId }, { $set: { liked_by: newLikedBy, likes: newLikes } });
      return NextResponse.json({ liked: true, likes: newLikes });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
