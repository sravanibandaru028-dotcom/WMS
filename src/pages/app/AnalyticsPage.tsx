import { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package, Clock, CheckCircle2, AlertTriangle, Truck, Boxes } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { PageLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatNumber, formatPercent, cn } from '@/lib/utils';

export function AnalyticsPage() {
  const { orders, products, pickTasks, exceptions, auditEntries, dispatchRecords, loading } = useWarehouseData();

  const metrics = useMemo(() => {
    const total = orders.length;
    const dispatched = orders.filter((o) => o.status === 'dispatched').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const fulfillmentRate = total > 0 ? ((dispatched / (total - cancelled)) * 100) : 0;

    const completedPicks = pickTasks.filter((t) => t.status === 'completed');
    const avgPickTime = completedPicks.length > 0
      ? completedPicks.reduce((sum, t) => {
          if (t.started_at && t.completed_at) {
            return sum + (new Date(t.completed_at).getTime() - new Date(t.started_at).getTime()) / 60000;
          }
          return sum;
        }, 0) / completedPicks.length
      : 0;

    const openExceptions = exceptions.filter((e) => e.status === 'open').length;
    const resolvedExceptions = exceptions.filter((e) => e.status === 'resolved').length;
    const exceptionRate = total > 0 ? (exceptions.length / total) * 100 : 0;

    const acceptedDecisions = auditEntries.filter((a) => a.decision === 'accepted').length;
    const overriddenDecisions = auditEntries.filter((a) => a.decision === 'overridden').length;
    const allocationSuccess = auditEntries.length > 0 ? (acceptedDecisions / auditEntries.length) * 100 : 0;

    const totalValue = orders.reduce((sum, o) => sum + o.total_value, 0);
    const inventoryValue = products.reduce((sum, p) => sum + p.on_hand * Number(p.unit_cost), 0);
    const lowStock = products.filter((p) => p.available <= p.reorder_point).length;
    const stockoutFreq = products.filter((p) => p.available <= 0).length;
    const inventoryTurnover = inventoryValue > 0 ? (totalValue / inventoryValue) * 100 : 0;

    const dispatchedCount = dispatchRecords.filter((d) => d.status === 'dispatched').length;
    const dispatchOnTime = dispatchRecords.filter((d) => d.status === 'dispatched' && d.dispatched_at).length;
    const dispatchRate = dispatchRecords.length > 0 ? (dispatchedCount / dispatchRecords.length) * 100 : 0;

    return {
      total, dispatched, cancelled, fulfillmentRate, avgPickTime,
      openExceptions, resolvedExceptions, exceptionRate,
      acceptedDecisions, overriddenDecisions, allocationSuccess,
      totalValue, inventoryValue, lowStock, stockoutFreq, inventoryTurnover,
      dispatchRate,
    };
  }, [orders, products, pickTasks, exceptions, auditEntries, dispatchRecords]);

  if (loading) return <PageLoader label="Loading analytics…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Operational Analytics</h1>
        <p className="text-sm text-ink-500 mt-1">Key performance metrics across the warehouse</p>
      </div>

      {/* Order Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Order Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={metrics.total} icon={<Package className="h-5 w-5" />} tone="primary" />
          <StatCard label="Fulfillment Rate" value={formatPercent(metrics.fulfillmentRate)} icon={<TrendingUp className="h-5 w-5" />} tone="success" />
          <StatCard label="Dispatched" value={metrics.dispatched} icon={<Truck className="h-5 w-5" />} tone="info" />
          <StatCard label="Order Value" value={formatCurrency(metrics.totalValue)} icon={<BarChart3 className="h-5 w-5" />} tone="neutral" />
        </div>
      </div>

      {/* Picking Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Picking Productivity</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Completed Picks" value={pickTasks.filter((t) => t.status === 'completed').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
          <StatCard label="Avg Pick Time" value={`${metrics.avgPickTime.toFixed(1)}m`} icon={<Clock className="h-5 w-5" />} tone="primary" />
          <StatCard label="Pick Issues" value={pickTasks.filter((t) => t.status === 'missing' || t.status === 'damaged').length} icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
          <StatCard label="Pending Picks" value={pickTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length} icon={<Clock className="h-5 w-5" />} tone="neutral" />
        </div>
      </div>

      {/* Inventory Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Inventory Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Inventory Value" value={formatCurrency(metrics.inventoryValue)} icon={<Boxes className="h-5 w-5" />} tone="info" />
          <StatCard label="Est. Turnover" value={formatPercent(metrics.inventoryTurnover)} icon={<TrendingUp className="h-5 w-5" />} tone="primary" />
          <StatCard label="Low Stock SKUs" value={metrics.lowStock} icon={<TrendingDown className="h-5 w-5" />} tone="warning" />
          <StatCard label="Stockouts" value={metrics.stockoutFreq} icon={<AlertTriangle className="h-5 w-5" />} tone={metrics.stockoutFreq > 0 ? 'error' : 'neutral'} />
        </div>
      </div>

      {/* Exception & Decision Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Exceptions & Decisions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Exceptions" value={exceptions.length} icon={<AlertTriangle className="h-5 w-5" />} tone="neutral" />
          <StatCard label="Exception Rate" value={formatPercent(metrics.exceptionRate)} icon={<TrendingDown className="h-5 w-5" />} tone="warning" />
          <StatCard label="Decisions Accepted" value={metrics.acceptedDecisions} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
          <StatCard label="Decisions Overridden" value={metrics.overriddenDecisions} icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
        </div>
      </div>

      {/* Dispatch Performance */}
      <div>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Dispatch Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Dispatch Rate" value={formatPercent(metrics.dispatchRate)} icon={<Truck className="h-5 w-5" />} tone="success" />
          <StatCard label="On-Time Dispatch" value={dispatchRecords.filter((d) => d.status === 'dispatched').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="primary" />
          <StatCard label="At Risk" value={dispatchRecords.filter((d) => d.status === 'at_risk').length} icon={<AlertTriangle className="h-5 w-5" />} tone="error" />
        </div>
      </div>

      {/* Decision Success Rate */}
      <Card>
        <CardHeader><CardTitle>Allocation Success Rate</CardTitle></CardHeader>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-500">Accepted vs Overridden</span>
                <span className="text-sm font-medium text-ink-900">{formatPercent(metrics.allocationSuccess)} accepted</span>
              </div>
              <div className="h-3 bg-ink-100 rounded-full overflow-hidden flex">
                <div className="bg-success-500 h-full transition-all" style={{ width: `${metrics.allocationSuccess}%` }} />
                <div className="bg-warning-500 h-full transition-all" style={{ width: `${100 - metrics.allocationSuccess}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-success-600">{metrics.acceptedDecisions} accepted</span>
                <span className="text-warning-600">{metrics.overriddenDecisions} overridden</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
