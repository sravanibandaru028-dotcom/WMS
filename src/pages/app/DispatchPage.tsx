import { useMemo } from 'react';
import { Truck, Clock, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { dispatchStatusConfig } from '@/lib/status';
import { timeUntil, isOverdue, cn } from '@/lib/utils';

export function DispatchPage() {
  const { dispatchRecords, loading } = useWarehouseData();

  const stats = useMemo(() => {
    const ready = dispatchRecords.filter((d) => d.status === 'ready');
    const qcPending = dispatchRecords.filter((d) => d.status === 'qc_pending');
    const atRisk = dispatchRecords.filter((d) => d.status === 'at_risk');
    const dispatched = dispatchRecords.filter((d) => d.status === 'dispatched');
    return { ready, qcPending, atRisk, dispatched };
  }, [dispatchRecords]);

  if (loading) return <PageLoader label="Loading dispatch…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Dispatch Management</h1>
        <p className="text-sm text-ink-500 mt-1">Carrier cutoffs, dispatch risks, and shipment tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ready" value={stats.ready.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label="QC Pending" value={stats.qcPending.length} icon={<Clock className="h-5 w-5" />} tone="warning" />
        <StatCard label="At Risk" value={stats.atRisk.length} icon={<AlertTriangle className="h-5 w-5" />} tone={stats.atRisk.length > 0 ? 'error' : 'neutral'} />
        <StatCard label="Dispatched" value={stats.dispatched.length} icon={<Truck className="h-5 w-5" />} tone="neutral" />
      </div>

      {stats.atRisk.length > 0 && (
        <Alert tone="error" title="Dispatch Risk">
          {stats.atRisk.length} order(s) approaching carrier cutoff. Expedite picking and QC to meet deadline.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary-500" />
            <CardTitle>Dispatch Queue</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {dispatchRecords.length === 0 ? (
            <EmptyState icon={<Truck className="h-7 w-7" />} title="No dispatch records" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Carrier</TH>
                  <TH>Tracking</TH>
                  <TH>Cutoff</TH>
                  <TH>Status</TH>
                  <TH>Dispatched</TH>
                </TR>
              </THead>
              <TBody>
                {dispatchRecords.map((d) => (
                  <TR key={d.id}>
                    <TD className="font-medium text-primary-600">{d.order_number}</TD>
                    <TD>{d.carrier}</TD>
                    <TD className="font-mono text-xs">{d.tracking_number || '—'}</TD>
                    <TD>
                      <span className={cn('text-sm', isOverdue(d.cutoff_time) ? 'text-error-600 font-medium' : 'text-ink-600')}>
                        {timeUntil(d.cutoff_time)}
                      </span>
                    </TD>
                    <TD>
                      <Badge tone={dispatchStatusConfig[d.status].tone} variant="soft" dot>
                        {dispatchStatusConfig[d.status].label}
                      </Badge>
                    </TD>
                    <TD className="text-sm text-ink-500">{d.dispatched_at ? timeUntil(d.dispatched_at) : '—'}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
