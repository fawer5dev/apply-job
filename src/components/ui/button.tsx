import { cn } from '@/lib/utils/formatting';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    default: 'bg-blue-700 hover:bg-blue-800 text-white',
    outline:
      'bg-white border border-gray-200 hover:bg-gray-50 text-gray-800',
    ghost: 'border border-blue-700 text-blue-700 hover:bg-blue-50',
    destructive:
      'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100',
  };

  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
