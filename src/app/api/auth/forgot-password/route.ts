import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';
import { createPasswordResetToken, cleanupExpiredTokens } from '@/src/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Clean up expired tokens first
    await cleanupExpiredTokens(db);
    
    // Check if user exists
    const user = await db.collection('users').findOne({ 
      email, 
      auth_method: 'email' 
    });

    if (!user) {
      // For security, always return success even if user doesn't exist
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken(db, email);
    
    // In a real implementation, you would send an email here with the reset link
    // For now, we'll just return success (frontend can handle the email sending)
    console.log('Password reset token generated:', resetToken);
    console.log('Reset link would be:', `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      // For development/testing, you might want to include the token
      // token: resetToken,
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again.' },
      { status: 500 }
    );
  }
}
