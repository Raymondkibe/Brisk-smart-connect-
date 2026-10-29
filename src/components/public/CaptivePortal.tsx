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
  Laptop,
  RotateCw,
  Signal,
  ArrowRight,
  Download,
  Code,
  Copy,
  Sliders,
  Sparkles,
  Layers,
  Power,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import type { WifiPackage, Transaction, WifiSession } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CaptivePortalProps {
  packages: WifiPackage[];
  onPaymentSelect: (pkg: WifiPackage) => void;
  onOpenReceipt: (tx: Transaction) => void;
  onGoToOwnerDashboard: () => void;
  onReturnHome: () => void;
}

export const CaptivePortal: React.FC<CaptivePortalProps> = ({
  packages,
  onPaymentSelect,
  onOpenReceipt,
  onGoToOwnerDashboard,
  onReturnHome,
}) => {
  // Device Simulation Controls
  const [deviceFrameMode, setDeviceFrameMode] = useState<'PHONE' | 'DESKTOP'>('PHONE');
  const [activeNetwork, setActiveNetwork] = useState('BRISK_Smart_WiFi_Kiambu');
  const [routerIp] = useState('192.168.88.1');
  const [assignedIp] = useState('192.168.88.142');
  const [deviceMac] = useState('DC:A6:32:89:BC:11');

  // Active Tab inside Captive Portal
  const [portalTab, setPortalTab] = useState<'MPESA' | 'VOUCHER' | 'FREE_TRIAL' | 'STATUS'>('MPESA');

  // M-Pesa Flow State
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-1d');
  const [phone, setPhone] = useState('');
  const [stkStatus, setStkStatus] = useState<'IDLE' | 'PROMPTING' | 'VERIFYING' | 'SUCCESS'>('IDLE');
  const [stkErrorMessage, setStkErrorMessage] = useState('');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);

  // Voucher Flow State
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  // Active Session countdown simulation
  const [isConnected, setIsConnected] = useState(false);
  const [remainingSecs, setRemainingSecs] = useState(86400); // 24 hours
  const [currentSpeed, setCurrentSpeed] = useState('10 Mbps');
  const [activePackageName, setActivePackageName] = useState('1 Day Unlimited');
  const [usageMb, setUsageMb] = useState(128);

  // Countdown timer when connected
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

  const selectedPackage = packages.find((p) => p.id === selectedPkgId) || packages[3] || {
    id: 'pkg-1d',
    name: '1 Day Unlimited',
    priceKes: 80,
    speedLabel: '10 Mbps',
    durationHours: 24,
    durationLabel: '24 hours',
  };

  // Trigger M-Pesa STK Flow
  const handleMpesaConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStkErrorMessage('');
    setStkStatus('PROMPTING');

    try {
      const res = await api.initiateMpesaStk({
        phone,
        amount: selectedPackage.priceKes,
        type: 'CUSTOMER_WIFI',
        reference: `HOTSPOT-${selectedPackage.id}`,
        packageId: selectedPackage.id,
      });

      // Simulate PIN entry after 3 seconds
      setTimeout(async () => {
        setStkStatus('VERIFYING');
        try {
          const verifyRes = await api.verifyMpesaPayment({
            checkoutRequestId: res.checkoutRequestId,
            phone,
            amount: selectedPackage.priceKes,
            type: 'CUSTOMER_WIFI',
            packageId: selectedPackage.id,
            userId: 'usr-cust-01',
          });

          if (verifyRes.success && verifyRes.transaction) {
            setLastTx(verifyRes.transaction);
            setStkStatus('SUCCESS');
            setIsConnected(true);
            setActivePackageName(selectedPackage.name);
            setCurrentSpeed(selectedPackage.speedLabel || '10 Mbps');
            setRemainingSecs((selectedPackage.durationHours || 24) * 3600);
            setTimeout(() => {
              setPortalTab('STATUS');
              setStkStatus('IDLE');
            }, 1200);
          } else {
            setStkStatus('IDLE');
            setStkErrorMessage('Payment timeout. Please try again.');
          }
        } catch (err: any) {
          setStkStatus('IDLE');
          setStkErrorMessage(err.message || 'Verification failed');
        }
      }, 3500);
    } catch (err: any) {
      setStkStatus('IDLE');
      setStkErrorMessage(err.message || 'Could not initiate STK push');
    }
  };

  // Redeem Voucher Code
  const handleVoucherRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError('');
    setVoucherSuccess('');

    try {
      const res = await api.redeemVoucher(voucherCode.trim(), 'usr-cust-01');
      setVoucherSuccess(res.message || 'Voucher activated!');
      setIsConnected(true);
      setActivePackageName(res.voucher?.packageName || 'Voucher Access');
      setCurrentSpeed(res.voucher?.speed || '10 Mbps');
      setRemainingSecs((res.voucher?.durationHours || 24) * 3600);
      setTimeout(() => {
        setPortalTab('STATUS');
        setVoucherSuccess('');
      }, 1400);
    } catch (err: any) {
      setVoucherError(err.message || 'Invalid or expired voucher code');
    } finally {
      setVoucherLoading(false);
    }
  };

  // Claim Free Welcome Trial
  const handleClaimFreeTrial = () => {
    setIsConnected(true);
    setActivePackageName('3 Days Free Welcome Pass');
    setCurrentSpeed('10 Mbps');
    setRemainingSecs(3 * 24 * 3600); // 72 hours
    setPortalTab('STATUS');
  };

  // Disconnect active session
  const handleDisconnect = async () => {
    try {
      await fetch('/api/hotspot/disconnect-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ macAddress: deviceMac }),
      });
    } catch (err) {
      // offline fallback
    }
    setIsConnected(false);
    setPortalTab('MPESA');
  };

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-4 text-slate-100 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Top Control Bar: Network and Simulation Switcher */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-amber-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wifi className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">Brisk SmartConnect Hotspot Captive Portal</h1>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800/60">
                  LIVE SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact screen shown to mobile and laptop users upon connecting to your MikroTik WiFi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setDeviceFrameMode('PHONE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  deviceFrameMode === 'PHONE'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Preview</span>
              </button>
              <button
                onClick={() => setDeviceFrameMode('DESKTOP')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  deviceFrameMode === 'DESKTOP'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Full Browser</span>
              </button>
            </div>

            <button
              onClick={onReturnHome}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Device Technical Specs Banner (MikroTik Handshake) */}
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Connected SSID</span>
            <select
              value={activeNetwork}
              onChange={(e) => setActiveNetwork(e.target.value)}
              className="bg-transparent font-semibold text-sky-400 focus:outline-none cursor-pointer"
            >
              <option value="BRISK_Smart_WiFi_Kiambu" className="bg-slate-900 text-white">BRISK_Kiambu</option>
              <option value="BRISK_Smart_WiFi_Ndumberi" className="bg-slate-900 text-white">BRISK_Ndumberi</option>
              <option value="BRISK_Roysambu_Hub" className="bg-slate-900 text-white">BRISK_Roysambu</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Gateway Router</span>
            <span className="font-mono text-white">{routerIp}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Assigned IP (DHCP)</span>
            <span className="font-mono text-white">{assignedIp}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Device MAC Address</span>
            <span className="font-mono text-amber-300">{deviceMac}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Signal className="w-4 h-4 shrink-0" />
            <span>-52 dBm (Excellent)</span>
          </div>
        </div>

        {/* Main Captive Portal Container */}
        <div className={`mx-auto transition-all duration-300 ${deviceFrameMode === 'PHONE' ? 'max-w-md' : 'max-w-3xl'}`}>
          <div className="relative bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Phone Top Notch Bar (If in phone mode) */}
            {deviceFrameMode === 'PHONE' && (
              <div className="bg-slate-950 pt-2 pb-1 px-6 flex justify-between items-center text-[11px] text-slate-400 font-mono border-b border-slate-800/60">
                <span>9:41 AM</span>
                <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* ISP Branded Captive Portal Header */}
            <div className="p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800 text-center relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-amber-400 p-0.5 mx-auto mb-3 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Wifi className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
              </div>

              <h2 className="text-xl font-black tracking-tight text-white uppercase">
                {activeNetwork.replace(/_/g, ' ')}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Fast · Unlimited · Powered by BRISK Smart Connect
              </p>

              {/* Status Indicator */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-950/80">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
                  {isConnected ? 'Connected & Authenticated' : 'Authentication Required'}
                </span>
              </div>
            </div>

            {/* Portal Navigation Tabs */}
            <div className="grid grid-cols-4 p-1.5 bg-slate-950 border-b border-slate-800 text-xs">
              <button
                onClick={() => setPortalTab('MPESA')}
                className={`py-2 px-1 rounded-xl font-bold transition-all flex flex-col items-center gap-1 ${
                  portalTab === 'MPESA'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px]">M-Pesa</span>
              </button>

              <button
                onClick={() => setPortalTab('VOUCHER')}
                className={`py-2 px-1 rounded-xl font-bold transition-all flex flex-col items-center gap-1 ${
                  portalTab === 'VOUCHER'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span className="text-[11px]">Voucher</span>
              </button>

              <button
                onClick={() => setPortalTab('FREE_TRIAL')}
                className={`py-2 px-1 rounded-xl font-bold transition-all flex flex-col items-center gap-1 ${
                  portalTab === 'FREE_TRIAL'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px]">Free Trial</span>
              </button>

              <button
                onClick={() => setPortalTab('STATUS')}
                className={`py-2 px-1 rounded-xl font-bold transition-all flex flex-col items-center gap-1 ${
                  portalTab === 'STATUS'
                    ? 'bg-sky-500 text-white shadow-md'
                    : isConnected
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-[11px]">Status</span>
              </button>
            </div>

            {/* TAB 1: M-PESA CHECKOUT */}
            {portalTab === 'MPESA' && (
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white">1. Select WiFi Hotspot Package</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unthrottled high speed with zero device login queues.
                  </p>
                </div>

                {/* Package Selection Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {packages.slice(0, 6).map((pkg) => {
                    const isSelected = selectedPkgId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-white">{pkg.name}</span>
                          <span className="text-[10px] font-mono text-sky-400">{pkg.speedLabel}</span>
                        </div>
                        <div className="text-base font-black text-amber-400 font-mono mt-1">
                          KES {pkg.priceKes}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {pkg.durationLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Phone & Instant STK form */}
                <form onSubmit={handleMpesaConnect} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Safaricom M-Pesa Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XXXXXXXX or 01XXXXXXXX"
                        className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                      <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        DARAJA STK
                      </span>
                    </div>
                  </div>

                  {stkErrorMessage && (
                    <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{stkErrorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={stkStatus !== 'IDLE'}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {stkStatus === 'IDLE' && (
                      <>
                        <Smartphone className="w-4 h-4" />
                        <span>PAY KES {selectedPackage.priceKes} & CONNECT NOW</span>
                      </>
                    )}
                    {stkStatus === 'PROMPTING' && (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>SENDING M-PESA STK PROMPT...</span>
                      </>
                    )}
                    {stkStatus === 'VERIFYING' && (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>WAITING FOR M-PESA PIN & AUTH...</span>
                      </>
                    )}
                    {stkStatus === 'SUCCESS' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                        <span>PAID! AUTHENTICATING MIKROTIK...</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Upon PIN entry, your device's MAC <code className="text-amber-300">{deviceMac}</code> is automatically whitelisted in the MikroTik RADIUS engine for {selectedPackage.durationLabel}.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: VOUCHER REDEMPTION */}
            {portalTab === 'VOUCHER' && (
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Connect with Voucher Card</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the code from your purchased scratchcard or SMS ticket.
                  </p>
                </div>

                <form onSubmit={handleVoucherRedeem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Voucher Code
                    </label>
                    <input
                      type="text"
                      required
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="BRK-XXXX-XXXX"
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base tracking-widest text-center font-mono font-bold text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {voucherError && (
                    <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{voucherError}</span>
                    </div>
                  )}

                  {voucherSuccess && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{voucherSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={voucherLoading}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                  >
                    {voucherLoading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>AUTHENTICATING VOUCHER...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>ACTIVATE VOUCHER ACCESS</span>
                      </>
                    )}
                  </button>
                </form>


              </div>
            )}

            {/* TAB 3: FREE WELCOME TRIAL */}
            {portalTab === 'FREE_TRIAL' && (
              <div className="p-6 space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">First Time on this Network?</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    Enjoy our compliments! Try high-speed 10 Mbps WiFi with zero payment or credit card required.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>Welcome Trial Duration</span>
                    <span className="text-amber-400">3 Days (72 Hours)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Download / Upload Speed</span>
                    <span className="text-sky-400 font-mono">10 Mbps</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Device Limit</span>
                    <span>1 Phone or Laptop</span>
                  </div>
                </div>

                <button
                  onClick={handleClaimFreeTrial}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>CLAIM FREE 3-DAY WELCOME PASS</span>
                </button>
              </div>
            )}

            {/* TAB 4: ACTIVE SESSION STATUS (/status.html) */}
            {portalTab === 'STATUS' && (
              <div className="p-6 space-y-5">
                {isConnected ? (
                  <div className="space-y-5 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <Wifi className="w-8 h-8" />
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        ● INTERNET CONNECTION ACTIVE
                      </div>
                      <h3 className="text-xl font-black text-white mt-0.5">{activePackageName}</h3>
                      <p className="text-xs text-slate-400">
                        Connected to MikroTik gateway at <span className="font-mono text-slate-300">{activeNetwork}</span>
                      </p>
                    </div>

                    {/* Big Countdown Clock */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Remaining Internet Time
                      </span>
                      <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">
                        {formatCountdown(remainingSecs)}
                      </div>
                    </div>

                    {/* Network Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-left text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Current Bandwidth</span>
                        <span className="font-bold text-sky-400 font-mono text-sm">{currentSpeed}</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Data Transferred</span>
                        <span className="font-bold text-white font-mono text-sm">{usageMb} MB</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2">
                      {lastTx && (
                        <button
                          onClick={() => onOpenReceipt(lastTx)}
                          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Official M-Pesa Receipt</span>
                        </button>
                      )}

                      <button
                        onClick={handleDisconnect}
                        className="w-full py-2.5 bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-xs font-semibold text-red-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Power className="w-3.5 h-3.5 text-red-400" />
                        <span>Disconnect / Pause Session</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">No Active Session Found</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Your device is currently disconnected. Choose an M-Pesa package or enter a voucher to start browsing.
                      </p>
                    </div>
                    <button
                      onClick={() => setPortalTab('MPESA')}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-colors"
                    >
                      Pick WiFi Package
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Captive Portal Footer */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Customer Support: 0722 000 111</span>
              <span className="font-mono text-sky-400">MikroTik RouterOS 7.x</span>
            </div>
          </div>
        </div>

        {/* Brisk SmartConnect ISP Owner Callout Bar */}
        <div className="p-5 bg-gradient-to-r from-sky-950/50 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Are you a Router Owner / ISP? Customize & Deploy this Portal</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-2xl">
              Brand this captive login page with your logo, colors, and M-Pesa Paybill. Download the ready-to-flash <code>login.html</code> folder or generate the MikroTik terminal setup script in your dashboard.
            </p>
          </div>

          <button
            onClick={onGoToOwnerDashboard}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Open ISP Portal Studio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
