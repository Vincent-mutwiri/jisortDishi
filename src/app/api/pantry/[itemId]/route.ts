import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) throw new Error('Missing user session');

    const { itemId } = await params;
    const db = await getDb();
    await db.collection('pantry_items').deleteOne({ user_id: userId, item_id: itemId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete pantry item' }, { status: 400 });
  }
}
