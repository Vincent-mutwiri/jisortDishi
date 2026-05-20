import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import { verifyResetToken, deleteResetToken, hashPassword } from '@/src/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Verify reset token
    const email = await verifyResetToken(db, token);
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    // Find user by email
    const user = await db.collection('users').findOne({ 
      email, 
      auth_method: 'email' 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await db.collection('users').updateOne(
      { user_id: user.user_id },
      { 
        $set: { 
          password: hashedPassword,
          updated_at: new Date()
        }
      }
    );

    // Delete the reset token
    await deleteResetToken(db, token);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
