import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    await db.collection('recipes').updateOne(
      { recipe_id: params.id },
      { $inc: { views: 1 } }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
