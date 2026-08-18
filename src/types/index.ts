export type OrderStatus =
  | 'created'
  | 'prioritized'
  | 'allocated'
  | 'picking'
  | 'packing'
  | 'qc'
  | 'dispatched'
  | 'cancelled';

export type OrderPriority = 'urgent' | 'high' | 'standard' | 'low';

export type PickTaskStatus = 'pending' | 'in_progress' | 'completed' | 'paused' | 'missing' | 'damaged';

export type QcStatus = 'pending' | 'passed' | 'held' | 'failed';

export type DispatchStatus = 'ready' | 'qc_pending' | 'at_risk' | 'dispatched';

export type ExceptionStatus = 'open' | 'resolved' | 'escalated' | 'dismissed';
export type ExceptionType =
  | 'missing_item'
  | 'damaged_item'
  | 'stock_mismatch'
  | 'allocation_conflict'
  | 'picking_delay'
  | 'packing_failure'
  | 'qc_failure'
  | 'dispatch_risk';

export type ZoneId = 'A' | 'B' | 'C' | 'D';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  on_hand: number;
  reserved: number;
  available: number;
  safety_stock: number;
  reorder_point: number;
  reorder_qty: number;
  unit_cost: number;
  zone: ZoneId;
  location: string;
  damaged: number;
  lead_time_days: number;
  daily_velocity: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_priority: 'vip' | 'standard';
  status: OrderStatus;
  priority: OrderPriority;
  priority_score: number;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
  total_value: number;
  notes: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  quantity: number;
  allocated_qty: number;
  unit_price: number;
  zone: ZoneId;
  location: string;
}

export interface PickTask {
  id: string;
  order_id: string;
  order_number: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  quantity: number;
  zone: ZoneId;
  location: string;
  status: PickTaskStatus;
  picker: string | null;
  sequence: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface QcRecord {
  id: string;
  order_id: string;
  order_number: string;
  status: QcStatus;
  inspector: string | null;
  checked_items: number;
  total_items: number;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface DispatchRecord {
  id: string;
  order_id: string;
  order_number: string;
  carrier: string;
  tracking_number: string | null;
  status: DispatchStatus;
  cutoff_time: string;
  dispatched_at: string | null;
  created_at: string;
}

export interface Exception {
  id: string;
  type: ExceptionType;
  status: ExceptionStatus;
  title: string;
  description: string;
  order_id: string | null;
  order_number: string | null;
  product_id: string | null;
  product_sku: string | null;
  recommendation: string;
  impact: string;
  created_at: string;
  resolved_at: string | null;
  resolution: string | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  recommendation: string | null;
  decision: string;
  user_email: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DecisionRule {
  id: string;
  rule_key: string;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  category: string;
}

export interface WarehouseZone {
  id: ZoneId;
  name: string;
  total_skus: number;
  pending_picks: number;
  avg_pick_time_min: number;
  utilization: number;
}

export interface AllocationRecommendation {
  orderId: string;
  orderNumber: string;
  priority: OrderPriority;
  priorityScore: number;
  productSku: string;
  productName: string;
  requested: number;
  available: number;
  canFulfill: boolean;
  allocated: number;
  conflict: boolean;
  competingOrders: Array<{
    orderNumber: string;
    priority: OrderPriority;
    priorityScore: number;
    requested: number;
  }>;
  reasoning: string[];
  impact: string;
  recommendation: string;
}

export interface ReplenishmentRecommendation {
  productId: string;
  sku: string;
  name: string;
  onHand: number;
  available: number;
  safetyStock: number;
  reorderPoint: number;
  runwayDays: number;
  recommendedQty: number;
  reasoning: string[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface BottleneckFinding {
  zone: ZoneId;
  metric: string;
  currentValue: string;
  baseline: string;
  deviationPct: number;
  description: string;
  recommendation: string;
  expectedImpact: string;
  severity: 'high' | 'medium' | 'low';
}
