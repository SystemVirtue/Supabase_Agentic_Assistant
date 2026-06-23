import React from 'react';
import { cn } from './Badge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'glass';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const baseClasses = "rounded-lg border text-[var(--dca-text-primary)]";
  
  const variants = {
    default: "bg-[var(--dca-bg-secondary)] border-[var(--dca-bg-tertiary)]",
    elevated: "bg-[var(--dca-bg-tertiary)] border-[var(--dca-bg-tertiary)] shadow-lg",
    interactive: "bg-[var(--dca-bg-secondary)] border-[var(--dca-bg-tertiary)] hover:-translate-y-1 hover:border-[var(--dca-accent-primary)] hover:shadow-lg transition-all cursor-pointer",
    glass: "bg-[var(--dca-bg-secondary)]/80 backdrop-blur-md border-[var(--dca-bg-tertiary)]/50"
  };

  return (
    <div className={cn(baseClasses, variants[variant], className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-medium leading-none tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
