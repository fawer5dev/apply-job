import { TOTP, Secret } from 'otpauth';
import { randomBytes } from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate TOTP secret and QR code for user
 */
export async function generateTOTPSecret(userEmail: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  // Generate secret
  const secret = new Secret({ size: 20 });

  // Create TOTP instance
  const totp = new TOTP({
    issuer: 'Apply Job',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  // Generate QR code
  const otpauthUrl = totp.toString();
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  // Generate 10 backup codes (8 chars each)
  const backupCodes = Array.from({ length: 10 }, () =>
    randomBytes(4).toString('hex').toUpperCase()
  );

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verify TOTP code
 */
export function verifyTOTP(secret: string, token: string): boolean {
  try {
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Allow 1 period before/after for clock skew (±30 seconds)
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
}

/**
 * Verify backup code
 */
export function verifyBackupCode(
  storedCodes: string[],
  providedCode: string
): { valid: boolean; remainingCodes?: string[] } {
  const normalizedProvided = providedCode.toUpperCase().replace(/\s/g, '');
  const index = storedCodes.indexOf(normalizedProvided);

  if (index === -1) {
    return { valid: false };
  }

  // Remove used code
  const remainingCodes = storedCodes.filter((_, i) => i !== index);
  return { valid: true, remainingCodes };
}

/**
 * Generate new backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(4).toString('hex').toUpperCase()
  );
}

/**
 * Format backup code for display (e.g., "1A2B-3C4D")
 */
export function formatBackupCode(code: string): string {
  if (code.length !== 8) return code;
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Validate TOTP token format
 */
export function isValidTOTPToken(token: string): boolean {
  // TOTP tokens should be 6 digits
  return /^\d{6}$/.test(token);
}

/**
 * Generate current TOTP code (for testing/demo)
 */
export function getCurrentTOTPCode(secret: string): string {
  const totp = new TOTP({
    secret: Secret.fromBase32(secret),
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  return totp.generate();
}
