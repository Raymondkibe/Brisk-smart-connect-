import React, { useState, useEffect } from 'react';
import {
  Radio,
  Activity,
  Terminal,
  X,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  Server,
  Globe,
  ShieldCheck,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { RouterDevice, RouterDiagnosticResult } from '../../types/index.ts';

interface RouterDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  routers: RouterDevice[];
  initialRouterId?: string;
  onTriggerAlert?: (alert: {
    routerId: string;
    routerName: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    value?: number;
    threshold?: number;
  }) => void;
  latencyThreshold?: number;
  packetLossThreshold?: number;
}

const TARGET_PRESETS = [
  { label: 'Google DNS', host: '8.8.8.8', desc: 'Global ICMP & DNS Baseline' },
  { label: 'Cloudflare DNS', host: '1.1.1.1', desc: 'Ultra-low Latency Anycast' },
  { label: 'BRISK Captive Portal', host: 'wifi.brisk.co.ke', desc: 'Customer Hotspot Entry' },
  { label: 'Safaricom Daraja API', host: 'api.safaricom.co.ke', desc: 'M-Pesa STK Push Gateway' },
];

export const RouterDiagnosticModal: React.FC<RouterDiagnosticModalProps> = ({
  isOpen,
  onClose,
  routers,
  initialRouterId,
  onTriggerAlert,
  latencyThreshold = 50,
  packetLossThreshold = 5,
}) => {
  const [selectedRouterId, setSelectedRouterId] = useState<string>(
    initialRouterId || routers[0]?.id || 'rtr-01'
  );
  const [targetHost, setTargetHost] = useState<string>('8.8.8.8');
  const [packetCount, setPacketCount] = useState<number>(4);
  const [packetSize, setPacketSize] = useState<number>(64);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<RouterDiagnosticResult | null>(null);
  const [error, setError] = useState<string>('');
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);

  useEffect(() => {
    if (initialRouterId) {
      setSelectedRouterId(initialRouterId);
    }
  }, [initialRouterId]);

  if (!isOpen) return null;

  const activeRouter = routers.find((r) => r.id === selectedRouterId) || routers[0];

  const handleRunTest = async () => {
    setIsRunning(true);
    setError('');
    setResult(null);

    try {
      const res = await api.runDiagnosticPing({
        routerId: selectedRouterId,
        targetHost,
        count: packetCount,
        packetSize,
      });

      setResult(res.result);

      // Check if alert should be triggered
      if (onTriggerAlert) {
        if (res.result.packetLossPercent > packetLossThreshold) {
          onTriggerAlert({
            routerId: activeRouter.id,
            routerName: activeRouter.name,
            severity: 'CRITICAL',
            title: `Packet Loss Alert on ${activeRouter.name}`,
            message: `Diagnostic ping to ${targetHost} recorded ${res.result.packetLossPercent}% packet loss (Threshold: ${packetLossThreshold}%).`,
            value: res.result.packetLossPercent,
            threshold: packetLossThreshold,
          });
        } else if (res.result.avgLatencyMs > latencyThreshold) {
          onTriggerAlert({
            routerId: activeRouter.id,
            routerName: activeRouter.name,
            severity: 'WARNING',
            title: `High Latency Alert on ${activeRouter.name}`,
            message: `Ping to ${targetHost} averaged ${res.result.avgLatencyMs}ms (Threshold: ${latencyThreshold}ms).`,
            value: res.result.avgLatencyMs,
            threshold: latencyThreshold,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete diagnostic ping');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyTerminal = () => {
    if (!result?.terminalOutput) return;
    navigator.clipboard.writeText(result.terminalOutput.join('\n'));
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Router Ping & Diagnostics</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  LIVE ICMP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger real-time ICMP ping packets, measure jitter, latency, and packet loss from router hardware.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 font-sans text-xs">
          {/* Controls Bar: Select Router & Target */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Source Router
              </label>
              <select
                value={selectedRouterId}
                onChange={(e) => setSelectedRouterId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-sky-500"
              >
                {routers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.ipAddress})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Host / IP
              </label>
              <input
                type="text"
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                placeholder="8.8.8.8"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Packets
                </label>
                <select
                  value={packetCount}
                  onChange={(e) => setPacketCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value={4}>4 packets</option>
                  <option value={8}>8 packets</option>
                  <option value={12}>12 packets</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Size
                </label>
                <select
                  value={packetSize}
                  onChange={(e) => setPacketSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value={64}>64 B</option>
                  <option value={256}>256 B</option>
                  <option value={512}>512 B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Target Presets */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Diagnostic Target Presets:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset.host}
                  type="button"
                  onClick={() => setTargetHost(preset.host)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    targetHost === preset.host
                      ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{preset.label}</div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">{preset.host}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Diagnostic Result Cards */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Primary Metric Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Average Latency</div>
                  <div className="text-xl font-mono font-black text-sky-400 mt-1">
                    {result.avgLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Min {result.minLatencyMs}ms · Max {result.maxLatencyMs}ms
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Packet Loss</div>
                  <div
                    className={`text-xl font-mono font-black mt-1 ${
                      result.packetLossPercent === 0
                        ? 'text-emerald-400'
                        : result.packetLossPercent < 5
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {result.packetLossPercent}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {result.packetsReceived}/{result.packetsTransmitted} Packets OK
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Jitter Variance</div>
                  <div className="text-xl font-mono font-black text-purple-400 mt-1">
                    ±{result.jitterMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Stability Index</div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Diagnostic Verdict</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        result.status === 'OPTIMAL'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : result.status === 'ACCEPTABLE'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : result.status === 'DEGRADED'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {result.status === 'OPTIMAL' ? '● OPTIMAL' : `● ${result.status}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {result.status === 'OPTIMAL'
                      ? 'Zero packet drop'
                      : result.avgLatencyMs > latencyThreshold
                      ? 'Exceeds threshold'
                      : 'Operational'}
                  </div>
                </div>
              </div>

              {/* Service Health Badges */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-300">Upstream ISP & Cloud Dependencies:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Google DNS (8.8.8.8)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cloudflare DNS (1.1.1.1)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BRISK Captive Portal</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Safaricom Daraja API</span>
                  </span>
                </div>
              </div>

              {/* Terminal Output */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>router_icmp_probe.log</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTerminal}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedOutput ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedOutput ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>
                <pre className="p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 overflow-x-auto max-h-48 select-all">
                  {result.terminalOutput.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Source: <strong className="text-slate-200">{activeRouter?.name}</strong> · Firmware:{' '}
            <strong className="text-sky-400">{activeRouter?.routerOsVersion || 'RouterOS 7.x'}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={handleRunTest}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Pinging {targetHost}...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Diagnostic Ping
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
