import type { Product, Order, OrderItem, DecisionRule } from '@/types';
import type { AllocationRecommendation, ReplenishmentRecommendation, BottleneckFinding } from '@/types';
import type { WarehouseZone } from '@/types';

export function computeAllocationRecommendations(
  products: Product[],
  orders: Order[],
  orderItems: OrderItem[],
  rules: DecisionRule[],
): AllocationRecommendation[] {
  const getRule = (key: string) => rules.find((r) => r.rule_key === key);
  const urgentWeight = getRule('priority_weight_urgent')?.value ?? 40;
  const highWeight = getRule('priority_weight_high')?.value ?? 25;
  const standardWeight = getRule('priority_weight_standard')?.value ?? 15;
  const slaWeight = getRule('sla_weight')?.value ?? 30;
  const vipMultiplier = getRule('vip_multiplier')?.value ?? 1.5;
  const partialPolicy = getRule('partial_allocation_policy')?.value ?? 50;

  const priorityWeightMap: Record<string, number> = {
    urgent: urgentWeight,
    high: highWeight,
    standard: standardWeight,
    low: 5,
  };

  const activeOrders = orders.filter(
    (o) => o.status === 'created' || o.status === 'prioritized' || o.status === 'allocated',
  );

  const recommendations: AllocationRecommendation[] = [];

  for (const order of activeOrders) {
    const items = orderItems.filter((oi) => oi.order_id === order.id);
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;

      const available = product.available;
      const requested = item.quantity;
      const allocated = Math.min(available, requested);
      const canFulfill = allocated >= requested;

      const competing = activeOrders
        .filter((o) => o.id !== order.id)
        .flatMap((o) => orderItems.filter((oi) => oi.order_id === o.id && oi.product_id === item.product_id))
        .map((oi) => {
          const compOrder = orders.find((o) => o.id === oi.order_id);
          return compOrder
            ? {
                orderNumber: compOrder.order_number,
                priority: compOrder.priority,
                priorityScore: compOrder.priority_score,
                requested: oi.quantity,
              }
            : null;
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

      const conflict = !canFulfill && competing.length > 0;

      const slaHoursLeft = Math.max(
        0,
        (new Date(order.sla_deadline).getTime() - Date.now()) / 3600000,
      );
      const slaUrgency = Math.max(0, Math.min(100, slaWeight - slaHoursLeft));

      const baseScore = priorityWeightMap[order.priority] ?? 15;
      const vipBoost = order.customer_priority === 'vip' ? vipMultiplier : 1;
      const score = Math.round((baseScore + slaUrgency) * vipBoost);

      const reasoning: string[] = [];
      if (canFulfill) {
        reasoning.push(`${allocated} units available — full allocation possible.`);
      } else {
        reasoning.push(`Only ${available} of ${requested} units available — shortfall of ${requested - allocated} units.`);
      }
      if (conflict) {
        reasoning.push(`${competing.length} competing order(s) for the same SKU.`);
        reasoning.push(
          `Priority score ${score} vs competitors: ${competing.map((c) => `${c.orderNumber} (${c.priorityScore})`).join(', ')}.`,
        );
      }
      if (order.customer_priority === 'vip') {
        reasoning.push(`VIP customer — priority multiplier ${vipMultiplier}x applied.`);
      }
      const slaText = slaHoursLeft < 3 ? `SLA deadline in ${Math.round(slaHoursLeft)}h — high urgency.` : `SLA deadline in ${Math.round(slaHoursLeft)}h.`;
      reasoning.push(slaText);

      const fulfillPct = requested > 0 ? Math.round((allocated / requested) * 100) : 0;
      const allowPartial = fulfillPct >= partialPolicy;

      let recommendation: string;
      if (canFulfill) {
        recommendation = `Allocate ${allocated} units to ${order.order_number}.`;
      } else if (allowPartial && (!conflict || score >= Math.max(...competing.map((c) => c.priorityScore)))) {
        recommendation = `Partial-allocate ${allocated} of ${requested} units to ${order.order_number}. Backorder ${requested - allocated} units.`;
      } else if (conflict && score < Math.max(...competing.map((c) => c.priorityScore))) {
        const winner = competing.reduce((a, b) => (a.priorityScore > b.priorityScore ? a : b));
        recommendation = `Defer allocation to ${winner.orderNumber} (higher priority score ${winner.priorityScore}). Hold ${order.order_number} for backorder.`;
      } else {
        recommendation = `Partial-allocate ${allocated} units. Backorder ${requested - allocated} units.`;
      }

      const impact = canFulfill
        ? `Order ${order.order_number} proceeds to picking. ${product.available - allocated} units remain in stock.`
        : `Order ${order.order_number} partially fulfilled at ${fulfillPct}%. Backorder may delay completion by ${product.lead_time_days} days.`;

      recommendations.push({
        orderId: order.id,
        orderNumber: order.order_number,
        priority: order.priority,
        priorityScore: score,
        productSku: product.sku,
        productName: product.name,
        requested,
        available,
        canFulfill,
        allocated,
        conflict,
        competingOrders: competing,
        reasoning,
        impact,
        recommendation,
      });
    }
  }

  return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function computeReplenishmentRecommendations(
  products: Product[],
  rules: DecisionRule[],
): ReplenishmentRecommendation[] {
  const safetyMultiplier = rules.find((r) => r.rule_key === 'safety_stock_multiplier')?.value ?? 1.0;
  const reorderBuffer = rules.find((r) => r.rule_key === 'reorder_buffer_pct')?.value ?? 10;

  const results: ReplenishmentRecommendation[] = [];

  for (const p of products) {
    const effectiveSafety = Math.round(p.safety_stock * safetyMultiplier);
    const effectiveReorder = Math.round(p.reorder_point * (1 + reorderBuffer / 100));
    const runway = p.daily_velocity > 0 ? Math.floor(p.available / p.daily_velocity) : 999;

    const belowReorder = p.available <= effectiveReorder;
    const belowSafety = p.available <= effectiveSafety;
    const outOfStock = p.available <= 0;

    if (!belowReorder && !outOfStock) continue;

    const recommendedQty = Math.max(p.reorder_qty, Math.ceil(p.daily_velocity * p.lead_time_days) + effectiveSafety - p.available);

    let urgency: ReplenishmentRecommendation['urgency'] = 'low';
    if (outOfStock) urgency = 'critical';
    else if (belowSafety) urgency = 'high';
    else if (belowReorder) urgency = 'medium';

    const reasoning: string[] = [];
    if (outOfStock) reasoning.push(`Out of stock — 0 units available.`);
    if (belowSafety) reasoning.push(`Below safety stock threshold (${effectiveSafety} units).`);
    if (belowReorder) reasoning.push(`Below reorder point (${effectiveReorder} units).`);
    reasoning.push(`Daily velocity: ${p.daily_velocity} units/day — runway: ${runway} days.`);
    reasoning.push(`Lead time: ${p.lead_time_days} days. Recommended order: ${recommendedQty} units.`);

    results.push({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      onHand: p.on_hand,
      available: p.available,
      safetyStock: effectiveSafety,
      reorderPoint: effectiveReorder,
      runwayDays: runway,
      recommendedQty,
      reasoning,
      urgency,
    });
  }

  return results.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.urgency] - order[b.urgency];
  });
}

export function computeBottlenecks(
  zones: WarehouseZone[],
  pickTasks: { zone: string; status: string }[],
): BottleneckFinding[] {
  const findings: BottleneckFinding[] = [];
  const baselinePickTime = 6.0;
  const totalPending = pickTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;

  for (const zone of zones) {
    const zonePending = pickTasks.filter(
      (t) => t.zone === zone.id && (t.status === 'pending' || t.status === 'in_progress'),
    ).length;
    const pctOfTotal = totalPending > 0 ? (zonePending / totalPending) * 100 : 0;
    const pickTimeDeviation = ((zone.avg_pick_time_min - baselinePickTime) / baselinePickTime) * 100;

    if (pctOfTotal > 35 && pickTimeDeviation > 10) {
      findings.push({
        zone: zone.id as BottleneckFinding['zone'],
        metric: 'Pick time & task concentration',
        currentValue: `${zone.avg_pick_time_min} min avg`,
        baseline: `${baselinePickTime} min avg`,
        deviationPct: Math.round(pickTimeDeviation),
        description: `Zone ${zone.id} currently contains ${Math.round(pctOfTotal)}% of pending picking tasks and average pick time is ${Math.round(pickTimeDeviation)}% above normal.`,
        recommendation: `Move ${Math.max(1, Math.round(zonePending / 4))} available resource${Math.max(1, Math.round(zonePending / 4)) > 1 ? 's' : ''} from the least-utilized zone to Zone ${zone.id}.`,
        expectedImpact: `Estimated ${Math.round(pickTimeDeviation * 0.5)}% reduction in Zone ${zone.id} picking backlog within 2 hours.`,
        severity: pickTimeDeviation > 20 ? 'high' : 'medium',
      });
    }

    if (zone.utilization > 80) {
      findings.push({
        zone: zone.id as BottleneckFinding['zone'],
        metric: 'Zone utilization',
        currentValue: `${zone.utilization}%`,
        baseline: '75% target',
        deviationPct: Math.round(((zone.utilization - 75) / 75) * 100),
        description: `Zone ${zone.id} is at ${zone.utilization}% utilization, above the 75% target. Risk of congestion and pick delays.`,
        recommendation: `Review slotting in Zone ${zone.id} and consider relocating slow-moving SKUs to underutilized zones.`,
        expectedImpact: `Reducing utilization to 75% could improve pick speed by ${Math.round((zone.utilization - 75) * 0.3)}%.`,
        severity: zone.utilization > 85 ? 'high' : 'medium',
      });
    }
  }

  return findings.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}
