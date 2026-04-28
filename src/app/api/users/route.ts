import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import type { UserProfile } from '@/src/types';

type UserDocument = Omit<UserProfile, 'created_at'> & {
  created_at: Date | string;
  updated_at?: Date;
};

function requireUserId(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new Error('Missing user session');
  }
  return userId;
}

function serializeUser(user: UserDocument | null): UserProfile {
  if (!user) throw new Error('User not found');

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    dietary_preferences: user.dietary_preferences || [],
    budget_preference: user.budget_preference || 1000,
    currency: user.currency || 'KES',
    created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const db = await getDb();
    const user = await db.collection<UserDocument>('users').findOne({ user_id: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(serializeUser(user));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load user' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id || crypto.randomUUID();
    const now = new Date();
    const db = await getDb();

    const profile = {
      user_id: userId,
      name: body.name || 'Demo User',
      email: body.email || `demo-${userId.slice(0, 8)}@jisort.local`,
      dietary_preferences: body.dietary_preferences || [],
      budget_preference: Number(body.budget_preference || 1000),
      currency: body.currency || 'KES',
      created_at: now,
      updated_at: now,
    };

    await db.collection<UserDocument>('users').updateOne(
      { user_id: userId },
      { $setOnInsert: profile, $set: { updated_at: now } },
      { upsert: true },
    );

    const user = await db.collection<UserDocument>('users').findOne({ user_id: userId });
    return NextResponse.json(serializeUser(user));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save user' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const db = await getDb();

    await db.collection<UserDocument>('users').updateOne(
      { user_id: userId },
      {
        $set: {
          name: body.name,
          budget_preference: Number(body.budget_preference),
          dietary_preferences: body.dietary_preferences || [],
          currency: body.currency || 'KES',
          updated_at: new Date(),
        },
      },
    );

    const user = await db.collection<UserDocument>('users').findOne({ user_id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(serializeUser(user));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update user' }, { status: 400 });
  }
}
