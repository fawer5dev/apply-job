'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { 
  Shield, 
  Loader2, 
  ArrowLeft, 
  CheckCircle, 
  Download,
  Copy,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function TwoFactorSetupPage() {
  const t = useTranslations('Profile.setup');
  const router = useRouter();
  const { refreshSession } = useAuth();
  
  const [step, setStep] = useState(1); // 1: QR Code, 2: Backup Codes, 3: Success
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/profile"
          className="group mb-8 inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('done')}
        </Link>

        <div className="mb-12 animate-fade-in-up">
          <h1 className="mb-4 font-display text-5xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="font-body text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="animate-fade-in-up border-2 border-foreground/10 bg-card p-8">
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold">{t('step1')}</h3>
                <p className="font-body text-sm text-muted-foreground">
                  {t('step1Desc')}
                </p>
                <div className="flex flex-col items-center justify-center gap-6 py-4 sm:flex-row">
                  <div className="border-4 border-foreground p-2">
                    <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-body text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Manual Entry Key
                      </p>
                      <div className="flex items-center gap-2 rounded border-2 border-foreground/10 bg-muted/30 px-3 py-2">
                        <code className="font-mono text-xs">{secret}</code>
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

              <div className="h-px bg-foreground/10" />

              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold">{t('step2')}</h3>
                <p className="font-body text-sm text-muted-foreground">
                  {t('step2Desc')}
                </p>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder={t('placeholder')}
                      className="w-full border-2 border-foreground/20 bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                      required
                      autoComplete="one-time-code"
                      inputMode="numeric"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 border-2 border-red-500/50 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verifying || verificationCode.length !== 6}
                    className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden bg-primary px-8 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
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
                <div className="mb-4 rounded-full bg-green-500/10 p-3">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="mb-2 font-display text-2xl font-bold">{t('success')}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h4 className="font-display text-lg font-bold">{t('backupCodes')}</h4>
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  {t('backupCodesDesc')}
                </p>
                <div className="grid grid-cols-2 gap-4 rounded-lg border-2 border-foreground/10 bg-muted/30 p-6 font-mono text-sm sm:grid-cols-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{index + 1}.</span>
                      <span>{code}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={downloadBackupCodes}
                    className="flex flex-1 items-center justify-center gap-2 border-2 border-foreground bg-background px-6 py-3 font-body text-xs font-bold uppercase tracking-wider transition-all hover:bg-foreground hover:text-background"
                  >
                    <Download className="h-4 w-4" />
                    {t('download')}
                  </button>
                  <button
                    onClick={async () => {
                      await refreshSession();
                      router.push('/dashboard/profile');
                    }}
                    className="flex flex-1 items-center justify-center gap-2 bg-primary px-6 py-3 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:scale-[1.02]"
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
  );
}
