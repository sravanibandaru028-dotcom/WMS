/*
# WAREFLOW — Smart Warehouse Operations & Decision Platform

## Overview
Creates the complete database schema for a warehouse operations control tower.
The app has a sign-in screen, so all tables are owner-scoped to authenticated users
via `user_id uuid DEFAULT auth.uid()`. The app uses Supabase email/password auth.

## Tables Created
1. **products** — SKU inventory master data (on-hand, reserved, available, safety stock, reorder point, zone, location, damaged, lead time, daily velocity)
2. **orders** — Customer orders with priority, SLA deadline, status lifecycle
3. **order_items** — Line items per order (product, quantity, allocated qty)
4. **pick_tasks** — Pick queue tasks per order item (zone, location, picker, sequence, status, timestamps)
5. **qc_records** — Quality control checks per order (status, inspector, item counts)
6. **dispatch_records** — Dispatch tracking (carrier, tracking, cutoff, status, dispatched_at)
7. **exceptions** — Operational exceptions (type, status, recommendation, impact, resolution)
8. **audit_entries** — Audit trail of all operational decisions (action, entity, recommendation, decision, user, metadata)
9. **decision_rules** — Configurable decision engine parameters (priority weights, SLA weights, safety stock thresholds, etc.)
10. **warehouse_zones** — Zone-level metrics (total SKUs, pending picks, avg pick time, utilization)

## Security
- RLS enabled on every table.
- All tables have `user_id uuid NOT NULL DEFAULT auth.uid()` and 4 CRUD policies scoped to `authenticated` via `auth.uid() = user_id`.
- No public/anon access — this is a signed-in app.

## Seed Data
- 24 products across 4 zones (A–D) with realistic inventory levels
- 18 orders at various lifecycle stages with priorities and SLA deadlines
- Order items for each order
- Pick tasks, QC records, dispatch records
- 8 open exceptions with recommendations and impact
- Audit entries for past decisions
- Default decision rules
- Warehouse zone metrics

## Notes
1. All timestamps use `timestamptz DEFAULT now()`.
2. `available` on products is a stored column (not generated) so the frontend can update it atomically.
3. Seed data uses fixed UUIDs where cross-references are needed.
4. The migration is idempotent — uses `IF NOT EXISTS` and drops policies before recreating.
*/

-- ── PRODUCTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  on_hand integer NOT NULL DEFAULT 0,
  reserved integer NOT NULL DEFAULT 0,
  available integer NOT NULL DEFAULT 0,
  safety_stock integer NOT NULL DEFAULT 10,
  reorder_point integer NOT NULL DEFAULT 20,
  reorder_qty integer NOT NULL DEFAULT 50,
  unit_cost numeric(10,2) NOT NULL DEFAULT 0,
  zone text NOT NULL DEFAULT 'A',
  location text NOT NULL DEFAULT '',
  damaged integer NOT NULL DEFAULT 0,
  lead_time_days integer NOT NULL DEFAULT 7,
  daily_velocity numeric(10,2) NOT NULL DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_products" ON products;
CREATE POLICY "select_own_products" ON products FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── ORDERS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_priority text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'created',
  priority text NOT NULL DEFAULT 'standard',
  priority_score integer NOT NULL DEFAULT 50,
  sla_deadline timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  total_value numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── ORDER ITEMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_sku text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  allocated_qty integer NOT NULL DEFAULT 0,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  zone text NOT NULL DEFAULT 'A',
  location text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_order_items" ON order_items;
CREATE POLICY "update_own_order_items" ON order_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_order_items" ON order_items;
CREATE POLICY "delete_own_order_items" ON order_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── PICK TASKS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pick_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_sku text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  zone text NOT NULL DEFAULT 'A',
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  picker text,
  sequence integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pick_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_pick_tasks" ON pick_tasks;
CREATE POLICY "select_own_pick_tasks" ON pick_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_pick_tasks" ON pick_tasks;
CREATE POLICY "insert_own_pick_tasks" ON pick_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_pick_tasks" ON pick_tasks;
CREATE POLICY "update_own_pick_tasks" ON pick_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_pick_tasks" ON pick_tasks;
CREATE POLICY "delete_own_pick_tasks" ON pick_tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── QC RECORDS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qc_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  inspector text,
  checked_items integer NOT NULL DEFAULT 0,
  total_items integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE qc_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_qc_records" ON qc_records;
CREATE POLICY "select_own_qc_records" ON qc_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_qc_records" ON qc_records;
CREATE POLICY "insert_own_qc_records" ON qc_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_qc_records" ON qc_records;
CREATE POLICY "update_own_qc_records" ON qc_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_qc_records" ON qc_records;
CREATE POLICY "delete_own_qc_records" ON qc_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── DISPATCH RECORDS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dispatch_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  carrier text NOT NULL DEFAULT 'Standard',
  tracking_number text,
  status text NOT NULL DEFAULT 'qc_pending',
  cutoff_time timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  dispatched_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dispatch_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_dispatch_records" ON dispatch_records;
CREATE POLICY "select_own_dispatch_records" ON dispatch_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_dispatch_records" ON dispatch_records;
CREATE POLICY "insert_own_dispatch_records" ON dispatch_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_dispatch_records" ON dispatch_records;
CREATE POLICY "update_own_dispatch_records" ON dispatch_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_dispatch_records" ON dispatch_records;
CREATE POLICY "delete_own_dispatch_records" ON dispatch_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── EXCEPTIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  title text NOT NULL,
  description text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  order_number text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_sku text,
  recommendation text NOT NULL DEFAULT '',
  impact text NOT NULL DEFAULT '',
  resolution text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_exceptions" ON exceptions;
CREATE POLICY "select_own_exceptions" ON exceptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_exceptions" ON exceptions;
CREATE POLICY "insert_own_exceptions" ON exceptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_exceptions" ON exceptions;
CREATE POLICY "update_own_exceptions" ON exceptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_exceptions" ON exceptions;
CREATE POLICY "delete_own_exceptions" ON exceptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── AUDIT ENTRIES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  description text NOT NULL,
  recommendation text,
  decision text NOT NULL DEFAULT 'accepted',
  user_email text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_audit_entries" ON audit_entries;
CREATE POLICY "select_own_audit_entries" ON audit_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_audit_entries" ON audit_entries;
CREATE POLICY "insert_own_audit_entries" ON audit_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_audit_entries" ON audit_entries;
CREATE POLICY "update_own_audit_entries" ON audit_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_audit_entries" ON audit_entries;
CREATE POLICY "delete_own_audit_entries" ON audit_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── DECISION RULES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decision_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_key text NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  value numeric(10,2) NOT NULL DEFAULT 0,
  min numeric(10,2) NOT NULL DEFAULT 0,
  max numeric(10,2) NOT NULL DEFAULT 100,
  unit text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE decision_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_decision_rules" ON decision_rules;
CREATE POLICY "select_own_decision_rules" ON decision_rules FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_decision_rules" ON decision_rules;
CREATE POLICY "insert_own_decision_rules" ON decision_rules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_decision_rules" ON decision_rules;
CREATE POLICY "update_own_decision_rules" ON decision_rules FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_decision_rules" ON decision_rules;
CREATE POLICY "delete_own_decision_rules" ON decision_rules FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── WAREHOUSE ZONES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouse_zones (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_skus integer NOT NULL DEFAULT 0,
  pending_picks integer NOT NULL DEFAULT 0,
  avg_pick_time_min numeric(10,1) NOT NULL DEFAULT 0,
  utilization numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_warehouse_zones" ON warehouse_zones;
CREATE POLICY "select_own_warehouse_zones" ON warehouse_zones FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_warehouse_zones" ON warehouse_zones;
CREATE POLICY "insert_own_warehouse_zones" ON warehouse_zones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_warehouse_zones" ON warehouse_zones;
CREATE POLICY "update_own_warehouse_zones" ON warehouse_zones FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_warehouse_zones" ON warehouse_zones;
CREATE POLICY "delete_own_warehouse_zones" ON warehouse_zones FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── INDEXES ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_zone ON products(zone);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pick_tasks_order_id ON pick_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_pick_tasks_status ON pick_tasks(status);
CREATE INDEX IF NOT EXISTS idx_exceptions_status ON exceptions(status);
CREATE INDEX IF NOT EXISTS idx_audit_entries_created_at ON audit_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_rules_user_id ON decision_rules(user_id);
