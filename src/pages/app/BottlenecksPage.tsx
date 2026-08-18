import { useMemo } from 'react';
import { Activity, AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { computeBottlenecks } from '@/lib/decisionEngine';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export function BottlenecksPage() {
  const { warehouseZones, pickTasks, loading } = useWarehouseData();

  const bottlenecks = useMemo(
    () => computeBottlenecks(warehouseZones, pickTasks),
    [warehouseZones, pickTasks],
  );

  if (loading) return <PageLoader label="Analyzing bottlenecks…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Bottleneck Detection</h1>
        <p className="text-sm text-ink-500 mt-1">Analyzes zone performance to identify operational bottlenecks</p>
      </div>

      {/* Zone Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouseZones.map((zone) => (
          <Card key={zone.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-ink-900">Zone {zone.id}</span>
              <Badge tone={zone.utilization > 80 ? 'error' : zone.utilization > 60 ? 'warning' : 'success'} variant="soft">
                {zone.utilization}%
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs text-ink-500">
              <div className="flex justify-between"><span>Pending picks</span><span className="font-medium text-ink-700">{zone.pending_picks}</span></div>
              <div className="flex justify-between"><span>Avg pick time</span><span className="font-medium text-ink-700">{zone.avg_pick_time_min}m</span></div>
            </div>
            <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', zone.utilization > 80 ? 'bg-error-500' : zone.utilization > 60 ? 'bg-warning-500' : 'bg-success-500')} style={{ width: `${zone.utilization}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Bottleneck Findings */}
      {bottlenecks.length === 0 ? (
        <EmptyState icon={<Activity className="h-7 w-7" />} title="No bottlenecks detected" description="All zones are operating within normal parameters." />
      ) : (
        <div className="space-y-4">
          {bottlenecks.map((b, i) => (
            <Card key={i}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center',
                      b.severity === 'high' ? 'bg-error-50 text-error-600' : 'bg-warning-50 text-warning-600',
                    )}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Zone {b.zone} — {b.metric}</p>
                      <p className="text-xs text-ink-500">Current: {b.currentValue} vs Baseline: {b.baseline} ({b.deviationPct > 0 ? '+' : ''}{b.deviationPct}% deviation)</p>
                    </div>
                  </div>
                  <Badge tone={b.severity === 'high' ? 'error' : 'warning'} variant="solid">{b.severity}</Badge>
                </div>

                <div className="p-3 rounded-lg bg-ink-50 border border-ink-200">
                  <p className="text-xs font-semibold text-ink-600 mb-1">Problem</p>
                  <p className="text-sm text-ink-700">{b.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-primary-50/50 border border-primary-100">
                    <p className="text-xs font-semibold text-primary-700 mb-1">Recommendation</p>
                    <p className="text-sm text-ink-700">{b.recommendation}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success-50/50 border border-success-100">
                    <p className="text-xs font-semibold text-success-700 mb-1">Expected Impact</p>
                    <p className="text-sm text-ink-700">{b.expectedImpact}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
