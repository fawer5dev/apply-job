'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const t = useTranslations('Login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setRequiresVerification(false);
    setResendSuccess(false);

    try {
      const result = await login(email, password);

      if (result.success) {
        if (result.requires2FA && result.tempToken) {
          setRequires2FA(true);
          setTempToken(result.tempToken);
        } else {
          router.push(redirectTo);
        }
      } else {
        setError(result.error || t('loginFailed'));
        if (
          result.error?.includes('verify your email') ||
          result.error?.includes('verification')
        ) {
          setRequiresVerification(true);
        }
      }
    } catch (err) {
      setError(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          code: twoFactorCode,
          useBackupCode: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(redirectTo);
      } else {
        setError(data.error || t('twoFAFailed'));
      }
    } catch (err) {
      setError(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError(t('enterEmailFirst'));
      return;
    }

    setResendingEmail(true);
    setError(null);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setError(null);
      } else {
        setError(data.error || t('resendFailed'));
      }
    } catch (err) {
      setError(t('unexpectedError'));
    } finally {
      setResendingEmail(false);
    }
  };

  if (requires2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>{t('twoFactorTitle')}</CardTitle>
            <CardDescription>{t('twoFactorDescription')}</CardDescription>
          </CardHeader>
          <form onSubmit={handle2FASubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="twoFactorCode">
                  {t('authenticationCode')}
                </Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  autoFocus
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {t('backupCodeHint')}{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setError('Please use a backup code instead')}
                >
                  {t('useBackupCode')}
                </button>
              </p>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('verifying') : t('verify')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setRequires2FA(false);
                  setTempToken(null);
                  setTwoFactorCode('');
                }}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {t('backToLogin')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>{t('welcomeBack')}</CardTitle>
          <CardDescription>{t('signInToContinue')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {requiresVerification && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="w-full"
                      >
                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                        {resendingEmail
                          ? t('sending')
                          : t('resendVerification')}
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert variant="success">
                <AlertDescription>
                  {t('verificationSent')}
                </AlertDescription>
              </Alert>
            )}

            {searchParams.get('verified') === 'true' && (
              <Alert variant="success">
                <AlertDescription>{t('emailVerified')}</AlertDescription>
              </Alert>
            )}

            {searchParams.get('reset') === 'true' && (
              <Alert variant="success">
                <AlertDescription>{t('passwordReset')}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('signingIn') : t('signIn')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
