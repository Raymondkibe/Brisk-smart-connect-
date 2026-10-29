import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Radio,
  Wifi,
  DollarSign,
  Ticket,
  AlertTriangle,
  Receipt,
  Check,
  CheckCircle2,
  XCircle,
  Wrench,
  Activity,
  Search,
  Lock,
  Edit2,
  Save,
  Clock,
  UserCheck,
  UserX,
  Share2,
  Database,
  Cloud,
  RefreshCw,
  ExternalLink,
  Zap,
  Play,
  BellRing,
  BarChart3,
  TrendingUp,
  CreditCard,
  FileText,
  Headphones,
  Settings,
  Menu,
  X,
  ChevronDown,
  Layers,
  ChevronRight,
  Download,
  KeyRound,
  ArrowDownLeft,
} from 'lucide-react';
import { subscriptionCronService, type SubscriptionAuditResult, type SubscriptionServiceState } from '../../services/subscriptionCronService.ts';
import type {
  User,
  RouterDevice,
  AccessPoint,
  WifiPackage,
  SubscriptionPlan,
  Transaction,
  Voucher,
  WithdrawalRequest,
  InstallationRequest,
  NetworkIncident,
  AuditLog,
  HostApplication,
  OwnerPaymentMethod,
  ManualSubscriptionRequest,
  SubscriptionActivationCode,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { RouterHealthMonitor } from './RouterHealthMonitor.tsx';
import { AdminSubscriptionCodesTab } from './AdminSubscriptionCodesTab.tsx';
import { AdminPendingTransactionsTab } from './AdminPendingTransactionsTab.tsx';

export type AdminNavTab =
  | 'OVERVIEW'
  | 'HEALTH'
  | 'PENDING_TRANSACTIONS'
  | 'WITHDRAWALS'
  | 'OWNERS'
  | 'CUSTOMERS'
  | 'ROUTERS'
  | 'PACKAGES'
  | 'TRANSACTIONS'
  | 'PAYMENT_METHODS'
  | 'SUBSCRIPTION_CODES'
  | 'REFERRALS'
  | 'SUPPORT'
  | 'REPORTS'
  | 'SETTINGS';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  routers: RouterDevice[];
  accessPoints: AccessPoint[];
  packages: WifiPackage[];
  subscriptionPlans: SubscriptionPlan[];
  transactions: Transaction[];
  vouchers: Voucher[];
  withdrawals: WithdrawalRequest[];
  installations: InstallationRequest[];
  incidents: NetworkIncident[];
  auditLogs: AuditLog[];
  hostApplications: HostApplication[];
  onRefreshState: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  routers,
  accessPoints,
  packages,
  subscriptionPlans,
  transactions,
  vouchers,
  withdrawals,
  installations,
  incidents,
  auditLogs,
  hostApplications,
  onRefreshState,
}) => {
  const [activeTab, setActiveTab] = useState<AdminNavTab>('OVERVIEW');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'30days' | '7days' | 'all'>('30days');

  // Automated Subscription Recurring Revenue Cron State
  const [cronState, setCronState] = useState<SubscriptionServiceState>(subscriptionCronService.getState());
  const [auditRunning, setAuditRunning] = useState(false);
  const [manualPushMessage, setManualPushMessage] = useState('');

  // Withdrawal action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [routerSearch, setRouterSearch] = useState('');

  // Owner Payment Methods state
  const [adminPaymentMethods, setAdminPaymentMethods] = useState<OwnerPaymentMethod[]>([]);
  const [pmLoading, setPmLoading] = useState(false);
  const [pmVerifyingId, setPmVerifyingId] = useState<string | null>(null);
  const [pmFilter, setPmFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE'>('ALL');
  const [pmSearch, setPmSearch] = useState('');
  const [pmActionSuccess, setPmActionSuccess] = useState<string | null>(null);

  const loadAdminPaymentMethods = async () => {
    setPmLoading(true);
    try {
      const res = await api.getAdminPaymentMethods();
      if (res && res.methods) {
        setAdminPaymentMethods(res.methods);
      }
    } catch (err) {
      console.warn('Could not fetch payment methods:', err);
    } finally {
      setPmLoading(false);
    }
  };

  React.useEffect(() => {
    loadAdminPaymentMethods();
  }, []);

  const handleVerifyPaymentMethod = async (id: string, label: string, ownerName: string) => {
    setPmVerifyingId(id);
    try {
      await api.verifyPaymentMethod(id);
      setAdminPaymentMethods((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'active', verified_at: new Date().toISOString() } : m))
      );
      setPmActionSuccess(`Payment method "${label}" for ${ownerName} verified and activated!`);
      setTimeout(() => setPmActionSuccess(null), 4000);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setPmVerifyingId(null);
    }
  };

  // Supabase Backend Sync State
  const [supabaseSyncLoading, setSupabaseSyncLoading] = useState(false);
  const [supabaseSyncMsg, setSupabaseSyncMsg] = useState('');

  const handleSyncSupabase = async () => {
    setSupabaseSyncLoading(true);
    setSupabaseSyncMsg('');
    try {
      const res = await api.seedSupabaseDatabase();
      setSupabaseSyncMsg(res.message || 'Supabase database synchronized successfully!');
      setTimeout(() => setSupabaseSyncMsg(''), 5000);
      onRefreshState();
    } catch (e: any) {
      setSupabaseSyncMsg(`Sync status: ${e.message}`);
    } finally {
      setSupabaseSyncLoading(false);
    }
  };

  const handleTriggerAuditNow = async () => {
    setAuditRunning(true);
    try {
      const results = await subscriptionCronService.runAudit();
      const expiredCount = results.filter((r) => r.status === 'EXPIRED').length;
      setManualPushMessage(`Subscription Audit completed: ${results.length} subscriptions evaluated, ${expiredCount} expired/overdue.`);
      setTimeout(() => setManualPushMessage(''), 5000);
      onRefreshState();
    } catch (e: any) {
      setManualPushMessage(`Audit status: ${e.message}`);
    } finally {
      setAuditRunning(false);
    }
  };

  const handleWithdrawalAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    setActionSuccess('');
    try {
      await api.adminWithdrawalAction({
        withdrawalId: id,
        action,
        notes: action === 'APPROVE' ? 'Approved & Disbursed via M-Pesa B2C' : 'Rejected by Admin',
      });
      setActionSuccess(`Withdrawal #${id} has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.toggleUserStatus(userId, newStatus as any);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  const filteredOwners = users.filter((u) => u.role === 'ROUTER_OWNER' && (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())));
  const filteredCustomers = users.filter((u) => u.role === 'CUSTOMER' && (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch)));

  // Navigation Items matching Image 2 Section 5
  const navItems: { id: AdminNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'OVERVIEW', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'PENDING_TRANSACTIONS', label: 'Pending Transactions', icon: <Clock className="w-4 h-4 text-amber-400" /> },
    { id: 'WITHDRAWALS', label: 'Cashout Withdrawals', icon: <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> },
    { id: 'HEALTH', label: 'System Health', icon: <Activity className="w-4 h-4 text-cyan-400" /> },
    { id: 'ROUTERS', label: 'Routers', icon: <Radio className="w-4 h-4" /> },
    { id: 'OWNERS', label: 'Router Owners', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'CUSTOMERS', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'PACKAGES', label: 'Packages', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'PAYMENT_METHODS', label: 'Payment Methods', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
    { id: 'SUBSCRIPTION_CODES', label: 'Subscription Approvals', icon: <Receipt className="w-4 h-4 text-emerald-400" /> },
    { id: 'REFERRALS', label: 'Referrals', icon: <Share2 className="w-4 h-4" /> },
    { id: 'SUPPORT', label: 'Support', icon: <Headphones className="w-4 h-4" /> },
    { id: 'REPORTS', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'SETTINGS', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const currentTabLabel = navItems.find((n) => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      <div className="flex flex-1">
        {/* DESKTOP SIDEBAR MATCHING IMAGE 2 SECTION 5 */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0b132b] border-r border-slate-800/80 p-4 shrink-0 justify-between">
          <div className="space-y-6">
            {/* BRAND LOGO — BRISK STYLE */}
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                <div className="w-full h-full bg-[#0a1224] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white">BRISK</span>
                  <span className="text-xs font-bold text-cyan-400 tracking-wider">Super Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  ISP Billing & Network Engine
                </div>
              </div>
            </div>

            {/* NAVIGATION ITEMS */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ADMIN OPERATOR BADGE */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Single Super Admin</span>
              </div>
              <div className="font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">root@briskconnect.co.ke</div>
            </div>

            <button
              onClick={handleSyncSupabase}
              disabled={supabaseSyncLoading}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Database className={`w-3.5 h-3.5 ${supabaseSyncLoading ? 'animate-spin' : ''}`} />
              <span>{supabaseSyncLoading ? 'Syncing...' : 'Sync Supabase'}</span>
            </button>
          </div>
        </aside>

        {/* MAIN ADMIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* HEADER MATCHING IMAGE 2 SECTION 5 */}
          <header className="sticky top-0 z-30 bg-[#0b132b]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Platform Overview</h1>
                <p className="text-xs text-slate-400">Full control, Better insights. A stronger platform.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-xl font-medium focus:outline-none cursor-pointer pr-7 appearance-none"
                >
                  <option value="30days">Last 30 Days</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="all">All Time</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
                  SA
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white leading-none">Super Admin</div>
                  <div className="text-[10px] text-emerald-400 font-bold">Root Controller</div>
                </div>
              </div>
            </div>
          </header>

          {/* MESSAGES */}
          {supabaseSyncMsg && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-sky-950/70 border border-sky-800 rounded-xl text-xs text-sky-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{supabaseSyncMsg}</span>
            </div>
          )}
          {manualPushMessage && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-amber-950/70 border border-amber-800 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{manualPushMessage}</span>
            </div>
          )}

          {/* MAIN WORKSPACE CONTENT */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
            {/* ======================================================== */}
            {/* OVERVIEW TAB MATCHING IMAGE 2 SECTION 5 */}
            {/* ======================================================== */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* 4 PLATFORM STAT CARDS MATCHING SCREENSHOT */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Owners */}
                  <div className="p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-semibold">Total Owners</span>
                      <UserCheck className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono">24</div>
                  </div>

                  {/* Card 2: Total Customers */}
                  <div className="p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-semibold">Total Customers</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono">8,942</div>
                  </div>

                  {/* Card 3: Total Revenue */}
                  <div className="p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-semibold">Total Revenue</span>
                      <DollarSign className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-400 font-mono">KES 1,250,430</div>
                  </div>

                  {/* Card 4: Active Routers */}
                  <div className="p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-semibold">Active Routers</span>
                      <Radio className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-black text-emerald-400 font-mono">86</div>
                  </div>
                </div>

                {/* MIDDLE SPLIT: REVENUE OVERVIEW CHART + RECENT ACTIVITY */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT: REVENUE OVERVIEW (2/3 width) */}
                  <div className="lg:col-span-8 p-6 bg-[#0b132b] border border-slate-800/80 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">Revenue Overview</h3>
                        <p className="text-xs text-slate-400">Platform-wide SaaS licensing & M-Pesa transaction collections</p>
                      </div>
                      <span className="text-xs text-amber-400 font-semibold font-mono">Last 30 Days</span>
                    </div>

                    {/* GOLDEN SMOOTH SVG AREA CHART MATCHING IMAGE 2 SECTION 5 */}
                    <div className="h-56 relative w-full pt-4">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="adminGoldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area fill */}
                        <path
                          d="M 0 140 Q 60 110, 120 125 T 240 90 T 360 110 T 480 60 T 600 30 L 600 180 L 0 180 Z"
                          fill="url(#adminGoldGrad)"
                        />
                        {/* Golden trend line */}
                        <path
                          d="M 0 140 Q 60 110, 120 125 T 240 90 T 360 110 T 480 60 T 600 30"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Data points */}
                        <circle cx="120" cy="125" r="4" fill="#0b132b" stroke="#f59e0b" strokeWidth="2.5" />
                        <circle cx="240" cy="90" r="4" fill="#0b132b" stroke="#f59e0b" strokeWidth="2.5" />
                        <circle cx="360" cy="110" r="4" fill="#0b132b" stroke="#f59e0b" strokeWidth="2.5" />
                        <circle cx="480" cy="60" r="4" fill="#0b132b" stroke="#f59e0b" strokeWidth="2.5" />
                        <circle cx="600" cy="30" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                      </svg>
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                        <span>Day 1</span>
                        <span>Day 8</span>
                        <span>Day 15</span>
                        <span>Day 22</span>
                        <span>Day 30</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: RECENT ACTIVITY MATCHING IMAGE 2 SECTION 5 */}
                  <div className="lg:col-span-4 p-6 bg-[#0b132b] border border-slate-800/80 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">New owner registered</div>
                          <div className="text-[11px] text-slate-400">10 Oct 2025, 10:24 AM</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">Payment received (KES 2,500)</div>
                          <div className="text-[11px] text-slate-400">10 Oct 2025, 10:20 AM</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">Support ticket updated</div>
                          <div className="text-[11px] text-slate-400">9 Oct 2025, 08:52 PM</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">Router offline alert</div>
                          <div className="text-[11px] text-slate-400">8 Oct 2025, 12:45 PM</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-400 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">Package expired</div>
                          <div className="text-[11px] text-slate-400">7 Oct 2025, 11:30 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AUTOMATED BILLING CRON SERVICE STRIP */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Automated Recurring Billing Cron Daemon</div>
                      <div className="text-[11px] text-slate-400">
                        Evaluates owner 30-day licenses, issues M-Pesa B2C renewals & gracefully disables expired hotspots.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTriggerAuditNow}
                      disabled={auditRunning}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-amber-400/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{auditRunning ? 'Auditing...' : 'Run Daily Audit Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ROUTER OWNERS TAB */}
            {/* ======================================================== */}
            {activeTab === 'OWNERS' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search owners..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl w-full focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Owner Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredOwners.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-900/50">
                          <td className="p-4 font-bold text-white">{o.name}</td>
                          <td className="p-4 text-slate-300 font-mono">{o.email}</td>
                          <td className="p-4 text-slate-300 font-mono">{o.phone}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                o.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(o.id, o.status)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold"
                            >
                              {o.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* CUSTOMERS TAB */}
            {activeTab === 'CUSTOMERS' && (
              <div className="space-y-5">
                <div className="relative max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search platform customers..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl w-full focus:outline-none"
                  />
                </div>

                <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/50">
                          <td className="p-4 font-bold text-white">{c.name}</td>
                          <td className="p-4 font-mono text-slate-300">{c.phone}</td>
                          <td className="p-4 text-slate-400">{c.email}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* REAL-TIME SYSTEM HEALTH MONITOR (RECHARTS) */}
            {activeTab === 'HEALTH' && (
              <RouterHealthMonitor />
            )}

            {/* ======================================================== */}
            {/* ROUTERS FLEET */}
            {activeTab === 'ROUTERS' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0b132b] border border-slate-800/80 rounded-2xl">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400" />
                      Provisioned Router Devices & Hotspots
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage registered MikroTik gateways, IP assignments, and telemetry
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('HEALTH')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
                  >
                    <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    <span>Open Real-Time Health Monitor</span>
                  </button>
                </div>

                <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Router Name</th>
                        <th className="p-4">Model</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">CPU & RAM</th>
                        <th className="p-4">Uptime</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {routers.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-900/50">
                          <td className="p-4 font-bold text-white">{r.name}</td>
                          <td className="p-4 font-mono text-slate-300">{r.model}</td>
                          <td className="p-4 font-mono text-sky-400">{r.ipAddress}</td>
                          <td className="p-4 text-slate-300">{r.location || 'Central Area'}</td>
                          <td className="p-4">
                            <div className="text-[11px] font-mono text-slate-200">
                              CPU: <span className="text-cyan-400 font-bold">{r.cpuLoadPercent || 18}%</span> · RAM: <span className="text-indigo-400 font-bold">{r.ramUsagePercent || 32}%</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-300">{r.uptime || '28d 14h'}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Online
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Direct Health Monitor Preview below table */}
                <div className="pt-4 border-t border-slate-800/80">
                  <RouterHealthMonitor />
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PACKAGES CATALOGUE */}
            {activeTab === 'PACKAGES' && (
              <div className="space-y-5">
                <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Package</th>
                        <th className="p-4">Price (KES)</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Speed</th>
                        <th className="p-4">Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-slate-900/50">
                          <td className="p-4 font-bold text-white">{pkg.name}</td>
                          <td className="p-4 font-mono font-bold text-amber-400">KES {pkg.priceKes}</td>
                          <td className="p-4 text-slate-300">{pkg.durationLabel}</td>
                          <td className="p-4 font-mono text-sky-400">{pkg.speedLabel}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                              {pkg.isCustom ? 'Custom Tenant' : 'Official Platform'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TRANSACTIONS / PAYMENTS */}
            {activeTab === 'TRANSACTIONS' && (
              <div className="space-y-5">
                <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Reference</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {transactions.slice(0, 15).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-900/50">
                          <td className="p-4 font-mono text-sky-400">{t.reference}</td>
                          <td className="p-4 font-bold text-white">{t.userName}</td>
                          <td className="p-4 font-mono font-bold text-amber-400">KES {t.amountKes}</td>
                          <td className="p-4 text-emerald-400 font-semibold">{t.paymentMethod}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* OWNER PAYMENT METHODS TAB (Matching admin-payments.html) */}
            {/* ======================================================== */}
            {activeTab === 'PAYMENT_METHODS' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      Owner Payment Methods
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Review and verify router owner payout accounts (M-Pesa Buy Goods Till, Paybill & Bank)
                    </p>
                  </div>
                  <button
                    onClick={loadAdminPaymentMethods}
                    disabled={pmLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pmLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Verification Toast Alert */}
                {pmActionSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{pmActionSuccess}</span>
                  </div>
                )}

                {/* 3 KPI Stats matching admin-payments.html */}
                {(() => {
                  const pendingCount = adminPaymentMethods.filter((m) => m.status === 'pending').length;
                  const activeCount = adminPaymentMethods.filter((m) => m.status === 'active').length;
                  const uniqueOwnersCount = new Set(adminPaymentMethods.map((m) => m.owner_id)).size;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Stat 1: Pending Review */}
                      <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Pending Review
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-amber-400 font-mono" id="pm-pend">
                          {pendingCount}
                        </div>
                        <span className="text-[11px] text-amber-400/80 font-medium block mt-1">
                          Awaiting admin compliance approval
                        </span>
                      </div>

                      {/* Stat 2: Active */}
                      <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Active
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-400 font-mono" id="pm-act">
                          {activeCount}
                        </div>
                        <span className="text-[11px] text-emerald-400/80 font-medium block mt-1">
                          Live automated payout accounts
                        </span>
                      </div>

                      {/* Stat 3: Owners Configured */}
                      <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Owners Configured
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                            <UserCheck className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-sky-400 font-mono" id="pm-owners">
                          {uniqueOwnersCount}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-1">
                          Unique router owner operators
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b132b] border border-slate-800/80 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {(['ALL', 'PENDING', 'ACTIVE'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setPmFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          pmFilter === filter
                            ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter === 'ALL' ? 'All Methods' : filter === 'PENDING' ? 'Pending Review' : 'Active'}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search owner, phone, or number..."
                      value={pmSearch}
                      onChange={(e) => setPmSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl w-full focus:outline-none focus:border-sky-400 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Table matching admin-payments.html */}
                <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm" id="pm-table">
                  {(() => {
                    const filtered = adminPaymentMethods.filter((m) => {
                      if (pmFilter === 'PENDING' && m.status !== 'pending') return false;
                      if (pmFilter === 'ACTIVE' && m.status !== 'active') return false;
                      if (pmSearch) {
                        const q = pmSearch.toLowerCase();
                        return (
                          m.owner_name?.toLowerCase().includes(q) ||
                          m.phone?.includes(q) ||
                          m.number?.includes(q) ||
                          m.business_name?.toLowerCase().includes(q) ||
                          m.label?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 px-4 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-300 mb-1">No payment methods found</h3>
                          <p className="text-xs text-slate-500">
                            {pmFilter !== 'ALL'
                              ? `No ${pmFilter.toLowerCase()} payment accounts match your filter.`
                              : 'No router owner payout methods submitted yet.'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-4">Owner</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Number / Till</th>
                              <th className="p-4">Business</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Added</th>
                              <th className="p-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {filtered.map((m) => {
                              const isPending = m.status === 'pending';
                              const isVerifying = pmVerifyingId === m.id;

                              return (
                                <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="p-4">
                                    <div className="font-bold text-white text-sm">{m.owner_name || 'Raymond Kamau'}</div>
                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{m.phone || '—'}</div>
                                  </td>

                                  <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                      {m.label || m.type}
                                    </span>
                                  </td>

                                  <td className="p-4">
                                    <span className="font-mono font-bold text-sm text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                                      {m.number}
                                    </span>
                                    {m.bank_name && (
                                      <div className="text-[10px] text-slate-400 mt-1">{m.bank_name}</div>
                                    )}
                                  </td>

                                  <td className="p-4 text-slate-200 font-medium">
                                    {m.business_name || '—'}
                                  </td>

                                  <td className="p-4">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        m.status === 'active'
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      }`}
                                    >
                                      {m.status === 'active' ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3" /> Active
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3" /> Pending Review
                                        </>
                                      )}
                                    </span>
                                  </td>

                                  <td className="p-4 text-slate-400 text-[11px]">
                                    {m.created_at
                                      ? new Date(m.created_at).toLocaleDateString('en-KE', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'Recently'}
                                  </td>

                                  <td className="p-4 text-right">
                                    {isPending ? (
                                      <button
                                        type="button"
                                        disabled={isVerifying}
                                        onClick={() => handleVerifyPaymentMethod(m.id, m.label, m.owner_name)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60"
                                      >
                                        {isVerifying ? (
                                          <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                                          </>
                                        ) : (
                                          <>
                                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Verify
                                          </>
                                        )}
                                      </button>
                                    ) : (
                                      <span className="text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PENDING TRANSACTIONS TAB */}
            {activeTab === 'PENDING_TRANSACTIONS' && (
              <AdminPendingTransactionsTab
                users={users}
                wifiPackages={packages}
                subscriptionPlans={subscriptionPlans}
                onRefreshParentState={onRefreshState}
              />
            )}

            {/* ======================================================== */}
            {/* WITHDRAWALS APPROVAL & 5% FEE TAB */}
            {activeTab === 'WITHDRAWALS' && (() => {
              const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING');
              const approvedWithdrawals = withdrawals.filter((w) => w.status === 'COMPLETED' || w.status === 'APPROVED');
              const totalFeesCollected = withdrawals
                .filter((w) => w.status === 'COMPLETED' || w.status === 'APPROVED')
                .reduce((sum, w) => sum + (w.feeKes || Math.round(w.amount * 0.05)), 0);

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white">M-Pesa Disbursals & Withdrawal Approvals</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-bold">
                          5% PLATFORM FEE ENFORCED
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Verify customer and router owner cashout requests. Approving triggers Safaricom B2C disbursal of the net payout.
                      </p>
                    </div>
                  </div>

                  {actionSuccess && (
                    <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-4 bg-[#0b132b] border border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pending Review</div>
                      <div className="text-2xl font-black text-amber-300 font-mono">{pendingWithdrawals.length}</div>
                      <div className="text-[11px] text-slate-400">Awaiting Super Admin action</div>
                    </div>

                    <div className="p-4 bg-[#0b132b] border border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Approved & Disbursed</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">{approvedWithdrawals.length}</div>
                      <div className="text-[11px] text-slate-400">Successfully sent to M-Pesa</div>
                    </div>

                    <div className="p-4 bg-[#0b132b] border border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">5% Platform Fees</div>
                      <div className="text-2xl font-black text-cyan-300 font-mono">KES {totalFeesCollected.toLocaleString()}</div>
                      <div className="text-[11px] text-slate-400">Retained revenue from cashouts</div>
                    </div>

                    <div className="p-4 bg-[#0b132b] border border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Total Requests</div>
                      <div className="text-2xl font-black text-white font-mono">{withdrawals.length}</div>
                      <div className="text-[11px] text-slate-400">All-time cashout transactions</div>
                    </div>
                  </div>

                  {/* Table of Withdrawals */}
                  <div className="bg-[#0b132b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span>Withdrawal Requests Ledger</span>
                      </h3>
                      <button
                        type="button"
                        onClick={onRefreshState}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-800"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-[#070d1e] text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3.5">ID / User</th>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5">Gross Amount</th>
                            <th className="p-3.5 text-amber-400">5% Fee</th>
                            <th className="p-3.5 text-emerald-400">Net Disbursal</th>
                            <th className="p-3.5">M-Pesa Phone</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {withdrawals.length > 0 ? (
                            withdrawals.map((w) => {
                              const fee = w.feeKes ?? Math.round(w.amount * 0.05);
                              const net = w.netAmountKes ?? w.amount - fee;
                              const isPending = w.status === 'PENDING';

                              return (
                                <tr key={w.id} className="hover:bg-slate-900/50 transition-colors">
                                  <td className="p-3.5">
                                    <div className="font-mono font-bold text-white">{w.id}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{w.userId}</div>
                                  </td>
                                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                                    {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'Today'}
                                  </td>
                                  <td className="p-3.5 font-mono text-slate-200">
                                    KES {w.amount.toLocaleString()}
                                  </td>
                                  <td className="p-3.5 font-mono text-amber-400 font-semibold">
                                    - KES {fee.toLocaleString()}
                                  </td>
                                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                                    KES {net.toLocaleString()}
                                  </td>
                                  <td className="p-3.5 font-mono text-sky-400 font-semibold">
                                    {w.phone || '0712345678'}
                                  </td>
                                  <td className="p-3.5">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        w.status === 'COMPLETED' || w.status === 'APPROVED'
                                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                          : w.status === 'REJECTED'
                                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/50 animate-pulse'
                                      }`}
                                    >
                                      ● {w.status}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-right">
                                    {isPending ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          disabled={actionLoading}
                                          onClick={() => handleWithdrawalAction(w.id, 'APPROVE')}
                                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          type="button"
                                          disabled={actionLoading}
                                          onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                                          className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-[11px] rounded-lg border border-rose-800/40 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-slate-500 italic">Resolved</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                                No withdrawal requests recorded in the system.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SUBSCRIPTION ACTIVATION CODES TAB */}
            {/* ======================================================== */}
            {activeTab === 'SUBSCRIPTION_CODES' && (
              <AdminSubscriptionCodesTab
                subscriptionPlans={subscriptionPlans}
                users={users}
              />
            )}

            {/* ======================================================== */}
            {/* REFERRALS */}
            {activeTab === 'REFERRALS' && (
              <div className="space-y-5">
                <div className="p-6 bg-[#0b132b] border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white">Partner & Host Referral Network</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400">Active Wi-Fi Hosts</span>
                      <div className="text-2xl font-black text-white mt-1">18</div>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400">Monthly Commission Pool</span>
                      <div className="text-2xl font-black text-amber-400 mt-1 font-mono">KES 142,000</div>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400">Disbursed B2C Settlements</span>
                      <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">100% On-time</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SUPPORT */}
            {activeTab === 'SUPPORT' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Open Network Incidents & Operator Tickets</h3>
                <div className="space-y-3">
                  {incidents.slice(0, 5).map((inc) => (
                    <div key={inc.id} className="p-4 bg-[#0b132b] border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white">Incident #{inc.incidentNumber} - {inc.networkName}</div>
                        <div className="text-[11px] text-slate-400">Gateway: {inc.routerName} · Started: {inc.startedAt} · Affected: {inc.affectedUsers} users</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {inc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* REPORTS */}
            {activeTab === 'REPORTS' && (
              <div className="space-y-5">
                <div className="p-6 bg-[#0b132b] border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white">Platform Audit & Settlement Reports</h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                      <Download className="w-4 h-4" />
                      <span>Export Monthly P&L Ledger (CSV)</span>
                    </button>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                      <Download className="w-4 h-4" />
                      <span>Export Router Telemetry Logs</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SETTINGS */}
            {activeTab === 'SETTINGS' && (
              <div className="space-y-5">
                <div className="p-6 bg-[#0b132b] border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white">Global Super Admin Settings</h3>
                  <div className="space-y-4 max-w-md text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Platform Brand Name</label>
                      <input
                        type="text"
                        defaultValue="BRISK Smart Connect"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Safaricom B2C Disbursal Shortcode</label>
                      <input
                        type="text"
                        defaultValue="600000 (Test B2C Shortcode)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex">
          <div className="w-full max-w-xs bg-[#0b132b] border border-slate-800 rounded-2xl p-5 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black text-white">BRISK Admin</span>
              </div>
              <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1 text-xs">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left font-medium ${
                    activeTab === item.id ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
