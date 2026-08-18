import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  variant?: 'solid' | 'soft' | 'outline';
  className?: string;
  dot?: boolean;
}

const toneClasses: Record<Tone, { solid: string; soft: string; outline: string; dot: string }> = {
  primary: {
    solid: 'bg-primary-600 text-white',
    soft: 'bg-primary-50 text-primary-700',
    outline: 'border border-primary-300 text-primary-700',
    dot: 'bg-primary-500',
  },
  success: {
    solid: 'bg-success-600 text-white',
    soft: 'bg-success-50 text-success-700',
    outline: 'border border-success-300 text-success-700',
    dot: 'bg-success-500',
  },
  warning: {
    solid: 'bg-warning-500 text-white',
    soft: 'bg-warning-50 text-warning-700',
    outline: 'border border-warning-300 text-warning-700',
    dot: 'bg-warning-500',
  },
  error: {
    solid: 'bg-error-600 text-white',
    soft: 'bg-error-50 text-error-700',
    outline: 'border border-error-300 text-error-700',
    dot: 'bg-error-500',
  },
  info: {
    solid: 'bg-info-600 text-white',
    soft: 'bg-info-50 text-info-700',
    outline: 'border border-info-300 text-info-700',
    dot: 'bg-info-500',
  },
  neutral: {
    solid: 'bg-ink-600 text-white',
    soft: 'bg-ink-100 text-ink-700',
    outline: 'border border-ink-300 text-ink-600',
    dot: 'bg-ink-400',
  },
  accent: {
    solid: 'bg-accent-600 text-white',
    soft: 'bg-accent-50 text-accent-700',
    outline: 'border border-accent-300 text-accent-700',
    dot: 'bg-accent-500',
  },
};

export function Badge({ children, tone = 'neutral', variant = 'soft', className, dot }: BadgeProps) {
  const t = toneClasses[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        t[variant],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  );
}
