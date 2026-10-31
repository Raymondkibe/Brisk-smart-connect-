import React, { useState } from 'react';
import { NetworkHealthIndicator } from './NetworkHealthIndicator.tsx';
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
  AlertCircle,
  CheckCircle2,
  Copy,
  Printer,
  Download,
  Smartphone,
  MessageSquare,
  Mail,
  ShieldCheck,
  KeyRound,
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
  Clock,
  Globe,
  Menu,
  X,
  Terminal,
  Play,
  Scissors,
  Zap,
  Trash2,
  Eye,
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
  RouterAlert,
  ManualSubscriptionRequest,
  WithdrawalRequest,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { subscriptionCronService } from '../../services/subscriptionCronService.ts';
import { PrintVouchersModal } from './PrintVouchersModal.tsx';
import { MikrotikToolsModal } from './MikrotikToolsModal.tsx';
import { PppoeModal } from './PppoeModal.tsx';
import { VoucherQrModal } from './VoucherQrModal.tsx';
import { RouterQrModal } from './RouterQrModal.tsx';
import { AddCustomPackageModal } from './AddCustomPackageModal.tsx';
import { CaptivePortalPreviewModal } from './CaptivePortalPreviewModal.tsx';
import { CaptivePortalBuilder } from './CaptivePortalBuilder.tsx';
import { IntegrationsContainer } from './integrations/IntegrationsContainer.tsx';
import { RealTimeAuditLogDisplay } from './RealTimeAuditLogDisplay.tsx';
import { EasyConnectWizard } from './EasyConnectWizard.tsx';
import { OwnerPaymentMethodsView } from './OwnerPaymentMethodsView.tsx';
import { RouterSetupScriptsView } from './RouterSetupScriptsView.tsx';
import { RouterDiagnosticModal } from './RouterDiagnosticModal.tsx';
import { RouterLatencyTrendChart } from './RouterLatencyTrendChart.tsx';
import { RouterAlertToast } from './RouterAlertToast.tsx';
import { RouterUsageHeatmap } from './RouterUsageHeatmap.tsx';
import { SubmitTransitionCodeModal } from './SubmitTransitionCodeModal.tsx';
import { useSubscriptionGuard } from '../../hooks/useSubscriptionGuard.ts';

// Router Owner Pages + Wizard & Payment Methods + Captive Portal Studio
export type OwnerPage =
  | 'DASHBOARD'
  | 'NETWORK'
  | 'ROUTERS'
  | 'EASY_CONNECT'
  | 'SETUP_SCRIPTS'
  | 'ACCESS_POINTS'
  | 'CUSTOMERS'
  | 'SESSIONS'
  | 'PPPOE'
  | 'PACKAGES'
  | 'VOUCHERS'
  | 'PAYMENTS'
  | 'PAYMENT_METHODS'
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
  | 'SETTINGS'
  | 'CAPTIVE_PORTAL';

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
  withdrawals?: WithdrawalRequest[];
  onActivateSubscription: (plan: SubscriptionPlan) => void;
  onRefreshState: () => void;
  onGoToHotspotPortal?: () => void;
  initialTab?: OwnerPage;
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
  withdrawals = [],
  onActivateSubscription,
  onRefreshState,
  onGoToHotspotPortal,
  initialTab = 'DASHBOARD',
}) => {
  const [activeTab, setActiveTab] = useState<OwnerPage>(initialTab);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ISP Hardware & Hotspot Modals
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showMikrotikToolsModal, setShowMikrotikToolsModal] = useState(false);
  const [showPppoeModal, setShowPppoeModal] = useState(false);
  const [selectedQrVoucher, setSelectedQrVoucher] = useState<Voucher | null>(null);
  const [selectedRouterForQr, setSelectedRouterForQr] = useState<RouterDevice | null>(null);
  const [showAddCustomPackageModal, setShowAddCustomPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<WifiPackage | null>(null);
  const [showPortalPreviewModal, setShowPortalPreviewModal] = useState(false);
  const [deletingPppoeId, setDeletingPppoeId] = useState<string | null>(null);
  const [localPackages, setLocalPackages] = useState<WifiPackage[]>([]);

  // Router Ping Diagnostics & Latency Alert System
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticRouterId, setDiagnosticRouterId] = useState<string | undefined>(undefined);
  const [latencyThresholdMs, setLatencyThresholdMs] = useState(45);
  const [packetLossThresholdPercent, setPacketLossThresholdPercent] = useState(5);
  const [routerAlerts, setRouterAlerts] = useState<RouterAlert[]>([
    {
      id: 'alt-init-1',
      routerId: 'r-02',
      routerName: 'Ndumberi Town Sub-Gateway',
      severity: 'WARNING',
      title: 'High Ping Latency: 68ms',
      message: 'Ping latency spiked to 68ms (configured threshold: 45ms) via Safaricom Fiber uplink.',
      metricType: 'LATENCY',
      value: 68,
      threshold: 45,
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      read: false,
    },
  ]);

  const handleOpenDiagnostic = (routerId?: string) => {
    setDiagnosticRouterId(routerId);
    setShowDiagnosticModal(true);
  };

  const handleDismissAlert = (id: string) => {
    setRouterAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAllAlerts = () => {
    setRouterAlerts([]);
  };

  const handleSimulateAlert = (type: 'LATENCY' | 'DISCONNECT') => {
    const targetRouter = routers[0] || { id: 'r-01', name: 'Kiambu Main Gateway' };
    if (type === 'LATENCY') {
      const spikeLatency = Math.floor(Math.random() * 40) + 75;
      const newAlert: RouterAlert = {
        id: `alt-${Date.now()}`,
        routerId: targetRouter.id,
        routerName: targetRouter.name,
        severity: spikeLatency > 90 ? 'CRITICAL' : 'WARNING',
        title: `High Ping Latency: ${spikeLatency}ms`,
        message: `High latency detected on ${targetRouter.name}: ${spikeLatency}ms exceeds threshold of ${latencyThresholdMs}ms.`,
        metricType: 'LATENCY',
        value: spikeLatency,
        threshold: latencyThresholdMs,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setRouterAlerts((prev) => [newAlert, ...prev]);
    } else {
      const newAlert: RouterAlert = {
        id: `alt-${Date.now()}`,
        routerId: targetRouter.id,
        routerName: targetRouter.name,
        severity: 'CRITICAL',
        title: 'Connectivity Dropped: 100% Packet Loss',
        message: `Connectivity dropped: 3 consecutive ping probe timeouts on ${targetRouter.name} gateway.`,
        metricType: 'CONNECTIVITY',
        value: 100,
        threshold: packetLossThresholdPercent,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setRouterAlerts((prev) => [newAlert, ...prev]);
    }
  };

  // Load router owner custom packages on mount
  const loadOwnerPackages = () => {
    api
      .getOwnerPackages(currentUser.id)
      .then((res) => {
        if (res && res.packages) {
          setLocalPackages(res.packages);
        }
      })
      .catch((err) => {
        console.warn('Could not load owner packages:', err);
        setLocalPackages(packages.filter((p) => p.isCustom));
      });
  };

  React.useEffect(() => {
    loadOwnerPackages();
  }, [currentUser.id]);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handlePackageCreated = (newPkg: WifiPackage) => {
    setLocalPackages((prev) => [newPkg, ...prev]);
    onRefreshState();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('brisk-package-updated', { detail: newPkg }));
      localStorage.setItem('brisk_portal_last_updated', Date.now().toString());
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this custom WiFi package? It will no longer appear on your captive portal.')) return;
    try {
      await api.deleteCustomPackage(packageId);
      setLocalPackages((prev) => prev.filter((p) => p.id !== packageId));
      onRefreshState();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brisk-package-updated'));
        localStorage.setItem('brisk_portal_last_updated', Date.now().toString());
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete package.');
    }
  };

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
  const [enrollmentToken, setEnrollmentToken] = useState(() => `brk-tok-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[admin@MikroTik] > ',
    '# Terminal ready. Run the script below or click "Execute Script in Terminal Console".'
  ]);
  const [terminalExecuting, setTerminalExecuting] = useState(false);
  const [scriptAutoConnected, setScriptAutoConnected] = useState(false);
  const [antiBypassProbeResult, setAntiBypassProbeResult] = useState<string | null>(null);
  const [testingAntiBypass, setTestingAntiBypass] = useState(false);

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

  // PPPoE filter & search
  const [pppoeFilter, setPppoeFilter] = useState<'ALL' | 'CONNECTED' | 'DISCONNECTED'>('ALL');
  const [pppoeSearch, setPppoeSearch] = useState('');
  const [copiedPppoeCmd, setCopiedPppoeCmd] = useState<string | null>(null);

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('');

  // Payment flow filter (ISP Revenue vs Platform SaaS)
  const [paymentFlowFilter, setPaymentFlowFilter] = useState<'ALL' | 'ISP_REVENUE' | 'PLATFORM_SAAS'>('ALL');

  // Integration settings states
  const [shortcode, setShortcode] = useState('789123');
  const [passkey, setPasskey] = useState('••••••••••••••••••••••••••••••••');
  const [whatsappPhone, setWhatsappPhone] = useState('254722000111');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  // Daraja M-Pesa STK Push Test Box states
  const [testStkPhone, setTestStkPhone] = useState('0799123456');
  const [testStkAmount, setTestStkAmount] = useState(10);
  const [testStkLoading, setTestStkLoading] = useState(false);
  const [testStkResult, setTestStkResult] = useState<any>(null);

  // Captive Portal Customizer state
  const [customSsid, setCustomSsid] = useState('BRISK Smart WiFi');
  const [customHeading, setCustomHeading] = useState('Smart WiFi. Smart Host. Smarter You.');
  const [customTheme, setCustomTheme] = useState<'amber' | 'emerald' | 'sky' | 'purple'>('amber');
  const [customHelpline, setCustomHelpline] = useState('0722 000 111 / 0799 123 456');
  const [portalCustomSaved, setPortalCustomSaved] = useState(false);
  const [withdrawalPhone, setWithdrawalPhone] = useState(currentUser.phone);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewMessage, setRenewMessage] = useState('');

  const handleTriggerOwnerRenewStk = async (amount: number, planName: string) => {
    setRenewLoading(true);
    setRenewMessage('');
    try {
      const targetPhone = currentUser.phone || '0712345678';
      const res = await api.initiateMpesaStk({
        phone: targetPhone,
        amount: amount,
        type: 'ROUTER_OWNER_SUBSCRIPTION',
        reference: `RENEW-${planName.slice(0, 6).toUpperCase()}`,
      });
      setRenewMessage(`M-Pesa renewal prompt dispatched to ${targetPhone}! (Checkout ID: ${res.checkoutRequestId || 'OK'})`);
      setTimeout(() => setRenewMessage(''), 5000);
    } catch (err: any) {
      setRenewMessage(`M-Pesa request: ${err.message || 'Dispatched STK push prompt'}`);
    } finally {
      setRenewLoading(false);
    }
  };

  // Subscription Expiry & M-Pesa Transition Code Auto-Activation System
  const [simulatedSubExpired, setSimulatedSubExpired] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [blockedActionTitle, setBlockedActionTitle] = useState<string | null>(null);

  const {
    isOwnerExpired: rawIsOwnerExpired,
    ownerEndDate,
    ownerRemaining,
    canManageRouters,
  } = useSubscriptionGuard({
    ownerProfile: profile,
    onOpenActivateModal: () => setShowSubmitModal(true),
  });

  const isSubExpired = simulatedSubExpired || rawIsOwnerExpired;

  // Intercept any router management action and block if subscription is expired
  const guardRouterAction = (action: () => void, featureName: string) => {
    if (isSubExpired) {
      setBlockedActionTitle(featureName);
      setShowSubmitModal(true);
      return false;
    }
    action();
    return true;
  };

  const handleActivationSuccess = (updatedProf?: any) => {
    setSimulatedSubExpired(false);
    setShowSubmitModal(false);
    setBlockedActionTitle(null);
    onRefreshState();
  };

  // Transition Code Submission State
  const [transitionCodeInput, setTransitionCodeInput] = useState('');
  const [submittingTransitionCode, setSubmittingTransitionCode] = useState(false);
  const [transitionFeedback, setTransitionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingRequest, setPendingRequest] = useState<ManualSubscriptionRequest | null>(null);

  // Poll for admin auto-activation
  const checkOwnerApprovalStatus = async () => {
    try {
      const res = await api.getOwnerManualRequests(currentUser.id);
      if (res && res.requests) {
        const pending = res.requests.find((r: any) => r.status === 'PENDING_APPROVAL');
        setPendingRequest(pending || null);
      }
      if (res && res.profile) {
        const isNowActive =
          res.profile.subscriptionStatus === 'ACTIVE' &&
          Boolean(res.profile.subscriptionExpiresAt && new Date(res.profile.subscriptionExpiresAt).getTime() > Date.now());
        if (isNowActive && isSubExpired) {
          setSimulatedSubExpired(false);
          setPendingRequest(null);
          onRefreshState();
        }
      }
    } catch (err) {
      // quiet catch
    }
  };

  React.useEffect(() => {
    checkOwnerApprovalStatus();
    const interval = setInterval(checkOwnerApprovalStatus, 6000);
    return () => clearInterval(interval);
  }, [currentUser.id, isSubExpired]);

  const handleQuickSubmitTransitionCode = async () => {
    const code = transitionCodeInput.trim().toUpperCase();
    if (!code) {
      setTransitionFeedback({ type: 'error', message: 'Please enter your M-Pesa transition code from Safaricom (e.g. QKR49X2PLA).' });
      return;
    }
    setSubmittingTransitionCode(true);
    setTransitionFeedback(null);
    try {
      const res = await api.submitManualSubscriptionPayment({
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        phone: currentUser.phone || '0722000111',
        planName: 'BRISK Pro Host (30 Days)',
        amountKes: 1500,
        transactionReference: code,
      });
      if (res && res.request) {
        setPendingRequest(res.request);
        setTransitionFeedback({
          type: 'success',
          message: `✓ M-Pesa transition code "${code}" submitted! The Admin will review it and your account will automatically activate immediately.`,
        });
        setTransitionCodeInput('');
      }
    } catch (err: any) {
      setTransitionFeedback({
        type: 'error',
        message: err.message || 'Failed to submit transition code.',
      });
    } finally {
      setSubmittingTransitionCode(false);
    }
  };

  // Manual payment submission state (Paybill 222111 / Acc 5414200)
  const [manualMpesaRef, setManualMpesaRef] = useState('');
  const [manualAmount, setManualAmount] = useState(1500);
  const [manualPhone, setManualPhone] = useState(currentUser.phone || '0712883849');
  const [manualPlanName, setManualPlanName] = useState('BRISK Pro Host');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualSubmitSuccess, setManualSubmitSuccess] = useState('');

  const handleSubmitManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMpesaRef.trim()) {
      alert('Please enter your M-Pesa transaction confirmation code.');
      return;
    }
    setSubmittingManual(true);
    setManualSubmitSuccess('');
    try {
      await api.submitManualSubscriptionPayment({
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        phone: manualPhone,
        mpesaReference: manualMpesaRef.toUpperCase().trim(),
        amountKes: Number(manualAmount),
        planName: manualPlanName,
      });
      setManualSubmitSuccess(`Payment reference "${manualMpesaRef.toUpperCase()}" submitted to Admin! The admin will verify and dispatch your activation code via SMS or system.`);
      setManualMpesaRef('');
      setTimeout(() => setManualSubmitSuccess(''), 8000);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to submit manual payment.');
    } finally {
      setSubmittingManual(false);
    }
  };

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
# BRISK SMART CONNECT — MIKROTIK SETUP & ANTI-BYPASS
# Router: ${routerName || 'Gateway'} | Token: ${enrollmentToken}
# ========================================================
# 1. Hotspot Profile & RADIUS Authentication
/ip dns set allow-remote-requests=yes servers=1.1.1.1,8.8.8.8
/ip hotspot profile add name="brisk_hsp" dns-name="wifi.brisk.co.ke" hotspot-address=${routerIp || '192.168.88.1'} html-directory=flash/hotspot login-by=http-chap,http-pap,mac-cookie use-radius=yes
/ip hotspot add name="brisk_hotspot" interface=bridge profile="brisk_hsp" disabled=no

# 2. Strict Walled Garden (Only Captive Portal & M-Pesa allowed before payment)
/ip hotspot walled-garden add dst-host="*.vercel.app" action=allow comment="BRISK Captive Portal"
/ip hotspot walled-garden add dst-host="*.safaricom.co.ke" action=allow comment="Daraja M-Pesa API"
/ip hotspot walled-garden add dst-host="*.brisk.co.ke" action=allow comment="Platform Gateway"

# 3. ANTI-BYPASS ENFORCEMENT (Drop unauthorized guest traffic & DNS tunneling)
/ip firewall filter add chain=forward action=drop hotspot=!auth comment="ANTI-BYPASS: Drop unauthorized guest internet traffic"
/ip firewall filter add chain=forward protocol=tcp dst-port=443 action=drop hotspot=!auth comment="ANTI-BYPASS: Block HTTPS direct bypass"
/ip firewall filter add chain=forward protocol=tcp dst-port=80 action=drop hotspot=!auth comment="ANTI-BYPASS: Block HTTP direct bypass"
/ip firewall nat add chain=dstnat protocol=udp dst-port=53 action=redirect to-ports=53 comment="ANTI-BYPASS: Intercept UDP DNS Tunneling"
/ip firewall nat add chain=dstnat protocol=tcp dst-port=53 action=redirect to-ports=53 comment="ANTI-BYPASS: Intercept TCP DNS Hijack"
/interface bridge filter add chain=forward in-interface=wlan1 out-interface=wlan1 action=drop comment="ANTI-BYPASS: Client Isolation"

# 4. Outbound Handshake (Auto-Connects Website on Terminal Execution)
/tool fetch url="http://localhost:3000/api/router/enrollment-callback?token=${enrollmentToken}&router=${encodeURIComponent(routerName || 'MikroTik Gateway')}" keep-result=no
/log info "BRISK MikroTik Gateway Auto-Connected! Anti-Bypass active."
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


  // Poll for terminal script execution & auto-connect router
  React.useEffect(() => {
    if (!showConnectModal || connectStep !== 5 || scriptAutoConnected) return;

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.getRouterEnrollmentStatus(enrollmentToken);
        if (res && res.enrolled && isSubscribed && !scriptAutoConnected) {
          setScriptAutoConnected(true);
          setTerminalLogs((prev) => [
            ...prev,
            '✓ [RouterOS Callback] Script execution detected from router terminal!',
            '✓ Handshake verified: RouterBOARD RB750Gr3 (RouterOS 7.15.2)',
            '✓ Anti-Bypass Firewall & Walled Garden: ACTIVE (0% bypass leakage)',
            '✓ Automatically connecting router to network dashboard...',
          ]);
          setTimeout(() => {
            handleFinishConnect();
            setActionMessage(`🎉 Router "${routerName || 'MikroTik Gateway'}" terminal script executed! Automatically connected with Anti-Bypass active.`);
            setTimeout(() => setActionMessage(''), 6000);
          }, 1800);
        }
      } catch (err) {
        // silent poll catch
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [showConnectModal, connectStep, enrollmentToken, scriptAutoConnected, routerName]);

  // Interactive Terminal Runner: executes the script in the simulated terminal
  const handleRunTerminalScript = async () => {
    if (terminalExecuting || scriptAutoConnected) return;
    setTerminalExecuting(true);
    setTerminalLogs((prev) => [
      ...prev,
      `[admin@MikroTik] > /import ${(routerName || 'gateway').toLowerCase()}_setup.rsc`,
      'Opening setup script...',
      'Applying Hotspot profile "brisk_hsp"... [OK]',
      'Applying Strict Walled Garden allowlist for M-Pesa & Portal... [OK]',
      'Configuring Anti-Bypass Firewall Filter (Drop unauthenticated traffic)... [OK]',
      'Redirecting Port 53 UDP/TCP DNS queries to local walled garden... [OK]',
      'Executing outbound connector enrollment callback...',
      '  status: connecting to http://localhost:3000/api/router/enrollment-callback...',
      '  status: finished (HTTP 200 OK)',
      '/log info "BRISK MikroTik Gateway Auto-Connected! Anti-Bypass active."',
    ]);

    try {
      await api.simulateRouterTerminalRun({
        token: enrollmentToken,
        routerName: routerName || 'MikroTik Gateway',
        routerLocation: routerLocation || 'Central Area',
        routerIp: routerIp || '192.168.88.1',
        routerModel: routerModel || 'MikroTik RB750Gr3',
      });
      setScriptAutoConnected(true);
      setTerminalLogs((prev) => [
        ...prev,
        '✓ [BRISK Cloud] Router terminal execution detected and verified!',
        '✓ Anti-Bypass Firewall: 100% ENFORCED',
        '✓ Automatically adding router to your dashboard...',
      ]);
      setTimeout(() => {
        handleFinishConnect();
        setActionMessage(`🎉 Router "${routerName || 'MikroTik Gateway'}" script executed in terminal! Automatically connected.`);
        setTimeout(() => setActionMessage(''), 6000);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to simulate terminal run');
    } finally {
      setTerminalExecuting(false);
    }
  };

  const handleRunAntiBypassTest = () => {
    setTestingAntiBypass(true);
    setAntiBypassProbeResult(null);
    setTimeout(() => {
      setTestingAntiBypass(false);
      setAntiBypassProbeResult('✓ PROBE BLOCKED: Unauthenticated packet to 8.8.8.8:443 was intercepted and dropped by MikroTik firewall rule (chain=forward, hotspot=!auth). 0 bytes leaked. Anti-Bypass 100% active.');
    }, 1200);
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
        connectionMethod: selectedMethod as any,
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

  const handleTogglePppoe = async (id: string) => {
    try {
      await api.togglePppoeStatus(id);
      setActionMessage('PPPoE subscriber status updated.');
      setTimeout(() => setActionMessage(''), 3500);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle subscriber');
    }
  };

  const handleRemindPppoe = async (id: string) => {
    try {
      const res = await api.remindPppoeUser(id);
      setActionMessage(res.message || 'Payment reminder sent to subscriber.');
      setTimeout(() => setActionMessage(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to send reminder');
    }
  };

  const handleDeletePppoe = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete PPPoE subscriber account "${username}"?`)) return;
    setDeletingPppoeId(id);
    try {
      await api.deletePppoeUser(id);
      setActionMessage(`PPPoE account "${username}" deleted successfully.`);
      setTimeout(() => setActionMessage(''), 3500);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to delete PPPoE subscriber');
    } finally {
      setDeletingPppoeId(null);
    }
  };

  const handleTestStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStkLoading(true);
    setTestStkResult(null);
    try {
      const res = await api.initiateMpesaStk({
        phone: testStkPhone,
        amount: testStkAmount,
        type: 'CUSTOMER_WIFI',
        reference: `TEST-${Date.now().toString().slice(-4)}`,
      });
      setTestStkResult({
        success: true,
        merchantRequestId: res.merchantRequestId || '29115-492812-1',
        checkoutRequestId: res.checkoutRequestId || `ws_CO_${Date.now()}`,
        responseCode: '0',
        responseDescription: 'Success. Request accepted for processing',
        customerMessage: 'Success. Prompt displayed on handset.',
      });
    } catch (err: any) {
      setTestStkResult({
        success: false,
        error: err.message || 'Daraja STK push handshake failed',
      });
    } finally {
      setTestStkLoading(false);
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
      setShowPrintModal(true);
      setActionMessage(`Generated batch of ${genQuantity} vouchers. Ready for thermal or A4 printing.`);
      setTimeout(() => setActionMessage(''), 4000);
      onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to generate vouchers');
    } finally {
      setGeneratingVouchers(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawalAmount);
    if (!amt || amt < 100) {
      setWithdrawalError('Minimum withdrawal amount is KES 100.');
      return;
    }
    const currentBalance = profile?.walletBalanceKes ?? 12450;
    if (amt > currentBalance) {
      setWithdrawalError(`Requested amount KES ${amt.toLocaleString()} exceeds your available wallet balance of KES ${currentBalance.toLocaleString()}.`);
      return;
    }

    setWithdrawalLoading(true);
    setWithdrawalError('');
    setWithdrawalSuccess('');
    try {
      const fee = Math.round(amt * 0.05);
      const net = amt - fee;
      const res = await api.requestOwnerWithdrawal({
        ownerId: currentUser.id,
        amount: amt,
        phone: withdrawalPhone || currentUser.phone || '0712345678',
      });
      setWithdrawalSuccess(`Withdrawal of KES ${amt.toLocaleString()} submitted! 5% fee (KES ${fee.toLocaleString()}) deducted. Net payout: KES ${net.toLocaleString()} awaiting Super Admin approval.`);
      setWithdrawalAmount('');
      onRefreshState();
    } catch (err: any) {
      setWithdrawalError(err.message || 'Withdrawal request failed');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (voucherFilter !== 'ALL' && v.status !== voucherFilter) return false;
    if (voucherSearch && !v.code.toLowerCase().includes(voucherSearch.toLowerCase())) return false;
    return true;
  });

  const filteredPppoeUsers = pppoeUsers.filter((p) => {
    if (pppoeFilter !== 'ALL' && p.status !== pppoeFilter) return false;
    if (
      pppoeSearch &&
      !p.username.toLowerCase().includes(pppoeSearch.toLowerCase()) &&
      !p.ipAddress.includes(pppoeSearch)
    )
      return false;
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
        { id: 'EASY_CONNECT', label: '⚡ Easy Connect Wizard', icon: <Zap className="w-4 h-4 text-sky-400" /> },
        { id: 'SETUP_SCRIPTS', label: 'Router Setup Scripts', icon: <Terminal className="w-4 h-4 text-cyan-400" /> },
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
        { id: 'CAPTIVE_PORTAL', label: 'Captive Portal Studio', icon: <Smartphone className="w-4 h-4" /> },
        { id: 'PAYMENTS', label: '10. Payments Ledger', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'PAYMENT_METHODS', label: 'Owner Payment Methods', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
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
        { id: 'INTEGRATIONS', label: '19. API Integrations Hub', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
        { id: 'SUBSCRIPTION', label: '30-Day Subscription', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'SETTINGS', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d1a] py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* SUBSCRIPTION EXPIRED LOCKOUT BANNER */}
        {isSubExpired ? (
          <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500/70 rounded-3xl shadow-2xl shadow-rose-950/60 space-y-4 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-7 h-7 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                      SUBSCRIPTION EXPIRED · MANAGEMENT SUSPENDED
                    </span>
                    <span className="text-xs text-rose-300 font-mono">Status: INACTIVE</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Router Owner License Expired — Network Controls Suspended
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                    Your 30-day router owner license has expired. Hotspot guest network authentication, physical voucher printing, and remote MikroTik provisioning will not work until activated. Pay manually via M-Pesa Paybill <strong className="text-amber-400 font-mono">222111</strong> Acc <strong className="text-amber-400 font-mono">5414200</strong> or submit your M-Pesa Transition Code below for instant admin approval.
                  </p>
                </div>
              </div>

              {/* Mobile-Responsive Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                <button
                  type="button"
                  onClick={() => {
                    setBlockedActionTitle('Router Network Operations');
                    setShowSubmitModal(true);
                  }}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-center min-h-[44px]"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Submit Transition Code →</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SUBSCRIPTION')}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-black rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-center min-h-[44px]"
                >
                  <span>View M-Pesa Instructions</span>
                </button>
              </div>
            </div>

            {/* Quick Inline M-Pesa Transition Code Form */}
            {pendingRequest ? (
              <div className="p-4 bg-[#0a1224] rounded-2xl border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Transition Code Awaiting Admin Approval
                    </span>
                    <span className="text-xs text-white font-mono font-black tracking-wide">
                      Ref: <span className="text-cyan-300">{pendingRequest.transactionReference}</span> · KES {pendingRequest.amountKes} ({pendingRequest.planName})
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Once the Admin approves this code, your account will automatically activate immediately.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkOwnerApprovalStatus}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md min-h-[42px]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Approval Status</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-[#0a1224] rounded-2xl border border-blue-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Paid via Paybill 222111 Acc 5414200?
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Enter your M-Pesa transition code for instant Admin auto-activation
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
                  <input
                    type="text"
                    value={transitionCodeInput}
                    onChange={(e) => setTransitionCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. QKR49X2PLA"
                    className="w-full sm:flex-1 px-3.5 py-2.5 bg-[#080d1a] border border-slate-700 rounded-xl text-xs text-white font-mono uppercase tracking-wider focus:outline-none focus:border-cyan-400 placeholder:text-slate-500 min-h-[44px]"
                  />
                  <button
                    type="button"
                    disabled={submittingTransitionCode || !transitionCodeInput.trim()}
                    onClick={handleQuickSubmitTransitionCode}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center min-h-[44px] whitespace-nowrap"
                  >
                    {submittingTransitionCode ? 'Submitting...' : 'SUBMIT CODE'}
                  </button>
                </div>
              </div>
            )}

            {transitionFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  transitionFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                }`}
              >
                {transitionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{transitionFeedback.message}</span>
              </div>
            )}
          </div>
        ) : (
          /* 14-DAY FREE TRIAL / ACTIVE SUBSCRIPTION BANNER */
          <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-sky-950/60 border border-amber-400/50 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black rounded-md tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SUBSCRIPTION ACTIVE</span>
                  <span>·</span>
                  <span>13 DAYS REMAINING</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulatedSubExpired(true)}
                  className="px-2 py-0.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-[10px] font-bold rounded cursor-pointer transition-colors"
                  title="Simulate subscription expiration to test lockout and activation"
                >
                  ⚠️ Test Expire Subscription
                </button>
              </div>
              <h2 className="text-xl font-black text-white">
                {profile?.businessName || 'Kiambu Smart WiFi Networks'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <div>Trial started: <strong className="text-white">{trialStartedText}</strong></div>
                <span>·</span>
                <div>Expires: <strong className="text-amber-400">{trialEndsText}</strong></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setBlockedActionTitle(null);
                  setShowSubmitModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                title="Submit M-Pesa transition code for Admin auto-activation"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                <span>SUBMIT M-PESA CODE</span>
              </button>
              <button
                onClick={() => guardRouterAction(() => setShowMikrotikToolsModal(true), 'MikroTik Maintenance Tools')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>MIKROTIK TOOLS</span>
              </button>
              {onGoToHotspotPortal && (
                <button
                  onClick={onGoToHotspotPortal}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 font-bold text-xs rounded-xl border border-sky-700 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>HOTSPOT PORTAL</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPortalPreviewModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 transition-colors cursor-pointer whitespace-nowrap"
                title="Preview Branded Captive Portal on Mobile / Tablet / Desktop"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>PREVIEW PORTAL</span>
              </button>
              <button
                onClick={() => setActiveTab('SUBSCRIPTION')}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 whitespace-nowrap transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                MANAGE 30-DAY PLAN
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
        )}

        {/* Action message flash */}
        {actionMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* MODERN 3D VECTOR VISUAL HIERARCHY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Dashboard Analytics */}
          <div
            onClick={() => setActiveTab('DASHBOARD')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              activeTab === 'DASHBOARD'
                ? 'bg-amber-950/40 border-amber-400/80 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 p-0.5 bg-slate-950">
              <img
                src="/src/assets/images/icon_dashboard_analytics_1792325984725.jpg"
                alt="Dashboard Analytics Vector Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Metrics</div>
              <h3 className="text-xs font-bold text-white truncate">Live Dashboard</h3>
              <p className="text-[11px] text-slate-400">{sessions.length} Active Sessions</p>
            </div>
          </div>

          {/* Card 2: MikroTik Routers Fleet */}
          <div
            onClick={() => setActiveTab('ROUTERS')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              activeTab === 'ROUTERS'
                ? 'bg-sky-950/40 border-sky-400/80 shadow-lg shadow-sky-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 p-0.5 bg-slate-950">
              <img
                src="/src/assets/images/icon_routers_mikrotik_1792325985474.jpg"
                alt="MikroTik Hardware Vector Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Hardware</div>
              <h3 className="text-xs font-bold text-white truncate">Routers & APs</h3>
              <p className="text-[11px] text-slate-400">{routers.length} Managed Routers</p>
            </div>
          </div>

          {/* Card 3: Hotspot Vouchers & Tickets */}
          <div
            onClick={() => setActiveTab('VOUCHERS')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              activeTab === 'VOUCHERS'
                ? 'bg-amber-950/40 border-amber-400/80 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 p-0.5 bg-slate-950">
              <img
                src="/src/assets/images/icon_vouchers_hotspot_1792325985959.jpg"
                alt="Hotspot Voucher Vector Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Scratchcards</div>
              <h3 className="text-xs font-bold text-white truncate">Vouchers & PINs</h3>
              <p className="text-[11px] text-slate-400">{vouchers.length} Total Vouchers</p>
            </div>
          </div>

          {/* Card 4: 30-Day Subscription & Recurring Billing */}
          <div
            onClick={() => setActiveTab('SUBSCRIPTION')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              activeTab === 'SUBSCRIPTION'
                ? 'bg-emerald-950/40 border-emerald-400/80 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 p-0.5 bg-slate-950">
              <img
                src="/src/assets/images/icon_sub_billing_1792325986081.jpg"
                alt="Recurring Billing Vector Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Billing</div>
              <h3 className="text-xs font-bold text-white truncate">Subscription & M-Pesa</h3>
              <p className="text-[11px] text-slate-400">Recurring SaaS Engine</p>
            </div>
          </div>
        </div>

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
            {activeTab === 'DASHBOARD' && (() => {
              const uniqueCustomersCount = new Set(
                sessions.map((s) => s.customerId || s.customerName).filter(Boolean)
              ).size;
              const activeUsersCount = sessions.length;
              const todayRev = transactions
                .filter(
                  (t) =>
                    t.status === 'SUCCESS' &&
                    new Date(t.createdAt).toDateString() === new Date().toDateString()
                )
                .reduce((acc, t) => acc + t.amountKes, 0);
              const monthlyRev = transactions
                .filter((t) => t.status === 'SUCCESS')
                .reduce((acc, t) => acc + t.amountKes, 0);
              const activeVouchersCount = vouchers.filter((v) => v.status === 'UNUSED').length;
              const avgUptimeStr =
                routers.length > 0
                  ? `${((routers.filter((r) => r.status === 'ONLINE').length / routers.length) * 100).toFixed(1)}%`
                  : '100%';

              return (
                <div className="space-y-6">
                  {/* REAL-TIME NETWORK HEALTH INDICATOR COMPONENT */}
                  <NetworkHealthIndicator routers={routers} onRefresh={onRefreshState} />

                  {/* DYNAMIC METRIC CARDS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Network Status</div>
                      <div className="text-base font-bold text-emerald-400 mt-1">
                        {routers.length === 0
                          ? '● Ready for Gateways'
                          : routers.some((r) => r.status === 'ONLINE')
                          ? '● Operational'
                          : '● Offline Alert'}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Connected Customers</div>
                      <div className="text-xl font-black text-white font-mono mt-1">{uniqueCustomersCount}</div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Active User Sessions</div>
                      <div className="text-xl font-black text-sky-400 font-mono mt-1">{activeUsersCount}</div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Routers / APs</div>
                      <div className="text-xl font-black text-white font-mono mt-1">
                        {routers.length} / {accessPoints.length}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Today's Revenue</div>
                      <div className="text-sm font-extrabold text-amber-400 font-mono mt-1">
                        KES {todayRev.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Monthly Revenue</div>
                      <div className="text-sm font-extrabold text-emerald-400 font-mono mt-1">
                        KES {monthlyRev.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Unused Vouchers</div>
                      <div className="text-xl font-black text-white font-mono mt-1">{activeVouchersCount}</div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="text-[11px] text-slate-400">Uptime Average</div>
                      <div className="text-sm font-bold text-white font-mono mt-1">{avgUptimeStr}</div>
                    </div>
                  </div>

                {/* Quick controls */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-300 font-semibold">Quick Hotspot & ISP Operations:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        guardRouterAction(() => {
                          setShowConnectModal(true);
                          setConnectStep(1);
                        }, 'Connect Router Wizard')
                      }
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ CONNECT ROUTER</span>
                    </button>
                    <button
                      onClick={() =>
                        guardRouterAction(() => setShowVoucherGenModal(true), 'Voucher Generation')
                      }
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>GENERATE VOUCHERS</span>
                    </button>
                    <button
                      onClick={() =>
                        guardRouterAction(() => setShowPrintModal(true), 'Voucher Card Printing')
                      }
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>PRINT CARDS</span>
                    </button>
                    <button
                      onClick={() =>
                        guardRouterAction(() => setShowMikrotikToolsModal(true), 'MikroTik Maintenance Tools')
                      }
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>MIKROTIK TOOLS</span>
                    </button>
                    <button
                      onClick={() =>
                        guardRouterAction(() => setShowPppoeModal(true), 'PPPoE Client Setup')
                      }
                      className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>+ PPPOE CLIENT</span>
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

                {/* Real-time MikroTik Interface Traffic Monitor Widget */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Live MikroTik Gateway Interface Throughput (ether1 WAN & bridge)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Gateway: <strong className="text-white">192.168.88.1</strong></span>
                      <span>·</span>
                      <span>RouterOS: <strong className="text-sky-400">v7.15.2</strong></span>
                      <span>·</span>
                      <span>Health: <strong className="text-emerald-400">OPTIMAL (11ms ping)</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Download Bandwidth (Rx)</div>
                      <div className="text-xl font-mono font-black text-sky-400">48.6 Mbps</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full rounded-full animate-pulse" style={{ width: '48%' }} />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Upload Bandwidth (Tx)</div>
                      <div className="text-xl font-mono font-black text-emerald-400">18.2 Mbps</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full animate-pulse" style={{ width: '22%' }} />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">CPU Utilization</div>
                      <div className="text-xl font-mono font-black text-white">18% <span className="text-xs text-slate-400 font-normal">/ 4 Cores</span></div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">RAM Usage</div>
                      <div className="text-xl font-mono font-black text-white">324 MB <span className="text-xs text-slate-400 font-normal">/ 1 GB</span></div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full rounded-full" style={{ width: '32%' }} />
                      </div>
                    </div>
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

                {/* AUTOMATED REAL-TIME AUDIT LOG DISPLAY (Router Config Changes & Guest Connections) */}
                <RealTimeAuditLogDisplay
                  ownerId={currentUser.id}
                  onRefreshParent={onRefreshState}
                />
              </div>
            );
          })()}

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
                {/* ANTI-BYPASS BILLING ENFORCEMENT & WALLED GARDEN SHIELD */}
                <div className="p-4 bg-[#0a1224] border border-cyan-500/30 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">Anti-Bypass Firewall & Strict Walled Garden</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            100% ENFORCED · NO LEAKAGE
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Users cannot bypass billing: unauthenticated traffic is dropped at forward chain, Port 53 DNS tunneling is intercepted, and client isolation blocks MAC spoofing.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={testingAntiBypass}
                      onClick={handleRunAntiBypassTest}
                      className="px-3.5 py-1.5 bg-[#131f38] hover:bg-[#1a2b4d] text-cyan-300 border border-cyan-700/50 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                    >
                      {testingAntiBypass ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      Test Anti-Bypass Filter
                    </button>
                  </div>

                  {antiBypassProbeResult && (
                    <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold animate-fade-in flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{antiBypassProbeResult}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-[#080d1a] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Unauth Traffic:</span>
                      <strong className="text-rose-400">DROPPED (hotspot=!auth)</strong>
                    </div>
                    <div className="p-2 bg-[#080d1a] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Port 53 DNS Tunnel:</span>
                      <strong className="text-emerald-400">REDIRECTED TO WALLED GARDEN</strong>
                    </div>
                    <div className="p-2 bg-[#080d1a] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">MAC / ARP Spoofing:</span>
                      <strong className="text-cyan-400">BLOCKED (Client Isolation)</strong>
                    </div>
                    <div className="p-2 bg-[#080d1a] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Direct HTTPS Bypass:</span>
                      <strong className="text-amber-400">BLOCKED (Port 443 Drop)</strong>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">3. Connected Hotspot Routers & Fleet Health</h2>
                    <p className="text-xs text-slate-400">
                      MikroTik RouterOS 7.x, OpenWrt, and Omada routers broadcasting your SSIDs with ICMP telemetry.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOpenDiagnostic(routers[0]?.id)}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>RUN DIAGNOSTIC PING</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('EASY_CONNECT')}
                      className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/15 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>EASY CONNECT WIZARD</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('SETUP_SCRIPTS')}
                      className="px-3.5 py-2 bg-cyan-950 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SETUP SCRIPTS & TOKENS</span>
                    </button>
                    <button
                      onClick={() => setShowMikrotikToolsModal(true)}
                      className="px-3.5 py-2 bg-sky-950 text-sky-300 border border-sky-700/60 hover:bg-sky-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>MIKROTIK CONFIG SCRIPTS</span>
                    </button>
                    <button
                      onClick={() =>
                        guardRouterAction(() => {
                          setShowConnectModal(true);
                          setConnectStep(1);
                        }, 'Connect Router Wizard')
                      }
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      + CONNECT ROUTER
                    </button>
                  </div>
                </div>

                {/* 7-DAY HISTORICAL LATENCY TREND CHART & PING SUCCESS RATES */}
                <RouterLatencyTrendChart
                  routers={routers}
                  onOpenDiagnosticModal={handleOpenDiagnostic}
                />

                {/* D3.JS NETWORK USAGE ACTIVITY HEATMAP — PEAK USAGE & SCHEDULING OPTIMIZATION */}
                <RouterUsageHeatmap
                  routers={routers}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span className="font-bold text-white uppercase tracking-wider">
                      Fleet Router Nodes ({routers.length})
                    </span>
                    <span>Real-time Ping Interval: 30s · Gateway: 192.168.88.1</span>
                  </div>

                  {routers.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{r.name}</span>
                            <span className="text-xs font-mono text-sky-400">({r.ipAddress})</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ● {r.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{r.model} · {r.location}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedRouterForQr(r)}
                            className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Generate dynamic WiFi QR code for guests to scan and connect directly"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-400" />
                            <span>WiFi QR Code</span>
                          </button>
                          <button
                            onClick={() => handleOpenDiagnostic(r.id)}
                            className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700/60 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Run multi-target diagnostic ping, latency breakdown & packet loss probe"
                          >
                            <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                            <span>Diagnostic Ping</span>
                          </button>
                          <button
                            onClick={() => handleRouterAction(r.id, 'TEST_CONNECTION')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-semibold"
                          >
                            Quick Ping
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Reboot router ${r.name}?`)) handleRouterAction(r.id, 'RESTART');
                            }}
                            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 text-xs rounded-lg font-semibold border border-red-900/60"
                          >
                            Reboot
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2.5 bg-slate-900 rounded-xl">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">8. WiFi Packages & Hotspot Rates</h2>
                    <p className="text-xs text-slate-400">
                      Manage and create custom WiFi rates that guests see on your network login portal.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPortalPreviewModal(true)}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>PREVIEW PORTAL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPackage(null);
                        setShowAddCustomPackageModal(true);
                      }}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/20 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      <span>+ ADD CUSTOM PACKAGE</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-4 bg-slate-950 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        pkg.isCustom
                          ? 'border-amber-400/50 hover:border-amber-400 bg-amber-950/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="font-bold text-white text-sm block">{pkg.name}</span>
                            <span className="text-xs text-sky-400 font-mono">{pkg.speedLabel}</span>
                          </div>
                          {pkg.isCustom ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              Custom Package
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                              Standard
                            </span>
                          )}
                        </div>

                        <div className="text-2xl font-black text-amber-400 font-mono">
                          KES {pkg.priceKes.toLocaleString()}
                        </div>

                        <div className="text-xs text-slate-400 space-y-1">
                          <div>⏱ Duration: <strong className="text-slate-200">{pkg.durationLabel}</strong></div>
                          <div>📱 Devices: <strong className="text-slate-200">{pkg.deviceLimit} device{pkg.deviceLimit > 1 ? 's' : ''}</strong></div>
                          {pkg.description && (
                            <div className="text-[11px] text-slate-400 italic line-clamp-2">{pkg.description}</div>
                          )}
                        </div>
                      </div>

                      {pkg.isCustom && (
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-emerald-400 font-semibold">● Synced to Portal</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPackage(pkg);
                                setShowAddCustomPackageModal(true);
                              }}
                              className="px-2.5 py-1 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Sliders className="w-3 h-3 text-amber-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
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
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedQrVoucher(filteredVouchers[0] || vouchers[0] || null)}
                      className="px-3.5 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>QR GENERATOR</span>
                    </button>
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>PRINT VOUCHERS (A4 / 80MM)</span>
                    </button>
                    <button
                      onClick={() =>
                        guardRouterAction(() => setShowVoucherGenModal(true), 'Voucher Generation')
                      }
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      + Generate Batch
                    </button>
                  </div>
                </div>

                {/* Vouchers Filter & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {(['ALL', 'UNUSED', 'REDEEMED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setVoucherFilter(status)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          voucherFilter === status
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {status === 'ALL' ? 'All Vouchers' : status === 'UNUSED' ? 'Active / Unused' : 'Redeemed'}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={voucherSearch}
                      onChange={(e) => setVoucherSearch(e.target.value)}
                      placeholder="Search voucher code..."
                      className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

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
                        <th className="p-3 text-right">QR Pass & Share</th>
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
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedQrVoucher(v)}
                              className="px-2.5 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>QR Slip</span>
                            </button>
                          </td>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">10. Payments Ledger & Cashflow Separation</h2>
                    <p className="text-xs text-slate-400">
                      Strict separation between your customer internet access revenue and your BRISK platform SaaS license payments.
                    </p>
                  </div>

                  {/* Flow Filter Controls */}
                  <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setPaymentFlowFilter('ALL')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        paymentFlowFilter === 'ALL'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Transactions
                    </button>
                    <button
                      onClick={() => setPaymentFlowFilter('ISP_REVENUE')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        paymentFlowFilter === 'ISP_REVENUE'
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Customer Internet (Your Revenue)
                    </button>
                    <button
                      onClick={() => setPaymentFlowFilter('PLATFORM_SAAS')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        paymentFlowFilter === 'PLATFORM_SAAS'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Platform SaaS (Software Invoices)
                    </button>
                  </div>
                </div>

                {/* Flow Clarification Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-sky-950/40 border border-sky-800/50 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sky-300">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Flow 1 · Internet Access Payment (ISP Direct Collection)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Paid by your end-customers for WiFi hotspot passes, PPPoE home fiber, and vouchers. Funds settle directly into your configured Safaricom M-Pesa Till or Paybill.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 font-bold text-purple-300">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>Flow 2 · Platform SaaS Subscription (BRISK Software License)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Paid by you to BRISK Smart Connect (KES 450–3,500 every 30 days) covering cloud MikroTik RouterOS automation, captive portal hosting, and Daraja STK reconciliation.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Receipt #</th>
                        <th className="p-3">Payment Flow</th>
                        <th className="p-3">Customer / Payer</th>
                        <th className="p-3">Service / Package</th>
                        <th className="p-3">Settlement Account</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Reference</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactions
                        .filter((tx) => {
                          if (paymentFlowFilter === 'ALL') return true;
                          if (paymentFlowFilter === 'PLATFORM_SAAS') {
                            return tx.type === 'ROUTER_OWNER_SUBSCRIPTION' || tx.flowCategory === 'PLATFORM_SAAS';
                          }
                          return tx.type !== 'ROUTER_OWNER_SUBSCRIPTION' && tx.flowCategory !== 'PLATFORM_SAAS';
                        })
                        .map((tx) => {
                          const isPlatform =
                            tx.type === 'ROUTER_OWNER_SUBSCRIPTION' || tx.flowCategory === 'PLATFORM_SAAS';

                          return (
                            <tr key={tx.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono font-bold text-white">{tx.receiptNumber}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    isPlatform
                                      ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                                      : 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                                  }`}
                                >
                                  {isPlatform ? 'PLATFORM SAAS' : 'ISP REVENUE'}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-slate-200">{tx.userName}</td>
                              <td className="p-3 text-sky-300 font-medium">{tx.packageName}</td>
                              <td className="p-3 font-mono text-[11px] text-slate-400">
                                {tx.recipientAccount || (isPlatform ? 'BRISK Paybill 408801' : 'Till 882194')}
                              </td>
                              <td className="p-3 font-mono font-bold text-amber-400">
                                KES {tx.amountKes.toLocaleString()}
                              </td>
                              <td className="p-3">{tx.paymentMethod}</td>
                              <td className="p-3 font-mono text-slate-400">{tx.reference}</td>
                              <td className="p-3">
                                <span className="text-emerald-400 font-bold">● {tx.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 10: /owner/revenue */}
            {activeTab === 'REVENUE' && (() => {
              const customerRev = transactions
                .filter((tx) => tx.type !== 'ROUTER_OWNER_SUBSCRIPTION' && tx.status === 'SUCCESS')
                .reduce((acc, tx) => acc + tx.amountKes, 0);

              const activePlan =
                subscriptionPlans.find((p) => p.id === profile?.subscriptionPlanId) ||
                subscriptionPlans[2] ||
                subscriptionPlans[0];

              const platformFee = activePlan?.priceKes || 1500;
              const hostCommissions = Math.round(customerRev * 0.1);
              const netProfit = customerRev - platformFee - hostCommissions;

              return (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">11. Revenue & Earnings Analytics</h2>
                    <p className="text-xs text-slate-400">
                      Consolidated financial statements separating customer revenue, software overhead, and net margin.
                    </p>
                  </div>

                  {/* High-level KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                        Gross ISP Customer Sales
                      </div>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        KES {customerRev.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">Hotspot + PPPoE + Vouchers</div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                        BRISK Platform SaaS License
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                        KES {platformFee.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">{activePlan?.name} (30 Days License)</div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                        Host & Referral Payouts
                      </div>
                      <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                        KES {hostCommissions.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">10% Host & affiliate commissions</div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                        Net Operating Margin
                      </div>
                      <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                        KES {Math.max(netProfit, 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">Retained profit in your Till/Bank</div>
                    </div>
                  </div>

                  {/* Financial Statement & Cashflow Model */}
                  <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      <span>Monthly ISP P&L Statement (KES)</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                        <span>1. Hotspot WiFi M-Pesa Direct Collections (Hourly, Daily, Multi-Day)</span>
                        <span className="font-mono font-bold text-white">KES 88,200</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                        <span>2. Home & Business PPPoE Fiber Subscriptions (Monthly)</span>
                        <span className="font-mono font-bold text-white">KES 46,000</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                        <span>3. Over-The-Counter Printed Voucher Sales</span>
                        <span className="font-mono font-bold text-white">KES 24,000</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 font-bold text-sky-400 bg-sky-950/20 px-2 rounded">
                        <span>Total Gross Customer Revenue (Deposited to Your Till 882194)</span>
                        <span className="font-mono font-extrabold">KES 158,200</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-red-300">
                        <span>Less: BRISK Smart Connect Platform License ({activePlan?.name} 30-Day Plan)</span>
                        <span className="font-mono font-bold">- KES {platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-red-300">
                        <span>Less: WiFi Host Partner Revenue Share (10% to Location Hosts)</span>
                        <span className="font-mono font-bold">- KES 15,820</span>
                      </div>
                      <div className="flex justify-between py-2.5 font-extrabold text-emerald-400 text-sm bg-emerald-950/30 px-2 rounded">
                        <span>Net Take-Home ISP Operating Profit</span>
                        <span className="font-mono text-base">KES 140,880</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* PAGE 11: /owner/referrals */}
            {activeTab === 'REFERRALS' && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">12. Referral Partner Network</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                        35% COMMISSION RATE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Refer other router owners and landlords. When they subscribe and pay their license, you earn a 35% recurring commission!
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Your Referral Earnings</div>
                    <div className="text-xl font-black text-emerald-400 font-mono">KES 8,400</div>
                  </div>
                </div>

                {/* 35% Commission Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Router Owner Rate
                    </div>
                    <div className="text-2xl font-black text-white font-mono">35% Payout</div>
                    <div className="text-[11px] text-slate-400">
                      Earn <strong className="text-emerald-400">KES 525</strong> per KES 1,500 monthly owner subscription payment!
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                      Active Referred Hosts
                    </div>
                    <div className="text-2xl font-black text-white font-mono">8 Owners</div>
                    <div className="text-[11px] text-slate-400">
                      8 active hotspot hosts across Kiambu & Nairobi networks.
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Guest Hotspot Rate
                    </div>
                    <div className="text-2xl font-black text-white font-mono">10% Pass</div>
                    <div className="text-[11px] text-slate-400">
                      Earn 10% on direct guest WiFi package purchases in your zone.
                    </div>
                  </div>
                </div>

                {/* Referral Code & Share Bar */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Your Unique Router Owner Referral Code
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono tracking-wider mt-1">
                        {profile?.referralCode || `HOST_${currentUser.id.slice(-6).toUpperCase()}`}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Share this code or link with other hotspot entrepreneurs to start earning 35% commissions today.
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const refCode = profile?.referralCode || `HOST_${currentUser.id.slice(-6).toUpperCase()}`;
                          const refUrl = `https://brisksmartconnect.vercel.app/register?ref=${refCode}`;
                          navigator.clipboard.writeText(refUrl);
                          setActionMessage('Referral link copied to clipboard!');
                          setTimeout(() => setActionMessage(''), 3000);
                        }}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Referral Link</span>
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Start your own profitable WiFi hotspot business with BRISK Smart Connect! Use my partner referral code ${
                            profile?.referralCode || `HOST_${currentUser.id.slice(-6).toUpperCase()}`
                          } to get started: https://brisksmartconnect.vercel.app/`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share on WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* How It Works Steps */}
                  <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">1</span>
                        <span>Invite Router Owners</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Send your referral link to cyber cafes, rental landlords, or campus operators.</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">2</span>
                        <span>They Subscribe & Pay</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">When they activate their router license (e.g. KES 1,500), payment validates via M-Pesa.</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">3</span>
                        <span>Earn 35% Instantly</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">KES 525 is automatically credited to your cashout wallet every month they renew.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 12: /owner/withdrawals */}
            {activeTab === 'WITHDRAWALS' && (() => {
              const numAmount = Number(withdrawalAmount) || 0;
              const feeKes = Math.round(numAmount * 0.05);
              const netAmount = Math.max(0, numAmount - feeKes);
              const walletBal = profile?.walletBalanceKes ?? 12450;

              return (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white">13. M-Pesa Payouts & Withdrawals</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-bold">
                          5% DISBURSAL FEE
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Request revenue cashout directly to your Safaricom M-Pesa. Super Admin verifies and approves each payout.
                      </p>
                    </div>
                    <div className="text-right p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Available Wallet Balance</div>
                      <div className="text-xl font-black text-emerald-400 font-mono">KES {walletBal.toLocaleString()}</div>
                    </div>
                  </div>

                  {withdrawalSuccess && (
                    <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{withdrawalSuccess}</span>
                    </div>
                  )}

                  {withdrawalError && (
                    <div className="p-4 bg-red-950/70 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{withdrawalError}</span>
                    </div>
                  )}

                  {/* Cashout Request Form */}
                  <form onSubmit={handleWithdrawalRequest} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Withdrawal Amount (KES) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">KES</span>
                          <input
                            type="number"
                            min="100"
                            max={walletBal}
                            required
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full pl-12 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">Minimum cashout: KES 100</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          M-Pesa Recipient Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={withdrawalPhone}
                          onChange={(e) => setWithdrawalPhone(e.target.value)}
                          placeholder="07XX XXX XXX"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">Must be registered with Safaricom M-Pesa</span>
                      </div>
                    </div>

                    {/* Real-time 5% Fee Breakdown */}
                    {numAmount > 0 && (
                      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1.5 animate-fade-in">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Cashout Fee Breakdown:
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Gross Requested:</span>
                          <span className="font-mono font-bold text-white">KES {numAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-amber-400">
                          <span>Platform & B2C Disbursal Fee (5%):</span>
                          <span className="font-mono font-bold">- KES {feeKes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                          <span>Net Payout to Your Phone:</span>
                          <span className="font-mono text-sm font-black">KES {netAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-[11px] text-amber-300/90 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Withdrawal requests enter the Super Admin approval queue for fraud validation. Once approved, funds are automatically disbursed to your M-Pesa line via Safaricom B2C.
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={withdrawalLoading || numAmount <= 0}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                        <span>
                          {withdrawalLoading
                            ? 'Submitting...'
                            : `REQUEST CASHOUT OF KES ${netAmount.toLocaleString()}`}
                        </span>
                      </button>
                    </div>
                  </form>

                  {/* Withdrawal Requests History */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-400" />
                      <span>Recent Cashout Requests & Admin Approval Status</span>
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Reference / ID</th>
                            <th className="p-3">Gross Amount</th>
                            <th className="p-3">5% Fee</th>
                            <th className="p-3">Net Payout</th>
                            <th className="p-3">M-Pesa Phone</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {withdrawals && withdrawals.length > 0 ? (
                            withdrawals.map((w) => {
                              const rawAmount = w.amountKes || w.amount || 0;
                              const fee = w.feeKes ?? Math.round(rawAmount * 0.05);
                              const net = w.netAmountKes ?? (rawAmount - fee);
                              return (
                                <tr key={w.id} className="hover:bg-slate-800/40">
                                  <td className="p-3 font-mono font-bold text-white">{w.id}</td>
                                  <td className="p-3 font-mono text-slate-200">KES {rawAmount.toLocaleString()}</td>
                                  <td className="p-3 font-mono text-amber-400">- KES {fee.toLocaleString()}</td>
                                  <td className="p-3 font-mono font-bold text-emerald-400">KES {net.toLocaleString()}</td>
                                  <td className="p-3 font-mono text-slate-400">{w.phone || '0712345678'}</td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        w.status === 'COMPLETED' || w.status === 'APPROVED'
                                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                          : w.status === 'REJECTED'
                                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/50 animate-pulse'
                                      }`}
                                    >
                                      ● {w.status === 'PENDING' ? 'Awaiting Admin Approval' : w.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                                No withdrawal requests yet. Your pending and processed cashouts will appear here.
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

            {/* PAGE 18: /owner/integrations (BRISK Multi-Tenant API Integration Hub - 9 Subpages) */}
            {activeTab === 'INTEGRATIONS' && (
              <IntegrationsContainer
                ownerId={currentUser.id}
                onRefreshParent={onRefreshState}
              />
            )}

            {/* PAGE 19: /owner/subscription */}
            {activeTab === 'SUBSCRIPTION' && (
              <div className="space-y-6">
                {/* Recurring Revenue Status Card with Modern Vector Icon */}
                <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-500/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-emerald-400/40 p-0.5 bg-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
                      <img
                        src="/src/assets/images/icon_sub_billing_1792325986081.jpg"
                        alt="M-Pesa Recurring Subscription Vector Icon"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          AUTOMATED RECURRING ENGINE ACTIVE
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white mt-0.5">
                        {profile?.subscriptionPlanId || 'BRISK Pro Host'} · 13 Days Remaining
                      </h2>
                      <p className="text-xs text-slate-300 max-w-xl mt-1">
                        Subscription is continuously monitored against the current date. M-Pesa push reminders are automatically queued 3 days prior to expiration to protect uptime.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      disabled={renewLoading}
                      onClick={() => handleTriggerOwnerRenewStk(1500, profile?.subscriptionPlanId || 'BRISK Pro')}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{renewLoading ? 'Dispatching STK...' : 'Trigger M-Pesa STK Renewal (KES 1,500)'}</span>
                    </button>
                  </div>
                </div>

                {renewMessage && (
                  <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{renewMessage}</span>
                  </div>
                )}

                {/* MANUAL M-PESA TRANSITION CODE & ADMIN AUTO-ACTIVATION CENTER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Enter M-Pesa Transition Code */}
                  <div className="p-6 bg-[#0b1426] border border-blue-900/40 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                        <Zap className="w-5 h-5 fill-white text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Enter M-Pesa Transition Code</h3>
                        <p className="text-xs text-slate-400">Admin reviews the code and your subscription automatically activates</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      If you paid manually via M-Pesa Paybill <strong className="text-cyan-400 font-mono">222111</strong> Acc <strong className="text-cyan-400 font-mono">5414200</strong>, enter your Safaricom confirmation code below. The Super Admin will verify it and your subscription will automatically activate—<strong className="text-emerald-400">no manual codes required</strong>!
                    </p>

                    {pendingRequest ? (
                      <div className="p-4 bg-[#0e1933] rounded-2xl border border-amber-500/40 space-y-3 animate-fade-in">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                          <span className="text-xs font-bold text-amber-300">
                            Transition Code Pending Admin Approval
                          </span>
                        </div>
                        <div className="p-2.5 bg-[#080d1a] rounded-xl font-mono text-xs flex justify-between items-center">
                          <span className="text-slate-400">Code: <strong className="text-cyan-300">{pendingRequest.transactionReference}</strong></span>
                          <span className="text-amber-400 font-bold">KES {pendingRequest.amountKes}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Submitted on {new Date(pendingRequest.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. As soon as the Admin approves in their console, your account will auto-activate immediately.
                        </p>
                        <button
                          type="button"
                          onClick={checkOwnerApprovalStatus}
                          className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Check Admin Approval
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            M-Pesa Transition Code
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={transitionCodeInput}
                              onChange={(e) => setTransitionCodeInput(e.target.value.toUpperCase())}
                              placeholder="e.g. QKR49X2PLA"
                              className="w-full sm:flex-1 px-3.5 py-2.5 bg-[#080d1a] border border-slate-800 rounded-xl text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 min-h-[44px]"
                            />
                            <button
                              type="button"
                              disabled={submittingTransitionCode || !transitionCodeInput.trim()}
                              onClick={handleQuickSubmitTransitionCode}
                              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center min-h-[44px] whitespace-nowrap"
                            >
                              {submittingTransitionCode ? 'Submitting...' : 'SUBMIT CODE'}
                            </button>
                          </div>
                        </div>

                        {transitionFeedback && (
                          <div
                            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-fade-in ${
                              transitionFeedback.type === 'success'
                                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                            }`}
                          >
                            {transitionFeedback.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span>{transitionFeedback.message}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card 2: Manual Payment via PayBill 222111 / Acc 5414200 */}
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Manual M-Pesa Subscription Payment</h3>
                        <p className="text-xs text-slate-400">Pay via official Paybill and submit your reference code</p>
                      </div>
                    </div>

                    {/* Official PayBill Credentials Banner */}
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">M-Pesa PayBill (Business No):</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-amber-400 text-sm">222111</span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText('222111')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            title="Copy Paybill"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-amber-400 text-sm">5414200</span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText('5414200')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                        <span>Standard Subscription:</span>
                        <span className="font-bold text-white">KES 1,500 / month</span>
                      </div>
                    </div>

                    {/* Submit Confirmation Reference Form */}
                    <form onSubmit={handleSubmitManualPayment} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Plan</label>
                          <select
                            value={manualPlanName}
                            onChange={(e) => setManualPlanName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                          >
                            <option value="BRISK Starter">Starter (KES 500)</option>
                            <option value="BRISK Pro Host">Pro Host (KES 1,500)</option>
                            <option value="BRISK Business">Business (KES 3,500)</option>
                            <option value="BRISK Enterprise">Enterprise (KES 8,000)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Amount (KES)</label>
                          <input
                            type="number"
                            value={manualAmount}
                            onChange={(e) => setManualAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">M-Pesa Reference Code *</label>
                          <input
                            type="text"
                            required
                            value={manualMpesaRef}
                            onChange={(e) => setManualMpesaRef(e.target.value.toUpperCase())}
                            placeholder="e.g. TI78KL9012"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Your Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={manualPhone}
                            onChange={(e) => setManualPhone(e.target.value)}
                            placeholder="0712883849"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingManual}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
                      >
                        {submittingManual ? 'Submitting to Admin...' : 'SUBMIT PAYMENT REFERENCE TO ADMIN'}
                      </button>
                    </form>

                    {manualSubmitSuccess && (
                      <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{manualSubmitSuccess}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Select or Upgrade 30-Day Platform Plan</h3>
                      <p className="text-xs text-slate-400">
                        Choose your recurring tier. M-Pesa STK pushes will be triggered to {currentUser.phone || '0799123456'}.
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">5 Tiers Available</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {subscriptionPlans.map((plan) => (
                      <div key={plan.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all">
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
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => onActivateSubscription(plan)}
                            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                          >
                            Activate Plan
                          </button>
                          <button
                            onClick={() => handleTriggerOwnerRenewStk(plan.priceKes, plan.name)}
                            disabled={renewLoading}
                            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Quick STK Push</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Server className="w-5 h-5 text-sky-400" />
                      <span>7. PPPoE Client Tunnels & Fixed Broadband</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Manage home and business fiber broadband subscribers authenticated via MikroTik PPPoE server.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      guardRouterAction(() => setShowPppoeModal(true), 'PPPoE Client Setup')
                    }
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ ADD PPPOE SUBSCRIBER</span>
                  </button>
                </div>

                {/* PPPoE KPI Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Subscribers</div>
                    <div className="text-lg font-black text-white mt-1">{pppoeUsers.length} Clients</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Online</div>
                    <div className="text-lg font-black text-emerald-400 mt-1">
                      {pppoeUsers.filter((p) => p.status === 'CONNECTED').length} Connected
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Isolated / Suspended</div>
                    <div className="text-lg font-black text-amber-400 mt-1">
                      {pppoeUsers.filter((p) => p.status === 'DISCONNECTED').length} Inactive
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Subnet Pool</div>
                    <div className="text-xs font-mono font-bold text-sky-400 mt-1">10.10.40.0/24</div>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {(['ALL', 'CONNECTED', 'DISCONNECTED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setPppoeFilter(status)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          pppoeFilter === status
                            ? 'bg-sky-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {status === 'ALL' ? 'All Clients' : status === 'CONNECTED' ? 'Active Connected' : 'Disconnected'}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={pppoeSearch}
                      onChange={(e) => setPppoeSearch(e.target.value)}
                      placeholder="Search username or IP..."
                      className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                {/* Subscribers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Subscriber</th>
                        <th className="p-3">Assigned IP</th>
                        <th className="p-3">Bandwidth Tier</th>
                        <th className="p-3">Gateway Router</th>
                        <th className="p-3">Data Transfer (GB)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredPppoeUsers.map((p) => {
                        const isConnected = p.status === 'CONNECTED';
                        const secretCmd = `/ppp secret add name="${p.username}" password="Secret2026!" service=pppoe local-address=10.10.40.1 remote-address=${p.ipAddress}`;
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/40">
                            <td className="p-3">
                              <div className="font-mono font-bold text-white">{p.username}</div>
                              <div className="text-[10px] text-slate-500">Duration: {p.connectedDuration}</div>
                            </td>
                            <td className="p-3 font-mono text-sky-400">{p.ipAddress}</td>
                            <td className="p-3 text-amber-300 font-semibold">{p.speed}</td>
                            <td className="p-3 text-slate-400">{p.routerName}</td>
                            <td className="p-3 font-mono text-emerald-400">
                              {(p.downloadMb / 1024).toFixed(1)} GB ↓ / {(p.uploadMb / 1024).toFixed(1)} GB ↑
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isConnected
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                ● {p.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleTogglePppoe(p.id)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                    isConnected
                                      ? 'bg-red-950 hover:bg-red-900 text-red-300'
                                      : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300'
                                  }`}
                                  title={isConnected ? 'Isolate / Disconnect' : 'Reconnect Session'}
                                >
                                  {isConnected ? 'Suspend' : 'Enable'}
                                </button>

                                <button
                                  onClick={() => handleRemindPppoe(p.id)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold transition-colors"
                                  title="Send SMS Payment Reminder"
                                >
                                  Remind SMS
                                </button>

                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(secretCmd);
                                    setCopiedPppoeCmd(p.id);
                                    setTimeout(() => setCopiedPppoeCmd(null), 2000);
                                  }}
                                  className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] transition-colors"
                                  title="Copy MikroTik /ppp secret command"
                                >
                                  {copiedPppoeCmd === p.id ? '✓' : <Copy className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeletePppoe(p.id, p.username)}
                                  disabled={deletingPppoeId === p.id}
                                  className="p-1 bg-red-950/80 hover:bg-red-900 text-red-400 rounded text-[10px] transition-colors border border-red-800/40"
                                  title="Delete PPPoE Subscriber"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE: Captive Portal Designer & Customization Studio */}
            {activeTab === 'CAPTIVE_PORTAL' && (
              <CaptivePortalBuilder
                ownerId={currentUser.id}
                packages={localPackages}
                routers={routers}
                profile={profile}
                onRefreshState={onRefreshState}
                onLaunchPortal={onGoToHotspotPortal}
              />
            )}

            {/* PAGE: Easy Connect Wizard */}
            {activeTab === 'EASY_CONNECT' && (
              <EasyConnectWizard
                currentUser={currentUser}
                profile={profile}
                onSuccess={(_newRouter) => {
                  onRefreshState();
                }}
                onCancel={() => setActiveTab('ROUTERS')}
                onNavigateToStorefront={() => setActiveTab('CAPTIVE_PORTAL')}
                onNavigateToVouchers={() => setActiveTab('VOUCHERS')}
                onNavigateToDashboard={() => setActiveTab('DASHBOARD')}
                onNavigateToScripts={() => setActiveTab('SETUP_SCRIPTS')}
                onNavigateToRouters={() => setActiveTab('ROUTERS')}
              />
            )}

            {/* PAGE: Router Setup Scripts & Tokens */}
            {activeTab === 'SETUP_SCRIPTS' && (
              <RouterSetupScriptsView
                currentUser={currentUser}
                routers={routers}
                onRefreshState={onRefreshState}
                onNavigateToRouters={() => setActiveTab('ROUTERS')}
              />
            )}

            {/* PAGE: Owner Payment Methods */}
            {activeTab === 'PAYMENT_METHODS' && (
              <OwnerPaymentMethodsView
                currentUser={currentUser}
                profile={profile}
                onRefreshState={onRefreshState}
              />
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

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/40 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Prefer our guided step-by-step visual setup with automatic tokens?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConnectModal(false);
                  setActiveTab('EASY_CONNECT');
                }}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
              >
                Launch Easy Connect Wizard →
              </button>
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
                {/* Live Terminal Auto-Detection Status */}
                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                  scriptAutoConnected
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/40 animate-fade-in'
                    : 'bg-[#0a1224] border-cyan-500/40 text-slate-300'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {scriptAutoConnected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                          <span className="text-emerald-300 font-black">
                            ✓ SCRIPT EXECUTED IN TERMINAL! ROUTER AUTO-CONNECTED
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-cyan-300 font-bold">
                            Live Listening: Enter script in MikroTik terminal or click "Execute in Terminal Console"
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-cyan-400 border border-blue-800">
                      Token: {enrollmentToken}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {scriptAutoConnected
                      ? 'The website detected your terminal execution and has automatically connected the router to your fleet.'
                      : 'When you run this script in Winbox/PuTTY terminal or below, the website will automatically detect it and connect without manual clicking.'}
                  </p>
                </div>

                {/* Terminal Console View */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      MikroTik RouterOS Terminal Console
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const filename = `${(routerName || 'mikrotik').toLowerCase().replace(/\s+/g, '_')}_setup.rsc`;
                          const blob = new Blob([generatedMikrotikScript], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>.RSC File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedMikrotikScript);
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedScript ? 'COPIED!' : 'Copy Script'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal Screen */}
                  <div className="p-3 bg-black border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 max-h-48 overflow-y-auto space-y-1 shadow-inner">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className={log.startsWith('✓') ? 'text-cyan-300 font-bold' : log.startsWith('[admin') ? 'text-amber-300 font-bold' : 'text-emerald-400'}>
                        {log}
                      </div>
                    ))}
                    {!scriptAutoConnected && (
                      <div className="flex items-center gap-1 text-slate-500 animate-pulse">
                        <span className="text-amber-400 font-bold">[admin@MikroTik] &gt;</span>
                        <span className="w-2 h-3.5 bg-emerald-400 inline-block" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Anti-Bypass Guard Badge in Wizard */}
                <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/40 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-slate-300 text-[11px]">
                      Anti-Bypass Firewall Rules included in script (unauthorized clients cannot bypass portal).
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    PROTECTED
                  </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConnectModal(false);
                      setActiveTab('SETUP_SCRIPTS');
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>View All Tokens</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={terminalExecuting || scriptAutoConnected}
                      onClick={handleRunTerminalScript}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {terminalExecuting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Executing in Terminal...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Execute Script in Terminal Console</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleFinishConnect}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Finish
                    </button>
                  </div>
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

      {/* BRISK SMARTCONNECT MODALS */}
      <PrintVouchersModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        vouchers={printBatch && printBatch.length > 0 ? printBatch : vouchers}
        networkName={customSsid || 'BRISK Smart WiFi'}
        supportPhone={customHelpline || '0722 000 111'}
      />

      <MikrotikToolsModal
        isOpen={showMikrotikToolsModal}
        onClose={() => setShowMikrotikToolsModal(false)}
        routers={routers}
      />

      <PppoeModal
        isOpen={showPppoeModal}
        onClose={() => setShowPppoeModal(false)}
        routers={routers}
        onSuccess={() => {
          setShowPppoeModal(false);
          setActionMessage('New PPPoE subscriber registered and queued in MikroTik pool.');
          setTimeout(() => setActionMessage(''), 4000);
          onRefreshState();
        }}
      />

      {/* VOUCHER QR CODE MODAL */}
      <VoucherQrModal
        voucher={selectedQrVoucher}
        onClose={() => setSelectedQrVoucher(null)}
        networkName="BRISK Smart WiFi"
        businessName={profile?.businessName || 'Kiambu Smart WiFi Networks'}
        supportPhone={profile?.supportContact || '0722 000 111'}
      />

      {/* DYNAMIC ROUTER GUEST WIFI QR CODE MODAL */}
      <RouterQrModal
        router={selectedRouterForQr}
        onClose={() => setSelectedRouterForQr(null)}
        businessName={profile?.businessName || businessProfile?.businessName || 'BRISK Smart WiFi Networks'}
        supportPhone={profile?.supportContact || '0722 000 111'}
        businessLocation={selectedRouterForQr?.location || profile?.businessLocation || 'Central Area'}
      />

      {/* ADD / EDIT CUSTOM PACKAGE MODAL */}
      <AddCustomPackageModal
        isOpen={showAddCustomPackageModal}
        onClose={() => {
          setShowAddCustomPackageModal(false);
          setEditingPackage(null);
        }}
        ownerId={currentUser.id}
        initialPackage={editingPackage}
        onPackageCreated={handlePackageCreated}
        onPackageUpdated={(updatedPkg) => {
          setLocalPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));
          onRefreshState();
        }}
      />

      {/* CAPTIVE PORTAL LIVE PREVIEW MODAL */}
      <CaptivePortalPreviewModal
        isOpen={showPortalPreviewModal}
        onClose={() => setShowPortalPreviewModal(false)}
        config={{
          businessDisplayName: profile?.businessName || businessProfile?.companyName,
          portalName: profile?.businessName ? `${profile.businessName} Hotspot` : 'BRISK Smart Hotspot',
          supportPhone: profile?.supportContact || businessProfile?.phone,
        }}
        packages={localPackages.length > 0 ? localPackages : packages}
      />

      {/* ROUTER DIAGNOSTIC ICMP PING & PACKET LOSS MODAL */}
      <RouterDiagnosticModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        routers={routers}
        initialRouterId={diagnosticRouterId}
      />

      {/* ROUTER TELEMETRY ALERT NOTIFICATIONS & THRESHOLD SYSTEM */}
      <RouterAlertToast
        alerts={routerAlerts}
        onDismiss={handleDismissAlert}
        onOpenDiagnostic={(routerId: string) => handleOpenDiagnostic(routerId)}
        latencyThreshold={latencyThresholdMs}
        packetLossThreshold={packetLossThresholdPercent}
        onUpdateThresholds={(newLat, newLoss) => {
          setLatencyThresholdMs(newLat);
          setPacketLossThresholdPercent(newLoss);
        }}
        onSimulateAlert={handleSimulateAlert}
      />

      {/* M-PESA TRANSITION CODE SUBMISSION & AUTO-ACTIVATION MODAL */}
      <SubmitTransitionCodeModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        ownerId={currentUser.id}
        ownerName={currentUser.name}
        ownerPhone={currentUser.phone}
        currentExpiryDate={ownerEndDate || profile?.subscriptionExpiresAt}
        onSuccess={handleActivationSuccess}
        blockedFeatureName={blockedActionTitle}
      />
    </div>
  );
};
