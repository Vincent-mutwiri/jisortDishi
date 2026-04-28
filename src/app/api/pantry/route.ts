import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import type { PantryItem } from '@/src/types';

type PantryItemDocument = Omit<PantryItem, 'date_added' | 'expiry_date'> & {
  expiry_date?: string | null;
  date_added: Date | string;
};

type StorageDocument = {
  storage_id: string;
  user_id: string;
  type: 'fridge' | 'pantry' | 'store';
  name: string;
  created_at: Date;
};

function requireUserId(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) throw new Error('Missing user session');
  return userId;
}

function serializeItem(item: PantryItemDocument): PantryItem {
  return {
    item_id: item.item_id,
    storage_id: item.storage_id,
    user_id: item.user_id,
    item_name: item.item_name,
    quantity: item.quantity,
    unit: item.unit,
    expiry_date: item.expiry_date || undefined,
    date_added: item.date_added instanceof Date ? item.date_added.toISOString() : item.date_added,
  };
}

async function ensureDefaultStorage(userId: string) {
  const db = await getDb();
  let storage = await db.collection<StorageDocument>('storage').findOne({ user_id: userId, name: 'Main Storage' });

  if (!storage) {
    const storageId = crypto.randomUUID();
    const newStorage: StorageDocument = {
      storage_id: storageId,
      user_id: userId,
      type: 'fridge',
      name: 'Main Storage',
      created_at: new Date(),
    };
    await db.collection<StorageDocument>('storage').insertOne(newStorage);
    return storageId;
  }

  return storage.storage_id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const db = await getDb();
    await ensureDefaultStorage(userId);

    const items = await db
      .collection<PantryItemDocument>('pantry_items')
      .find({ user_id: userId })
      .sort({ date_added: -1 })
      .toArray();

    return NextResponse.json(items.map(serializeItem));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load pantry' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const db = await getDb();
    const storageId = await ensureDefaultStorage(userId);
    const now = new Date();

    const item = {
      item_id: crypto.randomUUID(),
      user_id: userId,
      storage_id: storageId,
      item_name: body.name,
      quantity: Number(body.quantity || 1),
      unit: body.unit || 'pcs',
      expiry_date: body.expiry || null,
      date_added: now,
    };

    await db.collection<PantryItemDocument>('pantry_items').insertOne(item);
    return NextResponse.json(serializeItem(item));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to add pantry item' }, { status: 400 });
  }
}
