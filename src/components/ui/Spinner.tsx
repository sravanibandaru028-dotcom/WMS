import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-primary-500', className)} />;
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink-50">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
          <Spinner className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-semibold font-display text-ink-900">WAREFLOW</span>
      </div>
      <p className="text-sm text-ink-500">Loading your control tower…</p>
    </div>
  );
}
