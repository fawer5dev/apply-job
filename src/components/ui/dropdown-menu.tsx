'use client';

import * as React from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<
  DropdownMenuContextType | undefined
>(undefined);

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownMenuTrigger({
  children,
  asChild = false,
}: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }

  const { open, setOpen } = context;

  const handleClick = () => {
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = 'end',
  className = '',
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }

  const { open, setOpen } = context;
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, setOpen]);

  if (!open) return null;

  const alignClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div
      ref={contentRef}
      className={`absolute ${alignClass} z-50 mt-2 w-64 origin-top-right border-2 border-foreground/10 bg-background shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  destructive?: boolean;
  asChild?: boolean;
}

export function DropdownMenuItem({
  children,
  destructive = false,
  asChild = false,
  onClick,
  className = '',
  ...props
}: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuItem must be used within DropdownMenu');
  }

  const { setOpen } = context;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e as any);
    setOpen(false);
  };

  const destructiveClass = destructive
    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
    : 'hover:bg-primary/5';

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      className: `${children.props.className || ''} block w-full px-4 py-3 text-left font-body text-sm transition-colors ${destructiveClass} ${className}`,
    });
  }

  return (
    <button
      type="button"
      className={`block w-full px-4 py-3 text-left font-body text-sm transition-colors ${destructiveClass} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenuSeparator({
  className = '',
}: DropdownMenuSeparatorProps) {
  return <div className={`my-1 h-px bg-border ${className}`} />;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuLabel({
  children,
  className = '',
}: DropdownMenuLabelProps) {
  return (
    <div
      className={`px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
}
