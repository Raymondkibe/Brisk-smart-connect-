import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  X,
  Play,
  Sliders,
  Bell,
  RefreshCw,
  Activity,
  Volume2,
} from 'lucide-react';
import type { RouterAlert } from '../../types/index.ts';

interface RouterAlertToastProps {
  alerts: RouterAlert[];
  onDismiss: (id: string) => void;
  onOpenDiagnostic: (routerId: string) => void;
  latencyThreshold: number;
  packetLossThreshold: number;
  onUpdateThresholds: (latency: number, packetLoss: number) => void;
  onSimulateAlert: (type: 'LATENCY' | 'DISCONNECT') => void;
}

export const RouterAlertToast: React.FC<RouterAlertToastProps> = ({
  alerts,
  onDismiss,
  onOpenDiagnostic,
  latencyThreshold,
  packetLossThreshold,
  onUpdateThresholds,
  onSimulateAlert,
}) => {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [localLatency, setLocalLatency] = useState<number>(latencyThreshold);
  const [localPacketLoss, setLocalPacketLoss] = useState<number>(packetLossThreshold);

  useEffect(() => {
    setLocalLatency(latencyThreshold);
    setLocalPacketLoss(packetLossThreshold);
  }, [latencyThreshold, packetLossThreshold]);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds(localLatency, localPacketLoss);
    setShowSettings(false);
  };

  return (
    <>
      {/* Floating Active Alerts Stack (Top-Right) */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right-8 ${
                isCritical
                  ? 'bg-slate-950/95 border-rose-500/50 text-white shadow-rose-950/50'
                  : isWarning
                  ? 'bg-slate-950/95 border-amber-500/50 text-white shadow-amber-950/50'
                  : 'bg-slate-950/95 border-sky-500/50 text-white shadow-sky-950/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {isCritical ? (
                      <AlertOctagon className="w-4 h-4 animate-bounce" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500 text-slate-950 font-black'
                            : isWarning
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-sky-500 text-slate-950 font-black'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString('en-KE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{alert.message}</p>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenDiagnostic(alert.routerId);
                          onDismiss(alert.id);
                        }}
                        className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Ping Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDismiss(alert.id)}
                        className="px-2 py-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(alert.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Threshold Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Router Alert Threshold Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveThresholds} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Latency Threshold (ms)
                </label>
                <input
                  type="number"
                  min={10}
                  max={250}
                  value={localLatency}
                  onChange={(e) => setLocalLatency(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Notify with a toast warning when ping latency exceeds this value (Default: 50ms)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Packet Loss Threshold (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={localPacketLoss}
                  onChange={(e) => setLocalPacketLoss(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-rose-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Trigger a critical toast alert if dropped packets exceed this percentage (Default: 5%)
                </span>
              </div>


              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md"
                >
                  Save Thresholds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
