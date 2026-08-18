import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; positive?: boolean };
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  subtitle?: string;
}

const toneClasses = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
  info: 'bg-info-50 text-info-600',
  neutral: 'bg-ink-100 text-ink-600',
};

export function StatCard({ label, value, icon, trend, tone = 'neutral', subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 shadow-card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold font-display text-ink-900 truncate">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0', toneClasses[tone])}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend.positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-success-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-error-600" />
          )}
          <span className={trend.positive ? 'text-success-700' : 'text-error-700'}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-ink-400">vs last period</span>
        </div>
      )}
    </div>
  );
}
