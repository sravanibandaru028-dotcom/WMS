import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/ui/Spinner';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { CommandCenter } from '@/pages/app/CommandCenter';
import { OrdersPage } from '@/pages/app/OrdersPage';
import { OrderDetailPage } from '@/pages/app/OrderDetailPage';
import { InventoryPage } from '@/pages/app/InventoryPage';
import { AllocationEnginePage } from '@/pages/app/AllocationEnginePage';
import { ExceptionsPage } from '@/pages/app/ExceptionsPage';
import { PickingPage } from '@/pages/app/PickingPage';
import { PackingQcPage } from '@/pages/app/PackingQcPage';
import { DispatchPage } from '@/pages/app/DispatchPage';
import { AnalyticsPage } from '@/pages/app/AnalyticsPage';
import { BottlenecksPage } from '@/pages/app/BottlenecksPage';
import { SimulatorPage } from '@/pages/app/SimulatorPage';
import { RulesPage } from '@/pages/app/RulesPage';
import { AuditPage } from '@/pages/app/AuditPage';
import { SettingsPage } from '@/pages/app/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CommandCenter />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="allocation" element={<AllocationEnginePage />} />
            <Route path="exceptions" element={<ExceptionsPage />} />
            <Route path="picking" element={<PickingPage />} />
            <Route path="packing" element={<PackingQcPage />} />
            <Route path="dispatch" element={<DispatchPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="bottlenecks" element={<BottlenecksPage />} />
            <Route path="simulator" element={<SimulatorPage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
