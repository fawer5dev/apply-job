import { cn } from '@/lib/utils/formatting';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'group relative border-2 border-foreground/10 bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
      {/* Subtle corner accent */}
      <div className="absolute right-0 top-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-12" />
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col space-y-2 p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3
      className={cn(
        'font-display text-xl font-bold leading-tight tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: CardProps) {
  return (
    <p
      className={cn(
        'font-body text-sm leading-relaxed text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
