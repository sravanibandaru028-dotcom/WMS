import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Warehouse, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 bg-grid-dark p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-3 shadow-elevated">
            <Warehouse className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white">WAREFLOW</h1>
          <p className="text-sm text-ink-400 mt-1">Smart Warehouse Operations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-elevated p-8">
          <h2 className="text-xl font-semibold text-ink-900 mb-1">Welcome back</h2>
          <p className="text-sm text-ink-500 mb-6">Sign in to your control tower</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 border border-error-200 px-3 py-2.5 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-base pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-base">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-ink-200 text-center">
            <p className="text-sm text-ink-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4 rounded-lg bg-ink-50 border border-ink-200 px-4 py-3 text-xs text-ink-500">
            <p className="font-medium text-ink-600 mb-1">Demo Account</p>
            <p>Email: demo@wareflow.io</p>
            <p>Password: demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
