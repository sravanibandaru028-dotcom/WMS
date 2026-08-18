import type {
  OrderStatus,
  OrderPriority,
  PickTaskStatus,
  QcStatus,
  DispatchStatus,
  ExceptionStatus,
  ExceptionType,
} from '@/types';

type Tone = 'neutral' | 'primary' | 'info' | 'accent' | 'success' | 'warning' | 'error';

export const orderStatusConfig: Record<OrderStatus, { label: string; tone: Tone }> = {
  created: { label: 'Created', tone: 'neutral' },
  prioritized: { label: 'Prioritized', tone: 'info' },
  allocated: { label: 'Allocated', tone: 'primary' },
  picking: { label: 'Picking', tone: 'accent' },
  packing: { label: 'Packing', tone: 'accent' },
  qc: { label: 'QC', tone: 'warning' },
  dispatched: { label: 'Dispatched', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'error' },
};

export const priorityConfig: Record<OrderPriority, { label: string; tone: Tone }> = {
  urgent: { label: 'Urgent', tone: 'error' },
  high: { label: 'High', tone: 'warning' },
  standard: { label: 'Standard', tone: 'info' },
  low: { label: 'Low', tone: 'neutral' },
};

export const pickStatusConfig: Record<PickTaskStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'neutral' },
  in_progress: { label: 'In Progress', tone: 'primary' },
  completed: { label: 'Completed', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
  missing: { label: 'Missing', tone: 'error' },
  damaged: { label: 'Damaged', tone: 'error' },
};

export const qcStatusConfig: Record<QcStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'neutral' },
  passed: { label: 'Passed', tone: 'success' },
  held: { label: 'Held', tone: 'warning' },
  failed: { label: 'Failed', tone: 'error' },
};

export const dispatchStatusConfig: Record<DispatchStatus, { label: string; tone: Tone }> = {
  ready: { label: 'Ready', tone: 'success' },
  qc_pending: { label: 'QC Pending', tone: 'warning' },
  at_risk: { label: 'At Risk', tone: 'error' },
  dispatched: { label: 'Dispatched', tone: 'neutral' },
};

export const exceptionStatusConfig: Record<ExceptionStatus, { label: string; tone: Tone }> = {
  open: { label: 'Open', tone: 'error' },
  resolved: { label: 'Resolved', tone: 'success' },
  escalated: { label: 'Escalated', tone: 'warning' },
  dismissed: { label: 'Dismissed', tone: 'neutral' },
};

export const exceptionTypeConfig: Record<ExceptionType, { label: string; tone: Tone }> = {
  missing_item: { label: 'Missing Item', tone: 'error' },
  damaged_item: { label: 'Damaged Item', tone: 'error' },
  stock_mismatch: { label: 'Stock Mismatch', tone: 'warning' },
  allocation_conflict: { label: 'Allocation Conflict', tone: 'warning' },
  picking_delay: { label: 'Picking Delay', tone: 'warning' },
  packing_failure: { label: 'Packing Failure', tone: 'warning' },
  qc_failure: { label: 'QC Failure', tone: 'error' },
  dispatch_risk: { label: 'Dispatch Risk', tone: 'error' },
};

export const orderStatusFlow: OrderStatus[] = [
  'created',
  'prioritized',
  'allocated',
  'picking',
  'packing',
  'qc',
  'dispatched',
];

export function orderProgress(status: OrderStatus): number {
  if (status === 'cancelled') return 0;
  const idx = orderStatusFlow.indexOf(status);
  return idx === -1 ? 0 : Math.round((idx / (orderStatusFlow.length - 1)) * 100);
}
