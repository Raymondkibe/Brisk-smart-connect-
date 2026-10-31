import React from 'react';
import { Radio, RefreshCw, Cpu, HardDrive, Wifi, Activity } from 'lucide-react';
import type { RouterDevice } from '../../types/index.ts';

interface NetworkHealthIndicatorProps {
  routers: RouterDevice[];
  onRefresh?: () => void;
}

export const NetworkHealthIndicator: React.FC<NetworkHealthIndicatorProps> = ({ routers, onRefresh }) => {
  const onlineCount = routers.filter((r) => r.status === 'ONLINE').length;
  const totalCount = routers.length;
  const isAllOnline = totalCount > 0 && onlineCount === totalCount;
  const isDegraded = totalCount > 0 && onlineCount > 0 && onlineCount < totalCount;

  return (
    <div className="p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl space-y-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isAllOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isDegraded
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Network Health Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isAllOnline
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isDegraded
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {totalCount === 0
                  ? 'No Routers Provisioned'
                  : isAllOnline
                  ? '● All Systems Operational'
                  : isDegraded
                  ? '● Partial Network Alert'
                  : '● All Gateways Offline'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time telemetry and heartbeat monitoring for registered MikroTik gateways
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-800/80 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Status</span>
          </button>
        )}
      </div>

      {/* Router Status Grid */}
      {routers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {routers.map((router) => {
            const isOnline = router.status === 'ONLINE';

            return (
              <div
                key={router.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
                  isOnline
                    ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                    : 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-bold text-xs text-white truncate max-w-[140px]">{router.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {router.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="text-slate-400">
                    IP: <span className="text-sky-400 font-semibold">{router.ipAddress || '192.168.88.1'}</span>
                  </div>
                  <div className="text-slate-400 text-right">
                    Uptime: <span className="text-slate-200">{router.uptime || '0d 01h'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>CPU: {router.cpuLoadPercent || 12}%</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-indigo-400" />
                    <span>RAM: {router.ramUsagePercent || 28}%</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3 h-3" />
                    <span>{router.activeUsers || 0} users</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
          <Activity className="w-6 h-6 mx-auto mb-2 text-slate-600" />
          <span>No routers registered yet. Connect your MikroTik router to view live network health.</span>
        </div>
      )}
    </div>
  );
};
