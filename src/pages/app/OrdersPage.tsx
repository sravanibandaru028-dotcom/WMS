import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, Plus } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { orderStatusConfig, priorityConfig } from '@/lib/status';
import { formatCurrency, timeUntil, isOverdue, cn } from '@/lib/utils';
import type { OrderStatus, OrderPriority } from '@/types';

export function OrdersPage() {
  const { orders, loading } = useWarehouseData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = !search ||
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || o.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [orders, search, statusFilter, priorityFilter]);

  if (loading) return <PageLoader label="Loading orders…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900">Orders</h1>
          <p className="text-sm text-ink-500 mt-1">{orders.length} total orders</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search by order number or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-9"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
              <option value="all">All Statuses</option>
              <option value="created">Created</option>
              <option value="prioritized">Prioritized</option>
              <option value="allocated">Allocated</option>
              <option value="picking">Picking</option>
              <option value="packing">Packing</option>
              <option value="qc">QC</option>
              <option value="dispatched">Dispatched</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="sm:w-40">
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="standard">Standard</option>
              <option value="low">Low</option>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Package className="h-7 w-7" />} title="No orders found" description="Try adjusting your filters." />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH>Priority</TH>
                  <TH>Status</TH>
                  <TH>SLA Deadline</TH>
                  <TH className="text-right">Value</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((order) => (
                  <TR key={order.id} className="cursor-pointer" onClick={() => navigate(`/app/orders/${order.id}`)}>
                    <TD>
                      <Link to={`/app/orders/${order.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                        {order.order_number}
                      </Link>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <span>{order.customer_name}</span>
                        {order.customer_priority === 'vip' && <Badge tone="accent" variant="solid">VIP</Badge>}
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={priorityConfig[order.priority].tone} variant="soft" dot>
                        {priorityConfig[order.priority].label}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone={orderStatusConfig[order.status].tone} variant="soft">
                        {orderStatusConfig[order.status].label}
                      </Badge>
                    </TD>
                    <TD>
                      <span className={cn('text-sm', isOverdue(order.sla_deadline) ? 'text-error-600 font-medium' : 'text-ink-600')}>
                        {timeUntil(order.sla_deadline)}
                      </span>
                    </TD>
                    <TD className="text-right font-medium text-ink-900">{formatCurrency(order.total_value)}</TD>
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
