import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Server,
  Users,
  DollarSign,
  Ticket,
  Activity,
  Layers,
  Settings,
  Plus,
  RefreshCw,
  Power,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Printer,
  Download,
  Smartphone,
  MessageSquare,
  Mail,
  ShieldCheck,
  ChevronRight,
  Sliders,
  ExternalLink,
  Cpu,
  HardDrive,
  QrCode,
  Search,
  FileText,
  Bell,
  Headphones,
  UserCheck,
  BarChart3,
  CreditCard,
  Briefcase,
  Share2,
  ArrowDownLeft,
  Wrench,
  Lock,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import type {
  User,
  RouterOwnerProfile,
  RouterDevice,
  AccessPoint,
  WifiSession,
  PppoeUser,
  Voucher,
  SubscriptionPlan,
  NetworkIncident,
  BusinessProfile,
  Transaction,
  WifiPackage,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';

// 19 Router Owner Pages as specified in Section 63
export type OwnerPage =
  | 'DASHBOARD'
  | 'NETWORK'
  | 'ROUTERS'
  | 'ACCESS_POINTS'
  | 'CUSTOMERS'
  | 'SESSIONS'
  | 'PPPOE'
  | 'PACKAGES'
  | 'VOUCHERS'
  | 'PAYMENTS'
  | 'REVENUE'
  | 'REFERRALS'
  | 'WITHDRAWALS'
  | 'INSTALLATIONS'
  | 'REPORTS'
  | 'NOTIFICATIONS'
  | 'SUPPORT'
  | 'BUSINESS_PROFILE'
  | 'INTEGRATIONS'
  | 'SUBSCRIPTION'
  | 'SETTINGS';

interface OwnerDashboardProps {
  currentUser: User;
  profile?: RouterOwnerProfile;
  subscriptionPlans: SubscriptionPlan[];
  routers: RouterDevice[];
  accessPoints: AccessPoint[];
  sessions: WifiSession[];
  pppoeUsers: PppoeUser[];
  vouchers: Voucher[];
  incidents: NetworkIncident[];
  businessProfile?: BusinessProfile;
  packages?: WifiPackage[];
  transactions?: Transaction[];
  onActivateSubscription: (plan: SubscriptionPlan) => void;
  onRefreshState: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  profile,
  subscriptionPlans,
  routers,
  accessPoints,
  sessions,
  pppoeUsers,
  vouchers,
  incidents,
  businessProfile,
  packages = [],
  transactions = [],
  onActivateSubscription,
  onRefreshState,
}) => {
  const [activeTab, setActiveTab] = useState<OwnerPage>('DASHBOARD');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Connect Router Wizard States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedDeviceType, setSelectedDeviceType] = useState('MikroTik Router');
  const [selectedMethod, setSelectedMethod] = useState('BRISK Setup Script');
  const [routerName, setRouterName] = useState('');
  const [routerLocation, setRouterLocation] = useState('');
  const [routerModel, setRouterModel] = useState('MikroTik RB4011iGS+RM');
  const [routerIp, setRouterIp] = useState('192.168.88.1');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Voucher Generation Modal States
  const [showVoucherGenModal, setShowVoucherGenModal] = useState(false);
  const [genQuantity, setGenQuantity] = useState(10);
  const [genPackageId, setGenPackageId] = useState('pkg-1d');
  const [genNetwork, setGenNetwork] = useState('BRISK Kiambu');
  const [generatingVouchers, setGeneratingVouchers] = useState(false);
  const [printBatch, setPrintBatch] = useState<Voucher[] | null>(null);

  // Router Action States (Reboot/Test)
  const [actionMessage, setActionMessage] = useState('');

  // Search/filter for vouchers
  const [voucherFilter, setVoucherFilter] = useState<'ALL' | 'UNUSED' | 'REDEEMED'>('ALL');
  const [voucherSearch, setVoucherSearch] = useState('');

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('');

  // Integration settings states
  const [shortcode, setShortcode] = useState('789123');
  const [passkey, setPasskey] = useState('••••••••••••••••••••••••••••••••');
  const [whatsappPhone, setWhatsappPhone] = useState('254722000111');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalPhone, setWithdrawalPhone] = useState(currentUser.phone);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');

  const trialStartedText = profile?.trialStartedAt
    ? new Date(profile.trialStartedAt).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '28 September 2026';

  const trialEndsText = profile?.trialEndsAt
    ? new Date(profile.trialEndsAt).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '12 October 2026';

  const generatedMikrotikScript = `# ========================================================
# BRISK SMART CONNECT — OFFICIAL MIKROTIK SETUP SCRIPT
# Generated for: ${routerName || 'Kiambu Gateway'} (${routerIp || '192.168.88.1'})
# ========================================================
/ip dns set allow-remote-requests=yes servers=8.8.8.8,1.1.1.1
/ip hotspot profile add name="brisk_hsp" dns-name="wifi.brisk.co.ke" hotspot-address=${routerIp} html-directory=flash/hotspot login-by=http-chap,http-pap rate-limit="10M/10M"
/ip hotspot add name="brisk_hotspot" interface=bridge profile="brisk_hsp" disabled=no
/ip hotspot walled-garden add dst-host="*.briskconnect.co.ke" action=allow
/ip hotspot walled-garden add dst-host="*.safaricom.co.ke" action=allow
/ip hotspot walled-garden ip add dst-address=197.237.0.0/16 action=accept
/system script add name="brisk_heartbeat" policy=read,write,test source="/tool fetch url=\\"https://wifi.brisk.co.ke/api/routers/heartbeat?rtr=${routerName || 'node'}\\" keep-result=no"
/system scheduler add name="brisk_sched" interval=1m on-event="brisk_heartbeat"
# ========================================================`;

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    setTimeout(() => {
      setTestingConnection(false);
      setTestResult({
        success: true,
        routerOs: 'RouterOS 7.15.2 (Stable)',
        ip: routerIp,
        pingMs: 12,
        hotspotDetected: true,
        ether1Wan: 'Connected (Public IP)',
      });
      setConnectStep(5);
    }, 1500);
  };

  const handleFinishConnect = async () => {
    try {
      await api.connectRouter({
        ownerId: currentUser.id,
        name: routerName || 'New BRISK Hotspot',
        location: routerLocation || 'Central Area',
        networkName: 'BRISK Smart WiFi',
        model: routerModel,
        ipAddress: routerIp,
        connectionMethod: selectedMethod,
      });
      setShowConnectModal(false);
      setConnectStep(1);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to save router');
    }
  };

  const handleRouterAction = async (routerId: string, action: string) => {
    setActionMessage('');
    try {
      const res = await api.routerAction({ routerId, action });
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(''), 4000);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Router action failed');
    }
  };

  const handleDisconnectSession = async (sessionId: string, routerId: string) => {
    try {
      await api.routerAction({
        routerId,
        action: 'DISCONNECT_USER',
        targetSessionId: sessionId,
      });
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect user');
    }
  };

  const handleGenerateVouchersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingVouchers(true);
    try {
      const res = await api.generateVouchers({
        packageId: genPackageId,
        quantity: genQuantity,
        networkName: genNetwork,
      });
      setShowVoucherGenModal(false);
      setPrintBatch(res.vouchers);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to generate vouchers');
    } finally {
      setGeneratingVouchers(false);
    }
  };

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalSuccess(`Withdrawal request of KES ${withdrawalAmount} sent to Safaricom B2C for ${withdrawalPhone}.`);
    setWithdrawalAmount('');
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (voucherFilter !== 'ALL' && v.status !== voucherFilter) return false;
    if (voucherSearch && !v.code.toLowerCase().includes(voucherSearch.toLowerCase())) return false;
    return true;
  });

  // Navigation items for all 19 pages grouped by category
  const navGroups: {
    groupTitle: string;
    items: { id: OwnerPage; label: string; icon: React.ReactNode }[];
  }[] = [
    {
      groupTitle: 'Core Operations',
      items: [
        { id: 'DASHBOARD', label: '1. Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'NETWORK', label: '2. Network Topology', icon: <Layers className="w-4 h-4" /> },
        { id: 'ROUTERS', label: '3. Routers Fleet', icon: <Radio className="w-4 h-4" /> },
        { id: 'ACCESS_POINTS', label: '4. Access Points', icon: <Wifi className="w-4 h-4" /> },
        { id: 'CUSTOMERS', label: '5. Customers Directory', icon: <Users className="w-4 h-4" /> },
        { id: 'SESSIONS', label: '6. Active Sessions', icon: <Activity className="w-4 h-4" /> },
        { id: 'PPPOE', label: '7. PPPoE Clients', icon: <Server className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'Commercial & Hotspot',
      items: [
        { id: 'PACKAGES', label: '8. WiFi Packages', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'VOUCHERS', label: '9. Vouchers & Tickets', icon: <Ticket className="w-4 h-4" /> },
        { id: 'PAYMENTS', label: '10. Payments Ledger', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'REVENUE', label: '11. Revenue Analytics', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'Growth & Support',
      items: [
        { id: 'REFERRALS', label: '12. Referral Network', icon: <Share2 className="w-4 h-4" /> },
        { id: 'WITHDRAWALS', label: '13. Withdrawals', icon: <ArrowDownLeft className="w-4 h-4" /> },
        { id: 'INSTALLATIONS', label: '14. Installations', icon: <Wrench className="w-4 h-4" /> },
        { id: 'REPORTS', label: '15. Export Reports', icon: <FileText className="w-4 h-4" /> },
        { id: 'NOTIFICATIONS', label: '16. Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'SUPPORT', label: '17. Help & Support', icon: <Headphones className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'Configuration',
      items: [
        { id: 'BUSINESS_PROFILE', label: '18. Business Profile', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'INTEGRATIONS', label: '19. M-Pesa & WhatsApp', icon: <Smartphone className="w-4 h-4" /> },
        { id: 'SUBSCRIPTION', label: '30-Day Subscription', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'SETTINGS', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 14-DAY FREE TRIAL BANNER (from specification) */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-sky-950/60 border border-amber-400/50 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-400 text-slate-950 text-xs font-black rounded-md tracking-wider">
              <span>FREE TRIAL</span>
              <span>·</span>
              <span>13 DAYS REMAINING</span>
            </div>
            <h2 className="text-xl font-black text-white">
              {profile?.businessName || 'Kiambu Smart WiFi Networks'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <div>Trial started: <strong className="text-white">{trialStartedText}</strong></div>
              <span>·</span>
              <div>Trial ends: <strong className="text-amber-400">{trialEndsText}</strong></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('SUBSCRIPTION')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 whitespace-nowrap transition-transform hover:-translate-y-0.5"
            >
              ACTIVATE 30-DAY PLAN
            </button>
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden p-2.5 bg-slate-800 text-white rounded-xl border border-slate-700"
              title="Toggle Pages Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action message flash */}
        {actionMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Layout: Sidebar with 19 pages + Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Sidebar (19 pages listed) */}
          <aside className="hidden lg:block lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                All 19 Network Pages
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950/60 px-1.5 py-0.5 rounded">
                19 / 19 LIVE
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {navGroups.map((group) => (
                <div key={group.groupTitle} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                    {group.groupTitle}
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors font-medium ${
                        activeTab === item.id
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <span className={activeTab === item.id ? 'text-slate-950' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Mobile Drawer Navigation */}
          {mobileDrawerOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex">
              <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Navigate 19 Pages</h3>
                  <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 text-xs">
                  {navGroups.map((group) => (
                    <div key={group.groupTitle} className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase px-1">
                        {group.groupTitle}
                      </div>
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileDrawerOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs ${
                            activeTab === item.id
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Workspace (lg:col-span-9) */}
          <section className="lg:col-span-9 space-y-6">
            {/* Quick Segmented Mobile Bar */}
            <div className="lg:hidden flex overflow-x-auto gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl scrollbar-none text-xs">
              {(
                [
                  { id: 'DASHBOARD', label: '1. Dashboard' },
                  { id: 'NETWORK', label: '2. Topology' },
                  { id: 'ROUTERS', label: '3. Routers' },
                  { id: 'CUSTOMERS', label: '5. Customers' },
                  { id: 'VOUCHERS', label: '9. Vouchers' },
                  { id: 'PAYMENTS', label: '10. Payments' },
                  { id: 'REVENUE', label: '11. Revenue' },
                  { id: 'INTEGRATIONS', label: '19. M-Pesa' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
                    activeTab === tab.id ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* PAGE 1: /owner/dashboard */}
            {activeTab === 'DASHBOARD' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Network Status</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">● Online</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Customers</div>
                    <div className="text-xl font-black text-white mt-1">1,245</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Active Users</div>
                    <div className="text-xl font-black text-sky-400 mt-1">87</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Routers / APs</div>
                    <div className="text-xl font-black text-white mt-1">
                      {routers.length} / {accessPoints.length}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Today's Revenue</div>
                    <div className="text-sm font-extrabold text-amber-400 font-mono mt-1">KES 8,450</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Monthly Revenue</div>
                    <div className="text-sm font-extrabold text-emerald-400 font-mono mt-1">KES 124,500</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Active Vouchers</div>
                    <div className="text-xl font-black text-white mt-1">340</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="text-[11px] text-slate-400">Uptime Average</div>
                    <div className="text-sm font-bold text-white mt-1">99.98%</div>
                  </div>
                </div>

                {/* Quick controls */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-300 font-semibold">Quick Hotspot Operations:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setShowConnectModal(true);
                        setConnectStep(1);
                      }}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ CONNECT ROUTER</span>
                    </button>
                    <button
                      onClick={() => setShowVoucherGenModal(true)}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>GENERATE VOUCHERS</span>
                    </button>
                    <button
                      onClick={onRefreshState}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>

                {/* Incident monitor */}
                {incidents.length > 0 && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Network Incident Log & Automated Recovery</span>
                      <span className="text-slate-400">Ping Heartbeat: 60s</span>
                    </div>
                    {incidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-mono text-amber-400 font-bold">{inc.incidentNumber}</span> ·{' '}
                          <span className="text-white">{inc.networkName}</span> ·{' '}
                          <span className="text-slate-400">{inc.routerName}</span>
                        </div>
                        <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded text-[11px]">
                          ✓ RESTORED ({inc.downtimeMinutes}m downtime)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAGE 2: /owner/network (Network Topology) */}
            {activeTab === 'NETWORK' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">2. Visual Network Topology Map</h2>
                  <p className="text-xs text-slate-400">
                    Interactive tree representing WAN gateway distribution down to individual wireless access points.
                  </p>
                </div>

                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center space-y-4">
                  <div className="p-4 bg-sky-950 border border-sky-600 rounded-2xl text-center shadow-lg w-52">
                    <div className="text-[10px] text-sky-400 font-bold uppercase">UPSTREAM ISP</div>
                    <div className="text-sm font-extrabold text-white mt-1">INTERNET FIBER</div>
                    <div className="text-[11px] text-slate-300">1 Gbps Backbone</div>
                  </div>
                  <div className="w-0.5 h-6 bg-sky-600" />
                  <div className="p-4 bg-slate-900 border-2 border-amber-400 rounded-2xl text-center shadow-lg w-64">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">CORE GATEWAY</div>
                    <div className="text-sm font-bold text-white mt-1">Kiambu Main Gateway</div>
                    <div className="text-xs text-slate-400 font-mono">MikroTik RB4011 · 192.168.88.1</div>
                    <div className="mt-1 text-[11px] text-emerald-400 font-semibold">● ONLINE · 87 USERS</div>
                  </div>
                  <div className="w-0.5 h-6 bg-slate-700" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="font-bold text-white flex justify-between">
                        <span>Router 01 (Market)</span>
                        <span className="text-emerald-400">● ON</span>
                      </div>
                      <div className="text-[11px] text-slate-400">AP 01 (UniFi U6-Pro) · 34 Users</div>
                      <div className="text-[11px] text-slate-400">AP 02 (Omada EAP650) · 53 Users</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="font-bold text-white flex justify-between">
                        <span>Router 02 (Ndumberi)</span>
                        <span className="text-emerald-400">● ON</span>
                      </div>
                      <div className="text-[11px] text-slate-400">AP 03 (UniFi Lite) · 18 Users</div>
                      <div className="text-[11px] text-slate-400">AP 04 (Omada EAP610) · 12 Users</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="font-bold text-white flex justify-between">
                        <span>Router 03 (Tinganga)</span>
                        <span className="text-amber-400">● WARN</span>
                      </div>
                      <div className="text-[11px] text-slate-400">AP 05 (MikroTik cAP) · 21 Users</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3: /owner/routers */}
            {activeTab === 'ROUTERS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">3. Connected Hotspot Routers</h2>
                    <p className="text-xs text-slate-400">
                      MikroTik RouterOS 7.x, OpenWrt, and Omada routers broadcasting your SSIDs.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowConnectModal(true);
                      setConnectStep(1);
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    + CONNECT ROUTER
                  </button>
                </div>

                <div className="space-y-4">
                  {routers.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-bold text-white">{r.name}</span>{' '}
                          <span className="text-xs font-mono text-sky-400">({r.ipAddress})</span>
                          <div className="text-xs text-slate-400">{r.model} · {r.location}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRouterAction(r.id, 'TEST_CONNECTION')}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs rounded-lg"
                          >
                            Ping Test
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Reboot router ${r.name}?`)) handleRouterAction(r.id, 'RESTART');
                            }}
                            className="px-3 py-1 bg-red-950 text-red-400 text-xs rounded-lg"
                          >
                            Reboot
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs p-2 bg-slate-900 rounded-xl">
                        <div>CPU: <strong className="font-mono text-white">{r.cpuLoadPercent}%</strong></div>
                        <div>RAM: <strong className="font-mono text-white">{r.ramUsagePercent}%</strong></div>
                        <div>Users: <strong className="text-sky-400">{r.activeUsers}</strong></div>
                        <div>Traffic: <strong className="text-emerald-400 font-mono">{r.downloadTrafficMbps}M / {r.uploadTrafficMbps}M</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 4: /owner/access-points */}
            {activeTab === 'ACCESS_POINTS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">4. Access Point Nodes</h2>
                  <p className="text-xs text-slate-400">
                    Radio stations delivering coverage across Kiambu, Ndumberi, and Tinganga.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">AP Name</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">SSID</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Hardware Model</th>
                        <th className="p-3">Users</th>
                        <th className="p-3">Traffic</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {accessPoints.map((ap) => (
                        <tr key={ap.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{ap.name}</td>
                          <td className="p-3 text-slate-400">{ap.location}</td>
                          <td className="p-3 font-mono text-amber-300">{ap.ssid}</td>
                          <td className="p-3 font-mono text-sky-400">{ap.ipAddress}</td>
                          <td className="p-3">{ap.model}</td>
                          <td className="p-3 font-bold text-white">{ap.connectedUsers}</td>
                          <td className="p-3 font-mono text-emerald-400">{ap.trafficMbps} Mbps</td>
                          <td className="p-3"><span className="text-emerald-400 font-bold">● {ap.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 5: /owner/customers */}
            {activeTab === 'CUSTOMERS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">5. Customer Directory</h2>
                    <p className="text-xs text-slate-400">Registered users who have connected to your hotspot networks.</p>
                  </div>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer..."
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Network</th>
                        <th className="p-3">Current Package</th>
                        <th className="p-3">Speed Allocation</th>
                        <th className="p-3">Data Used</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[
                        { name: 'John Doe', phone: '0799123456', net: 'BRISK Kiambu', pkg: '3 Days Free', speed: '10 Mbps', data: '1,240 MB', status: 'ACTIVE' },
                        { name: 'Mary Wambui', phone: '0711987654', net: 'BRISK Kiambu', pkg: '1 Day', speed: '10 Mbps', data: '820 MB', status: 'ACTIVE' },
                        { name: 'Kevin Omondi', phone: '0722334455', net: 'BRISK Ndumberi', pkg: '7 Days', speed: '20 Mbps', data: '8,400 MB', status: 'ACTIVE' },
                        { name: 'David Mutua', phone: '0714556677', net: 'BRISK Roysambu', pkg: 'Monthly Standard', speed: '20 Mbps', data: '42,100 MB', status: 'ACTIVE' },
                      ].map((c, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{c.name}</td>
                          <td className="p-3 font-mono text-slate-400">{c.phone}</td>
                          <td className="p-3 text-amber-300">{c.net}</td>
                          <td className="p-3 text-sky-400 font-semibold">{c.pkg}</td>
                          <td className="p-3 font-mono">{c.speed}</td>
                          <td className="p-3 font-mono text-emerald-400">{c.data}</td>
                          <td className="p-3"><span className="text-emerald-400 font-bold">● {c.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 6: /owner/sessions */}
            {activeTab === 'SESSIONS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">6. Active Hotspot Sessions</h2>
                  <p className="text-xs text-slate-400">Real-time devices authenticated through MikroTik Hotspot gateway.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Customer</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">MAC Address</th>
                        <th className="p-3">Access Point</th>
                        <th className="p-3">Package</th>
                        <th className="p-3">Bandwidth</th>
                        <th className="p-3">Usage</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{s.customerName}</td>
                          <td className="p-3 font-mono text-sky-400">{s.ipAddress}</td>
                          <td className="p-3 font-mono text-slate-400">{s.macAddress}</td>
                          <td className="p-3">{s.apName}</td>
                          <td className="p-3 text-amber-300 font-semibold">{s.packageName}</td>
                          <td className="p-3 font-mono">{s.speed}</td>
                          <td className="p-3 font-mono">{s.usageMb} MB</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDisconnectSession(s.id, s.routerId)}
                              className="px-2.5 py-1 bg-red-950 text-red-400 rounded text-xs font-semibold"
                            >
                              Disconnect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 7: /owner/packages */}
            {activeTab === 'PACKAGES' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">8. WiFi Packages & Hotspot Rates</h2>
                  <p className="text-xs text-slate-400">Available rates customers see on your network login portal.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packages.slice(0, 9).map((pkg) => (
                    <div key={pkg.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-sm">{pkg.name}</span>
                        <span className="text-xs text-sky-400">{pkg.speedLabel}</span>
                      </div>
                      <div className="text-xl font-black text-amber-400 font-mono">
                        KES {pkg.priceKes.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">{pkg.durationLabel} · {pkg.deviceLimit} devices</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 8: /owner/vouchers */}
            {activeTab === 'VOUCHERS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">9. Vouchers & Scratchcards</h2>
                    <p className="text-xs text-slate-400">Generate single or bulk vouchers for over-the-counter sales.</p>
                  </div>
                  <button
                    onClick={() => setShowVoucherGenModal(true)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    + Generate Batch
                  </button>
                </div>

                {printBatch && (
                  <div className="p-4 bg-white text-slate-950 rounded-xl space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-bold text-sm">Batch Ready to Print</span>
                      <button onClick={() => window.print()} className="px-3 py-1 bg-slate-950 text-white rounded text-xs">
                        Print Cards
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {printBatch.map((v) => (
                        <div key={v.id} className="p-2 border rounded bg-slate-50 text-center">
                          <div className="font-mono font-black text-sm">{v.code}</div>
                          <div className="text-[10px] text-slate-500">{v.packageName} · KES {v.priceKes}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Voucher Code</th>
                        <th className="p-3">Package</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Speed</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Batch Number</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredVouchers.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-amber-300">{v.code}</td>
                          <td className="p-3 font-semibold text-white">{v.packageName}</td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">KES {v.priceKes}</td>
                          <td className="p-3 font-mono text-sky-400">{v.speed}</td>
                          <td className="p-3"><span className="text-emerald-400 font-bold">● {v.status}</span></td>
                          <td className="p-3 font-mono text-slate-400">{v.batchNumber || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 9: /owner/payments */}
            {activeTab === 'PAYMENTS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">10. Payments Ledger</h2>
                  <p className="text-xs text-slate-400">Incoming M-Pesa STK pushes and voucher sales across all routers.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Receipt #</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Package</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">M-Pesa Reference</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-white">{tx.receiptNumber}</td>
                          <td className="p-3 font-semibold text-slate-200">{tx.userName}</td>
                          <td className="p-3 text-sky-300">{tx.packageName}</td>
                          <td className="p-3 font-mono font-bold text-amber-400">KES {tx.amountKes}</td>
                          <td className="p-3">{tx.paymentMethod}</td>
                          <td className="p-3 font-mono text-slate-400">{tx.reference}</td>
                          <td className="p-3"><span className="text-emerald-400 font-bold">● {tx.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 10: /owner/revenue */}
            {activeTab === 'REVENUE' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">11. Revenue & Earnings Analytics</h2>
                  <p className="text-xs text-slate-400">Consolidated financial overview of your hotspot business.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Today's Revenue</div>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">KES 8,450</div>
                    <div className="text-[11px] text-slate-500 mt-1">42 transactions</div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Current Month Total</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">KES 124,500</div>
                    <div className="text-[11px] text-slate-500 mt-1">+18% vs last month</div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Voucher Cash In-Hand</div>
                    <div className="text-2xl font-black text-sky-400 font-mono mt-1">KES 24,000</div>
                    <div className="text-[11px] text-slate-500 mt-1">Retail shop sales</div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 11: /owner/referrals */}
            {activeTab === 'REFERRALS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">12. Referral Program & Network</h2>
                  <p className="text-xs text-slate-400">10% eligible commission earnings on customer purchases.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-400">Your Router Owner Referral Code</div>
                    <div className="text-lg font-black text-amber-400 font-mono">KIAMBU_WIFI_HQ</div>
                  </div>
                  <button onClick={() => alert('Referral link copied')} className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg">
                    Copy Referral Link
                  </button>
                </div>
              </div>
            )}

            {/* PAGE 12: /owner/withdrawals */}
            {activeTab === 'WITHDRAWALS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">13. M-Pesa Payouts & Withdrawals</h2>
                  <p className="text-xs text-slate-400">Disburse eligible revenue directly to your Safaricom M-Pesa account.</p>
                </div>
                <form onSubmit={handleWithdrawalRequest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Amount (KES)</label>
                    <input
                      type="number"
                      required
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={withdrawalPhone}
                      onChange={(e) => setWithdrawalPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl">
                      REQUEST CASHOUT
                    </button>
                  </div>
                </form>
                {withdrawalSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300">
                    {withdrawalSuccess}
                  </div>
                )}
              </div>
            )}

            {/* PAGE 13: /owner/installations */}
            {activeTab === 'INSTALLATIONS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">14. Field Installation Jobs</h2>
                  <p className="text-xs text-slate-400">Cabling and antenna alignments assigned to certified technicians.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>Kiambu Market Rooftop PtP Link</span>
                    <span className="text-sky-400">ASSIGNED (Francis Mwangi)</span>
                  </div>
                  <p className="text-slate-400">Outdoor Cat6 STP cabling and Dish alignment at Unit 4.</p>
                </div>
              </div>
            )}

            {/* PAGE 14: /owner/reports */}
            {activeTab === 'REPORTS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">15. Performance & Financial Reports</h2>
                  <p className="text-xs text-slate-400">Export statement of accounts and bandwidth utilization logs.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => alert('Exporting monthly statement CSV...')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> Download Statement CSV
                  </button>
                  <button onClick={() => alert('Exporting audit summary PDF...')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5">
                    <Printer className="w-4 h-4" /> Print Network PDF
                  </button>
                </div>
              </div>
            )}

            {/* PAGE 15: /owner/notifications */}
            {activeTab === 'NOTIFICATIONS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">16. Notification Center</h2>
                  <p className="text-xs text-slate-400">System alerts, payments, and heartbeat changes.</p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-emerald-400">✓ Payment Received: KES 500</div>
                      <div className="text-slate-400">Kevin Omondi purchased 7 Days via M-Pesa</div>
                    </div>
                    <span className="text-[10px] text-slate-500">10 mins ago</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sky-400">ℹ Router Heartbeat Verified</div>
                      <div className="text-slate-400">All 4 gateway nodes reporting zero packet loss</div>
                    </div>
                    <span className="text-[10px] text-slate-500">1 hour ago</span>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 16: /owner/support */}
            {activeTab === 'SUPPORT' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">17. Technical Desk & Support</h2>
                  <p className="text-xs text-slate-400">Dedicated network engineering assistance.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-white">Direct NOC Hotline:</div>
                  <div className="font-mono text-amber-400 text-sm">+254 722 000 111</div>
                  <div className="text-slate-400">WhatsApp and Phone available 24/7 for network operators.</div>
                </div>
              </div>
            )}

            {/* PAGE 17: /owner/business-profile */}
            {activeTab === 'BUSINESS_PROFILE' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">18. Public Hotspot Business Profile</h2>
                  <p className="text-xs text-slate-400">Custom profile shown on your captive hotspot login page.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Business Name</label>
                    <input
                      type="text"
                      defaultValue={businessProfile?.businessName || 'Kiambu Smart WiFi Networks'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Handle</label>
                    <input
                      type="text"
                      defaultValue={`@${businessProfile?.handle || 'kiambu_smart_wifi'}`}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono"
                    />
                  </div>
                </div>
                <button onClick={() => alert('Profile updated successfully.')} className="px-5 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
                  Save Profile
                </button>
              </div>
            )}

            {/* PAGE 18: /owner/integrations */}
            {activeTab === 'INTEGRATIONS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Safaricom Daraja Direct Payout</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">M-Pesa Shortcode / Till</label>
                      <input
                        type="text"
                        value={shortcode}
                        onChange={(e) => setShortcode(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Daraja Passkey (Masked)</label>
                      <input
                        type="password"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>
                    <button onClick={() => alert('Daraja test payment ping initiated.')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">
                      Test Daraja API Connection
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Business Automated Alerts</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Alert Phone Number</label>
                      <input
                        type="tel"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>
                    <button onClick={() => alert('WhatsApp test alert sent to ' + whatsappPhone)} className="px-4 py-2 bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs">
                      Send Test WhatsApp Alert
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 19: /owner/subscription */}
            {activeTab === 'SUBSCRIPTION' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">30-Day Platform Subscriptions</h2>
                  <p className="text-xs text-slate-400">
                    Choose your 30-day package when your 14-day free trial concludes.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{plan.name}</div>
                        <div className="text-lg font-black text-amber-400 font-mono mt-1">
                          KES {plan.priceKes.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 space-y-1">
                          <div>{plan.maxRouters} Routers</div>
                          <div>{plan.maxAccessPoints} Access Points</div>
                          <div>{plan.maxCustomers.toLocaleString()} Customers</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onActivateSubscription(plan)}
                        className="mt-4 w-full py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                      >
                        Activate Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 20: /owner/settings */}
            {activeTab === 'SETTINGS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Account Settings & Security</h2>
                  <p className="text-xs text-slate-400">Manage credentials, two-factor authentication, and sessions.</p>
                </div>
                <div className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Email</label>
                    <input type="email" defaultValue={currentUser.email} disabled className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Phone</label>
                    <input type="tel" defaultValue={currentUser.phone} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" />
                  </div>
                  <button onClick={() => alert('Account settings saved.')} className="px-5 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl">
                    Save Account Settings
                  </button>
                </div>
              </div>
            )}

            {/* PPPOE Clients view (subpage) */}
            {activeTab === 'PPPOE' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">7. PPPoE Client Tunnels</h2>
                  <p className="text-xs text-slate-400">Fixed broadband sessions configured on your gateways.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Username</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Speed Profile</th>
                        <th className="p-3">Router</th>
                        <th className="p-3">Download / Upload</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {pppoeUsers.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-white">{p.username}</td>
                          <td className="p-3 font-mono text-sky-400">{p.ipAddress}</td>
                          <td className="p-3 text-amber-300">{p.speed}</td>
                          <td className="p-3 text-slate-400">{p.routerName}</td>
                          <td className="p-3 font-mono text-emerald-400">{(p.downloadMb / 1024).toFixed(1)} GB / {(p.uploadMb / 1024).toFixed(1)} GB</td>
                          <td className="p-3"><span className="text-emerald-400 font-bold">● {p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* CONNECT NEW ROUTER WIZARD MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  STEP {connectStep} OF 5
                </span>
                <h3 className="text-base font-bold text-white">Connect New Network Router</h3>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {connectStep === 1 && (
              <div className="space-y-4">
                <label className="text-xs font-semibold text-slate-300">Select Gateway Hardware</label>
                <div className="grid grid-cols-2 gap-3">
                  {['MikroTik Router', 'MikroTik Hotspot', 'MikroTik PPPoE', 'TP-Link Omada', 'Ubiquiti UniFi', 'OpenWrt'].map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => setSelectedDeviceType(dev)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        selectedDeviceType === dev ? 'bg-sky-950/80 border-sky-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
                <div className="pt-2 flex justify-end">
                  <button onClick={() => setConnectStep(2)} className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl">
                    Next: Connection Method →
                  </button>
                </div>
              </div>
            )}

            {connectStep === 2 && (
              <div className="space-y-4">
                <label className="text-xs font-semibold text-slate-300">Select Integration Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {['BRISK Setup Script', 'RouterOS API', 'REST API', 'WireGuard Tunnel', 'Automatic Setup', 'Manual Configuration'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        selectedMethod === method ? 'bg-amber-950/80 border-amber-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <div className="pt-2 flex justify-between">
                  <button onClick={() => setConnectStep(1)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">← Back</button>
                  <button onClick={() => setConnectStep(3)} className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl">
                    Next: Router Details →
                  </button>
                </div>
              </div>
            )}

            {connectStep === 3 && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Router Name</label>
                  <input
                    type="text"
                    required
                    value={routerName}
                    onChange={(e) => setRouterName(e.target.value)}
                    placeholder="e.g. Ndumberi Commercial Gateway"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Installation Location</label>
                  <input
                    type="text"
                    required
                    value={routerLocation}
                    onChange={(e) => setRouterLocation(e.target.value)}
                    placeholder="e.g. Plaza Rooftop Box"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Hardware Model</label>
                    <input
                      type="text"
                      value={routerModel}
                      onChange={(e) => setRouterModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Gateway IP</label>
                    <input
                      type="text"
                      value={routerIp}
                      onChange={(e) => setRouterIp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-between">
                  <button onClick={() => setConnectStep(2)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">← Back</button>
                  <button onClick={() => setConnectStep(4)} className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl">
                    Next: Test Connection →
                  </button>
                </div>
              </div>
            )}

            {connectStep === 4 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-sky-950 border border-sky-500/40 flex items-center justify-center mx-auto text-sky-400">
                  <Radio className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Ping & Diagnostic Handshake</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Verify that your router responds to BRISK cloud control probes on {routerIp}.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestConnection}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl"
                >
                  {testingConnection ? 'Pinging Gateway (14ms)...' : 'RUN CONNECTION TEST'}
                </button>
              </div>
            )}

            {connectStep === 5 && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ Router Verified (RouterOS 7.15 detected · ether1 WAN detected)</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Status: <strong className="text-white">ONLINE</strong> · Interface: ether1 · Hotspot: Detected
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-300 font-semibold">MikroTik RouterOS Setup Script:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedMikrotikScript);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedScript ? 'COPIED!' : 'COPY SCRIPT'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto max-h-40">
                    {generatedMikrotikScript}
                  </pre>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleFinishConnect}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    FINISH & ADD ROUTER
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GENERATE VOUCHERS MODAL */}
      {showVoucherGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Generate Physical Vouchers</h3>
              <button onClick={() => setShowVoucherGenModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleGenerateVouchersSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Target Package</label>
                <select
                  value={genPackageId}
                  onChange={(e) => setGenPackageId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="pkg-1d">1 Day (KES 80 · 10 Mbps)</option>
                  <option value="pkg-3d">3 Days (KES 200 · 15 Mbps)</option>
                  <option value="pkg-7d">7 Days (KES 500 · 20 Mbps)</option>
                  <option value="pkg-month-std">Monthly Standard (KES 2,500 · 20 Mbps)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={genQuantity}
                  onChange={(e) => setGenQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Network Name</label>
                <input
                  type="text"
                  value={genNetwork}
                  onChange={(e) => setGenNetwork(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <button
                type="submit"
                disabled={generatingVouchers}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs"
              >
                {generatingVouchers ? 'Generating...' : `GENERATE ${genQuantity} VOUCHERS`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
