import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import { hashPassword } from '@/src/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('Registration request received');
    
    const { name, email, password } = await request.json();
    console.log('Request data:', { name, email, password: '***' });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    const db = await getDb();
    console.log('Database connected');
    
    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed');

    // Create user
    const userId = crypto.randomUUID();
    const user = {
      user_id: userId,
      name,
      email,
      password: hashedPassword,
      auth_method: 'email',
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log('Creating user...');
    await db.collection('users').insertOne(user);
    console.log('User created');

    // Create user profile
    const profile = {
      user_id: userId,
      name,
      email,
      dietary_preferences: [],
      budget_preference: 1000,
      currency: 'KES',
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log('Creating profile...');
    await db.collection('profiles').insertOne(profile);
    console.log('Profile created');

    return NextResponse.json({
      success: true,
      user: {
        user_id: userId,
        name,
        email,
        auth_method: 'email',
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
