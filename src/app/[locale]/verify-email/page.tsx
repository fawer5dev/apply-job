'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No verification token provided');
      setLoading(false);
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setError(data.error || 'Email verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Mail className="h-5 w-5 text-blue-700" />
          </div>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {loading
              ? 'Verifying your email address...'
              : success
                ? 'Your email has been verified!'
                : 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
            </div>
          )}

          {success && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle className="break-words">Success!</AlertTitle>
              <AlertDescription className="break-words">
                Your email has been verified successfully. You will be
                redirected to the login page in a few seconds...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle className="break-words">Verification Failed</AlertTitle>
                <AlertDescription className="break-words">{error}</AlertDescription>
              </Alert>
              <div className="space-y-2 break-words text-sm text-gray-500">
                <p>Common reasons for verification failure:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>The verification link has expired (valid for 24 hours)</li>
                  <li>The link has already been used</li>
                  <li>The link is invalid or corrupted</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          {success ? (
            <Button
              className="w-full"
              onClick={() => router.push('/login?verified=true')}
            >
              Go to Login
            </Button>
          ) : (
            <>
              {error && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/register')}
                >
                  Request New Verification Link
                </Button>
              )}
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
