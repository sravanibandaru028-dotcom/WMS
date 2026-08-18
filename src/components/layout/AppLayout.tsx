import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Warehouse, LayoutDashboard, Package, Boxes, Split, AlertTriangle,
  ClipboardList, PackageCheck, Truck, BarChart3, FlaskConical,
  Settings, ScrollText, Activity, LogOut, Menu, X, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/app', label: 'Command Center', icon: LayoutDashboard, end: true },
      { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/app/bottlenecks', label: 'Bottlenecks', icon: Activity },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/app/orders', label: 'Orders', icon: Package },
      { to: '/app/inventory', label: 'Inventory', icon: Boxes },
      { to: '/app/allocation', label: 'Decision Engine', icon: Split },
      { to: '/app/exceptions', label: 'Exceptions', icon: AlertTriangle },
    ],
  },
  {
    label: 'Fulfillment',
    items: [
      { to: '/app/picking', label: 'Picking', icon: ClipboardList },
      { to: '/app/packing', label: 'Packing & QC', icon: PackageCheck },
      { to: '/app/dispatch', label: 'Dispatch', icon: Truck },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/app/simulator', label: 'Decision Simulator', icon: FlaskConical },
      { to: '/app/rules', label: 'Decision Rules', icon: Settings },
      { to: '/app/audit', label: 'Audit Trail', icon: ScrollText },
    ],
  },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-ink-900 text-ink-300 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink-900 text-ink-300 flex flex-col animate-slide-in-left">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-ink-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-ink-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-ink-600 hover:bg-ink-100 rounded-lg p-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-ink-500">
              <span className="font-medium text-ink-700">Operations Manager</span>
              <span className="text-ink-300">/</span>
              <span>Distribution Center 7</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 hover:bg-ink-100 rounded-lg p-1.5 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                {user?.email ? initials(user.email) : '?'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-ink-700 max-w-[160px] truncate">
                {user?.email}
              </span>
              <ChevronDown className="h-4 w-4 text-ink-400" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-ink-200 py-2 z-20 animate-scale-in">
                  <div className="px-4 py-2 border-b border-ink-100">
                    <p className="text-sm font-medium text-ink-900 truncate">{user?.email}</p>
                    <p className="text-xs text-ink-500">Operations Manager</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/app/settings'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-ink-800">
        <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center">
          <Warehouse className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold font-display text-white">WAREFLOW</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-5 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600/15 text-primary-300 border-l-2 border-primary-500'
                      : 'text-ink-400 hover:text-white hover:bg-ink-800/50',
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-ink-800">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
          System Online
        </div>
      </div>
    </>
  );
}
