import { useMemo } from 'react';
import { ClipboardList, Play, Pause, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { pickStatusConfig } from '@/lib/status';
import { cn } from '@/lib/utils';

export function PickingPage() {
  const { pickTasks, warehouseZones, loading } = useWarehouseData();

  const stats = useMemo(() => {
    const pending = pickTasks.filter((t) => t.status === 'pending');
    const inProgress = pickTasks.filter((t) => t.status === 'in_progress');
    const completed = pickTasks.filter((t) => t.status === 'completed');
    const issues = pickTasks.filter((t) => t.status === 'missing' || t.status === 'damaged');
    return { pending, inProgress, completed, issues };
  }, [pickTasks]);

  if (loading) return <PageLoader label="Loading pick queue…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Picking Management</h1>
        <p className="text-sm text-ink-500 mt-1">Pick queue, assignments, and zone optimization</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending" value={stats.pending.length} icon={<ClipboardList className="h-5 w-5" />} tone="neutral" />
        <StatCard label="In Progress" value={stats.inProgress.length} icon={<Play className="h-5 w-5" />} tone="primary" />
        <StatCard label="Completed" value={stats.completed.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label="Issues" value={stats.issues.length} icon={<AlertTriangle className="h-5 w-5" />} tone={stats.issues.length > 0 ? 'error' : 'neutral'} />
      </div>

      {/* Zone summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouseZones.map((zone) => (
          <Card key={zone.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ink-900">Zone {zone.id}</span>
              <Badge tone={zone.pending_picks > 3 ? 'error' : zone.pending_picks > 1 ? 'warning' : 'success'} variant="soft">
                {zone.pending_picks} pending
              </Badge>
            </div>
            <p className="text-xs text-ink-500">Avg pick time: {zone.avg_pick_time_min}m</p>
            <p className="text-xs text-ink-500">Utilization: {zone.utilization}%</p>
          </Card>
        ))}
      </div>

      {/* Pick Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-500" />
            <CardTitle>Pick Queue</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {pickTasks.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-7 w-7" />} title="No pick tasks" description="Pick tasks will appear here when orders enter picking." />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Seq</TH>
                  <TH>Order</TH>
                  <TH>SKU</TH>
                  <TH>Product</TH>
                  <TH className="text-right">Qty</TH>
                  <TH>Location</TH>
                  <TH>Picker</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {pickTasks.map((task) => (
                  <TR key={task.id}>
                    <TD className="font-mono text-xs text-ink-400">{task.sequence}</TD>
                    <TD className="font-medium text-primary-600">{task.order_number}</TD>
                    <TD className="font-mono text-xs">{task.product_sku}</TD>
                    <TD className="font-medium">{task.product_name}</TD>
                    <TD className="text-right">{task.quantity}</TD>
                    <TD>
                      <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                        <MapPin className="h-3 w-3" /> {task.location}
                      </span>
                    </TD>
                    <TD className="text-sm">{task.picker || '—'}</TD>
                    <TD>
                      <Badge tone={pickStatusConfig[task.status].tone} variant="soft" dot>
                        {pickStatusConfig[task.status].label}
                      </Badge>
                    </TD>
                    <TD>
                      {task.status === 'pending' && <Button size="sm" variant="outline"><Play className="h-3.5 w-3.5" /> Start</Button>}
                      {task.status === 'in_progress' && <Button size="sm" variant="success"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</Button>}
                    </TD>
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
