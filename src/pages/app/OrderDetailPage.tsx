import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowLeft, Package, Clock, User, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { orderStatusConfig, priorityConfig, orderStatusFlow, orderProgress } from '@/lib/status';
import { formatCurrency, formatDateTime, timeUntil, isOverdue, cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { orders, orderItems, pickTasks, qcRecords, dispatchRecords, exceptions, loading } = useWarehouseData();
  const navigate = useNavigate();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const items = useMemo(() => orderItems.filter((oi) => oi.order_id === id), [orderItems, id]);
  const picks = useMemo(() => pickTasks.filter((pt) => pt.order_id === id), [pickTasks, id]);
  const qc = useMemo(() => qcRecords.find((q) => q.order_id === id), [qcRecords, id]);
  const dispatch = useMemo(() => dispatchRecords.find((d) => d.order_id === id), [dispatchRecords, id]);
  const orderExceptions = useMemo(() => exceptions.filter((e) => e.order_id === id), [exceptions, id]);

  if (loading) return <PageLoader label="Loading order…" />;
  if (!order) {
    return (
      <EmptyState
        icon={<Package className="h-7 w-7" />}
        title="Order not found"
        action={<Button onClick={() => navigate('/app/orders')}>Back to Orders</Button>}
      />
    );
  }

  const progress = orderProgress(order.status);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/app/orders" className="text-ink-400 hover:text-ink-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-ink-900">{order.order_number}</h1>
            <Badge tone={priorityConfig[order.priority].tone} variant="soft" dot>
              {priorityConfig[order.priority].label}
            </Badge>
            <Badge tone={orderStatusConfig[order.status].tone} variant="soft">
              {orderStatusConfig[order.status].label}
            </Badge>
            {order.customer_priority === 'vip' && <Badge tone="accent" variant="solid">VIP</Badge>}
          </div>
          <p className="text-sm text-ink-500 mt-1">{order.customer_name}</p>
        </div>
      </div>

      {/* Progress bar */}
      {order.status !== 'cancelled' && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-ink-700">Fulfillment Progress</span>
              <span className="text-sm text-ink-500">{progress}%</span>
            </div>
            <div className="flex items-center gap-1">
              {orderStatusFlow.map((status, i) => {
                const currentIdx = orderStatusFlow.indexOf(order.status as OrderStatus);
                const isComplete = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={status} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                        isComplete ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-400',
                        isCurrent && 'ring-2 ring-primary-500/30 ring-offset-2',
                      )}>
                        {isComplete && !isCurrent ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={cn('text-[10px] font-medium', isComplete ? 'text-ink-700' : 'text-ink-400')}>
                        {orderStatusConfig[status].label}
                      </span>
                    </div>
                    {i < orderStatusFlow.length - 1 && (
                      <div className={cn('h-0.5 flex-1 mx-1 transition-colors', i < currentIdx ? 'bg-primary-600' : 'bg-ink-200')} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-ink-400" />
              <span className="text-ink-500">SLA Deadline:</span>
              <span className={cn('font-medium', isOverdue(order.sla_deadline) ? 'text-error-600' : 'text-ink-900')}>
                {timeUntil(order.sla_deadline)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="h-4 w-4 text-ink-400" />
              <span className="text-ink-500">Total Value:</span>
              <span className="font-medium text-ink-900">{formatCurrency(order.total_value)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-ink-400" />
              <span className="text-ink-500">Customer:</span>
              <span className="font-medium text-ink-900">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-ink-400" />
              <span className="text-ink-500">Created:</span>
              <span className="font-medium text-ink-900">{formatDateTime(order.created_at)}</span>
            </div>
            {order.notes && (
              <div className="pt-2 border-t border-ink-100">
                <p className="text-xs text-ink-500 mb-1">Notes</p>
                <p className="text-sm text-ink-700">{order.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Order Items */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Line Items ({items.length})</CardTitle></CardHeader>
          <CardBody>
            <Table>
              <THead>
                <TR>
                  <TH>SKU</TH>
                  <TH>Product</TH>
                  <TH className="text-right">Requested</TH>
                  <TH className="text-right">Allocated</TH>
                  <TH>Zone</TH>
                  <TH className="text-right">Price</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((item) => (
                  <TR key={item.id}>
                    <TD className="font-mono text-xs">{item.product_sku}</TD>
                    <TD className="font-medium">{item.product_name}</TD>
                    <TD className="text-right">{item.quantity}</TD>
                    <TD className="text-right">
                      <span className={cn(
                        'font-medium',
                        item.allocated_qty === item.quantity ? 'text-success-600' : item.allocated_qty === 0 ? 'text-error-600' : 'text-warning-600',
                      )}>
                        {item.allocated_qty}
                      </span>
                    </TD>
                    <TD><Badge tone="neutral" variant="outline">{item.zone}</Badge></TD>
                    <TD className="text-right">{formatCurrency(item.unit_price)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Exceptions */}
      {orderExceptions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-error-500" />
              <CardTitle>Exceptions ({orderExceptions.length})</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {orderExceptions.map((exc) => (
              <div key={exc.id} className="p-3 rounded-lg border border-error-200 bg-error-50/50">
                <p className="text-sm font-medium text-ink-900">{exc.title}</p>
                <p className="text-sm text-ink-600 mt-1">{exc.description}</p>
                <div className="mt-2 p-2 rounded-lg bg-white border border-ink-200">
                  <p className="text-xs font-medium text-primary-700">Recommendation:</p>
                  <p className="text-sm text-ink-700 mt-0.5">{exc.recommendation}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Dispatch Info */}
      {dispatch && (
        <Card>
          <CardHeader><CardTitle>Dispatch Information</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-ink-500">Carrier</p>
              <p className="font-medium text-ink-900">{dispatch.carrier}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Tracking</p>
              <p className="font-medium text-ink-900">{dispatch.tracking_number || 'Pending'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Cutoff</p>
              <p className="font-medium text-ink-900">{timeUntil(dispatch.cutoff_time)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Status</p>
              <Badge tone={dispatch.status === 'dispatched' ? 'success' : dispatch.status === 'at_risk' ? 'error' : 'warning'} variant="soft">
                {dispatch.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
