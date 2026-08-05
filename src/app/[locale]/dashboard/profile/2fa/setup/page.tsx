'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  Shield,
  Loader2,
  CheckCircle,
  Download,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import DashboardBackBar from '@/components/DashboardBackBar';

export default function TwoFactorSetupPage() {
  const t = useTranslations('Profile.setup');
  const router = useRouter();
  const { refreshSession } = useAuth();

  const [step, setStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    startSetup();
  }, []);

  const startSetup = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start 2FA setup');
      }

      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error'));
      }

      if (data.backupCodes) {
        setBackupCodes(data.backupCodes);
      }
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setVerifying(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `Apply Job - 2FA Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apply-job-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <DashboardBackBar label={t('done')} />

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12">
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t('subtitle')}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-8">
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('step1')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('step1Desc')}
                  </p>
                  <div className="flex flex-col items-center justify-center gap-6 py-4 sm:flex-row">
                    <div className="rounded-lg border p-2">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="h-48 w-48"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">
                          Manual Entry Key
                        </p>
                        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                          <code className="text-xs">{secret}</code>
                          <button
                            onClick={copySecret}
                            className="text-muted-foreground hover:text-primary"
                            title="Copy Secret"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('step2')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('step2Desc')}
                  </p>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(
                            e.target.value.replace(/\D/g, '').slice(0, 6)
                          )
                        }
                        placeholder={t('placeholder')}
                        className="w-full rounded-md border border-input bg-background px-4 py-2 text-center font-mono text-2xl tracking-[0.5em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={verifying || verificationCode.length !== 6}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('verifying')}
                        </>
                      ) : (
                        t('verify')
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-emerald-500/10 p-3">
                    <CheckCircle className="h-12 w-12 text-emerald-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">{t('success')}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-medium">
                      {t('backupCodes')}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('backupCodesDesc')}
                  </p>
                  <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-6 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span>{code}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={downloadBackupCodes}
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Download className="h-4 w-4" />
                      {t('download')}
                    </button>
                    <button
                      onClick={async () => {
                        await refreshSession();
                        router.push('/dashboard/profile');
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {t('done')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
