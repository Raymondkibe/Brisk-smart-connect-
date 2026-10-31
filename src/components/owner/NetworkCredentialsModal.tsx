import React, { useState } from 'react';
import {
  X,
  Wifi,
  Lock,
  ShieldCheck,
  Terminal,
  Check,
  Copy,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import type { RouterDevice } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface NetworkCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  router: RouterDevice | null;
  onUpdated: (updatedRouter: RouterDevice) => void;
}

export const NetworkCredentialsModal: React.FC<NetworkCredentialsModalProps> = ({
  isOpen,
  onClose,
  router,
  onUpdated,
}) => {
  const [ssid, setSsid] = useState(router?.networkName || '');
  const [password, setPassword] = useState(router?.wifiPassword || 'BriskWifi2026!');
  const [securityMode, setSecurityMode] = useState<string>(router?.wifiSecurityMode || 'WPA2-PSK');
  const [band, setBand] = useState<'2.4ghz' | '5ghz' | 'dual'>('dual');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mikrotikScript, setMikrotikScript] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync state if router changes
  React.useEffect(() => {
    if (router) {
      setSsid(router.networkName || '');
      setPassword(router.wifiPassword || 'BriskWifi2026!');
      setSecurityMode(router.wifiSecurityMode || 'WPA2-PSK');
      setMikrotikScript('');
      setSuccessMsg('');
      setError('');
    }
  }, [router]);

  if (!isOpen || !router) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim()) {
      setError('Please provide a valid SSID (Network Name).');
      return;
    }
    if (securityMode !== 'OPEN' && password.length < 8) {
      setError('WiFi WPA2/WPA3 password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.updateRouterCredentials(router.id, {
        ssid: ssid.trim(),
        wifiPassword: password,
        securityMode,
        band,
      });

      if (res && res.success) {
        setSuccessMsg(res.message || 'WiFi credentials saved and applied to router successfully!');
        if (res.router) {
          onUpdated(res.router);
        }
        if (res.mikrotikScript) {
          setMikrotikScript(res.mikrotikScript);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update router network credentials.');
    } finally {
      setLoading(false);
    }
  };

  const copyScript = () => {
    if (!mikrotikScript) return;
    navigator.clipboard.writeText(mikrotikScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Network Credentials</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-[10px] font-bold">
                  {router.model || 'MikroTik RouterOS'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Update SSID broadcast name and wireless password for <strong className="text-white">{router.name}</strong> ({router.ipAddress}).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/70 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SSID & Security Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                WiFi Network Name (SSID) *
              </label>
              <div className="relative">
                <Wifi className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="e.g. BRISK_SMART_WIFI_WESTLANDS"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                This exact name will be broadcast to nearby guest devices.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Security Protocol
              </label>
              <select
                value={securityMode}
                onChange={(e) => setSecurityMode(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="WPA2-PSK">WPA2 Personal (Recommended for home/office)</option>
                <option value="WPA3-Personal">WPA3 Personal (High Security)</option>
                <option value="OPEN">Open Hotspot (Captive Portal Login Required)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Use "Open Hotspot" if routing customers through the BRISK web login portal.
              </p>
            </div>
          </div>

          {/* Password & Band */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityMode !== 'OPEN' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WiFi Passphrase / Security Key *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={securityMode !== 'OPEN'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Frequency Band Frequency
              </label>
              <select
                value={band}
                onChange={(e) => setBand(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="dual">Dual Band (2.4 GHz + 5 GHz Concurrent)</option>
                <option value="2.4ghz">2.4 GHz (Longer Range / Wall Penetration)</option>
                <option value="5ghz">5 GHz (Higher Speed / Dense Crowds)</option>
              </select>
            </div>
          </div>

          {/* Live Preview Banner */}
          <div className="p-4 bg-slate-950 border border-cyan-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
              <span>Broadcasting Preview:</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE SIGNAL
              </span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm font-mono">{ssid || 'BRISK_WIFI'}</div>
                  <div className="text-[11px] text-slate-400">
                    {securityMode === 'OPEN' ? 'Open Network (Captive Portal)' : `Secured (${securityMode})`} · {band === 'dual' ? '2.4 GHz + 5 GHz' : band.toUpperCase()}
                  </div>
                </div>
              </div>
              {securityMode !== 'OPEN' && (
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">WPA Key</div>
                  <div className="text-xs font-mono text-cyan-300 font-bold">
                    {showPassword ? password : '••••••••'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MikroTik RouterOS Output Command Script */}
          {mikrotikScript && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>MikroTik RouterOS Sync Command</span>
                </div>
                <button
                  type="button"
                  onClick={copyScript}
                  className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre">
                {mikrotikScript}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-400/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{loading ? 'Updating Credentials...' : 'Save & Sync to Router'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
