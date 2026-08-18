import { useMemo } from 'react';
import { ScrollText, CheckCircle2, AlertTriangle, ArrowUp, User } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo, cn } from '@/lib/utils';

export function AuditPage() {
  const { auditEntries, loading } = useWarehouseData();

  const stats = useMemo(() => {
    const accepted = auditEntries.filter((a) => a.decision === 'accepted').length;
    const overridden = auditEntries.filter((a) => a.decision === 'overridden').length;
    return { accepted, overridden, total: auditEntries.length };
  }, [auditEntries]);

  if (loading) return <PageLoader label="Loading audit trail…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Audit Trail</h1>
        <p className="text-sm text-ink-500 mt-1">Every operational decision — what happened, what was recommended, who decided</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-ink-500">Total Decisions</p>
          <p className="text-2xl font-semibold font-display text-ink-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink-500">Accepted</p>
          <p className="text-2xl font-semibold font-display text-success-600 mt-1">{stats.accepted}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink-500">Overridden</p>
          <p className="text-2xl font-semibold font-display text-warning-600 mt-1">{stats.overridden}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary-500" />
            <CardTitle>Decision History</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {auditEntries.length === 0 ? (
            <EmptyState icon={<ScrollText className="h-7 w-7" />} title="No audit entries" />
          ) : (
            <div className="space-y-3">
              {auditEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-ink-200 hover:border-ink-300 transition-colors">
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    entry.decision === 'accepted' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600',
                  )}>
                    {entry.decision === 'accepted' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={entry.decision === 'accepted' ? 'success' : 'warning'} variant="soft">
                        {entry.decision}
                      </Badge>
                      <span className="text-xs text-ink-400">{entry.action.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-ink-400">·</span>
                      <span className="text-xs text-ink-400">{timeAgo(entry.created_at)}</span>
                    </div>
                    <p className="text-sm text-ink-700 mt-1">{entry.description}</p>
                    {entry.recommendation && (
                      <div className="mt-1.5 p-2 rounded-lg bg-primary-50/50 border border-primary-100">
                        <p className="text-xs text-primary-700"><span className="font-medium">Recommendation:</span> {entry.recommendation}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-ink-400">
                      <User className="h-3 w-3" /> {entry.user_email}
                      <span>·</span>
                      <span className="font-mono">{entry.entity_type}: {entry.entity_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
