import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import {
  sendEmail,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from '@/lib/email/sender';

const VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Send verification email to new user
 */
export async function sendVerificationEmail(
  userId: string,
  email: string,
  name?: string
): Promise<void> {
  // Generate secure token
  const tokenBytes = randomBytes(32);
  const token = tokenBytes.toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Delete existing verification tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type: 'EMAIL_VERIFY',
    },
  });

  // Create verification token
  await prisma.verificationToken.create({
    data: {
      userId,
      email,
      token: tokenHash,
      type: 'EMAIL_VERIFY',
      expires: new Date(Date.now() + VERIFICATION_EXPIRY),
    },
  });

  // Send email
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your email - Apply Job',
    html: getVerificationEmailTemplate(name || email, verifyUrl),
  });
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const verifyToken = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!verifyToken || verifyToken.type !== 'EMAIL_VERIFY') {
    return { valid: false, error: 'Invalid verification token' };
  }

  if (verifyToken.usedAt) {
    return { valid: false, error: 'Token already used' };
  }

  if (verifyToken.expires < new Date()) {
    return { valid: false, error: 'Token expired' };
  }

  // Mark token as used
  await prisma.verificationToken.update({
    where: { id: verifyToken.id },
    data: { usedAt: new Date() },
  });

  // Verify user email and activate account
  if (verifyToken.userId) {
    await prisma.user.update({
      where: { id: verifyToken.userId },
      data: {
        emailVerified: new Date(),
        isActive: true,
      },
    });

    return { valid: true, userId: verifyToken.userId };
  }

  return { valid: false, error: 'User not found' };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<boolean> {
  // Find user by email (case-insensitive)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true },
  });

  // Always return true (don't reveal if email exists)
  if (!user) {
    return true;
  }

  // Generate secure token
  const tokenBytes = randomBytes(32);
  const token = tokenBytes.toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Delete existing password reset tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      userId: user.id,
      type: 'PASSWORD_RESET',
    },
  });

  // Create password reset token
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      email,
      token: tokenHash,
      type: 'PASSWORD_RESET',
      expires: new Date(Date.now() + PASSWORD_RESET_EXPIRY),
    },
  });

  // Send email
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your password - Apply Job',
    html: getPasswordResetEmailTemplate(user.name || email, resetUrl),
  });

  return true;
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
  error?: string;
}> {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const resetToken = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!resetToken || resetToken.type !== 'PASSWORD_RESET') {
    return { valid: false, error: 'Invalid password reset token' };
  }

  if (resetToken.usedAt) {
    return { valid: false, error: 'Token already used' };
  }

  if (resetToken.expires < new Date()) {
    return { valid: false, error: 'Token expired' };
  }

  return {
    valid: true,
    userId: resetToken.userId || undefined,
    email: resetToken.email || undefined,
  };
}

/**
 * Mark password reset token as used
 */
export async function markPasswordResetTokenUsed(token: string): Promise<void> {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  await prisma.verificationToken.updateMany({
    where: { token: tokenHash },
    data: { usedAt: new Date() },
  });
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.verificationToken.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });

  return result.count;
}
