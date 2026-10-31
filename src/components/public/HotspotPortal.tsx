import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Smartphone,
  Ticket,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Download,
  Receipt,
  LogOut,
  HelpCircle,
  Activity,
  Radio,
  Copy,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Camera,
  QrCode,
} from 'lucide-react';
import type { WifiPackage, Voucher, WifiSession, Transaction } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { QrCodeScannerModal } from '../common/QrCodeScannerModal.tsx';
import type { ParsedQrResult } from '../../lib/qrParser.ts';


interface HotspotPortalProps {
  packages: WifiPackage[];
  vouchers: Voucher[];
  onReturnHome: () => void;
  onTriggerExpired: () => void;
  onViewReceipt?: (tx: Transaction) => void;
  networkSsid?: string;
  portalHeading?: string;
  helplinePhone?: string;
}

export const HotspotPortal: React.FC<HotspotPortalProps> = ({
  packages,
  vouchers,
  onReturnHome,
  onTriggerExpired,
  onViewReceipt,
  networkSsid = 'BRISK Smart WiFi',
  portalHeading = 'Smart WiFi. Smart Host. Smarter You.',
  helplinePhone = '0722 000 111 / 0799 123 456',
}) => {
  // Tabs: 'BUY' (M-Pesa STK Push) or 'VOUCHER' (PIN Code)
  const [activeTab, setActiveTab] = useState<'BUY' | 'VOUCHER'>('BUY');

  // Filter package options suitable for quick hotspot buy
  const hotspotPackages: WifiPackage[] = packages.length > 0 ? packages : [
    {
      id: 'pkg-1h',
      name: '1 Hour Lightning',
      category: 'HOURLY',
      priceKes: 10,
      durationHours: 1,
      durationLabel: '1 Hour',
      downloadSpeedMbps: 5,
      uploadSpeedMbps: 3,
      speedLabel: '5 Mbps',
      deviceLimit: 1,
      description: 'Ideal for rapid WhatsApp, email and social check-ins.',
    },
    {
      id: 'pkg-3h',
      name: '3 Hours Standard',
      category: 'HOURLY',
      priceKes: 20,
      durationHours: 3,
      durationLabel: '3 Hours',
      downloadSpeedMbps: 10,
      uploadSpeedMbps: 5,
      speedLabel: '10 Mbps',
      deviceLimit: 1,
      description: 'High-speed surfing and YouTube streaming.',
    },
    {
      id: 'pkg-1d',
      name: '24 Hours Unlimited',
      category: 'DAILY',
      priceKes: 50,
      durationHours: 24,
      durationLabel: '24 Hours',
      downloadSpeedMbps: 15,
      uploadSpeedMbps: 10,
      speedLabel: '15 Mbps',
      deviceLimit: 2,
      isPopular: true,
      description: 'Full day continuous high-speed connectivity for all devices.',
    },
    {
      id: 'pkg-7d',
      name: '7 Days Weekly Super',
      category: 'MULTI_DAY',
      priceKes: 250,
      durationHours: 168,
      durationLabel: '7 Days',
      downloadSpeedMbps: 20,
      uploadSpeedMbps: 15,
      speedLabel: '20 Mbps',
      deviceLimit: 3,
      description: 'Weekly pass for uninterrupted work and video streaming.',
    },
    {
      id: 'pkg-month-std',
      name: '30 Days Monthly Elite',
      category: 'MONTHLY',
      priceKes: 700,
      durationHours: 720,
      durationLabel: '30 Days',
      downloadSpeedMbps: 25,
      uploadSpeedMbps: 20,
      speedLabel: '25 Mbps',
      deviceLimit: 4,
      description: 'Full month high capacity unlimited broadband hotspot.',
    },
    {
      id: 'pkg-tv-monthly',
      name: 'Smart TV Monthly Stream',
      category: 'TV',
      priceKes: 1500,
      durationHours: 720,
      durationLabel: '30 Days',
      downloadSpeedMbps: 20,
      uploadSpeedMbps: 15,
      speedLabel: '20 Mbps',
      deviceLimit: 2,
      description: 'Dedicated unthrottled streaming pass for Smart TV, Netflix, YouTube 4K & IPTV.',
    },
    {
      id: 'pkg-tv-4k',
      name: 'Smart TV 4K Ultra Stream',
      category: 'TV',
      priceKes: 2500,
      durationHours: 720,
      durationLabel: '30 Days',
      downloadSpeedMbps: 40,
      uploadSpeedMbps: 30,
      speedLabel: '40 Mbps',
      deviceLimit: 3,
      description: 'Buffer-free 4K/8K streaming for Smart TVs, Apple TV & Gaming Consoles.',
    },
  ];

  const [selectedPkg, setSelectedPkg] = useState<WifiPackage>(
    hotspotPackages.find((p) => p.isPopular) || hotspotPackages[0]
  );

  const [phone, setPhone] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // M-Pesa STK Push Simulation state

  const [isPromptingMpesa, setIsPromptingMpesa] = useState(false);
  const [stkPin, setStkPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [latestTx, setLatestTx] = useState<Transaction | null>(null);

  // Authenticated Hotspot Status state (/status.html simulation)
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<{
    ip: string;
    mac: string;
    uptimeSeconds: number;
    remainingSeconds: number;
    downloadMb: number;
    uploadMb: number;
    pkgName: string;
    speed: string;
    rateLimit: string;
  }>({
    ip: '192.168.88.145',
    mac: '48:D2:24:AB:19:8C',
    uptimeSeconds: 142,
    remainingSeconds: 24 * 3600 - 142,
    downloadMb: 184.6,
    uploadMb: 26.2,
    pkgName: '24 Hours Unlimited',
    speed: '15 Mbps / 10 Mbps',
    rateLimit: '15M/10M',
  });

  // Real-time ticking counter when connected
  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => {
      setSessionData((prev) => {
        if (prev.remainingSeconds <= 1) {
          setIsConnected(false);
          onTriggerExpired();
          return prev;
        }
        return {
          ...prev,
          uptimeSeconds: prev.uptimeSeconds + 1,
          remainingSeconds: prev.remainingSeconds - 1,
          downloadMb: +(prev.downloadMb + 0.12).toFixed(1),
          uploadMb: +(prev.uploadMb + 0.03).toFixed(1),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, onTriggerExpired]);

  // Initiate M-Pesa STK Push
  const handleInitiateMpesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      alert('Please enter a valid Safaricom phone number (e.g. 07XXXXXXXX)');
      return;
    }
    setIsPromptingMpesa(true);
  };

  // Simulate Customer entering PIN on their phone
  const handleConfirmMpesaPin = async () => {
    setIsVerifying(true);
    try {
      const res = await api.initiateMpesaStk({
        phone,
        amount: selectedPkg.priceKes,
        type: 'CUSTOMER_WIFI',
        reference: selectedPkg.name,
        packageId: selectedPkg.id,
      });

      // Verify payment
      const verifyRes = await api.verifyMpesaPayment({
        checkoutRequestId: res.checkoutRequestId || `ws_CO_${Date.now()}`,
        phone,
        amount: selectedPkg.priceKes,
        type: 'CUSTOMER_WIFI',
        packageId: selectedPkg.id,
        userId: phone ? `guest-${phone.slice(-6)}` : 'guest-hotspot',
      });

      if (verifyRes.transaction) {
        setLatestTx(verifyRes.transaction);
      }

      // Mark session as connected!
      const totalSec = (selectedPkg.durationHours || 24) * 3600;
      setSessionData({
        ip: '192.168.88.' + Math.floor(100 + Math.random() * 100),
        mac: '48:D2:24:' + Math.floor(10 + Math.random() * 89) + ':AB:' + Math.floor(10 + Math.random() * 89),
        uptimeSeconds: 0,
        remainingSeconds: totalSec,
        downloadMb: 2.4,
        uploadMb: 0.8,
        pkgName: selectedPkg.name,
        speed: selectedPkg.speedLabel || '15 Mbps',
        rateLimit: `${selectedPkg.downloadSpeedMbps || 15}M/${selectedPkg.uploadSpeedMbps || 10}M`,
      });

      setIsPromptingMpesa(false);
      setIsVerifying(false);
      setIsConnected(true);
    } catch (err: any) {
      setIsVerifying(false);
      alert(err.message || 'M-Pesa payment confirmation failed');
    }
  };

  // Core Voucher Redemption Handler
  const executeVoucherRedemption = async (codeToRedeem: string) => {
    const cleanCode = codeToRedeem.trim().toUpperCase();
    if (!cleanCode) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    setVoucherLoading(true);
    setVoucherError('');

    try {
      const res = await api.redeemVoucher(cleanCode, 'guest-voucher-user');
      if (res.success && res.voucher) {
        const v = res.voucher;
        const totalSec = (v.durationHours || 24) * 3600;
        setSessionData({
          ip: '192.168.88.' + Math.floor(100 + Math.random() * 100),
          mac: '52:54:00:' + Math.floor(10 + Math.random() * 89) + ':CC:9F',
          uptimeSeconds: 0,
          remainingSeconds: totalSec,
          downloadMb: 1.1,
          uploadMb: 0.4,
          pkgName: v.packageName || 'Voucher Package',
          speed: v.speed || '15 Mbps',
          rateLimit: '15M/10M',
        });
        setIsConnected(true);
      } else {
        setVoucherError(res.error || 'Invalid or expired voucher code');
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Failed to authenticate voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    executeVoucherRedemption(voucherCode);
  };

  const handleQrScan = (parsed: ParsedQrResult) => {
    const code = parsed.voucherCode || parsed.raw;
    if (code) {
      setVoucherCode(code.toUpperCase());
      setActiveTab('VOUCHER');
      executeVoucherRedemption(code);
    }
  };



  // Format seconds into HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Top MikroTik Hotspot Status Header Bar */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">
              SSID: <strong className="text-white">{networkSsid}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-400 hidden sm:inline">Gateway: 192.168.88.1</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 rounded-lg text-[11px] font-bold transition-all shadow-sm"
              title="Scan Voucher QR Code with Camera"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Scan QR</span>
            </button>

            <span className="font-mono text-[11px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
              {isConnected ? 'AUTHENTICATED' : 'MIKROTIK CAPTIVE PORTAL'}
            </span>
            <button
              onClick={onReturnHome}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Exit to Website
            </button>
          </div>

        </div>
      </div>

      {/* Main Captive Portal Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl">
          {/* STATE 1: ALREADY AUTHENTICATED & ONLINE (/status.html) */}
          {isConnected ? (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Connected Banner */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <Wifi className="w-8 h-8" />
                </div>
                <div className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
                  ✓ Hotspot Authenticated · Internet Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  YOU ARE CONNECTED!
                </h1>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your device is online via {networkSsid}. Keep this tab open to monitor your active session time.
                </p>
              </div>

              {/* Live Session Counter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Time Remaining</div>
                  <div className="text-lg sm:text-xl font-mono font-black text-amber-400 mt-1">
                    {formatTime(sessionData.remainingSeconds)}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Download Used</div>
                  <div className="text-lg sm:text-xl font-mono font-black text-sky-400 mt-1">
                    {sessionData.downloadMb} MB
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Upload Used</div>
                  <div className="text-lg sm:text-xl font-mono font-black text-purple-400 mt-1">
                    {sessionData.uploadMb} MB
                  </div>
                </div>
              </div>

              {/* Hardware & Network Details */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Current Package:</span>
                  <span className="font-bold text-white">{sessionData.pkgName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Queue Speed Limit:</span>
                  <span className="font-mono text-emerald-400 font-bold">{sessionData.rateLimit}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Assigned Client IP:</span>
                  <span className="font-mono text-slate-400">{sessionData.ip}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Hardware MAC Address:</span>
                  <span className="font-mono text-slate-400">{sessionData.mac}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {latestTx && onViewReceipt && (
                  <button
                    onClick={() => onViewReceipt(latestTx)}
                    className="w-full py-3 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800/60 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Receipt className="w-4 h-4 text-sky-400" />
                    <span>VIEW OFFICIAL M-PESA RECEIPT</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onTriggerExpired}
                    className="py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    title="Simulate what happens when package runs out"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>SIMULATE EXPIRY</span>
                  </button>

                  <button
                    onClick={() => setIsConnected(false)}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>DISCONNECT / LOG OFF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 2: CAPTIVE PORTAL LOGIN SCREEN */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Branding Header */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-amber-500 p-0.5 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Wifi className="w-7 h-7 text-amber-400" />
                  </div>
                </div>

                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  {networkSsid}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  CONNECT TO INTERNET
                </h1>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {portalHeading}
                </p>
              </div>

              {/* Segmented Auth Selector (M-Pesa STK Push vs Voucher Code) */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('BUY')}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'BUY'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>1. PAY VIA M-PESA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('VOUCHER')}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'VOUCHER'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>2. VOUCHER CODE</span>
                </button>
              </div>

              {/* TAB 1: BUY PACKAGE VIA M-PESA */}
              {activeTab === 'BUY' && (
                <form onSubmit={handleInitiateMpesa} className="space-y-5">
                  {/* Package Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex justify-between">
                      <span>Choose Internet Package:</span>
                      <span className="text-amber-400 font-bold">{selectedPkg.name}</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {hotspotPackages.map((pkg) => {
                        const isSelected = selectedPkg.id === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPkg(pkg)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-400/10 border-amber-400 shadow-md'
                                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-xs text-white truncate max-w-[120px]">
                                {pkg.name}
                              </span>
                              <span className="font-mono font-black text-amber-400 text-xs">
                                KES {pkg.priceKes}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                              <span>{pkg.durationLabel}</span>
                              <span className="text-sky-400 font-medium">{pkg.speedLabel}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safaricom Phone Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Safaricom M-Pesa Phone Number:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                        🇰🇪 +254
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XXXXXXXX or 01XXXXXXXX"
                        className="w-full pl-20 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      You will receive an automatic Safaricom STK Push on your phone to enter your M-Pesa PIN.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>CONNECT WITH M-PESA (KES {selectedPkg.priceKes})</span>
                  </button>
                </form>
              )}

              {/* TAB 2: VOUCHER CODE */}
              {activeTab === 'VOUCHER' && (
                <form onSubmit={handleRedeemVoucher} className="space-y-4">
                  {/* Camera QR Quick Scan Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-amber-400/20 hover:from-amber-400/30 hover:to-amber-400/30 border border-amber-400/50 hover:border-amber-400 rounded-xl text-amber-300 hover:text-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Scan Voucher Card with Camera</span>
                  </button>

                  <div className="relative flex py-0.5 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">or enter PIN manually</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Enter Voucher PIN / Scratchcard Code:
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          setVoucherError('');
                        }}
                        placeholder="e.g. BRISK-9842"
                        className="w-full pl-4 pr-12 py-3.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white font-mono font-bold tracking-widest text-center text-lg placeholder:text-slate-600 uppercase focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="absolute right-3 p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Scan with Camera"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    </div>

                    {voucherError && (
                      <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{voucherError}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={voucherLoading}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{voucherLoading ? 'AUTHENTICATING PIN...' : 'ACTIVATE & CONNECT NOW'}</span>
                  </button>
                </form>
              )}

              {/* Customer Support Helpline footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted Captive Gateway</span>
                </div>
                <div>
                  Help: <strong className="text-slate-300">{helplinePhone}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* M-PESA STK PUSH PHONE SIMULATION MODAL */}
      {isPromptingMpesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          {/* Phone Mockup Frame */}
          <div className="relative w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-[38px] p-6 shadow-2xl space-y-6">
            {/* Top speaker notch */}
            <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />

            {/* Simulated Safaricom Prompt Window */}
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-5 space-y-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xs tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SAFARICOM M-PESA</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-200">
                  Do you want to pay <strong className="text-white">KES {selectedPkg.priceKes}.00</strong> to
                </div>
                <div className="text-sm font-black text-amber-400">
                  BRISK SMART CONNECT
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Till / Paybill: 882194 · Phone: {phone}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[11px] font-semibold text-slate-300">
                  Enter M-Pesa PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={stkPin}
                  onChange={(e) => setStkPin(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-[1em] py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromptingMpesa(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleConfirmMpesaPin}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {isVerifying ? 'Verifying...' : 'OK (Confirm)'}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 pt-1">
                Press OK to authorize instant activation
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Bottom Credits */}
      <div className="py-3 px-4 text-center text-[11px] text-slate-500 border-t border-slate-900">
        BRISK Smart Connect · MikroTik Hotspot & PPPoE Billing Engine · Nairobi, Kenya
      </div>

      {/* Camera QR Code Scanner Modal */}
      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQrScan}
        title="Scan WiFi Hotspot or Voucher QR"
        hint="Point camera at your printed voucher, receipt, or WiFi QR card"
      />
    </div>
  );
};

