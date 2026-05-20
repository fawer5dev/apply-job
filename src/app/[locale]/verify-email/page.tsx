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
        // Redirect to login after 3 seconds
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {success && (
            <Alert variant="success">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your email has been verified successfully. You will be
                redirected to the login page in a few seconds...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <>
              <Alert variant="destructive">
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-muted-foreground">
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
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Back to Login
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
