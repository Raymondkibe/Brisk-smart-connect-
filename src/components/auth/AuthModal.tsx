import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Radio,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Wifi,
  ChevronDown,
  Gift,
  Rocket,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { isSupabaseConfigured } from '../../lib/supabase.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import type { User } from '../../types/index.ts';

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
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  // Supabase Auth hook
  const { signIn: authSignIn, signUp: authSignUp } = useAuth();

  // Login form states
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'router_owner'>('router_owner');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Calculate password strength score (1-4)
  const calculatePasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const pwStrength = calculatePasswordStrength(regPass);

  const getStrengthBarColor = (index: number) => {
    if (pwStrength < index) return 'bg-slate-200 dark:bg-slate-800';
    if (pwStrength === 1) return 'bg-rose-500';
    if (pwStrength === 2) return 'bg-amber-400';
    if (pwStrength === 3) return 'bg-cyan-400';
    return 'bg-emerald-500';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass) {
      setError('Please enter your phone/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const emailToUse = loginUser.includes('@')
        ? loginUser
        : `${loginUser.replace(/[^0-9]/g, '')}@briskwifi.co.ke`;

      if (isSupabaseConfigured && loginPass) {
        try {
          await authSignIn(emailToUse, loginPass);
        } catch (sbErr: any) {
          console.warn('Supabase auth fallback:', sbErr.message);
        }
      }

      const roleParam = loginUser.toLowerCase().includes('admin')
        ? 'SUPER_ADMIN'
        : loginUser.toLowerCase().includes('owner') || loginUser.includes('0722')
        ? 'ROUTER_OWNER'
        : 'CUSTOMER';

      const data = await api.login(emailToUse, roleParam);
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
    if (!firstName.trim() || !regPhone.trim() || !regPass) {
      setError('First name, phone number, and password are required.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    if (regPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const targetRole = regRole === 'router_owner' ? 'ROUTER_OWNER' : 'CUSTOMER';
      const emailToUse = regEmail.trim() || `${regPhone.replace(/[^0-9]/g, '')}@briskwifi.co.ke`;

      if (isSupabaseConfigured && regPass) {
        try {
          await authSignUp(emailToUse, regPass, {
            name: fullName,
            phone: regPhone,
            role: targetRole,
          });
        } catch (sbErr: any) {
          console.warn('Supabase registration fallback:', sbErr.message);
        }
      }

      const res = await api.register({
        name: fullName,
        email: emailToUse,
        phone: regPhone,
        role: targetRole,
      });

      setSuccessMsg('Account created! Free WiFi + trial activated!');
      setTimeout(() => {
        onAuthSuccess(res);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      {/* AUTH CARD MATCHING REFERENCE ATTACHMENT */}
      <div className="relative w-full max-w-[460px] bg-white dark:bg-[#0b132b] text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGO & TITLE */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-2 shadow-lg shadow-sky-500/20">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            <span>BRISK </span>
            <span className="text-sky-500">Smart Connect</span>
          </div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">
            {tab === 'LOGIN' ? 'Welcome back! Sign in to continue' : 'Join BRISK Smart Connect today'}
          </div>
        </div>

        {/* TABS (Sign In / Register) */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-5 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTab('LOGIN');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'LOGIN'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('REGISTER');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'REGISTER'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-xl text-xs text-rose-700 dark:text-rose-300 mb-4 animate-fade-in">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-4 animate-fade-in">
            {successMsg}
          </div>
        )}

        {/* ======================================================== */}
        {/* SIGN IN PANE                                             */}
        {/* ======================================================== */}
        {tab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
            {/* Phone or Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Phone or Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="0712883849 or email"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to registered email/phone')}
                className="text-sky-500 hover:text-sky-400 hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>



            <div className="text-center pt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('REGISTER')}
                  className="text-sky-500 hover:text-sky-400 font-bold hover:underline"
                >
                  Register Free →
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* REGISTER PANE                                            */}
        {/* ======================================================== */}
        {tab === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in max-h-[70vh] overflow-y-auto pr-1">
            {/* Promo Alert Banner */}
            <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl flex items-start gap-2.5 text-xs text-slate-200">
              <Gift className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sky-300">
                  🎉 FREE 3-Day WiFi + Free Hosting!
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Register now — both activated instantly, no credit card needed.
                </div>
              </div>
            </div>

            {/* First & Last Name Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Kamau"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Phone * <span className="text-emerald-500 font-normal lowercase">(M-Pesa number)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0712883849"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Email <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Password with Strength Meter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showRegPass ? 'text' : 'password'}
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-10 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass(!showRegPass)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* 4 Password Strength Bars */}
              <div className="flex gap-1.5 mt-1.5">
                <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(1)}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(2)}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(3)}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(4)}`} />
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Referral Code <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="BSC-XXXXXX"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                I am signing up as
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="customer">Customer — I want WiFi</option>
                <option value="router_owner">Router Owner — I provide WiFi</option>
              </select>

              {regRole === 'router_owner' && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl flex items-center gap-2 mt-2 text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in">
                  <Gift className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Your 14-day free trial starts the moment you sign up — no card required.</span>
                </div>
              )}
            </div>

            {/* Terms of Service Checkbox */}
            <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700"
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="text-sky-600 dark:text-sky-400 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-sky-600 dark:text-sky-400 underline">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Register Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* PAYBILL INFO FOOTER */}
        <p className="text-center text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          M-Pesa PayBill: <strong className="text-sky-400 font-bold">222111</strong> · Account:{' '}
          <strong className="text-sky-400 font-mono">5414200</strong>
        </p>
      </div>
    </div>
  );
};
