import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Radio,
  Share2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { isSupabaseConfigured, supabaseAuth } from '../../services/supabase.ts';
import type { User, UserRole } from '../../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'LOGIN' | 'REGISTER';
  onAuthSuccess: (authData: { user: User; customerProfile?: any; ownerProfile?: any }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'ROUTER_OWNER' | 'WIFI_HOST'>('CUSTOMER');

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hostSuccess, setHostSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured) {
        try {
          await supabaseAuth.signIn(email, password);
        } catch (sbErr: any) {
          console.warn('Supabase auth fallback to local store:', sbErr.message);
        }
      }
      const data = await api.login(email);
      onAuthSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedRole === 'WIFI_HOST') {
      try {
        await api.submitHostApplication({
          fullName: name,
          phone,
          email,
          location: 'Nairobi / Kiambu Region',
          internetProvider: 'Fiber Provider',
          speedMbps: 50,
          routerModel: 'Standard Wi-Fi Gateway',
          availability: '24/7',
        });
        setHostSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Host application submission failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (isSupabaseConfigured) {
        try {
          await supabaseAuth.signUp(email, password, {
            name,
            phone,
            role: selectedRole,
          });
        } catch (sbErr: any) {
          console.warn('Supabase registration fallback:', sbErr.message);
        }
      }

      const data = await api.register({
        name,
        email,
        phone,
        role: selectedRole,
      });
      onAuthSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectQuickAccount = async (roleName: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.login(undefined, roleName);
      onAuthSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {mode === 'LOGIN' ? 'Sign In to BRISK Smart Connect' : 'Create Your Account'}
              </h3>
              <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" />
                {isSupabaseConfigured ? 'Supabase Auth' : 'Backend DB'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {mode === 'LOGIN'
                ? 'Access your WiFi dashboard, hotspot router, or platform control'
                : 'Choose your journey: WiFi User, Network Operator, or WiFi Host'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-950 rounded-xl mt-4 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'LOGIN' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'REGISTER' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Instant Demo Role Switcher */}
        <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Fast Switch Demo Account:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => selectQuickAccount('CUSTOMER')}
              className="px-2 py-1.5 bg-slate-800/80 hover:bg-sky-950/60 border border-slate-700/60 hover:border-sky-500/50 rounded-lg text-left transition-colors"
            >
              <div className="text-xs font-bold text-white">Customer</div>
              <div className="text-[10px] text-slate-400 truncate">John Doe (3-Day Free)</div>
            </button>
            <button
              type="button"
              onClick={() => selectQuickAccount('ROUTER_OWNER')}
              className="px-2 py-1.5 bg-slate-800/80 hover:bg-amber-950/60 border border-slate-700/60 hover:border-amber-500/50 rounded-lg text-left transition-colors"
            >
              <div className="text-xs font-bold text-amber-300">Router Owner</div>
              <div className="text-[10px] text-slate-400 truncate">Raymond (14d Trial)</div>
            </button>
            <button
              type="button"
              onClick={() => selectQuickAccount('SUPER_ADMIN')}
              className="px-2 py-1.5 bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700/60 hover:border-emerald-500/50 rounded-lg text-left transition-colors"
            >
              <div className="text-xs font-bold text-emerald-300">Super Admin</div>
              <div className="text-[10px] text-slate-400 truncate">Full Platform Ctrl</div>
            </button>
          </div>
        </div>

        {/* Form */}
        {mode === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@briskconnect.co.ke"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {error && <div className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-sky-600/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : hostSuccess ? (
          <div className="mt-5 p-5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Application Received!</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thank you for applying to become a <span className="text-amber-400 font-semibold">BRISK WiFi Host</span>.
              Our operations team will review your network info and contact you at {phone} within 24 hours.
            </p>
            <button
              onClick={() => {
                setHostSuccess(false);
                setMode('LOGIN');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">I want to:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CUSTOMER')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'CUSTOMER'
                      ? 'bg-sky-950/80 border-sky-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserIcon className="w-4 h-4 mb-1 text-sky-400" />
                  <div className="text-xs font-bold leading-tight">Use WiFi</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">3-Day Free Gift</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('ROUTER_OWNER')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'ROUTER_OWNER'
                      ? 'bg-amber-950/80 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-4 h-4 mb-1 text-amber-400" />
                  <div className="text-xs font-bold leading-tight">Manage Network</div>
                  <div className="text-[10px] text-amber-400 mt-0.5">14-Day Free Trial</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('WIFI_HOST')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'WIFI_HOST'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Share2 className="w-4 h-4 mb-1 text-emerald-400" />
                  <div className="text-xs font-bold leading-tight">WiFi Host</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">10% Commission</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Raymond Kamau"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">M-Pesa Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create secure password"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            {selectedRole === 'CUSTOMER' && (
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
                🎁 <strong>New Customer Special:</strong> Registering now automatically provisions your{' '}
                <strong>FREE 3-Day Package</strong> (10 Mbps)!
              </div>
            )}

            {selectedRole === 'ROUTER_OWNER' && (
              <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300">
                🚀 <strong>Router Owner Trial:</strong> You get a full <strong>14-Day Free Trial</strong> with
                MikroTik Hotspot & PPPoE setup scripts!
              </div>
            )}

            {error && <div className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-400/20"
            >
              {loading
                ? 'Creating account...'
                : selectedRole === 'WIFI_HOST'
                ? 'SUBMIT HOST APPLICATION'
                : 'CREATE ACCOUNT & START'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
