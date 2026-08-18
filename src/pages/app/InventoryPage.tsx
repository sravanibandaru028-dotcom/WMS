import { useState, useMemo } from 'react';
import { Boxes, Search, TrendingDown, AlertTriangle, Package } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { computeReplenishmentRecommendations } from '@/lib/decisionEngine';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { Alert } from '@/components/ui/Alert';
import { formatCurrency, cn } from '@/lib/utils';

export function InventoryPage() {
  const { products, decisionRules, loading } = useWarehouseData();
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const replenishments = useMemo(
    () => computeReplenishmentRecommendations(products, decisionRules),
    [products, decisionRules],
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.sku.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
      const matchZone = zoneFilter === 'all' || p.zone === zoneFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'out' && p.available <= 0) ||
        (statusFilter === 'low' && p.available > 0 && p.available <= p.reorder_point) ||
        (statusFilter === 'ok' && p.available > p.reorder_point);
      return matchSearch && matchZone && matchStatus;
    });
  }, [products, search, zoneFilter, statusFilter]);

  if (loading) return <PageLoader label="Loading inventory…" />;

  const outOfStock = products.filter((p) => p.available <= 0);
  const lowStock = products.filter((p) => p.available > 0 && p.available <= p.reorder_point);
  const totalValue = products.reduce((sum, p) => sum + p.on_hand * Number(p.unit_cost), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Inventory</h1>
        <p className="text-sm text-ink-500 mt-1">{products.length} SKUs across 4 zones</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SKUs" value={products.length} icon={<Package className="h-5 w-5" />} tone="primary" />
        <StatCard label="Out of Stock" value={outOfStock.length} icon={<AlertTriangle className="h-5 w-5" />} tone={outOfStock.length > 0 ? 'error' : 'neutral'} />
        <StatCard label="Low Stock" value={lowStock.length} icon={<TrendingDown className="h-5 w-5" />} tone={lowStock.length > 0 ? 'warning' : 'neutral'} />
        <StatCard label="Inventory Value" value={formatCurrency(totalValue)} icon={<Boxes className="h-5 w-5" />} tone="info" />
      </div>

      {/* Replenishment Recommendations */}
      {replenishments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-error-500" />
              <CardTitle>Replenishment Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {replenishments.map((rec) => (
              <div key={rec.productId} className="p-4 rounded-lg border border-ink-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-500">{rec.sku}</span>
                    <span className="text-sm font-medium text-ink-900">{rec.name}</span>
                  </div>
                  <Badge
                    tone={rec.urgency === 'critical' ? 'error' : rec.urgency === 'high' ? 'warning' : 'info'}
                    variant="solid"
                  >
                    {rec.urgency}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-2">
                  <div><span className="text-ink-500">Available:</span> <span className="font-medium text-ink-900">{rec.available}</span></div>
                  <div><span className="text-ink-500">Safety stock:</span> <span className="font-medium text-ink-900">{rec.safetyStock}</span></div>
                  <div><span className="text-ink-500">Runway:</span> <span className="font-medium text-ink-900">{rec.runwayDays}d</span></div>
                  <div><span className="text-ink-500">Reorder qty:</span> <span className="font-medium text-primary-600">{rec.recommendedQty}</span></div>
                </div>
                <div className="p-2 rounded-lg bg-primary-50/50 border border-primary-100">
                  <p className="text-xs font-medium text-primary-700">Why:</p>
                  <ul className="mt-1 space-y-0.5">
                    {rec.reasoning.map((r, i) => (
                      <li key={i} className="text-xs text-ink-600">{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search by SKU or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-9"
              />
            </div>
            <Select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="sm:w-36">
              <option value="all">All Zones</option>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
              <option value="D">Zone D</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-36">
              <option value="all">All Status</option>
              <option value="ok">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Boxes className="h-7 w-7" />} title="No products found" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>SKU</TH>
                  <TH>Product</TH>
                  <TH>Category</TH>
                  <TH className="text-right">On Hand</TH>
                  <TH className="text-right">Available</TH>
                  <TH className="text-right">Reorder Pt</TH>
                  <TH>Zone</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((p) => {
                  const status = p.available <= 0 ? 'out' : p.available <= p.reorder_point ? 'low' : 'ok';
                  return (
                    <TR key={p.id}>
                      <TD className="font-mono text-xs">{p.sku}</TD>
                      <TD className="font-medium">{p.name}</TD>
                      <TD className="text-ink-500">{p.category}</TD>
                      <TD className="text-right">{p.on_hand}</TD>
                      <TD className={cn('text-right font-medium', status === 'out' ? 'text-error-600' : status === 'low' ? 'text-warning-600' : 'text-ink-900')}>
                        {p.available}
                      </TD>
                      <TD className="text-right text-ink-500">{p.reorder_point}</TD>
                      <TD><Badge tone="neutral" variant="outline">{p.zone}</Badge></TD>
                      <TD>
                        {status === 'out' && <Badge tone="error" variant="soft" dot>Out of Stock</Badge>}
                        {status === 'low' && <Badge tone="warning" variant="soft" dot>Low Stock</Badge>}
                        {status === 'ok' && <Badge tone="success" variant="soft" dot>In Stock</Badge>}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
