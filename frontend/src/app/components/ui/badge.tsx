import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'active' | 'blocked' | 'completed' | 'high-confidence' | 'low-confidence' | 'default';
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const variants = {
    active: "bg-[var(--dca-success)]/20 text-[var(--dca-success)]",
    blocked: "bg-[var(--dca-warning)]/20 text-[var(--dca-warning)]",
    completed: "bg-[var(--dca-success)]/10 text-[var(--dca-success)] opacity-80",
    "high-confidence": "bg-gradient-to-r from-[var(--dca-success)]/30 to-[var(--dca-success)]/10 text-[var(--dca-success)]",
    "low-confidence": "bg-gradient-to-r from-[var(--dca-error)]/30 to-[var(--dca-error)]/10 text-[var(--dca-error)]",
    default: "bg-[var(--dca-bg-tertiary)] text-[var(--dca-text-primary)]"
  };

  return (
    <div className={cn(baseClasses, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
