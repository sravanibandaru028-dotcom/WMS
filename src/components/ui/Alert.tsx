import type { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

const toneConfig: Record<Tone, { icon: ReactNode; classes: string }> = {
  info: {
    icon: <Info className="h-5 w-5 text-info-600" />,
    classes: 'bg-info-50 border-info-200',
  },
  success: {
    icon: <CheckCircle className="h-5 w-5 text-success-600" />,
    classes: 'bg-success-50 border-success-200',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-warning-600" />,
    classes: 'bg-warning-50 border-warning-200',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-error-600" />,
    classes: 'bg-error-50 border-error-200',
  },
};

export function Alert({ tone = 'info', title, children, className, action }: AlertProps) {
  const config = toneConfig[tone];
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', config.classes, className)}>
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-ink-900">{title}</p>}
        <div className={cn('text-sm text-ink-600', title && 'mt-0.5')}>{children}</div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
