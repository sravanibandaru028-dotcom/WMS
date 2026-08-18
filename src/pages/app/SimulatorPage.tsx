import { useState } from 'react';
import { FlaskConical, Zap, ArrowRight, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import type { OrderPriority } from '@/types';

interface SimResult {
  situation: string;
  conflict: string;
  recommendation: string;
  reasoning: string[];
  impact: string;
  alternatives: string[];
}

export function SimulatorPage() {
  const [priority, setPriority] = useState<OrderPriority>('urgent');
  const [requiredQty, setRequiredQty] = useState(10);
  const [availableStock, setAvailableStock] = useState(3);
  const [safetyStock, setSafetyStock] = useState(12);
  const [slaHours, setSlaHours] = useState(3);
  const [customerPriority, setCustomerPriority] = useState<'vip' | 'standard'>('vip');
  const [competingOrders, setCompetingOrders] = useState(1);
  const [result, setResult] = useState<SimResult | null>(null);

  const runSimulation = () => {
    const priorityScores: Record<OrderPriority, number> = { urgent: 40, high: 25, standard: 15, low: 5 };
    const vipMult = customerPriority === 'vip' ? 1.5 : 1;
    const slaUrgency = Math.max(0, 30 - slaHours);
    const score = Math.round((priorityScores[priority] + slaUrgency) * vipMult);

    const canFulfill = availableStock >= requiredQty;
    const conflict = !canFulfill && competingOrders > 0;

    const situation = `Order requires ${requiredQty} units. ${availableStock} available (safety stock: ${safetyStock}). SLA deadline in ${slaHours}h. ${customerPriority === 'vip' ? 'VIP customer.' : 'Standard customer.'} ${competingOrders} competing order(s).`;

    const conflictText = conflict
      ? `${competingOrders} competing order(s) need the same SKU. Combined demand exceeds available stock by ${requiredQty - availableStock} units.`
      : canFulfill
        ? 'No conflict — sufficient stock available for full allocation.'
        : 'Insufficient stock but no competing orders — partial allocation possible.';

    const reasoning: string[] = [];
    reasoning.push(`Priority score: ${score} (${priority} base ${priorityScores[priority]} + SLA urgency ${slaUrgency}${vipMult > 1 ? ` × VIP ${vipMult}` : ''}).`);
    if (canFulfill) {
      reasoning.push(`${availableStock} units available — full allocation of ${requiredQty} units possible.`);
    } else {
      reasoning.push(`Only ${availableStock} of ${requiredQty} units available — shortfall of ${requiredQty - availableStock} units.`);
    }
    if (conflict) {
      reasoning.push(`${competingOrders} competing order(s) detected for the same SKU.`);
      reasoning.push(`This order's priority score (${score}) determines allocation priority vs competitors.`);
    }
    if (availableStock <= safetyStock) {
      reasoning.push(`Available stock (${availableStock}) is at or below safety stock (${safetyStock}) — allocation will dip into safety reserves.`);
    }
    reasoning.push(`SLA deadline in ${slaHours}h ${slaHours <= 3 ? '— high urgency.' : '— moderate urgency.'}`);

    let recommendation: string;
    const alternatives: string[] = [];

    if (canFulfill) {
      recommendation = `Allocate ${requiredQty} units. Order proceeds to picking immediately.`;
      alternatives.push('Hold allocation pending inventory verification (adds 15min delay).');
    } else if (conflict && score < 50) {
      recommendation = `Defer allocation to higher-priority competing order. Hold this order for backorder — estimated delay ${7} days (replenishment lead time).`;
      alternatives.push('Partial-allocate available units and backorder the remainder.');
      alternatives.push('Escalate to operations manager for manual override.');
    } else {
      const allocated = Math.min(availableStock, requiredQty);
      recommendation = `Partial-allocate ${allocated} of ${requiredQty} units (${Math.round((allocated / requiredQty) * 100)}%). Backorder ${requiredQty - allocated} units.`;
      alternatives.push('Wait for replenishment (7 days) and allocate full quantity.');
      alternatives.push('Source from alternate warehouse if available.');
    }

    const impact = canFulfill
      ? `Order fulfilled within SLA (${slaHours}h). ${availableStock - requiredQty} units remain in stock.`
      : `Order partially fulfilled at ${Math.round((Math.min(availableStock, requiredQty) / requiredQty) * 100)}%. Backorder delay of ~7 days for remaining units. Customer notification recommended.`;

    setResult({ situation, conflict: conflictText, recommendation, reasoning, impact, alternatives });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Decision Simulator</h1>
        <p className="text-sm text-ink-500 mt-1">Create hypothetical scenarios and run the Decision Engine to see recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary-500" />
              <CardTitle>Scenario Inputs</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Select label="Order Priority" value={priority} onChange={(e) => setPriority(e.target.value as OrderPriority)}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="standard">Standard</option>
              <option value="low">Low</option>
            </Select>
            <Select label="Customer Priority" value={customerPriority} onChange={(e) => setCustomerPriority(e.target.value as 'vip' | 'standard')}>
              <option value="vip">VIP Customer</option>
              <option value="standard">Standard Customer</option>
            </Select>
            <Input label="Required Quantity" type="number" value={requiredQty} onChange={(e) => setRequiredQty(Number(e.target.value))} />
            <Input label="Available Stock" type="number" value={availableStock} onChange={(e) => setAvailableStock(Number(e.target.value))} />
            <Input label="Safety Stock" type="number" value={safetyStock} onChange={(e) => setSafetyStock(Number(e.target.value))} />
            <Input label="SLA Deadline (hours)" type="number" value={slaHours} onChange={(e) => setSlaHours(Number(e.target.value))} />
            <Input label="Competing Orders" type="number" value={competingOrders} onChange={(e) => setCompetingOrders(Number(e.target.value))} />
            <Button onClick={runSimulation} className="w-full" size="lg">
              <Zap className="h-4 w-4" /> Run Decision Engine
            </Button>
          </CardBody>
        </Card>

        {/* Results Panel */}
        <div className="space-y-4">
          {!result ? (
            <Card>
              <CardBody>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-400 mb-4">
                    <Lightbulb className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-medium text-ink-900">No simulation yet</p>
                  <p className="text-sm text-ink-500 mt-1">Set your scenario inputs and run the Decision Engine.</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader><CardTitle>Situation</CardTitle></CardHeader>
                <CardBody><p className="text-sm text-ink-700">{result.situation}</p></CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning-500" />
                    <CardTitle>Conflict Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardBody><p className="text-sm text-ink-700">{result.conflict}</p></CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary-500" />
                    <CardTitle>Recommended Decision</CardTitle>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary-50/50 border border-primary-100">
                    <p className="text-sm font-medium text-primary-700">{result.recommendation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-600 mb-1">Reasoning</p>
                    <ul className="space-y-1">
                      {result.reasoning.map((r, i) => (
                        <li key={i} className="text-xs text-ink-500 flex gap-1.5">
                          <span className="text-primary-500">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-ink-50 border border-ink-200">
                    <p className="text-xs font-semibold text-ink-600 mb-1">Expected Impact</p>
                    <p className="text-sm text-ink-600">{result.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-600 mb-1">Alternative Decisions</p>
                    <ul className="space-y-1">
                      {result.alternatives.map((a, i) => (
                        <li key={i} className="text-xs text-ink-500 flex gap-1.5">
                          <ArrowRight className="h-3 w-3 mt-0.5 text-ink-400 flex-shrink-0" /> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
