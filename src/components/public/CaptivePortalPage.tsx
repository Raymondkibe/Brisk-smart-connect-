import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Smartphone,
  Ticket,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Signal,
  ArrowRight,
  Download,
  Copy,
  Sparkles,
  Power,
  Receipt,
  Radio,
  Zap,
  Globe,
  ArrowLeft,
  Server,
  Activity,
  Gauge,
  QrCode,
  Check,
  Share2,
  Sliders,
  Settings,
  HelpCircle,
  X,
  FileCode,
  Terminal,
  Database,
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  CreditCard,
  Banknote,
  MessageCircle,
  PhoneCall,
  Info,
  Camera,
} from 'lucide-react';
import type { WifiPackage, Transaction, Voucher, WifiSession, PortalManualPayment } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { QrCodeScannerModal } from '../common/QrCodeScannerModal.tsx';
import type { ParsedQrResult } from '../../lib/qrParser.ts';


interface CaptivePortalPageProps {
  packages: WifiPackage[];
  vouchers?: Voucher[];
  onReturnHome?: () => void;
  onOpenReceipt?: (tx: Transaction) => void;
  onViewCustomerDashboard?: () => void;
}

type PortalLanguage = 'EN' | 'SW';

export const CaptivePortalPage: React.FC<CaptivePortalPageProps> = ({
  packages,
  vouchers = [],
  onReturnHome,
  onOpenReceipt,
  onViewCustomerDashboard,
}) => {
  // Read router query params if redirected by MikroTik Hotspot
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialMac = queryParams?.get('mac') || 'DC:A6:32:89:BC:11';
  const initialIp = queryParams?.get('ip') || '192.168.88.142';
  const initialSsid = queryParams?.get('ssid') || 'BRISK WiFi';
  const isExpiredParam = queryParams?.get('expired') === '1';

  // Language state
  const [lang, setLang] = useState<PortalLanguage>('EN');

  // Hotspot Network & Device State
  const [activeNetwork] = useState(initialSsid);
  const [routerIp] = useState('192.168.88.1');
  const [assignedIp] = useState(initialIp);
  const [deviceMac] = useState(initialMac);
  const [showExpiredBanner, setShowExpiredBanner] = useState(isExpiredParam);

  // Dynamic Published Portal Configuration from Router Owner
  const [publishedPortal, setPublishedPortal] = useState<any>(null);
  const [dynamicPackages, setDynamicPackages] = useState<WifiPackage[]>(
    packages.filter((p) => p.isCustom)
  );
  const [lastAutoSync, setLastAutoSync] = useState<string>('Just now');

  // Manual payment methods available for this portal
  const [manualMethods, setManualMethods] = useState<any[]>([]);
  const [selectedManualMethod, setSelectedManualMethod] = useState<any>(null);
  const [manualRefCode, setManualRefCode] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualStatus, setManualStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUBMITTED'>('IDLE');
  const [manualMessage, setManualMessage] = useState('');
  const [manualError, setManualError] = useState('');

  // Determine current portal tenant ID from URL or default
  const getPortalTenantId = () => {
    if (typeof window === 'undefined') return 'default';
    const params = new URLSearchParams(window.location.search);
    return params.get('owner') || params.get('tenant') || 'default';
  };

  // Load published portal & manual payment methods
  const loadPublishedPortal = async () => {
    try {
      const tenantId = getPortalTenantId();
      const res = await api.getPublicPortal(tenantId);
      if (res && res.portal) {
        setPublishedPortal(res.portal);
        if (Array.isArray(res.portal.packages) && res.portal.packages.length > 0) {
          setDynamicPackages(res.portal.packages);
          if (!selectedPkgId) {
            setSelectedPkgId(res.portal.packages[0].id);
          }
        }
        setLastAutoSync(new Date().toLocaleTimeString('en-KE', { hour12: false }));
      }
    } catch (err) {
      console.warn('Could not load dynamic portal:', err);
    }
  };

  const loadManualMethods = async () => {
    try {
      const tenantId = getPortalTenantId();
      const res = await api.getPortalManualPaymentMethods(tenantId);
      if (res && res.methods) {
        setManualMethods(res.methods);
        if (res.methods.length > 0) {
          setSelectedManualMethod(res.methods[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load manual methods:', err);
    }
  };

  useEffect(() => {
    loadPublishedPortal();
    loadManualMethods();

    const handlePortalChange = () => {
      loadPublishedPortal();
      loadManualMethods();
    };

    window.addEventListener('brisk-portal-published', handlePortalChange);
    window.addEventListener('brisk-package-updated', handlePortalChange);
    window.addEventListener('storage', handlePortalChange);

    // Automated synchronization poll
    const pollInterval = setInterval(() => {
      loadPublishedPortal();
    }, 6000);

    return () => {
      window.removeEventListener('brisk-portal-published', handlePortalChange);
      window.removeEventListener('brisk-package-updated', handlePortalChange);
      window.removeEventListener('storage', handlePortalChange);
      clearInterval(pollInterval);
    };
  }, []);

  const currentPackages = dynamicPackages.length > 0 ? dynamicPackages : packages;

  // Active Tab: 'BUY' (Buy Data), 'VOUCHER' (Voucher PIN), 'ACCOUNT' (My Account)
  const [activeTab, setActiveTab] = useState<'BUY' | 'VOUCHER' | 'ACCOUNT'>('BUY');

  // Checkout Mode: 'MPESA' vs 'MANUAL'
  const [checkoutMode, setCheckoutMode] = useState<'MPESA' | 'MANUAL'>('MPESA');

  // M-Pesa Flow State
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    currentPackages[0]?.id || 'pkg-1d'
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [stkStatus, setStkStatus] = useState<'IDLE' | 'PROMPTING' | 'VERIFYING' | 'SUCCESS'>('IDLE');
  const [stkErrorMessage, setStkErrorMessage] = useState('');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);

  // Voucher Flow State
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);


  // Account Flow State
  const [accountSubTab, setAccountSubTab] = useState<'LOGIN' | 'REGISTER' | 'STATUS'>('LOGIN');
  const [accountUser, setAccountUser] = useState('');
  const [accountPass, setAccountPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  // Connected Session State
  const [isConnected, setIsConnected] = useState(false);
  const [remainingSecs, setRemainingSecs] = useState(86400); // 24 hours default
  const [currentSpeed, setCurrentSpeed] = useState('15 Mbps');
  const [activePackageName, setActivePackageName] = useState('1 Day Unlimited');
  const [usageMb, setUsageMb] = useState(210);

  // Tools & Info Modals
  const [showMikrotikModal, setShowMikrotikModal] = useState(false);
  const [showSpeedTestModal, setShowSpeedTestModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Speed test state
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [speedTestPhase, setSpeedTestPhase] = useState<'IDLE' | 'PING' | 'DOWNLOAD' | 'UPLOAD' | 'DONE'>('IDLE');
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [speedPing, setSpeedPing] = useState(11);

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (isConnected && remainingSecs > 0) {
      timer = setInterval(() => {
        setRemainingSecs((prev) => Math.max(prev - 1, 0));
        setUsageMb((prev) => prev + Math.floor(Math.random() * 2));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isConnected, remainingSecs]);

  const formatCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const selectedPackage =
    currentPackages.find((p) => p.id === selectedPkgId) ||
    currentPackages[0] || {
      id: 'pkg-1d',
      name: '1 Day Unlimited',
      priceKes: 80,
      durationLabel: '24 hours',
      speedLabel: '15 Mbps',
      durationHours: 24,
    };

  // 1. Select Package
  const handleSelectPackageChip = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setIsCheckoutOpen(true);
    setManualStatus('IDLE');
    setManualMessage('');
    setManualError('');
  };

  // 2. M-Pesa STK Push
  const handleInitiateMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setStkErrorMessage(lang === 'SW' ? 'Tafadhali weka nambari sahihi ya M-Pesa (tarakimu 10).' : 'Please enter a valid 10-digit M-Pesa phone number.');
      return;
    }
    setStkErrorMessage('');
    setStkStatus('PROMPTING');

    try {
      const stkRes = await api.initiateMpesaStkPush({
        phone: cleanPhone,
        amount: selectedPackage.priceKes,
        accountReference: `HOTSPOT-${selectedPackage.id}`,
        transactionDesc: `BRISK WiFi Hotspot ${selectedPackage.name}`,
      });

      setStkStatus('VERIFYING');

      setTimeout(async () => {
        try {
          const verifyRes = await api.verifyMpesaPayment({
            checkoutRequestId: stkRes.checkoutRequestId || `ws_CO_${Date.now()}`,
            phone: cleanPhone,
            amount: selectedPackage.priceKes,
            type: 'CUSTOMER_WIFI',
            packageId: selectedPackage.id,
            userId: 'usr-cust-01',
          });

          setStkStatus('SUCCESS');
          setLastTx(verifyRes.transaction);
          setIsConnected(true);
          setRemainingSecs((selectedPackage.durationHours || 24) * 3600);
          setCurrentSpeed(selectedPackage.speedLabel || '15 Mbps');
          setActivePackageName(selectedPackage.name);
          setShowExpiredBanner(false);
        } catch (verErr: any) {
          setStkErrorMessage(verErr.message || 'Payment verification encountered an issue. Try PayBill 222111.');
          setStkStatus('IDLE');
        }
      }, 1800);
    } catch (err: any) {
      setStkErrorMessage(err.message || 'Failed to initiate M-Pesa payment prompt.');
      setStkStatus('IDLE');
    }
  };

  // 3. Manual Payment Submission
  const handleSubmitManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRefCode.trim()) {
      setManualError(lang === 'SW' ? 'Tafadhali weka nambari ya uthibitisho ya M-Pesa au benki.' : 'Please enter your payment confirmation code / SMS reference.');
      return;
    }
    if (!manualPhone.trim() || manualPhone.trim().length < 10) {
      setManualError(lang === 'SW' ? 'Tafadhali weka nambari yako ya simu.' : 'Please enter a valid phone number.');
      return;
    }

    setManualError('');
    setManualStatus('SUBMITTING');

    try {
      const res = await api.submitPortalManualPayment({
        paymentMethodId: selectedManualMethod?.id,
        methodLabel: selectedManualMethod?.title,
        methodType: selectedManualMethod?.type,
        accountOrTill: selectedManualMethod?.identifier,
        customerPhone: manualPhone.trim(),
        transactionReference: manualRefCode.trim().toUpperCase(),
        packageId: selectedPackage.id,
        amountKes: selectedPackage.priceKes,
      });

      setManualStatus('SUBMITTED');
      setManualMessage(res.message);
    } catch (err: any) {
      setManualError(err.message || 'Failed to submit payment reference. Please check your reference code.');
      setManualStatus('IDLE');
    }
  };

  // 4. Voucher Redemption
  const executeVoucherRedeem = async (codeToRedeem: string) => {
    const cleanCode = codeToRedeem.trim().toUpperCase();
    if (!cleanCode) {
      setVoucherError(lang === 'SW' ? 'Tafadhali weka nambari ya vocha yako.' : 'Please enter your voucher code.');
      return;
    }

    setVoucherLoading(true);
    setVoucherError('');
    setVoucherSuccess('');

    try {
      const res = await api.redeemVoucher(cleanCode, loggedInCustomer?.id || 'guest-session');
      setVoucherSuccess(lang === 'SW' ? `Vocha Imethibitishwa! Kifurushi cha ${res.voucher.packageName} kimewezeshwa.` : `Voucher Verified! ${res.voucher.packageName} activated successfully.`);
      setIsConnected(true);
      setRemainingSecs(res.voucher.durationHours * 3600);
      setCurrentSpeed(res.voucher.speed);
      setActivePackageName(res.voucher.packageName);
      setShowExpiredBanner(false);
    } catch (err: any) {
      setVoucherError(err.message || 'Invalid or expired voucher code. Please check your PIN.');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleVoucherRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    executeVoucherRedeem(voucherCode);
  };

  const handleQrScan = (parsed: ParsedQrResult) => {
    const code = parsed.voucherCode || parsed.raw;
    if (code) {
      setVoucherCode(code.toUpperCase());
      setActiveTab('VOUCHER');
      executeVoucherRedeem(code);
    }
  };


  // 5. Account Sign In
  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountUser.trim() || !accountPass) {
      setAccountError(lang === 'SW' ? 'Tafadhali weka maelezo yako ya akaunti.' : 'Please enter your credentials');
      return;
    }
    setAccountLoading(true);
    setAccountError('');
    try {
      const res = await api.login(accountUser.trim(), 'CUSTOMER');
      setLoggedInCustomer(res.user);
      setIsConnected(true);
      setRemainingSecs(72 * 3600);
      setCurrentSpeed('20 Mbps');
      setActivePackageName('Subscriber Unlimited Pass');
      setShowExpiredBanner(false);
      setAccountSubTab('STATUS');
    } catch (err: any) {
      setAccountError(err.message || 'Login failed. Please check your phone/email and password.');
    } finally {
      setAccountLoading(false);
    }
  };

  // 6. Inline Account Registration
  const handleAccountRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      setAccountError(lang === 'SW' ? 'Jina na simu vinahitajika.' : 'Name and Phone number are required.');
      return;
    }
    setAccountLoading(true);
    setAccountError('');
    try {
      const res = await api.registerCustomer({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        password: regPass,
      });

      setLoggedInCustomer(res.user);
      setAccountSuccess(res.message);
      setAccountSubTab('STATUS');
    } catch (err: any) {
      setAccountError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setAccountLoading(false);
    }
  };

  // Disconnect
  const handleDisconnect = () => {
    if (confirm(lang === 'SW' ? 'Ungependa kutenganisha kifaa hiki kutoka kwenye mtandao wa WiFi?' : 'Disconnect this device from the WiFi hotspot?')) {
      setIsConnected(false);
      setIsCheckoutOpen(false);
    }
  };

  // Speed test simulation
  const handleRunSpeedTest = () => {
    setSpeedTestRunning(true);
    setSpeedTestPhase('PING');
    setDownloadSpeed(0);
    setUploadSpeed(0);

    setTimeout(() => {
      setSpeedPing(Math.floor(9 + Math.random() * 5));
      setSpeedTestPhase('DOWNLOAD');

      let dl = 2;
      const dlInterval = setInterval(() => {
        dl += 2.8;
        setDownloadSpeed(Number(dl.toFixed(1)));
        if (dl >= 18.5) {
          clearInterval(dlInterval);
          setSpeedTestPhase('UPLOAD');

          let ul = 1;
          const ulInterval = setInterval(() => {
            ul += 2.1;
            setUploadSpeed(Number(ul.toFixed(1)));
            if (ul >= 12.4) {
              clearInterval(ulInterval);
              setSpeedTestPhase('DONE');
              setSpeedTestRunning(false);
            }
          }, 100);
        }
      }, 90);
    }, 500);
  };

  const availableVouchers = vouchers && vouchers.length > 0 ? vouchers.slice(0, 3) : [];


  return (
    <div className="min-h-screen bg-[#060a17] bg-radial-at-t from-[#0e1b3d] via-[#060a17] to-[#03060f] flex flex-col items-center justify-center p-3 sm:p-5 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ======================================================== */}
      {/* TOP COMPACT BRAND HEADER & LANGUAGE SELECTOR             */}
      {/* ======================================================== */}
      <div className="w-full max-w-[440px] flex items-center justify-between py-2 px-1 mb-2 text-xs">
        <button
          onClick={onReturnHome}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'SW' ? 'Mwanzo' : 'Home'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 font-bold text-[10px]">
            <button
              onClick={() => setLang('EN')}
              className={`px-2 py-0.5 rounded transition-all ${
                lang === 'EN' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('SW')}
              className={`px-2 py-0.5 rounded transition-all ${
                lang === 'SW' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              SW
            </button>
          </div>

          <button
            onClick={() => setShowSupportModal(true)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/60 px-2 py-1 rounded-lg"
          >
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'SW' ? 'Msaada' : 'Helpline'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CAPTIVE PORTAL MAIN CARD CONTAINER                       */}
      {/* ======================================================== */}
      <div className="w-full max-w-[440px] bg-[#0b132b]/95 backdrop-blur-xl text-slate-100 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-800/90 shadow-cyan-950/20 transition-all">
        {/* 1. BRAND LOGO SECTION */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-2 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/20">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>BRISK</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
              Smart Connect
            </span>
          </div>
          <div className="text-[11px] text-cyan-200/70 font-medium tracking-wide">
            {lang === 'SW' ? 'Huduma ya WiFi ya Haraka na Salama' : 'Fast & Secure WiFi Access'}
          </div>
        </div>

        {/* 2. NETWORK BANNER (Blue-to-Purple Gradient Glass Card) */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-4 text-white text-center shadow-lg shadow-indigo-950/40 mb-4 relative overflow-hidden border border-white/10">
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-1.5">
              <Radio className="w-4 h-4 text-cyan-200" />
            </div>
            <div className="font-extrabold text-base sm:text-lg tracking-tight">
              {publishedPortal?.businessDisplayName || activeNetwork}
            </div>
            <div className="text-[11px] text-cyan-100/90 font-medium mt-0.5">
              {publishedPortal?.businessLocation || 'Kiambu County · 5 GHz High-Speed Hotspot'}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'SW' ? 'Mtandao Unafanya Kazi' : 'Hotspot Online'}</span>
            </div>
          </div>
        </div>

        {/* 3. EXPIRY ALERT BANNER */}
        {showExpiredBanner && (
          <div className="bg-amber-950/50 border border-amber-600/60 rounded-xl p-3 text-center mb-4 animate-fade-in text-amber-200">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="font-bold text-xs">
              {lang === 'SW' ? 'Muda wako wa intaneti umekwisha!' : 'Your internet has expired!'}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">
              {lang === 'SW' ? 'Chagua kifurushi hapa chini kuunganishwa tena mara moja.' : 'Choose a package below to reconnect instantly.'}
            </div>
          </div>
        )}

        {/* 4. CONNECTED & PROTECTED ACTIVE SESSION VIEW */}
        {isConnected ? (
          <div className="space-y-4 py-2 animate-fade-in">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-2xl text-center space-y-2 shadow-inner">
              <div className="w-11 h-11 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                  CONNECTED & PROTECTED
                </span>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {activePackageName}
                </div>
              </div>
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                  {lang === 'SW' ? 'Muda Uliosalia' : 'Time Remaining'}
                </span>
                <span className="text-sm font-black font-mono text-cyan-400">
                  {formatCountdown(remainingSecs)}
                </span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                  {lang === 'SW' ? 'Kasi ya Mtandao' : 'Bandwidth Speed'}
                </span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  {currentSpeed}
                </span>
              </div>
            </div>

            {/* Device Diagnostics Info */}
            <div className="p-2.5 bg-slate-900/60 rounded-xl text-[11px] font-mono text-slate-400 flex justify-between border border-slate-800/80">
              <span>IP: {assignedIp}</span>
              <span>MAC: {deviceMac}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setShowSpeedTestModal(true)}
                className="w-full py-2.5 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'SW' ? 'Pima Kasi ya Mtandao' : 'Run Interactive Speed Test'}</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="w-full py-2 bg-slate-900/80 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
              >
                {lang === 'SW' ? 'Tenganisha Kifaa' : 'Disconnect Device'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 5. 3-TAB PILL ROW MATCHING SPECIFICATION */}
            <div className="flex bg-slate-900/90 p-1 rounded-full mb-4 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('BUY');
                  setIsCheckoutOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'BUY'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'SW' ? 'Nunua Data' : 'Buy Data'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('VOUCHER')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'VOUCHER'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'SW' ? 'Vocha' : 'Voucher'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ACCOUNT')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'ACCOUNT'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'SW' ? 'Akaunti Yangu' : 'My Account'}
              </button>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: BUY DATA                                          */}
            {/* ======================================================== */}
            {activeTab === 'BUY' && (
              <div className="space-y-3.5 animate-fade-in">
                {!isCheckoutOpen ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {lang === 'SW' ? 'Chagua Kifurushi cha WiFi' : 'Select WiFi Package'}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {currentPackages.length} {lang === 'SW' ? 'vifurushi' : 'offers'}
                      </span>
                    </div>

                    {/* RESPONSIVE PACKAGE CARDS */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {currentPackages.map((pkg) => {
                        const isSelected = selectedPkgId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => handleSelectPackageChip(pkg.id)}
                            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between relative group ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400'
                                : 'border-slate-800 hover:border-cyan-500/60 bg-slate-900/60 hover:bg-slate-900'
                            }`}
                          >
                            {pkg.isPopular && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[8px] uppercase tracking-wider shadow">
                                POPULAR
                              </span>
                            )}
                            <div className="text-xl font-black text-amber-400 font-mono leading-none pt-1">
                              {pkg.priceKes}
                            </div>
                            <div className="text-[9px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5">
                              KES
                            </div>
                            <div className="text-[11px] text-slate-200 truncate mt-1.5 font-bold">
                              {pkg.durationLabel || `${pkg.durationHours}h`}
                            </div>
                            {pkg.speedLabel && (
                              <div className="text-[9px] text-cyan-400 font-mono mt-0.5">
                                {pkg.speedLabel}
                              </div>
                            )}
                            <div className="mt-2 w-full py-1 bg-amber-400/20 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-300 text-[10px] font-bold rounded-lg transition-colors">
                              {lang === 'SW' ? 'Nunua' : 'Buy Now'}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                      {lang === 'SW'
                        ? 'Chagua kifurushi kulipa kwa M-Pesa au Njia ya Malipo ya Mwongozo'
                        : 'Select a package to pay via M-Pesa STK Push or Manual Payout channels'}
                    </p>
                  </>
                ) : (
                  /* ==================================================== */
                  /* SELECTED PACKAGE CHECKOUT VIEW                        */
                  /* ==================================================== */
                  <div className="space-y-3.5 animate-fade-in">
                    {/* Selected Summary Card */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-3.5 text-center shadow-md">
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        KES {selectedPackage.priceKes}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {selectedPackage.name} · {selectedPackage.durationLabel || `${selectedPackage.durationHours} hours`}
                      </div>
                      {selectedPackage.speedLabel && (
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                          Speed: {selectedPackage.speedLabel}
                        </div>
                      )}
                    </div>

                    {/* PAYMENT METHOD SELECTOR TOGGLE */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setCheckoutMode('MPESA')}
                        className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                          checkoutMode === 'MPESA'
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>M-Pesa STK Push</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutMode('MANUAL')}
                        className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                          checkoutMode === 'MANUAL'
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Manual / Till / Paybill</span>
                      </button>
                    </div>

                    {/* OPTION A: M-PESA AUTOMATED STK PUSH */}
                    {checkoutMode === 'MPESA' ? (
                      <form onSubmit={handleInitiateMpesa} className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            {lang === 'SW' ? 'Nambari ya Simu ya M-Pesa' : 'M-Pesa Phone Number'}
                          </label>
                          <div className="relative">
                            <Smartphone className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="0712883849"
                              inputMode="numeric"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                          </div>
                        </div>

                        {/* M-Pesa Action Button (Bright Yellow) */}
                        <button
                          type="submit"
                          disabled={stkStatus === 'PROMPTING' || stkStatus === 'VERIFYING'}
                          className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {stkStatus === 'PROMPTING' || stkStatus === 'VERIFYING' ? (
                            <>
                              <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                              <span>{lang === 'SW' ? 'Inatuma Maombi ya STK...' : 'Sending STK Prompt...'}</span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-4 h-4" />
                              <span>{lang === 'SW' ? 'Lipa na M-Pesa' : 'Pay with M-Pesa'} (KES {selectedPackage.priceKes})</span>
                            </>
                          )}
                        </button>

                        {/* Status Feedback */}
                        {stkStatus === 'PROMPTING' && (
                          <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded-xl text-center text-xs text-amber-300 animate-pulse">
                            {lang === 'SW' ? 'Tazama simu yako uweke nenosiri la M-Pesa...' : 'Check your phone for the M-Pesa PIN prompt...'}
                          </div>
                        )}
                        {stkStatus === 'VERIFYING' && (
                          <div className="p-3 bg-cyan-950/40 border border-cyan-600/60 rounded-xl text-center text-xs text-cyan-300">
                            {lang === 'SW' ? 'Inathibitisha malipo na kuwezesha router...' : 'Verifying transaction & authorizing router access...'}
                          </div>
                        )}
                        {stkErrorMessage && (
                          <div className="p-2.5 bg-rose-950/40 border border-rose-700/60 rounded-xl text-center text-xs text-rose-300">
                            {stkErrorMessage}
                          </div>
                        )}
                      </form>
                    ) : (
                      /* OPTION B: MANUAL PAYMENT METHODS (Till, Paybill, Bank, Cash) */
                      <form onSubmit={handleSubmitManualPayment} className="space-y-3">
                        <div className="text-[11px] font-bold text-slate-400 uppercase">
                          {lang === 'SW' ? 'Chagua Njia ya Mwongozo' : 'Choose Payout Channel'}
                        </div>

                        {/* List of manual payout options */}
                        <div className="space-y-1.5">
                          {manualMethods.map((m) => {
                            const isChosen = selectedManualMethod?.id === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedManualMethod(m)}
                                className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                                  isChosen
                                    ? 'border-amber-400 bg-amber-400/10 text-white'
                                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="font-extrabold text-xs text-amber-300">{m.title}</div>
                                  <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                                    {m.type === 'MPESA_PAYBILL' ? `Paybill: ${m.identifier} · Acct: ${m.accountRef || '5414200'}` : `Number: ${m.identifier}`}
                                  </div>
                                </div>
                                {isChosen && <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Instructions box */}
                        {selectedManualMethod && (
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-1">
                            <span className="font-bold text-cyan-400 block uppercase text-[10px]">
                              {lang === 'SW' ? 'Maagizo ya Malipo' : 'Payment Instructions'}:
                            </span>
                            <p>{selectedManualMethod.instructions}</p>
                          </div>
                        )}

                        {/* Customer Confirmation Code Input */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            {lang === 'SW' ? 'Nambari ya Uthibitisho (SMS Code / Reference)' : 'M-Pesa / Bank Reference Code'}
                          </label>
                          <input
                            type="text"
                            value={manualRefCode}
                            onChange={(e) => setManualRefCode(e.target.value.toUpperCase())}
                            placeholder="e.g. QGK881920 or REF-1204"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            {lang === 'SW' ? 'Nambari Yako ya Simu' : 'Your Phone Number'}
                          </label>
                          <input
                            type="tel"
                            value={manualPhone}
                            onChange={(e) => setManualPhone(e.target.value)}
                            placeholder="0712883849"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {manualStatus === 'SUBMITTED' ? (
                          <div className="p-3 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-center text-xs text-emerald-300 font-semibold space-y-1">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                            <div>{manualMessage}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Status: PENDING OWNER REVIEW. Your hotspot pass will activate automatically once confirmed.
                            </div>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            disabled={manualStatus === 'SUBMITTING'}
                            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {manualStatus === 'SUBMITTING' ? (
                              <>
                                <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                                <span>Submitting Proof...</span>
                              </>
                            ) : (
                              <>
                                <Receipt className="w-4 h-4" />
                                <span>Submit for Verification</span>
                              </>
                            )}
                          </button>
                        )}

                        {manualError && (
                          <div className="p-2.5 bg-rose-950/40 border border-rose-700/60 rounded-xl text-center text-xs text-rose-300">
                            {manualError}
                          </div>
                        )}
                      </form>
                    )}

                    {/* Back to package picker */}
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-full py-1.5 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{lang === 'SW' ? 'Rudi kwenye vifurushi' : 'Back to packages'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: VOUCHER REDEMPTION                                */}
            {/* ======================================================== */}
            {activeTab === 'VOUCHER' && (
              <form onSubmit={handleVoucherRedeem} className="space-y-3.5 animate-fade-in">
                {/* Camera QR Scanner Button */}
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-amber-400/20 hover:from-amber-400/30 hover:to-amber-400/30 border border-amber-400/40 hover:border-amber-400 rounded-xl text-amber-300 hover:text-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'SW' ? 'Changanua Vocha kwa Kamera' : 'Scan Voucher QR with Camera'}</span>
                </button>

                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {lang === 'SW' ? 'au weka nambari' : 'or enter code'}
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 text-center">
                    {lang === 'SW' ? 'Weka Nambari ya Vocha' : 'Enter Voucher PIN Code'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BRK-8821"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-11 text-center font-mono text-lg tracking-widest text-amber-400 uppercase focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="absolute right-3 p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Scan with Camera"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={voucherLoading || !voucherCode.trim()}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {voucherLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{lang === 'SW' ? 'Inathibitisha Vocha...' : 'Verifying Voucher...'}</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>{lang === 'SW' ? 'Tumia Vocha Sasa' : 'Redeem Voucher'}</span>
                    </>
                  )}
                </button>

                {voucherError && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-700/60 rounded-xl text-center text-xs text-rose-300">
                    {voucherError}
                  </div>
                )}
                {voucherSuccess && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-center text-xs text-emerald-300 font-semibold">
                    {voucherSuccess}
                  </div>
                )}

                {/* Available Vouchers or Scratchcard guidance */}
                {availableVouchers.length > 0 ? (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block text-center mb-1.5 font-bold">
                      {lang === 'SW' ? 'Vocha Zilizopo' : 'Available Vouchers'}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {availableVouchers.map((v) => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setVoucherCode(v.code)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[11px] font-mono rounded-lg transition-colors border border-slate-800"
                        >
                          {v.code}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800 text-center">
                    <p className="text-[11px] text-slate-400">
                      {lang === 'SW'
                        ? 'Weka nambari ya siri ya vocha uliyopokea au changanua kadi yako.'
                        : 'Enter the PIN from your physical scratch card or scan the printed QR code.'}
                    </p>
                  </div>
                )}
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 3: MY ACCOUNT (INLINE LOGIN, REGISTER & STATUS)      */}
            {/* ======================================================== */}
            {activeTab === 'ACCOUNT' && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Account Sub-Tabs Switcher */}
                <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setAccountSubTab('LOGIN')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      accountSubTab === 'LOGIN' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'SW' ? 'Ingia' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountSubTab('REGISTER')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      accountSubTab === 'REGISTER' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'SW' ? 'Jisajili' : 'Register'}
                  </button>
                  {loggedInCustomer && (
                    <button
                      type="button"
                      onClick={() => setAccountSubTab('STATUS')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${
                        accountSubTab === 'STATUS' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'SW' ? 'Hali Yangu' : 'My Session'}
                    </button>
                  )}
                </div>

                {/* SUBTAB 1: SIGN IN */}
                {accountSubTab === 'LOGIN' && (
                  <form onSubmit={handleAccountLogin} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        {lang === 'SW' ? 'Simu au Barua Pepe' : 'Phone or Email'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          value={accountUser}
                          onChange={(e) => setAccountUser(e.target.value)}
                          placeholder="0712883849"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        {lang === 'SW' ? 'Nenosiri' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={accountPass}
                          onChange={(e) => setAccountPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-9 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={accountLoading}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {accountLoading ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>{lang === 'SW' ? 'Ingia na Uunganishe' : 'Sign In & Connect'}</span>
                        </>
                      )}
                    </button>

                    {accountError && (
                      <div className="p-2.5 bg-rose-950/40 border border-rose-700/60 rounded-xl text-center text-xs text-rose-300">
                        {accountError}
                      </div>
                    )}
                  </form>
                )}

                {/* SUBTAB 2: REGISTER INLINE */}
                {accountSubTab === 'REGISTER' && (
                  <form onSubmit={handleAccountRegister} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        {lang === 'SW' ? 'Jina Kamili' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        {lang === 'SW' ? 'Nambari ya Simu' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0712345678"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        {lang === 'SW' ? 'Nenosiri' : 'Create Password'}
                      </label>
                      <input
                        type="password"
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={accountLoading}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {accountLoading ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>{lang === 'SW' ? 'Unda Akaunti Yangu' : 'Create Customer Account'}</span>
                        </>
                      )}
                    </button>

                    {accountError && (
                      <div className="p-2.5 bg-rose-950/40 border border-rose-700/60 rounded-xl text-center text-xs text-rose-300">
                        {accountError}
                      </div>
                    )}
                    {accountSuccess && (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-center text-xs text-emerald-300 font-semibold">
                        {accountSuccess}
                      </div>
                    )}
                  </form>
                )}

                {/* SUBTAB 3: MY STATUS & PROFILE */}
                {accountSubTab === 'STATUS' && loggedInCustomer && (
                  <div className="space-y-3 bg-slate-900/60 rounded-2xl p-3 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <div className="font-extrabold text-white text-sm">{loggedInCustomer.name}</div>
                        <div className="text-[11px] font-mono text-cyan-400">{loggedInCustomer.phone}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                        Active Account
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
                      <div className="p-2 bg-slate-900 rounded-lg">
                        <span className="text-[10px] text-slate-400 block font-sans">Active Pass</span>
                        <span className="text-white font-bold">{activePackageName}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg">
                        <span className="text-[10px] text-slate-400 block font-sans">Data Consumed</span>
                        <span className="text-cyan-400 font-bold">{usageMb} MB</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('BUY');
                        setIsCheckoutOpen(false);
                      }}
                      className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-bold rounded-xl text-center transition-colors block"
                    >
                      {lang === 'SW' ? 'Nunua Kifurushi Kipya' : 'Renew / Buy New Package'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 6. CARD FOOTER WITH HELP & PAYBILL */}
        <div className="text-center mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-col items-center gap-1.5">
          <div>
            Powered by <strong className="text-cyan-400">BRISK Smart Connect</strong> · PayBill <strong className="text-white">222111</strong>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <button onClick={() => setShowTermsModal(true)} className="hover:text-slate-300 underline">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => setShowPrivacyModal(true)} className="hover:text-slate-300 underline">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => setShowMikrotikModal(true)} className="hover:text-cyan-400">
              Router Script
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUPPORT & HELPLINE MODAL                                */}
      {/* ======================================================== */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Customer Support Helpline</h3>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/254722000111?text=Hello%20BRISK%20WiFi%20Support%2C%20I%20need%20assistance%20connecting."
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/60 hover:bg-emerald-900/40 text-emerald-300 font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Chat on WhatsApp</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="tel:0722000111"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-cyan-400" />
                  <span>Call Operator: 0722 000 111</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
                <span className="font-bold text-white block">Official Payment Account:</span>
                <div>Paybill: <strong>222111</strong></div>
                <div>Account Ref: <strong>5414200</strong></div>
                <div>Till Number: <strong>5414200</strong></div>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SPEED TEST MODAL                                        */}
      {/* ======================================================== */}
      {showSpeedTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Interactive Speed Test</h3>
              </div>
              <button onClick={() => setShowSpeedTestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-3xl font-black font-mono text-cyan-400">
                {speedTestPhase === 'UPLOAD' ? uploadSpeed : downloadSpeed}
                <span className="text-xs font-normal text-slate-400 ml-1">Mbps</span>
              </div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {speedTestPhase === 'IDLE' && 'Ready to Test Bandwidth'}
                {speedTestPhase === 'PING' && 'Measuring Latency...'}
                {speedTestPhase === 'DOWNLOAD' && 'Testing Download Bandwidth...'}
                {speedTestPhase === 'UPLOAD' && 'Testing Upload Bandwidth...'}
                {speedTestPhase === 'DONE' && 'Test Complete! High Speed Verified.'}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">PING</span>
                  <span className="text-slate-200">{speedPing} ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SERVER</span>
                  <span className="text-slate-200">Nairobi Edge</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunSpeedTest}
              disabled={speedTestRunning}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all disabled:opacity-50"
            >
              {speedTestRunning ? 'Testing Performance...' : 'Start Speed Test'}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MIKROTIK SETUP SCRIPT MODAL                             */}
      {/* ======================================================== */}
      {showMikrotikModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">MikroTik RouterOS Walled Garden Script</h3>
              </div>
              <button onClick={() => setShowMikrotikModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Paste this command into your MikroTik WinBox or SSH Terminal to whitelist the captive portal and Daraja M-Pesa:
            </p>

            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48 leading-relaxed">
{`/ip hotspot profile
set [find] login-by=http-chap,http-pap,mac-cookie use-radius=yes
/ip hotspot walled-garden
add action=accept comment="BRISK Portal" dst-host=*.vercel.app
add action=accept comment="Daraja M-Pesa" dst-host=*.safaricom.co.ke
add action=accept comment="Cloudflare DNS" dst-host=1.1.1.1
/log info "BRISK Smart Connect Configured!"`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`/ip hotspot profile\nset [find] login-by=http-chap,http-pap,mac-cookie use-radius=yes\n/ip hotspot walled-garden\nadd action=accept comment="BRISK Portal" dst-host=*.vercel.app\nadd action=accept comment="Daraja M-Pesa" dst-host=*.safaricom.co.ke\nadd action=accept comment="Cloudflare DNS" dst-host=1.1.1.1\n/log info "BRISK Smart Connect Configured!"`);
                  setCopiedCode('script');
                  setTimeout(() => setCopiedCode(null), 2500);
                }}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center gap-1 border border-slate-700"
              >
                {copiedCode === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'script' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowMikrotikModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TERMS & PRIVACY MODALS                                   */}
      {/* ======================================================== */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Terms & Fair Usage Policy</h3>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto pr-1">
              <p>1. Internet access is provided subject to timely payment via M-Pesa or approved voucher.</p>
              <p>2. Users must not engage in illegal file sharing, malicious denial of service, or abusive activity.</p>
              <p>3. Bandwidth speeds are monitored to guarantee fair distribution across all connected users.</p>
              <p>4. Sessions expire automatically upon conclusion of the allotted package duration.</p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Privacy Policy</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto pr-1">
              <p>We respect customer privacy. Device MAC addresses and phone numbers are utilized strictly for network authentication, STK push payment receipts, and session continuity.</p>
              <p>Customer data is never sold or exposed to third parties without explicit authorization.</p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Code Camera Scanner Modal */}
      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQrScan}
        title={lang === 'SW' ? 'Changanua Vocha kwa Kamera' : 'Scan Voucher QR with Camera'}
        hint={
          lang === 'SW'
            ? 'Elekeza kamera kwenye kadi yako ya vocha au risiti'
            : 'Point your camera at the printed voucher card or receipt QR'
        }
      />
    </div>
  );
};

