import { useMemo } from 'react';
import { PackageCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { qcStatusConfig } from '@/lib/status';

export function PackingQcPage() {
  const { orders, qcRecords, orderItems, loading } = useWarehouseData();

  const packingOrders = useMemo(() => orders.filter((o) => o.status === 'packing'), [orders]);
  const qcOrders = useMemo(() => orders.filter((o) => o.status === 'qc'), [orders]);

  if (loading) return <PageLoader label="Loading packing & QC…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Packing & Quality Control</h1>
        <p className="text-sm text-ink-500 mt-1">Verify picked items, pack, and pass QC before dispatch</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Packing" value={packingOrders.length} icon={<PackageCheck className="h-5 w-5" />} tone="primary" />
        <StatCard label="QC Pending" value={qcRecords.filter((q) => q.status === 'pending').length} icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
        <StatCard label="QC Passed" value={qcRecords.filter((q) => q.status === 'passed').length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label="QC Failed" value={qcRecords.filter((q) => q.status === 'failed').length} icon={<XCircle className="h-5 w-5" />} tone="error" />
      </div>

      {/* Packing Station */}
      <Card>
        <CardHeader><CardTitle>Packing Station ({packingOrders.length})</CardTitle></CardHeader>
        <CardBody>
          {packingOrders.length === 0 ? (
            <EmptyState icon={<PackageCheck className="h-7 w-7" />} title="No orders in packing" />
          ) : (
            <div className="space-y-3">
              {packingOrders.map((order) => {
                const items = orderItems.filter((oi) => oi.order_id === order.id);
                return (
                  <div key={order.id} className="p-4 rounded-lg border border-ink-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{order.order_number}</p>
                        <p className="text-xs text-ink-500">{order.customer_name}</p>
                      </div>
                      <Button size="sm" variant="success"><CheckCircle2 className="h-3.5 w-3.5" /> Mark Packed</Button>
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-ink-700">{item.product_name}</span>
                          <Badge tone="success" variant="soft">{item.allocated_qty} picked</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* QC Queue */}
      <Card>
        <CardHeader><CardTitle>Quality Control Queue</CardTitle></CardHeader>
        <CardBody>
          {qcRecords.length === 0 ? (
            <EmptyState icon={<PackageCheck className="h-7 w-7" />} title="No QC records" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Items Checked</TH>
                  <TH>Inspector</TH>
                  <TH>Status</TH>
                  <TH>Notes</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {qcRecords.map((qc) => (
                  <TR key={qc.id}>
                    <TD className="font-medium text-primary-600">{qc.order_number}</TD>
                    <TD>{qc.checked_items} / {qc.total_items}</TD>
                    <TD className="text-sm">{qc.inspector || '—'}</TD>
                    <TD>
                      <Badge tone={qcStatusConfig[qc.status].tone} variant="soft" dot>
                        {qcStatusConfig[qc.status].label}
                      </Badge>
                    </TD>
                    <TD className="text-xs text-ink-500 max-w-xs truncate">{qc.notes || '—'}</TD>
                    <TD>
                      {qc.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="success"><CheckCircle2 className="h-3.5 w-3.5" /> Pass</Button>
                          <Button size="sm" variant="warning">Hold</Button>
                          <Button size="sm" variant="danger"><XCircle className="h-3.5 w-3.5" /> Fail</Button>
                        </div>
                      )}
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
