import React, { useState, useEffect } from 'react';
import {
  Server,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Search,
  Lock,
  ArrowRight,
  PhoneCall,
  Clock,
  Zap,
  HelpCircle,
  Copy,
  ChevronRight,
  Download,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PppoeUser, WifiPackage } from '../../types/index.ts';

interface PppoeCaptivePortalProps {
  onBackToHome?: () => void;
  onNavigateToLogin?: () => void;
}

export const PppoeCaptivePortal: React.FC<PppoeCaptivePortalProps> = ({
  onBackToHome,
  onNavigateToLogin,
}) => {
  const [lookupQuery, setLookupQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PppoeUser | null>(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Payment Renewal State
  const [selectedTier, setSelectedTier] = useState<{ name: string; price: number; speed: string }>({
    name: 'Home Fiber 15 Mbps',
    price: 1500,
    speed: '15 Mbps',
  });
  const [mpesaPhone, setMpesaPhone] = useState('0712345678');
  const [transCode, setTransCode] = useState('');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');
  const [payError, setPayError] = useState('');
  const [copiedSetting, setCopiedSetting] = useState(false);

  // Available broadband packages for PPPoE renewal
  const broadbandTiers = [
    { name: 'Bronze Fiber 10 Mbps', price: 1200, speed: '10 Mbps', desc: 'Standard browsing & YouTube streaming' },
    { name: 'Silver Fiber 15 Mbps', price: 1500, speed: '15 Mbps', desc: 'Family HD streaming, CCTV & multiple devices' },
    { name: 'Gold Fiber 25 Mbps', price: 2500, speed: '25 Mbps', desc: 'High-speed remote work, Zoom & 4K Netflix' },
    { name: 'Business Dedicated 50 Mbps', price: 4500, speed: '50 Mbps', desc: 'Priority enterprise routing with 99.9% uptime SLA' },
  ];

  // Try auto-loading default demo user or state on mount
  useEffect(() => {
    handleSearchUser('mwangi-fiber');
  }, []);

  const handleSearchUser = async (usernameToFind?: string) => {
    const q = (usernameToFind || lookupQuery).trim().toLowerCase();
    if (!q) {
      setLookupError('Please enter your PPPoE account username or phone number.');
      return;
    }

    setLoadingLookup(true);
    setLookupError('');

    try {
      const state = await api.fetchState();
      const match = state.pppoeUsers.find(
        (p) =>
          p.username.toLowerCase() === q ||
          p.ipAddress === q ||
          p.username.toLowerCase().includes(q)
      );

      if (match) {
        setSelectedUser(match);
        // Pre-fill phone if available
        if (match.username.match(/\d{9,12}/)) {
          setMpesaPhone(match.username);
        }
      } else {
        // Fallback demo profile if backend freshly initialized
        setSelectedUser({
          id: `pppoe-${q}`,
          username: q,
          ipAddress: '10.10.40.105',
          status: 'CONNECTED',
          uptime: '14d 08h 22m',
          downloadMb: 42800,
          uploadMb: 11200,
          macAddress: 'E4:8D:8C:33:91:AA',
          routerId: 'r-01',
          routerName: 'Main MikroTik CCR Cloud Core',
          speed: '15 Mbps',
          connectedDuration: '14 days',
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        });
      }
    } catch (err: any) {
      setLookupError('Could not reach backend billing server. Please check internet connection.');
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleMpesaRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setPayError('Please identify your PPPoE account username first.');
      return;
    }
    if (!mpesaPhone.trim()) {
      setPayError('Please provide a valid M-Pesa phone number.');
      return;
    }

    setPaying(true);
    setPayError('');
    setPaySuccess('');

    try {
      // 1. Dispatch renewal to live backend
      const res = await api.renewPppoeSubscriber({
        username: selectedUser.username,
        transactionReference: transCode.trim() || `MPESA-${Date.now().toString().slice(-6)}`,
        phone: mpesaPhone.trim(),
        amountKes: selectedTier.price,
      });

      setPaySuccess(
        `Subscription renewed successfully for ${selectedUser.username}! 30 days broadband access added. Your router connection is active.`
      );
      setSelectedUser((prev) => (prev ? { ...prev, status: 'CONNECTED', speed: selectedTier.speed } : prev));
      setTransCode('');
    } catch (err: any) {
      setPayError(err.message || 'Payment renewal failed. Please verify transaction code.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 pb-16">
      {/* Top Banner Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wide">BRISK SMART CONNECT</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-black uppercase">
                  PPPoE PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Fixed Fiber & Home Broadband Self-Care</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-3.5 py-1.5 text-slate-400 hover:text-white transition-colors"
              >
                Back to Home
              </button>
            )}
            {onNavigateToLogin && (
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-md transition-colors"
              >
                Owner / Admin Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-400/30 rounded-full text-sky-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Automated PPPoE Fixed Broadband Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            PPPoE Subscriber Self-Service & Renewal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Check your home fiber account status, renew your monthly bandwidth tier via M-Pesa, or view router configuration parameters.
          </p>
        </div>

        {/* Account Lookup Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                placeholder="Enter PPPoE username (e.g. mwangi-fiber, wanjiku-home)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="button"
              disabled={loadingLookup}
              onClick={() => handleSearchUser()}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingLookup ? 'animate-spin' : ''}`} />
              <span>{loadingLookup ? 'Searching...' : 'Lookup Account'}</span>
            </button>
          </div>

          {lookupError && (
            <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}
        </div>

        {/* Subscriber Card & Status */}
        {selectedUser && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Details */}
            <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Username</div>
                  <div className="text-lg font-black text-white font-mono">{selectedUser.username}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                    selectedUser.status === 'CONNECTED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedUser.status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  {selectedUser.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Assigned WAN IP:</span>
                  <span className="font-mono font-bold text-sky-400">{selectedUser.ipAddress}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Speed Tier:</span>
                  <span className="font-bold text-amber-400 font-mono">{selectedUser.speed}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Uptime:</span>
                  <span className="font-mono text-slate-200">{selectedUser.uptime}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Router Gateway:</span>
                  <span className="text-slate-200 font-semibold">{selectedUser.routerName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Transferred:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {((selectedUser.downloadMb + selectedUser.uploadMb) / 1024).toFixed(1)} GB
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400">Hardware MAC:</span>
                  <span className="font-mono text-slate-400 text-[11px]">{selectedUser.macAddress}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Encrypted PPP Tunnel</span>
                </div>
                <p>Authenticates via RADIUS / MikroTik local secret. Bandwidth is dynamically shaped via queues.</p>
              </div>
            </div>

            {/* Renewal & M-Pesa Payment Card */}
            <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>Renew Monthly Broadband Subscription</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose your speed tier and enter your Safaricom phone number for instant M-Pesa STK push.
                </p>
              </div>

              {paySuccess && (
                <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{paySuccess}</span>
                </div>
              )}

              {payError && (
                <div className="p-4 bg-red-950/70 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{payError}</span>
                </div>
              )}

              {/* Tier Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Fiber Bandwidth Tier:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {broadbandTiers.map((tier) => {
                    const isSelected = selectedTier.name === tier.name;
                    return (
                      <button
                        key={tier.name}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-400/15 border-amber-400 shadow-md shadow-amber-400/10'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-white text-xs">{tier.name}</span>
                          <span className="font-black text-amber-400 font-mono text-xs">
                            KES {tier.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{tier.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* M-Pesa Payment Form */}
              <form onSubmit={handleMpesaRenewal} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      M-Pesa Phone Number:
                    </label>
                    <input
                      type="tel"
                      required
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Manual M-Pesa Code (Optional):
                    </label>
                    <input
                      type="text"
                      value={transCode}
                      onChange={(e) => setTransCode(e.target.value.toUpperCase())}
                      placeholder="e.g. RJK7899X1A"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-300">Paybill Payment Alternative: </span>
                    <span>Business No: <strong className="text-amber-400 font-mono">222111</strong>, Account: <strong className="text-amber-400 font-mono">{selectedUser.username}</strong></span>
                  </div>
                  <span className="text-emerald-400 font-bold whitespace-nowrap">Auto-Reactivated</span>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {paying
                      ? 'Sending M-Pesa STK Prompt...'
                      : `RENEW & PAY KES ${selectedTier.price.toLocaleString()} VIA M-PESA`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Router WAN PPPoE Setup Instructions */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>How to Configure PPPoE on Your Home WiFi Router</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compatible with TP-Link, Tenda, Mercusys, MikroTik, Netgear, and Huawei home fiber ONU routers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 font-black flex items-center justify-center text-xs">
                1
              </div>
              <div className="font-bold text-white">Connect WAN Port</div>
              <p className="text-slate-400 text-[11px]">
                Plug the blue/yellow Ethernet cable from the fiber ONU or antenna PoE injector into your router's <strong>WAN</strong> port.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 font-black flex items-center justify-center text-xs">
                2
              </div>
              <div className="font-bold text-white">Select WAN Type: PPPoE</div>
              <p className="text-slate-400 text-[11px]">
                Log into <code>192.168.0.1</code> or <code>192.168.1.1</code>. Under Network/WAN settings, change connection mode to <strong>PPPoE / PPPoE Client</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 font-black flex items-center justify-center text-xs">
                3
              </div>
              <div className="font-bold text-white">Input Credentials & Save</div>
              <p className="text-slate-400 text-[11px]">
                Enter your assigned <strong>PPPoE Username</strong> and provided Password. Set MTU to <strong>1480</strong> and click Save / Reboot.
              </p>
            </div>
          </div>
        </div>

        {/* 24/7 Technical Support Footer */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Need assistance or fiber line repairs? Local NOC Desk: <strong className="text-white">0722 000 111</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-semibold">● Fiber Core Uptime: 99.98%</span>
            <span>NOC Kiambu Central</span>
          </div>
        </div>
      </div>
    </div>
  );
};
