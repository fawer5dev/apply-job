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
    'inline-flex items-center justify-center font-body font-bold uppercase tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group';

  const variants = {
    default:
      'bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] border-2 border-transparent hover:border-primary/20',
    outline:
      'border-2 border-foreground/20 bg-background hover:border-primary hover:bg-primary/5 shadow-sm',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive:
      'bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] border-2 border-transparent',
  };

  const sizes = {
    default: 'h-11 px-6 py-2 text-xs',
    sm: 'h-9 px-4 text-xs',
    lg: 'h-14 px-8 text-sm',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {/* Animated underline effect for default variant */}
      {variant === 'default' && (
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-foreground/50 transition-all duration-500 group-hover:w-full" />
      )}
      {children}
    </button>
  );
}
