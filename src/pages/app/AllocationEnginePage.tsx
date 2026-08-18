import { useMemo, useState } from 'react';
import { Split, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { computeAllocationRecommendations } from '@/lib/decisionEngine';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { priorityConfig } from '@/lib/status';
import { cn } from '@/lib/utils';

export function AllocationEnginePage() {
  const { products, orders, orderItems, decisionRules, loading } = useWarehouseData();
  const [selected, setSelected] = useState<string | null>(null);

  const recommendations = useMemo(
    () => computeAllocationRecommendations(products, orders, orderItems, decisionRules),
    [products, orders, orderItems, decisionRules],
  );

  if (loading) return <PageLoader label="Loading decision engine…" />;

  const conflicts = recommendations.filter((r) => r.conflict);
  const clean = recommendations.filter((r) => !r.conflict);
  const selectedRec = recommendations.find((r) => r.orderId === selected);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Allocation Decision Engine</h1>
        <p className="text-sm text-ink-500 mt-1">Analyzes inventory, competing orders, and priority to recommend optimal allocation</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-ink-500">Total Recommendations</p>
          <p className="text-2xl font-semibold font-display text-ink-900 mt-1">{recommendations.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink-500">Conflicts Detected</p>
          <p className="text-2xl font-semibold font-display text-error-600 mt-1">{conflicts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink-500">Can Fulfill</p>
          <p className="text-2xl font-semibold font-display text-success-600 mt-1">{recommendations.filter((r) => r.canFulfill).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink-500">Partial / Backorder</p>
          <p className="text-2xl font-semibold font-display text-warning-600 mt-1">{recommendations.filter((r) => !r.canFulfill).length}</p>
        </Card>
      </div>

      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-error-500" />
              <CardTitle>Allocation Conflicts ({conflicts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {conflicts.map((rec) => (
              <div
                key={rec.orderId + rec.productSku}
                className={cn(
                  'p-4 rounded-lg border cursor-pointer transition-colors',
                  selected === rec.orderId ? 'border-primary-400 bg-primary-50/30' : 'border-ink-200 hover:border-ink-300',
                )}
                onClick={() => setSelected(selected === rec.orderId ? null : rec.orderId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={priorityConfig[rec.priority].tone} variant="soft" dot>{priorityConfig[rec.priority].label}</Badge>
                    <span className="text-sm font-medium text-ink-900">{rec.orderNumber}</span>
                    <span className="text-xs text-ink-500">Score: {rec.priorityScore}</span>
                  </div>
                  <Badge tone="error" variant="soft">Conflict</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div><span className="text-ink-500">SKU:</span> <span className="font-mono text-xs">{rec.productSku}</span></div>
                  <div><span className="text-ink-500">Requested:</span> <span className="font-medium">{rec.requested}</span></div>
                  <div><span className="text-ink-500">Available:</span> <span className="font-medium text-error-600">{rec.available}</span></div>
                </div>
                <div className="p-3 rounded-lg bg-primary-50/50 border border-primary-100">
                  <p className="text-xs font-semibold text-primary-700 mb-1">Recommendation</p>
                  <p className="text-sm text-ink-700">{rec.recommendation}</p>
                </div>
                <div className="mt-2 p-3 rounded-lg bg-ink-50 border border-ink-200">
                  <p className="text-xs font-semibold text-ink-600 mb-1">Expected Impact</p>
                  <p className="text-sm text-ink-600">{rec.impact}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-ink-600 mb-1">Reasoning</p>
                  <ul className="space-y-0.5">
                    {rec.reasoning.map((r, i) => (
                      <li key={i} className="text-xs text-ink-500 flex gap-1.5">
                        <span className="text-primary-500">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
                {rec.competingOrders.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-ink-600 mb-1">Competing Orders</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.competingOrders.map((c) => (
                        <Badge key={c.orderNumber} tone="neutral" variant="outline">
                          {c.orderNumber} ({c.priorityScore})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="success"><CheckCircle2 className="h-3.5 w-3.5" /> Accept</Button>
                  <Button size="sm" variant="outline">Override</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {clean.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success-500" />
              <CardTitle>Standard Allocations ({clean.length})</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {clean.map((rec) => (
              <div key={rec.orderId + rec.productSku} className="flex items-center justify-between p-3 rounded-lg border border-ink-200">
                <div className="flex items-center gap-3">
                  <Badge tone={priorityConfig[rec.priority].tone} variant="soft" dot>{priorityConfig[rec.priority].label}</Badge>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{rec.orderNumber}</p>
                    <p className="text-xs text-ink-500">{rec.productSku} — {rec.requested} units</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="success" variant="soft" dot>Fully Available</Badge>
                  <Button size="sm" variant="success"><CheckCircle2 className="h-3.5 w-3.5" /> Allocate</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {recommendations.length === 0 && (
        <EmptyState icon={<Split className="h-7 w-7" />} title="No allocations needed" description="All active orders have been allocated." />
      )}
    </div>
  );
}
