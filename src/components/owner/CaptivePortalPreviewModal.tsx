import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Lock,
  Ticket,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { WifiPackage, PortalConfig } from '../../types/index.ts';

interface CaptivePortalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Partial<PortalConfig>;
  packages: WifiPackage[];
  onSaveAndPublish?: () => void;
}

export const CaptivePortalPreviewModal: React.FC<CaptivePortalPreviewModalProps> = ({
  isOpen,
  onClose,
  config,
  packages,
  onSaveAndPublish,
}) => {
  const [deviceMode, setDeviceMode] = useState<'MOBILE' | 'TABLET' | 'DESKTOP'>('MOBILE');
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'VOUCHER' | 'ACCOUNT'>('PACKAGES');
  const [selectedPkg, setSelectedPkg] = useState<WifiPackage | null>(packages[0] || null);
  const [phoneInput, setPhoneInput] = useState('0712 345 678');
  const [voucherInput, setVoucherInput] = useState('');
  const [simulatedConnecting, setSimulatedConnecting] = useState(false);
  const [connectedState, setConnectedState] = useState(false);

  if (!isOpen) return null;

  const brandName = config.businessDisplayName || config.portalName || 'BRISK Smart Hotspot';
  const welcomeHeading = config.welcomeHeading || 'Welcome to Fast WiFi';
  const welcomeDescription =
    config.welcomeDescription ||
    'Select a high-speed internet pass or enter your voucher PIN code to get instant internet access.';
  const primaryColor = config.primaryColor || '#f59e0b';
  const supportPhone = config.supportPhone || '0722 000 111';

  const handleSimulatePayment = () => {
    setSimulatedConnecting(true);
    setTimeout(() => {
      setSimulatedConnecting(false);
      setConnectedState(true);
    }, 1200);
  };

  const handleResetSim = () => {
    setConnectedState(false);
    setSimulatedConnecting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top bar controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Live Captive Portal Preview</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold">
                  CLIENT VIEW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                This is exactly how connected guests and customers will experience your branded hotspot.
              </p>
            </div>
          </div>

          {/* Device viewport switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setDeviceMode('MOBILE')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === 'MOBILE'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (380px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('TABLET')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === 'TABLET'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (640px)"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('DESKTOP')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                deviceMode === 'DESKTOP'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop / Laptop View"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
          </div>

          {/* Close & Action Buttons */}
          <div className="flex items-center gap-2">
            {onSaveAndPublish && (
              <button
                type="button"
                onClick={onSaveAndPublish}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-colors"
              >
                Save & Publish
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 bg-slate-950 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div
            className={`transition-all duration-300 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto ${
              deviceMode === 'MOBILE'
                ? 'w-full max-w-sm min-h-[580px] border-slate-700/60 shadow-amber-500/5'
                : deviceMode === 'TABLET'
                ? 'w-full max-w-xl min-h-[600px] border-slate-700/60'
                : 'w-full max-w-3xl min-h-[640px] border-slate-700/60'
            }`}
          >
            {/* Mock phone status bar on mobile */}
            {deviceMode === 'MOBILE' && (
              <div className="flex items-center justify-between px-6 py-2 bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800 font-mono">
                <span>09:41</span>
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] text-emerald-400">BRISK_WiFi</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Portal Content Inside Device */}
            <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
              {connectedState ? (
                /* Connected Success Screen */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">You Are Connected!</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your internet session on <strong className="text-white">{brandName}</strong> is active.
                    </p>
                  </div>

                  <div className="w-full max-w-xs p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Package:</span>
                      <span className="font-bold text-white">{selectedPkg?.name || 'Standard Pass'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Allocated Speed:</span>
                      <span className="font-bold text-sky-400 font-mono">{selectedPkg?.speedLabel || '15 Mbps'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Time Remaining:</span>
                      <span className="font-bold text-amber-400 font-mono">{selectedPkg?.durationLabel || '12 Hours'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>IP Address:</span>
                      <span className="font-mono text-slate-300">192.168.88.241</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={handleResetSim}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Test Reconnect</span>
                    </button>
                    <a
                      href="https://google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Portal Authentication & Package Selection Screen */
                <>
                  {/* Brand Header */}
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-400 text-xs font-bold">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>{brandName}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{welcomeHeading}</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">{welcomeDescription}</p>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('PACKAGES')}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'PACKAGES'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Buy Pass</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('VOUCHER')}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'VOUCHER'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Use Voucher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ACCOUNT')}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'ACCOUNT'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Member</span>
                    </button>
                  </div>

                  {/* Tab 1: Packages & M-Pesa STK Push */}
                  {activeTab === 'PACKAGES' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Available Hotspot Rates</span>
                        <span className="text-amber-400">{packages.length} Packages</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {packages.map((pkg) => {
                          const isSel = selectedPkg?.id === pkg.id;
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setSelectedPkg(pkg)}
                              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                                isSel
                                  ? 'bg-amber-400/10 border-amber-400 shadow-md shadow-amber-500/10'
                                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                  <span>{pkg.name}</span>
                                  {pkg.isCustom && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black uppercase">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  {pkg.speedLabel} · {pkg.durationLabel}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-black text-amber-400 font-mono">
                                  KES {pkg.priceKes}
                                </div>
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mt-1 ml-auto ${
                                    isSel
                                      ? 'bg-amber-400 border-amber-400'
                                      : 'border-slate-700'
                                  }`}
                                >
                                  {isSel && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Phone input and M-Pesa STK action */}
                      <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-300">
                          Safaricom M-Pesa Phone Number:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="07XX XXX XXX"
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            disabled={simulatedConnecting}
                            onClick={handleSimulatePayment}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              {simulatedConnecting
                                ? 'Prompting M-Pesa...'
                                : `Pay KES ${selectedPkg?.priceKes || 50}`}
                            </span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Instant STK push notification will appear on your phone screen to enter your M-Pesa PIN.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Voucher Entry */}
                  {activeTab === 'VOUCHER' && (
                    <div className="space-y-4 animate-fade-in p-2">
                      <div className="text-center space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Enter Hotspot Voucher Code</h4>
                        <p className="text-xs text-slate-400">
                          Vouchers are available at the front counter or local retailer.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                          placeholder="e.g. BRISK-8902"
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm font-mono font-bold tracking-widest text-amber-400 uppercase focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          disabled={simulatedConnecting}
                          onClick={handleSimulatePayment}
                          className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Wifi className="w-3.5 h-3.5" />
                          <span>{simulatedConnecting ? 'Activating Session...' : 'Redeem & Connect'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Member Account Login */}
                  {activeTab === 'ACCOUNT' && (
                    <div className="space-y-3 animate-fade-in p-2">
                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-bold text-white">Registered Customer Sign In</h4>
                        <p className="text-xs text-slate-400">
                          Log in to resume your active fiber or broadband subscription.
                        </p>
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone Number (07XX XXX XXX)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                      <input
                        type="password"
                        placeholder="Password or Hotspot PIN"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleSimulatePayment}
                        className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Sign In & Connect
                      </button>
                    </div>
                  )}

                  {/* Anti-bypass security footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Anti-Bypass Guard Active</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <PhoneCall className="w-3 h-3 text-amber-400" />
                      <span>Help: {supportPhone}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
