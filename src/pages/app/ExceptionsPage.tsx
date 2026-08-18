import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, XCircle, ArrowUp } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { exceptionStatusConfig, exceptionTypeConfig } from '@/lib/status';
import { timeAgo, cn } from '@/lib/utils';
import type { Exception } from '@/types';

export function ExceptionsPage() {
  const { exceptions, loading } = useWarehouseData();
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return exceptions;
    return exceptions.filter((e) => e.status === filter);
  }, [exceptions, filter]);

  if (loading) return <PageLoader label="Loading exceptions…" />;

  const open = exceptions.filter((e) => e.status === 'open');
  const resolved = exceptions.filter((e) => e.status === 'resolved');
  const escalated = exceptions.filter((e) => e.status === 'escalated');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Exception Management</h1>
        <p className="text-sm text-ink-500 mt-1">Every exception follows: Exception → Decision → Resolution</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open" value={open.length} icon={<AlertTriangle className="h-5 w-5" />} tone={open.length > 0 ? 'error' : 'neutral'} />
        <StatCard label="Escalated" value={escalated.length} icon={<ArrowUp className="h-5 w-5" />} tone={escalated.length > 0 ? 'warning' : 'neutral'} />
        <StatCard label="Resolved" value={resolved.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label="Total" value={exceptions.length} icon={<AlertTriangle className="h-5 w-5" />} tone="neutral" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'escalated', 'resolved', 'dismissed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="No exceptions" description="All clear." />
      ) : (
        <div className="space-y-4">
          {filtered.map((exc) => (
            <ExceptionCard key={exc.id} exc={exc} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExceptionCard({ exc }: { exc: Exception }) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge tone={exceptionTypeConfig[exc.type].tone} variant="soft">{exceptionTypeConfig[exc.type].label}</Badge>
            <Badge tone={exceptionStatusConfig[exc.status].tone} variant="solid" dot>{exceptionStatusConfig[exc.status].label}</Badge>
            <span className="text-xs text-ink-400">{timeAgo(exc.created_at)}</span>
          </div>
          {exc.order_number && <Badge tone="neutral" variant="outline">{exc.order_number}</Badge>}
        </div>

        <div>
          <p className="text-sm font-semibold text-ink-900">{exc.title}</p>
          <p className="text-sm text-ink-600 mt-1">{exc.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary-50/50 border border-primary-100">
            <p className="text-xs font-semibold text-primary-700 mb-1">Recommendation</p>
            <p className="text-sm text-ink-700">{exc.recommendation}</p>
          </div>
          <div className="p-3 rounded-lg bg-ink-50 border border-ink-200">
            <p className="text-xs font-semibold text-ink-600 mb-1">Expected Impact</p>
            <p className="text-sm text-ink-600">{exc.impact}</p>
          </div>
        </div>

        {exc.status === 'open' && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="success"><CheckCircle2 className="h-3.5 w-3.5" /> Accept Recommendation</Button>
            <Button size="sm" variant="outline">Override</Button>
            <Button size="sm" variant="ghost"><ArrowUp className="h-3.5 w-3.5" /> Escalate</Button>
            <Button size="sm" variant="ghost"><XCircle className="h-3.5 w-3.5" /> Dismiss</Button>
          </div>
        )}
        {exc.resolution && (
          <div className="p-3 rounded-lg bg-success-50 border border-success-200">
            <p className="text-xs font-semibold text-success-700 mb-0.5">Resolution</p>
            <p className="text-sm text-ink-700">{exc.resolution}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
