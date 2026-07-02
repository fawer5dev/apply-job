import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="space-y-6 text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="font-display text-2xl font-bold">Page Not Found</h2>
        <p className="max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
