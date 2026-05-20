import bcrypt from 'bcryptjs';
import { Db } from 'mongodb';

export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    throw new Error('Failed to verify password');
  }
}

// Password reset utilities
export function generateResetToken(): string {
  return crypto.randomUUID();
}

export function getTokenExpiration(hours: number = 1): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

export async function createPasswordResetToken(db: Db, email: string): Promise<string> {
  const token = generateResetToken();
  const expiresAt = getTokenExpiration(1); // 1 hour expiration
  
  // Clean up any existing tokens for this email
  await db.collection('password_resets').deleteMany({ email });
  
  // Create new reset token
  await db.collection('password_resets').insertOne({
    token,
    email,
    expires_at: expiresAt,
    created_at: new Date(),
  });
  
  return token;
}

export async function verifyResetToken(db: Db, token: string): Promise<string | null> {
  const resetRecord = await db.collection('password_resets').findOne({
    token,
    expires_at: { $gt: new Date() }, // Token not expired
  });
  
  if (!resetRecord) {
    return null;
  }
  
  return resetRecord.email;
}

export async function cleanupExpiredTokens(db: Db): Promise<void> {
  await db.collection('password_resets').deleteMany({
    expires_at: { $lt: new Date() }, // Remove expired tokens
  });
}

export async function deleteResetToken(db: Db, token: string): Promise<void> {
  await db.collection('password_resets').deleteOne({ token });
}
