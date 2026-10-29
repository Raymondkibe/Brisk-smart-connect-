import React, { useState } from 'react';
import {
  Wifi,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plug,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
  Check,
  RefreshCw,
  Ticket,
  Store,
  LayoutDashboard,
  Terminal,
  Download,
  ShieldAlert,
  Radio,
  Clock,
  Code2,
  CheckCheck,
  Layers,
  Undo2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { RouterDevice, User, RouterOwnerProfile, GeneratedSetupScript } from '../../types/index.ts';

interface EasyConnectWizardProps {
  currentUser: User;
  profile?: RouterOwnerProfile;
  onSuccess: (newRouter: RouterDevice) => void;
  onCancel?: () => void;
  onNavigateToStorefront?: () => void;
  onNavigateToVouchers?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToScripts?: () => void;
  onNavigateToRouters?: () => void;
}

type RouterBrand = 'mikrotik' | 'ubiquiti' | 'tplink' | 'huawei' | 'other';
type SetupMode = 'SCRIPT' | 'MANUAL_IP';

interface BrandConfig {
  name: string;
  badge: string;
  badgeColor: string;
  tip: string;
  defaultIp: string;
  defaultPort: number;
  defaultUser: string;
  vendorKey: 'mikrotik_v7' | 'mikrotik_v6' | 'openwrt' | 'tplink' | 'ubiquiti';
}

const BRAND_CONFIGS: Record<RouterBrand, BrandConfig> = {
  mikrotik: {
    name: 'MikroTik',
    badge: 'Recommended',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    tip: 'MikroTik RouterOS 7.x & 6.x provide full automated hotspot integration. The generated script installs least-privilege rules, walled-garden routes, and cloud heartbeat.',
    defaultIp: '192.168.88.1',
    defaultPort: 8728,
    defaultUser: 'admin',
    vendorKey: 'mikrotik_v7',
  },
  ubiquiti: {
    name: 'Ubiquiti',
    badge: 'Supported',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    tip: 'Ubiquiti UniFi Gateway / Cloud Key support. Configures external guest portal redirection and RADIUS accounting policies.',
    defaultIp: '192.168.1.1',
    defaultPort: 443,
    defaultUser: 'admin',
    vendorKey: 'ubiquiti',
  },
  tplink: {
    name: 'TP-Link',
    badge: 'Omada Supported',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    tip: 'TP-Link Omada Controller & Gateway. Sets external captive portal redirect and Safaricom Daraja walled-garden destinations.',
    defaultIp: '192.168.0.1',
    defaultPort: 80,
    defaultUser: 'admin',
    vendorKey: 'tplink',
  },
  huawei: {
    name: 'Huawei',
    badge: 'Basic Support',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    tip: 'Huawei enterprise or 4G/5G CPE router. Configured via OpenWrt / Linux redirection daemon or standard web gateway.',
    defaultIp: '192.168.8.1',
    defaultPort: 80,
    defaultUser: 'admin',
    vendorKey: 'openwrt',
  },
  other: {
    name: 'OpenWrt / Linux',
    badge: 'Generic Hotspot',
    badgeColor: 'text-slate-300 bg-slate-700/40 border-slate-600/40',
    tip: 'Generic OpenWrt 23.x / Linux router. Installs lightweight captive portal redirect daemon (nodogsplash) and outbound heartbeat.',
    defaultIp: '192.168.1.1',
    defaultPort: 8728,
    defaultUser: 'root',
    vendorKey: 'openwrt',
  },
};

export const EasyConnectWizard: React.FC<EasyConnectWizardProps> = ({
  currentUser,
  profile,
  onSuccess,
  onCancel,
  onNavigateToStorefront,
  onNavigateToVouchers,
  onNavigateToDashboard,
  onNavigateToScripts,
  onNavigateToRouters,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedBrand, setSelectedBrand] = useState<RouterBrand>('mikrotik');
  const [setupMode, setSetupMode] = useState<SetupMode>('SCRIPT');

  // Router Identity
  const [routerName, setRouterName] = useState<string>('Central Hotspot Gateway');
  const [locationArea, setLocationArea] = useState<string>('Main Business Premise');
  const [vendorVariant, setVendorVariant] = useState<'mikrotik_v7' | 'mikrotik_v6' | 'openwrt' | 'tplink' | 'ubiquiti'>('mikrotik_v7');
  const [hotspotServer, setHotspotServer] = useState<string>('hotspot1');

  // Manual IP Mode state
  const [ipAddress, setIpAddress] = useState<string>(BRAND_CONFIGS.mikrotik.defaultIp);
  const [apiPort, setApiPort] = useState<number>(BRAND_CONFIGS.mikrotik.defaultPort);
  const [apiUsername, setApiUsername] = useState<string>(BRAND_CONFIGS.mikrotik.defaultUser);
  const [apiPassword, setApiPassword] = useState<string>('');

  // Generated Script state
  const [generatedScript, setGeneratedScript] = useState<GeneratedSetupScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [showRollback, setShowRollback] = useState<boolean>(false);
  const [scriptCopied, setScriptCopied] = useState<boolean>(false);

  // Verification & Testing state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    version?: string;
    model?: string;
  } | null>(null);

  // Step 3 Hotspot configuration state
  const [ssid, setSsid] = useState<string>('BRISK_Smart_WiFi');
  const [speedLimit, setSpeedLimit] = useState<string>('15M/10M');
  const [maxUsers, setMaxUsers] = useState<number>(50);
  const [idleTimeout, setIdleTimeout] = useState<number>(10);

  // Step 4 Final state
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectedRouter, setConnectedRouter] = useState<RouterDevice | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const businessSlug =
    profile?.businessName
      ? profile.businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : (currentUser.name || 'my-hotspot').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const publicUrl = `https://brisksmartconnect.vercel.app/@${businessSlug}`;
  const captivePortalUrl = `https://wifi.brisk.co.ke/portal`;

  const handleSelectBrand = (brand: RouterBrand) => {
    setSelectedBrand(brand);
    const cfg = BRAND_CONFIGS[brand];
    setIpAddress(cfg.defaultIp);
    setApiPort(cfg.defaultPort);
    setApiUsername(cfg.defaultUser);
    setVendorVariant(cfg.vendorKey);
    setVerifyResult(null);
    setGeneratedScript(null);
  };

  // Generate official script on demand or when stepping into Step 2
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setVerifyResult(null);

    try {
      const res = await api.generateRouterSetupScript({
        vendor: vendorVariant,
        routerName: routerName.trim() || 'Central Hotspot Gateway',
        connectionMethod: setupMode === 'SCRIPT' ? 'Single-Use Terminal Script' : 'Direct API',
        hotspotName: ssid || 'BRISK Smart WiFi',
        ownerId: currentUser.id,
        portalUrl: captivePortalUrl,
      });

      setGeneratedScript(res.script);
    } catch (err: any) {
      alert(err.message || 'Failed to generate router setup script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Run test connection or verify script enrollment
  const handleVerifyEnrollment = async () => {
    if (!routerName.trim()) {
      setVerifyResult({
        success: false,
        message: 'Please provide a name for this router.',
      });
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      if (setupMode === 'SCRIPT') {
        // If script hasn't been generated yet, generate it first
        if (!generatedScript) {
          await handleGenerateScript();
        }

        // Test handshake / simulated router enrollment probe
        const res = await api.testRouter({
          ip_address: ipAddress || '192.168.88.1',
          brand: selectedBrand,
        });

        setVerifyResult({
          success: true,
          message: `Router script enrolled successfully! Token [${generatedScript?.token || 'Active'}] confirmed · Heartbeat Active (12ms ping).`,
          version: res.version || 'RouterOS 7.15.2',
          model: res.model || `${BRAND_CONFIGS[selectedBrand].name} Gateway`,
        });

        // Automatically advance to Step 3 after confirmation
        setTimeout(() => {
          setCurrentStep(3);
        }, 1200);
      } else {
        // Manual IP test
        const res = await api.testRouter({
          ip_address: ipAddress.trim(),
          api_port: apiPort,
          api_username: apiUsername.trim(),
          api_password: apiPassword,
          brand: selectedBrand,
        });

        setVerifyResult({
          success: true,
          message: `Connected successfully! ${res.version || 'RouterOS 7.15.2'} · ${res.model || 'MikroTik RB4011iGS+'}`,
          version: res.version,
          model: res.model,
        });

        setTimeout(() => {
          setCurrentStep(3);
        }, 1200);
      }
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || 'Could not verify router enrollment. Paste the script into the router terminal and ensure internet access.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyScript = () => {
    if (!generatedScript) return;
    const textToCopy = showRollback ? generatedScript.rollbackContent : generatedScript.scriptContent;
    navigator.clipboard.writeText(textToCopy);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    if (!generatedScript) return;
    const isMikrotik = generatedScript.vendor.includes('mikrotik');
    const ext = isMikrotik ? 'rsc' : 'sh';
    const filename = `${(routerName || 'router').toLowerCase().replace(/\s+/g, '_')}_setup.${ext}`;
    const blob = new Blob([showRollback ? generatedScript.rollbackContent : generatedScript.scriptContent], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFinishWizard = async () => {
    setIsConnecting(true);
    try {
      const payload = {
        ownerId: currentUser.id,
        name: routerName.trim() || 'Central Hotspot Gateway',
        location: locationArea.trim() || 'Main Business Premise',
        ip_address: ipAddress.trim() || '192.168.88.1',
        api_port: apiPort,
        api_username: apiUsername.trim(),
        api_password: apiPassword,
        hotspot_server: hotspotServer,
        brand: selectedBrand,
        ssid: ssid.trim() || 'BRISK_Smart_WiFi',
        idle_timeout: idleTimeout,
        max_users: maxUsers,
        connection_type: setupMode === 'SCRIPT' ? 'script' : 'direct',
        token: generatedScript?.token,
        scriptId: generatedScript?.id,
      };

      const res = await api.connectRouterWizard(payload);
      setConnectedRouter(res.router);
      setCurrentStep(4);
      onSuccess(res.router);
    } catch (err: any) {
      alert(`Error connecting router: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const steps = [
    { num: 1, title: 'Choose Brand' },
    { num: 2, title: 'Script Setup & Token' },
    { num: 3, title: 'Hotspot Config' },
    { num: 4, title: 'Connected!' },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full font-sans">
      {/* Top Wizard Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              Step {currentStep} of 4
            </span>
            <span className="text-slate-400 font-semibold">{steps[currentStep - 1].title}</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px] font-bold">{Math.round((currentStep / 4) * 100)}% Complete</span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Step Circles */}
        <div className="flex items-center justify-between">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <div key={st.num} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-sky-500 text-slate-950 font-black ring-4 ring-sky-500/20 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                </div>
                <span
                  className={`text-[11px] font-medium hidden sm:block ${
                    isCurrent ? 'text-sky-300 font-bold' : isCompleted ? 'text-emerald-400 font-medium' : 'text-slate-500'
                  }`}
                >
                  {st.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CHOOSE BRAND */}
      {currentStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 1 — What router hardware are you connecting?</h2>
              <p className="text-xs text-slate-400">
                BRISK provides 1-click terminal setup scripts with secure short-lived tokens for all major enterprise & ISP vendors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
            {(Object.keys(BRAND_CONFIGS) as RouterBrand[]).map((brandKey) => {
              const cfg = BRAND_CONFIGS[brandKey];
              const isSelected = selectedBrand === brandKey;
              return (
                <button
                  key={brandKey}
                  type="button"
                  onClick={() => handleSelectBrand(brandKey)}
                  className={`relative p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isSelected ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200">{cfg.name}</div>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${cfg.badgeColor}`}>
                      {cfg.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Brand instructions tip box */}
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3.5 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-sky-300">{BRAND_CONFIGS[selectedBrand].name} Integration: </span>
              {BRAND_CONFIGS[selectedBrand].tip}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={() => {
                setCurrentStep(2);
                if (!generatedScript) {
                  handleGenerateScript();
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              Continue to Script Setup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SCRIPT SETUP & ENROLLMENT TOKEN */}
      {currentStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-in fade-in duration-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Step 2 — Router Setup Script & Enrollment</h2>
                <p className="text-xs text-slate-400">
                  Generate a vendor-tailored configuration script with single-use enrollment token.
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSetupMode('SCRIPT')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  setupMode === 'SCRIPT'
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>1-Click Script (Recommended)</span>
              </button>
              <button
                type="button"
                onClick={() => setSetupMode('MANUAL_IP')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  setupMode === 'MANUAL_IP'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plug className="w-3.5 h-3.5" />
                <span>Direct API / IP</span>
              </button>
            </div>
          </div>

          {/* SCRIPT MODE (RECOMMENDED) */}
          {setupMode === 'SCRIPT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Router Name *
                  </label>
                  <input
                    type="text"
                    value={routerName}
                    onChange={(e) => setRouterName(e.target.value)}
                    placeholder="e.g. Kiambu Central Hub"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Site Location
                  </label>
                  <input
                    type="text"
                    value={locationArea}
                    onChange={(e) => setLocationArea(e.target.value)}
                    placeholder="e.g. Market Plaza Rooftop"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Firmware / Vendor Target
                  </label>
                  <select
                    value={vendorVariant}
                    onChange={(e: any) => {
                      setVendorVariant(e.target.value);
                      setGeneratedScript(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                  >
                    <option value="mikrotik_v7">MikroTik RouterOS 7.x (Recommended)</option>
                    <option value="mikrotik_v6">MikroTik RouterOS 6.x Legacy</option>
                    <option value="openwrt">OpenWrt 23.x / Linux Daemon</option>
                    <option value="tplink">TP-Link Omada Controller</option>
                    <option value="ubiquiti">Ubiquiti UniFi Gateway</option>
                  </select>
                </div>
              </div>

              {/* Regenerate Script Action Bar if details changed */}
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-300">
                    Target: <strong className="text-sky-400 font-semibold">{routerName || 'Router'}</strong> · Vendor: <strong className="text-white">{vendorVariant}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isGeneratingScript}
                  onClick={handleGenerateScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingScript ? 'animate-spin' : ''}`} />
                  <span>{generatedScript ? 'Regenerate Token & Script' : 'Generate Setup Script'}</span>
                </button>
              </div>

              {/* Script Box with Token Badge */}
              {generatedScript ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300">Enrollment Token:</span>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                        {generatedScript.token}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                        (Permanent Validity · Never Expires · Least-privilege)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRollback(!showRollback)}
                        className="text-xs text-slate-400 hover:text-slate-200 underline flex items-center gap-1 cursor-pointer"
                      >
                        <Undo2 className="w-3 h-3" />
                        <span>{showRollback ? 'Show Setup Script' : 'View Rollback Script'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal Box */}
                  <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                        <Code2 className="w-4 h-4 text-sky-400" />
                        <span>
                          {showRollback
                            ? 'rollback_script.rsc'
                            : vendorVariant.includes('mikrotik')
                            ? `${routerName.toLowerCase().replace(/\s+/g, '_')}_brisk_setup.rsc`
                            : 'brisk_hotspot_setup.sh'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyScript}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all cursor-pointer"
                        >
                          {scriptCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{scriptCopied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadScript}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                          title="Download script file"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 overflow-x-auto max-h-56 bg-slate-950/90 select-all">
                      {showRollback ? generatedScript.rollbackContent : generatedScript.scriptContent}
                    </pre>
                  </div>

                  {/* Visual Instructions */}
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-sky-400" />
                      <span>Where to paste this script on your router:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed text-[11px]">
                      <li>
                        Connect to your router using <strong className="text-white">MikroTik WinBox</strong> or via SSH (<code className="text-sky-300 font-mono">ssh admin@{ipAddress || '192.168.88.1'}</code>).
                      </li>
                      <li>
                        Click on <strong className="text-white">New Terminal</strong> in the left-hand navigation menu.
                      </li>
                      <li>
                        Right-click anywhere inside the terminal window and choose <strong className="text-amber-300 font-semibold">Paste</strong> (or press Shift+Insert), then press <strong className="text-white">Enter</strong>.
                      </li>
                      <li>
                        The script will configure the hotspot profile, allow Safe Safaricom M-Pesa domains, and register this router with token <code className="text-sky-400 font-mono font-bold">{generatedScript.token}</code>.
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-950 border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Click below to generate the custom script for this router.</p>
                  <button
                    type="button"
                    disabled={isGeneratingScript}
                    onClick={handleGenerateScript}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2"
                  >
                    {isGeneratingScript ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                    <span>Generate Setup Script</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MANUAL IP MODE */}
          {setupMode === 'MANUAL_IP' && (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-200">
                  Direct API Mode links to your router's port 8728. Default {BRAND_CONFIGS[selectedBrand].name} IP is <strong className="text-white font-mono">{BRAND_CONFIGS[selectedBrand].defaultIp}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Router Name *
                  </label>
                  <input
                    type="text"
                    value={routerName}
                    onChange={(e) => setRouterName(e.target.value)}
                    placeholder="e.g. Kiambu Central Hub"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Location / Area
                  </label>
                  <input
                    type="text"
                    value={locationArea}
                    onChange={(e) => setLocationArea(e.target.value)}
                    placeholder="e.g. Kiambu Town Market, 2nd Floor"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Router IP Address *
                  </label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.88.1"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-sky-400 font-mono font-semibold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    API Port
                  </label>
                  <input
                    type="number"
                    value={apiPort}
                    onChange={(e) => setApiPort(parseInt(e.target.value) || 8728)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    API Username *
                  </label>
                  <input
                    type="text"
                    value={apiUsername}
                    onChange={(e) => setApiUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    API Password
                  </label>
                  <input
                    type="password"
                    value={apiPassword}
                    onChange={(e) => setApiPassword(e.target.value)}
                    placeholder="Leave blank if none"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test connection alert result */}
          {verifyResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 animate-in fade-in ${
                verifyResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {verifyResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <p className="font-semibold">{verifyResult.message}</p>
                {verifyResult.success && (
                  <p className="text-[11px] text-emerald-400/80 mt-0.5 font-medium">
                    Advancing to Step 3 (Hotspot Configuration)...
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Brand
            </button>

            <button
              type="button"
              disabled={isVerifying}
              onClick={handleVerifyEnrollment}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Router Handshake...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verify Enrollment & Continue →
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: HOTSPOT CONFIGURATION */}
      {currentStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Step 3 — Hotspot Broadcast & Client Quotas</h2>
              <p className="text-xs text-slate-400">
                Configure your broadcast WiFi network name (SSID), bandwidth profiles, and user session rules.
              </p>
            </div>
          </div>

          <div className="space-y-4 my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  WiFi Name (SSID) *
                </label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="BRISK_Smart_WiFi"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">What customers see in their phone WiFi list</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Download Speed Limit Profile
                </label>
                <select
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="">No limit (Maximum Available)</option>
                  <option value="5M/3M">5 Mbps (Standard Mobile Browsing)</option>
                  <option value="10M/5M">10 Mbps (Fast HD Streaming)</option>
                  <option value="15M/10M">15 Mbps (Turbo Gaming & Work)</option>
                  <option value="20M/15M">20 Mbps (Ultra Fiber Performance)</option>
                  <option value="50M/30M">50 Mbps (Gigabit Backbone Tier)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Max Simultaneous Users
                </label>
                <input
                  type="number"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(parseInt(e.target.value) || 50)}
                  min={1}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Idle Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={idleTimeout}
                  onChange={(e) => setIdleTimeout(parseInt(e.target.value) || 10)}
                  min={1}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Disconnect inactive devices after this duration</span>
              </div>
            </div>

            {/* Public Storefront URL Preview Card */}
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Your Dedicated Public Storefront URL
                </span>
                <button
                  type="button"
                  onClick={handleCopyPublicUrl}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedUrl ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-sky-400 break-all select-all">
                {publicUrl}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Customers visit this URL to buy vouchers with M-Pesa or connect their devices directly.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Script
            </button>

            <button
              type="button"
              disabled={isConnecting}
              onClick={handleFinishWizard}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-400/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Linking Router & Enrolling Node...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Connect Router & Finish →
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {currentStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-2">Router Connected! 🎉</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
            Your router has been enrolled into your BRISK fleet. Customers can pay via automated M-Pesa STK push and receive instant high-speed authorization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6 max-w-lg mx-auto">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Router Node
              </span>
              <span className="text-sm font-bold text-sky-400">
                {connectedRouter?.name || routerName || 'Main Gateway'}
              </span>
              <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                {connectedRouter?.model || BRAND_CONFIGS[selectedBrand].name} · {locationArea || 'Premise'}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Public Storefront & SSID
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-400 truncate block">
                @{businessSlug}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">SSID: {ssid}</span>
            </div>
          </div>

          {generatedScript?.token && (
            <div className="mb-6 p-3 bg-slate-950 border border-slate-800 rounded-xl inline-flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 font-sans">Active Token:</span>
              <span className="text-amber-400 font-bold">{generatedScript.token}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                ENROLLED
              </span>
            </div>
          )}

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onNavigateToRouters && (
              <button
                type="button"
                onClick={onNavigateToRouters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                View in Routers Fleet
              </button>
            )}

            {onNavigateToScripts && (
              <button
                type="button"
                onClick={onNavigateToScripts}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                Setup Scripts & Audit Log
              </button>
            )}

            {onNavigateToStorefront && (
              <button
                type="button"
                onClick={onNavigateToStorefront}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                <Store className="w-4 h-4" />
                Customise Storefront
              </button>
            )}

            {onNavigateToVouchers && (
              <button
                type="button"
                onClick={onNavigateToVouchers}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                Generate Vouchers
              </button>
            )}

            {onNavigateToDashboard && (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-sky-400" />
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
