import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Server,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Download,
  RotateCw,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Key,
  Trash2,
  HelpCircle,
  FileCode,
  Sliders,
  Radio,
} from 'lucide-react';
import type { GeneratedSetupScript, User, RouterDevice } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface RouterSetupScriptsViewProps {
  currentUser: User;
  routers: RouterDevice[];
  onRefreshState?: () => void;
  onNavigateToRouters?: () => void;
}

export const RouterSetupScriptsView: React.FC<RouterSetupScriptsViewProps> = ({
  currentUser,
  routers,
  onRefreshState,
  onNavigateToRouters,
}) => {
  // Script Generator Form State
  const [selectedVendor, setSelectedVendor] = useState<'mikrotik_v7' | 'mikrotik_v6' | 'openwrt' | 'tplink' | 'ubiquiti' | 'radius'>('mikrotik_v7');
  const [connectionMethod, setConnectionMethod] = useState('Outbound Connector Agent');
  const [routerName, setRouterName] = useState('Kiambu Main Gateway');
  const [hotspotSsid, setHotspotSsid] = useState('BRISK Smart WiFi');
  const [siteLocation, setSiteLocation] = useState('Kiambu Town Branch');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Active Generated Script & History
  const [activeScript, setActiveScript] = useState<GeneratedSetupScript | null>(null);
  const [scriptsHistory, setScriptsHistory] = useState<GeneratedSetupScript[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadScripts = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.getRouterSetupScripts(currentUser.id);
      if (res && res.scripts) {
        setScriptsHistory(res.scripts);
        if (res.scripts.length > 0 && !activeScript) {
          setActiveScript(res.scripts[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load scripts:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadScripts();
  }, [currentUser.id]);

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setActionMessage('');

    try {
      const res = await api.generateRouterSetupScript({
        vendor: selectedVendor,
        routerName,
        connectionMethod,
        hotspotName: hotspotSsid,
        ownerId: currentUser.id,
        portalUrl: 'https://wifi.brisk.co.ke/portal',
      });

      setActiveScript(res.script);
      setScriptsHistory((prev) => [res.script, ...prev]);
      setActionMessage(`Setup script generated! Token: ${res.script.token}`);
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to generate script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeScript = async (token: string, scriptId: string) => {
    if (!confirm(`Are you sure you want to revoke enrollment token ${token}? This will immediately prevent the router from authenticating.`)) {
      return;
    }

    try {
      const res = await api.revokeRouterSetupScript({ token, scriptId });
      setScriptsHistory((prev) =>
        prev.map((s) => (s.id === scriptId ? { ...s, status: 'REVOKED' } : s))
      );
      if (activeScript?.id === scriptId) {
        setActiveScript((prev) => (prev ? { ...prev, status: 'REVOKED' } : null));
      }
      setActionMessage(res.message);
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke token');
    }
  };

  const handleDownloadScript = () => {
    if (!activeScript) return;
    const isMikrotik = activeScript.vendor.includes('mikrotik');
    const filename = `${activeScript.routerName.toLowerCase().replace(/\s+/g, '_')}_brisk_setup.${isMikrotik ? 'rsc' : 'sh'}`;
    const blob = new Blob([activeScript.scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Least-Privilege Router Script Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Vendor-Specific Router Setup Scripts
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Generate server-signed, zero-credential installation scripts with single-use enrollment tokens. Supported on MikroTik RouterOS v7 & v6, OpenWrt, TP-Link Omada, and Ubiquiti UniFi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadScripts}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Fleet</span>
            </button>
            {onNavigateToRouters && (
              <button
                onClick={onNavigateToRouters}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20"
              >
                View Connected Routers →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACTION MESSAGE FLASH */}
      {actionMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKFLOW: GENERATOR FORM & SCRIPT PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: VENDOR & SETUP FORM (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                1. Router Specifications
              </h3>
            </div>

            <form onSubmit={handleGenerateScript} className="space-y-4 text-xs">
              {/* Vendor Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">
                  Select Hardware Platform / Vendor
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'mikrotik_v7', label: 'MikroTik v7.x', tag: 'Recommended' },
                    { id: 'mikrotik_v6', label: 'MikroTik v6.x', tag: 'Legacy' },
                    { id: 'openwrt', label: 'OpenWrt / Linux', tag: 'Daemon' },
                    { id: 'tplink', label: 'TP-Link Omada', tag: 'Controller' },
                    { id: 'ubiquiti', label: 'Ubiquiti UniFi', tag: 'Gateway' },
                    { id: 'radius', label: 'Generic RADIUS', tag: 'Standard' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVendor(v.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedVendor === v.id
                          ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/50'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-white">{v.label}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{v.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Router Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Router Device Name
                </label>
                <input
                  type="text"
                  value={routerName}
                  onChange={(e) => setRouterName(e.target.value)}
                  placeholder="e.g. Kiambu Market RB4011"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Hotspot SSID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Hotspot Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={hotspotSsid}
                  onChange={(e) => setHotspotSsid(e.target.value)}
                  placeholder="e.g. BRISK Smart WiFi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Connection Method */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Connection Method
                </label>
                <select
                  value={connectionMethod}
                  onChange={(e) => setConnectionMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Outbound Connector Agent">Outbound Connector Agent (Behind NAT)</option>
                  <option value="Direct REST API">Direct REST API over HTTPS</option>
                  <option value="WireGuard Tunnel">Encrypted WireGuard Private Tunnel</option>
                  <option value="RADIUS Accounting">RADIUS Accounting & Authentication</option>
                </select>
              </div>

              {/* Security notice */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero-Secret Protection</span>
                </div>
                <p>
                  Scripts never embed router passwords or Daraja M-Pesa API keys. Tokens expire automatically in 24 hours.
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Generating Script & Token...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    <span>Generate Setup Script</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: SCRIPT PREVIEW, TOKEN STATUS & ROLLBACK (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {activeScript ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              {/* TOP STATUS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{activeScript.routerName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        activeScript.status === 'CONNECTED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : activeScript.status === 'REVOKED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {activeScript.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {activeScript.vendorLabel} · {activeScript.connectionMethod}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadScript}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Download Configuration Script"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download</span>
                  </button>
                  {activeScript.status !== 'REVOKED' && (
                    <button
                      onClick={() => handleRevokeScript(activeScript.token, activeScript.id)}
                      className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/80 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Revoke Token & Invalidate Script"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Token</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ENROLLMENT TOKEN BADGE */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Single-Use Enrollment Token
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{activeScript.token}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Permanent Validity · Never Expires</span>
                </div>
              </div>

              {/* TERMINAL SCRIPT PREVIEW BOX */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase text-[11px]">
                    Generated Installation Script
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeScript.scriptContent);
                      setCopiedCode('script');
                      setTimeout(() => setCopiedCode(null), 2500);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedCode === 'script' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-60 leading-relaxed shadow-inner">
                    {activeScript.scriptContent}
                  </pre>
                </div>
              </div>

              {/* ROLLBACK INSTRUCTIONS */}
              {activeScript.rollbackContent && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[11px]">
                      Safe Rollback / Removal Script
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeScript.rollbackContent);
                        setCopiedCode('rollback');
                        setTimeout(() => setCopiedCode(null), 2500);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedCode === 'rollback' ? 'Copied Rollback' : 'Copy Rollback'}
                    </button>
                  </div>
                  <pre className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-[10px] font-mono text-slate-400 overflow-x-auto max-h-24">
                    {activeScript.rollbackContent}
                  </pre>
                </div>
              )}

              {/* INSTRUCTIONS STEP-BY-STEP */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-extrabold text-amber-400 block text-[11px] uppercase">
                  How to Install on Your Router:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                  <li>Open your router management tool (WinBox, SSH, or Web Terminal).</li>
                  <li>Verify you have administrative rights on the device.</li>
                  <li>Click <strong>Copy Script</strong> above and paste into the Terminal window.</li>
                  <li>Press <strong>Enter</strong> to execute. The device will report enrollment to BRISK within 60 seconds.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Terminal className="w-12 h-12 mx-auto text-slate-600" />
              <div className="font-extrabold text-white text-base">No Setup Script Selected</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your router model on the left and click "Generate Setup Script" to produce an installation command.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SETUP SCRIPTS AUDIT HISTORY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Script Generation & Token Audit History
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {scriptsHistory.length} scripts issued
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3">Router Name</th>
                <th className="p-3">Platform</th>
                <th className="p-3">Enrollment Token</th>
                <th className="p-3">Status</th>
                <th className="p-3">Generated At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {scriptsHistory.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-white">{s.routerName}</td>
                  <td className="p-3 text-cyan-400 font-mono text-[11px]">{s.vendorLabel}</td>
                  <td className="p-3 font-mono text-slate-300">{s.token}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        s.status === 'CONNECTED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : s.status === 'REVOKED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {new Date(s.createdAt).toLocaleTimeString('en-KE')}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveScript(s)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-bold transition-colors mr-1.5"
                    >
                      View Script
                    </button>
                    {s.status !== 'REVOKED' && (
                      <button
                        onClick={() => handleRevokeScript(s.token, s.id)}
                        className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
