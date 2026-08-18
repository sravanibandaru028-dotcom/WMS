import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Building2, Bell, Shield } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-500" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-semibold">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">{user?.email}</p>
              <p className="text-sm text-ink-500">Operations Manager</p>
              <Badge tone="primary" variant="soft" className="mt-1">Authenticated</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue="Operations Manager" />
            <Input label="Email" defaultValue={user?.email ?? ''} disabled />
            <Input label="Role" defaultValue="Operations Manager" disabled />
            <Input label="Warehouse" defaultValue="Distribution Center 7" disabled />
          </div>
          <Button>Save Profile</Button>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-500" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {[
            { label: 'Order at risk alerts', desc: 'Get notified when an order SLA is at risk', enabled: true },
            { label: 'Allocation conflicts', desc: 'Alert when competing orders need the same SKU', enabled: true },
            { label: 'Low stock warnings', desc: 'Notify when products drop below reorder point', enabled: true },
            { label: 'Dispatch cutoff alerts', desc: 'Warn before carrier cutoff times', enabled: true },
            { label: 'Exception summaries', desc: 'Daily summary of open exceptions', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-ink-200">
              <div>
                <p className="text-sm font-medium text-ink-900">{item.label}</p>
                <p className="text-xs text-ink-500">{item.desc}</p>
              </div>
              <button
                className={`relative h-6 w-11 rounded-full transition-colors ${item.enabled ? 'bg-primary-600' : 'bg-ink-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
          <Button variant="secondary">Update Password</Button>
        </CardBody>
      </Card>
    </div>
  );
}
