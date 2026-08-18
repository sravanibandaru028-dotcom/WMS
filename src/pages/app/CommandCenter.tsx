import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, AlertTriangle, Split, ClipboardList, Boxes,
  Truck, Activity, ArrowRight, TrendingDown, Zap, ShieldCheck,
} from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { computeAllocationRecommendations, computeReplenishmentRecommendations, computeBottlenecks } from '@/lib/decisionEngine';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { orderStatusConfig, priorityConfig, exceptionStatusConfig, exceptionTypeConfig } from '@/lib/status';
import { formatCurrency, timeUntil, isOverdue } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function CommandCenter() {
  const { products, orders, orderItems, pickTasks, exceptions, decisionRules, warehouseZones, loading } = useWarehouseData();

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'dispatched' && o.status !== 'cancelled');
    const atRisk = activeOrders.filter((o) => isOverdue(o.sla_deadline) || new Date(o.sla_deadline).getTime() - Date.now() < 3 * 3600000);
    const pendingAllocations = activeOrders.filter((o) => o.status === 'created' || o.status === 'prioritized');
    const pendingPicks = pickTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const lowStock = products.filter((p) => p.available <= p.reorder_point);
    const openExceptions = exceptions.filter((e) => e.status === 'open');
    const dispatchRisks = orders.filter((o) => {
      return exceptions.some((e) => e.order_id === o.id && e.type === 'dispatch_risk' && e.status === 'open');
    });
    return { activeOrders, atRisk, pendingAllocations, pendingPicks, lowStock, openExceptions, dispatchRisks };
  }, [orders, products, pickTasks, exceptions]);

  const allocations = useMemo(
    () => computeAllocationRecommendations(products, orders, orderItems, decisionRules),
    [products, orders, orderItems, decisionRules],
  );
  const replenishments = useMemo(
    () => computeReplenishmentRecommendations(products, decisionRules),
    [products, decisionRules],
  );
  const bottlenecks = useMemo(
    () => computeBottlenecks(warehouseZones, pickTasks),
    [warehouseZones, pickTasks],
  );

  if (loading) return <PageLoader label="Loading command center…" />;

  const topRecommendations = [
    ...allocations.filter((a) => a.conflict).slice(0, 2),
    ...replenishments.filter((r) => r.urgency === 'critical' || r.urgency === 'high').slice(0, 2),
    ...bottlenecks.filter((b) => b.severity === 'high').slice(0, 1),
  ].slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Command Center</h1>
        <p className="text-sm text-ink-500 mt-1">Real-time warehouse health and recommended actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Orders at Risk"
          value={stats.atRisk.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone={stats.atRisk.length > 0 ? 'error' : 'neutral'}
          subtitle={`${stats.activeOrders.length} active orders`}
        />
        <StatCard
          label="Pending Allocations"
          value={stats.pendingAllocations.length}
          icon={<Split className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Open Exceptions"
          value={stats.openExceptions.length}
          icon={<Activity className="h-5 w-5" />}
          tone={stats.openExceptions.length > 0 ? 'warning' : 'neutral'}
        />
        <StatCard
          label="Low Stock SKUs"
          value={stats.lowStock.length}
          icon={<Boxes className="h-5 w-5" />}
          tone={stats.lowStock.length > 0 ? 'error' : 'neutral'}
        />
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent-500" />
            <CardTitle>Recommended Actions</CardTitle>
          </div>
          <Badge tone="accent" variant="soft">{topRecommendations.length} pending</Badge>
        </CardHeader>
        <CardBody className="space-y-3">
          {topRecommendations.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-7 w-7" />}
              title="All clear"
              description="No critical actions recommended at this time."
            />
          ) : (
            topRecommendations.map((rec, i) => {
              const isAllocation = 'orderNumber' in rec;
              const isReplenishment = 'sku' in rec;
              const isBottleneck = 'zone' in rec;

              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-ink-200 hover:border-ink-300 transition-colors">
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isAllocation && 'bg-primary-50 text-primary-600',
                    isReplenishment && 'bg-error-50 text-error-600',
                    isBottleneck && 'bg-warning-50 text-warning-600',
                  )}>
                    {isAllocation && <Split className="h-4 w-4" />}
                    {isReplenishment && <TrendingDown className="h-4 w-4" />}
                    {isBottleneck && <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900">
                      {isAllocation && `Allocate: ${rec.recommendation}`}
                      {isReplenishment && `Replenish: ${rec.sku} ${rec.name}`}
                      {isBottleneck && `Rebalance: Zone ${rec.zone} bottleneck`}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                      {isAllocation && rec.impact}
                      {isReplenishment && rec.reasoning[0]}
                      {isBottleneck && rec.description}
                    </p>
                  </div>
                  <Link
                    to={isAllocation ? '/app/allocation' : isReplenishment ? '/app/inventory' : '/app/bottlenecks'}
                    className="text-primary-600 hover:text-primary-700 flex-shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders at Risk */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-error-500" />
              <CardTitle>Orders at Risk</CardTitle>
            </div>
            <Link to="/app/orders" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {stats.atRisk.length === 0 ? (
              <EmptyState icon={<Package className="h-7 w-7" />} title="No orders at risk" description="All active orders are within SLA." />
            ) : (
              <div className="space-y-2">
                {stats.atRisk.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    to={`/app/orders/${order.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-ink-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge tone={priorityConfig[order.priority].tone} variant="soft" dot>
                        {priorityConfig[order.priority].label}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate">{order.order_number}</p>
                        <p className="text-xs text-ink-500 truncate">{order.customer_name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn('text-xs font-medium', isOverdue(order.sla_deadline) ? 'text-error-600' : 'text-warning-600')}>
                        {timeUntil(order.sla_deadline)}
                      </p>
                      <p className="text-xs text-ink-400">{formatCurrency(order.total_value)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Open Exceptions */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-warning-500" />
              <CardTitle>Open Exceptions</CardTitle>
            </div>
            <Link to="/app/exceptions" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {stats.openExceptions.length === 0 ? (
              <EmptyState icon={<ShieldCheck className="h-7 w-7" />} title="No open exceptions" description="All exceptions have been resolved." />
            ) : (
              <div className="space-y-2">
                {stats.openExceptions.slice(0, 5).map((exc) => (
                  <Link
                    key={exc.id}
                    to="/app/exceptions"
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-ink-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge tone={exceptionTypeConfig[exc.type].tone} variant="soft">
                        {exceptionTypeConfig[exc.type].label}
                      </Badge>
                      <p className="text-sm font-medium text-ink-900 truncate">{exc.title}</p>
                    </div>
                    <Badge tone={exceptionStatusConfig[exc.status].tone} variant="solid" className="flex-shrink-0">
                      {exceptionStatusConfig[exc.status].label}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Warehouse Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary-500" />
            <CardTitle>Warehouse Zone Status</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {warehouseZones.map((zone) => (
              <div key={zone.id} className="rounded-lg border border-ink-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-ink-900">Zone {zone.id}</span>
                  <Badge
                    tone={zone.utilization > 80 ? 'error' : zone.utilization > 60 ? 'warning' : 'success'}
                    variant="soft"
                  >
                    {zone.utilization}%
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-ink-500">
                  <div className="flex justify-between">
                    <span>SKUs</span>
                    <span className="font-medium text-ink-700">{zone.total_skus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending picks</span>
                    <span className="font-medium text-ink-700">{zone.pending_picks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg pick time</span>
                    <span className="font-medium text-ink-700">{zone.avg_pick_time_min}m</span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      zone.utilization > 80 ? 'bg-error-500' : zone.utilization > 60 ? 'bg-warning-500' : 'bg-success-500',
                    )}
                    style={{ width: `${zone.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Dispatch Risks */}
      {stats.dispatchRisks.length > 0 && (
        <Alert tone="error" title="Dispatch Risk Alert">
          {stats.dispatchRisks.length} order(s) approaching carrier cutoff.{' '}
          <Link to="/app/dispatch" className="text-error-700 font-medium underline">Review dispatch queue</Link>
        </Alert>
      )}
    </div>
  );
}
