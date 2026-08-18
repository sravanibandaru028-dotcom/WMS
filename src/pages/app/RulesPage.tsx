import { useMemo } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import type { DecisionRule } from '@/types';

export function RulesPage() {
  const { decisionRules, loading } = useWarehouseData();

  const grouped = useMemo(() => {
    const groups: Record<string, DecisionRule[]> = {};
    for (const rule of decisionRules) {
      if (!groups[rule.category]) groups[rule.category] = [];
      groups[rule.category].push(rule);
    }
    return groups;
  }, [decisionRules]);

  if (loading) return <PageLoader label="Loading decision rules…" />;

  const categoryLabels: Record<string, string> = {
    priority: 'Priority Weights',
    sla: 'SLA Configuration',
    inventory: 'Inventory Thresholds',
    allocation: 'Allocation Policy',
    picking: 'Picking Rules',
    dispatch: 'Dispatch Rules',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900">Decision Rules</h1>
          <p className="text-sm text-ink-500 mt-1">Configure how the Decision Engine scores and recommends</p>
        </div>
        <Button><Save className="h-4 w-4" /> Save Changes</Button>
      </div>

      {Object.entries(grouped).map(([category, rules]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-500" />
              <CardTitle>{categoryLabels[category] || category}</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{rule.label}</p>
                    <p className="text-xs text-ink-500">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary-600">{rule.value}{rule.unit}</span>
                    <Badge tone="neutral" variant="outline">{rule.unit}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-400 w-8">{rule.min}</span>
                  <input
                    type="range"
                    min={rule.min}
                    max={rule.max}
                    step={0.1}
                    defaultValue={rule.value}
                    className="flex-1 h-2 bg-ink-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <span className="text-xs text-ink-400 w-8 text-right">{rule.max}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      ))}

      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">How rules affect recommendations</p>
              <p className="text-sm text-ink-500 mt-1">
                Changing a rule immediately affects how the Decision Engine scores orders and recommends actions.
                For example, increasing the Urgent Priority Weight will make urgent orders rank higher in allocation conflicts.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
