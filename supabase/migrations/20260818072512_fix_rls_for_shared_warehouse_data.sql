-- WAREFLOW is a shared warehouse management system — all authenticated operators
-- see and manage the same warehouse data (not per-user data).
-- Drop the per-user ownership policies and replace with shared-access policies.

-- products
DROP POLICY IF EXISTS select_own_products ON products;
DROP POLICY IF EXISTS insert_own_products ON products;
DROP POLICY IF EXISTS update_own_products ON products;
DROP POLICY IF EXISTS delete_own_products ON products;
CREATE POLICY "select_products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_products" ON products FOR DELETE TO authenticated USING (true);

-- orders
DROP POLICY IF EXISTS select_own_orders ON orders;
DROP POLICY IF EXISTS insert_own_orders ON orders;
DROP POLICY IF EXISTS update_own_orders ON orders;
DROP POLICY IF EXISTS delete_own_orders ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_orders" ON orders FOR DELETE TO authenticated USING (true);

-- order_items
DROP POLICY IF EXISTS select_own_order_items ON order_items;
DROP POLICY IF EXISTS insert_own_order_items ON order_items;
DROP POLICY IF EXISTS update_own_order_items ON order_items;
DROP POLICY IF EXISTS delete_own_order_items ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_order_items" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_order_items" ON order_items FOR DELETE TO authenticated USING (true);

-- pick_tasks
DROP POLICY IF EXISTS select_own_pick_tasks ON pick_tasks;
DROP POLICY IF EXISTS insert_own_pick_tasks ON pick_tasks;
DROP POLICY IF EXISTS update_own_pick_tasks ON pick_tasks;
DROP POLICY IF EXISTS delete_own_pick_tasks ON pick_tasks;
CREATE POLICY "select_pick_tasks" ON pick_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_pick_tasks" ON pick_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_pick_tasks" ON pick_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_pick_tasks" ON pick_tasks FOR DELETE TO authenticated USING (true);

-- qc_records
DROP POLICY IF EXISTS select_own_qc_records ON qc_records;
DROP POLICY IF EXISTS insert_own_qc_records ON qc_records;
DROP POLICY IF EXISTS update_own_qc_records ON qc_records;
DROP POLICY IF EXISTS delete_own_qc_records ON qc_records;
CREATE POLICY "select_qc_records" ON qc_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_qc_records" ON qc_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_qc_records" ON qc_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_qc_records" ON qc_records FOR DELETE TO authenticated USING (true);

-- dispatch_records
DROP POLICY IF EXISTS select_own_dispatch_records ON dispatch_records;
DROP POLICY IF EXISTS insert_own_dispatch_records ON dispatch_records;
DROP POLICY IF EXISTS update_own_dispatch_records ON dispatch_records;
DROP POLICY IF EXISTS delete_own_dispatch_records ON dispatch_records;
CREATE POLICY "select_dispatch_records" ON dispatch_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_dispatch_records" ON dispatch_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_dispatch_records" ON dispatch_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_dispatch_records" ON dispatch_records FOR DELETE TO authenticated USING (true);

-- exceptions
DROP POLICY IF EXISTS select_own_exceptions ON exceptions;
DROP POLICY IF EXISTS insert_own_exceptions ON exceptions;
DROP POLICY IF EXISTS update_own_exceptions ON exceptions;
DROP POLICY IF EXISTS delete_own_exceptions ON exceptions;
CREATE POLICY "select_exceptions" ON exceptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_exceptions" ON exceptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_exceptions" ON exceptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_exceptions" ON exceptions FOR DELETE TO authenticated USING (true);

-- audit_entries
DROP POLICY IF EXISTS select_own_audit_entries ON audit_entries;
DROP POLICY IF EXISTS insert_own_audit_entries ON audit_entries;
DROP POLICY IF EXISTS update_own_audit_entries ON audit_entries;
DROP POLICY IF EXISTS delete_own_audit_entries ON audit_entries;
CREATE POLICY "select_audit_entries" ON audit_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_audit_entries" ON audit_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_audit_entries" ON audit_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_audit_entries" ON audit_entries FOR DELETE TO authenticated USING (true);

-- decision_rules
DROP POLICY IF EXISTS select_own_decision_rules ON decision_rules;
DROP POLICY IF EXISTS insert_own_decision_rules ON decision_rules;
DROP POLICY IF EXISTS update_own_decision_rules ON decision_rules;
DROP POLICY IF EXISTS delete_own_decision_rules ON decision_rules;
CREATE POLICY "select_decision_rules" ON decision_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_decision_rules" ON decision_rules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_decision_rules" ON decision_rules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_decision_rules" ON decision_rules FOR DELETE TO authenticated USING (true);

-- warehouse_zones
DROP POLICY IF EXISTS select_own_warehouse_zones ON warehouse_zones;
DROP POLICY IF EXISTS insert_own_warehouse_zones ON warehouse_zones;
DROP POLICY IF EXISTS update_own_warehouse_zones ON warehouse_zones;
DROP POLICY IF EXISTS delete_own_warehouse_zones ON warehouse_zones;
CREATE POLICY "select_warehouse_zones" ON warehouse_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_warehouse_zones" ON warehouse_zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_warehouse_zones" ON warehouse_zones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_warehouse_zones" ON warehouse_zones FOR DELETE TO authenticated USING (true);
