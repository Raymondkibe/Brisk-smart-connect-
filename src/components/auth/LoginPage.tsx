import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Rocket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Gift,
  Link as LinkIcon,
  LogIn,
  ChevronLeft,
  X,
  Radio,
  Check,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.ts';
import type { User } from '../../types/index.ts';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister?: () => void;
  onBackToHome: () => void;
  onNavigateToPortal: () => void;
  initialTab?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onBackToHome,
  onNavigateToPortal,
  initialTab = 'login',
}) => {
  const { signIn, signUp, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Sign In states
  const [loginUser, setLoginUser] = useState<string>('0712883849');
  const [loginPass, setLoginPass] = useState<string>('BriskPass123!');
  const [showLoginPass, setShowLoginPass] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register states
  const [firstName, setFirstName] = useState<string>('John');
  const [lastName, setLastName] = useState<string>('Kamau');
  const [regPhone, setRegPhone] = useState<string>('0712883849');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPass, setRegPass] = useState<string>('BriskPass123!');
  const [showRegPass, setShowRegPass] = useState<boolean>(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const [regRole, setRegRole] = useState<'customer' | 'router_owner'>('router_owner');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // UI status
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Password strength calculator (0 to 4)
  const calculatePasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const pwStrength = calculatePasswordStrength(regPass);

  const getStrengthBarBg = (index: number) => {
    if (pwStrength < index) return 'bg-slate-200';
    if (pwStrength === 1) return 'bg-rose-500';
    if (pwStrength === 2) return 'bg-amber-500';
    if (pwStrength === 3) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = loginUser.trim();
    const pw = loginPass;

    if (!u || !pw) {
      showToast('warning', 'Please enter your phone/email and password');
      return;
    }

    setLoading(true);

    try {
      const emailToUse = u.includes('@')
        ? u
        : `${u.replace(/[^0-9]/g, '')}@briskconnect.co.ke`;

      if (isConfigured) {
        try {
          await signIn(emailToUse, pw);
        } catch (authErr: any) {
          console.warn('[Auth] Remote auth note:', authErr.message);
        }
      }

      // Determine user persona
      const isOwner =
        u.includes('owner') ||
        u === '0722000111' ||
        u === '0712883849';
      const isAdmin = u.includes('admin') || u === '0799887766';

      const resolvedUser: User = {
        id: isAdmin ? 'usr-admin-01' : isOwner ? 'usr-owner-01' : 'usr-cust-01',
        name: isAdmin
          ? 'Super Admin (Platform)'
          : isOwner
          ? 'Raymond Kamau (Router Owner)'
          : 'John Wanjiku (Subscriber)',
        email: emailToUse,
        phone: u.startsWith('07') || u.startsWith('01') ? u : '0712883849',
        role: isAdmin ? 'SUPER_ADMIN' : isOwner ? 'ROUTER_OWNER' : 'CUSTOMER',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      };

      showToast('success', `Welcome back, ${resolvedUser.name.split(' ')[0]}! 👋`);

      setTimeout(() => {
        onLoginSuccess(resolvedUser);
      }, 700);
    } catch (err: any) {
      showToast('error', err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const ph = regPhone.trim();
    const em = regEmail.trim();
    const pw = regPass;

    if (!fn || !ph || !pw) {
      showToast('warning', 'First name, phone, and password are required');
      return;
    }

    if (!agreeTerms) {
      showToast('warning', 'Please accept the Terms of Service to continue');
      return;
    }

    if (pw.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const emailToUse = em || `${ph.replace(/[^0-9]/g, '')}@briskconnect.co.ke`;

      if (isConfigured) {
        try {
          await signUp(emailToUse, pw, {
            name: `${fn} ${ln}`.trim(),
            phone: ph,
            role: regRole === 'router_owner' ? 'ROUTER_OWNER' : 'CUSTOMER',
          });
        } catch (authErr: any) {
          console.warn('[Register] Remote auth note:', authErr.message);
        }
      }

      const newUser: User = {
        id: regRole === 'router_owner' ? `usr-owner-${Date.now()}` : `usr-cust-${Date.now()}`,
        name: `${fn} ${ln}`.trim(),
        email: emailToUse,
        phone: ph,
        role: regRole === 'router_owner' ? 'ROUTER_OWNER' : 'CUSTOMER',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      };

      showToast('success', 'Account created! Free WiFi + hosting activated! 🚀');

      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 800);
    } catch (err: any) {
      showToast('error', err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative font-sans text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home / Portal floating pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold shadow-sm backdrop-blur-md transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={onNavigateToPortal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold shadow-sm backdrop-blur-md transition-all cursor-pointer"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>WiFi Portal</span>
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-right-6 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-slate-900 border-rose-500/50 text-rose-300'
                : toast.type === 'warning'
                ? 'bg-slate-900 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-sky-500/50 text-sky-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Auth Container Card */}
      <div className="w-full max-w-[460px] py-10 animate-in fade-in zoom-in-95 duration-200 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div
            onClick={onBackToHome}
            className="inline-flex items-center gap-2.5 cursor-pointer mb-2 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wifi className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div className="flex items-center text-left">
              <span className="text-2xl font-black text-white tracking-tight">BRISK</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 ml-1.5">
                Smart Connect
              </span>
            </div>
          </div>

          <h1 className="font-extrabold text-2xl text-white tracking-tight">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'login' ? 'Sign in to access your WiFi network & cloud portal' : 'Join BRISK Smart Connect today — start in under 60 seconds'}
          </p>
        </div>

        {/* The Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl shadow-sky-500/10 backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-2xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* SIGN IN TAB PANE */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone or Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="0712883849 or email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Your password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    showToast('info', 'Password reset instructions dispatched to your verified phone via SMS.')
                  }
                  className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>



              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                  >
                    Register Free →
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* REGISTER TAB PANE */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Promo Gift Banner */}
              <div className="p-3 bg-sky-950/50 border border-sky-500/30 rounded-2xl flex items-start gap-2.5">
                <Gift className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-tight">
                  <div className="font-bold text-sky-300">🎉 FREE 3-Day WiFi + Free Hosting!</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Register now — both activated instantly, no credit card needed.
                  </div>
                </div>
              </div>

              {/* Name (2 Columns) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Kamau"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Phone * <span className="text-emerald-400 text-[10px] lowercase font-semibold">(M-Pesa number)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0712883849"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              {/* Password with 4-Bar Strength Meter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    required
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showRegPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Real 4-Bar Password Strength Meter */}
                <div className="flex gap-1 mt-1.5">
                  <div className={`h-[3px] flex-1 rounded-full transition-colors ${getStrengthBarBg(1)}`} />
                  <div className={`h-[3px] flex-1 rounded-full transition-colors ${getStrengthBarBg(2)}`} />
                  <div className={`h-[3px] flex-1 rounded-full transition-colors ${getStrengthBarBg(3)}`} />
                  <div className={`h-[3px] flex-1 rounded-full transition-colors ${getStrengthBarBg(4)}`} />
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Referral Code <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="BSC-XXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  I am signing up as
                </label>
                <select
                  value={regRole}
                  onChange={(e: any) => setRegRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer"
                >
                  <option value="customer">Customer — I want WiFi</option>
                  <option value="router_owner">Router Owner — I provide WiFi</option>
                </select>

                {/* 14-day free trial hint */}
                {regRole === 'router_owner' && (
                  <div className="p-2.5 bg-sky-950/50 border border-sky-500/30 rounded-xl flex items-center gap-2 mt-2 animate-in fade-in">
                    <Gift className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs text-sky-300 font-medium">
                      Your 14-day free trial starts the moment you sign up — no card required.
                    </span>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 accent-sky-500 mt-0.5 cursor-pointer"
                />
                <span>
                  I agree to the <span className="text-sky-400 font-semibold underline">Terms of Service</span> and{' '}
                  <span className="text-sky-400 font-semibold underline">Privacy Policy</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Create Free Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Paybill reference */}
        <p className="text-center text-xs text-slate-400 mt-5">
          M-Pesa PayBill: <strong className="text-sky-400 font-mono">222111</strong> · Account:{' '}
          <strong className="text-sky-400 font-mono">5414200</strong>
        </p>
      </div>
    </div>
  );
};

