import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type {
  Product, Order, OrderItem, PickTask, QcRecord,
  DispatchRecord, Exception, AuditEntry, DecisionRule, WarehouseZone,
} from '@/types';

export function useWarehouseData() {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pickTasks, setPickTasks] = useState<PickTask[]>([]);
  const [qcRecords, setQcRecords] = useState<QcRecord[]>([]);
  const [dispatchRecords, setDispatchRecords] = useState<DispatchRecord[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [decisionRules, setDecisionRules] = useState<DecisionRule[]>([]);
  const [warehouseZones, setWarehouseZones] = useState<WarehouseZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const [
        { data: p, error: pe },
        { data: o, error: oe },
        { data: oi, error: oie },
        { data: pt, error: pte },
        { data: qc, error: qce },
        { data: dr, error: dre },
        { data: ex, error: exe },
        { data: au, error: aue },
        { data: ru, error: rue },
        { data: wz, error: wze },
      ] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('order_items').select('*'),
        supabase.from('pick_tasks').select('*').order('sequence'),
        supabase.from('qc_records').select('*').order('created_at', { ascending: false }),
        supabase.from('dispatch_records').select('*').order('created_at', { ascending: false }),
        supabase.from('exceptions').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('decision_rules').select('*').order('category'),
        supabase.from('warehouse_zones').select('*').order('id'),
      ]);

      if (pe || oe || oie || pte || qce || dre || exe || aue || rue || wze) {
        throw new Error('Failed to load warehouse data');
      }

      setProducts(p as Product[]);
      setOrders(o as Order[]);
      setOrderItems(oi as OrderItem[]);
      setPickTasks(pt as PickTask[]);
      setQcRecords(qc as QcRecord[]);
      setDispatchRecords(dr as DispatchRecord[]);
      setExceptions(ex as Exception[]);
      setAuditEntries(au as AuditEntry[]);
      setDecisionRules(ru as DecisionRule[]);
      setWarehouseZones(wz as WarehouseZone[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [session]);

  return {
    products, orders, orderItems, pickTasks, qcRecords,
    dispatchRecords, exceptions, auditEntries, decisionRules, warehouseZones,
    loading, error, reload: loadAll,
    setProducts, setOrders, setOrderItems, setPickTasks, setQcRecords,
    setDispatchRecords, setExceptions, setAuditEntries, setDecisionRules, setWarehouseZones,
  };
}
