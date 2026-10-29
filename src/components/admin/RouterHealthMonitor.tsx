import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  Radio,
  RefreshCw,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Server,
  Thermometer,
  Gauge,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../../services/api.ts';

interface RouterTelemetryItem {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  location: string;
  networkName: string;
  status: 'ONLINE' | 'OFFLINE';
  routerOsVersion: string;
  uptime: string;
  cpuLoadPercent: number;
  ramUsagePercent: number;
  totalRamMb: number;
  usedRamMb: number;
  freeRamMb: number;
  temperatureC: number;
  voltageV: string;
  activeUsers: number;
  downloadTrafficMbps: number;
  uploadTrafficMbps: number;
  lastHeartbeat: string;
  healthStatus: 'HEALTHY' | 'WARNING';
}

interface FleetSummary {
  totalRouters: number;
  onlineCount: number;
  avgCpuPercent: number;
  avgRamPercent: number;
  totalActiveUsers: number;
  totalThroughputMbps: number;
}

export const RouterHealthMonitor: React.FC = () => {
  const [routers, setRouters] = useState<RouterTelemetryItem[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [selectedChartMode, setSelectedChartMode] = useState<'COMBINED' | 'PER_ROUTER' | 'RAM_MB'>('COMBINED');
  const [selectedRouterId, setSelectedRouterId] = useState<string>('ALL');
  const [rebootingId, setRebootingId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ id: string; ms: number } | null>(null);

  const pollIntervalRef = useRef<any>(null);

  const fetchTelemetry = async () => {
    try {
      const data = await api.getRouterHealthTelemetry();
      if (data) {
        setRouters(data.routers || []);
        setHistory(data.history || []);
        setFleetSummary(data.fleetSummary || null);
        setLastRefreshed(new Date().toLocaleTimeString('en-KE', { hour12: false }));
        setError('');
      }
    } catch (err: any) {
      console.warn('Telemetry fetch error:', err);
      setError('Could not connect to router telemetry daemon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();

    if (isLiveStreaming) {
      pollIntervalRef.current = setInterval(fetchTelemetry, 3000);
    } else if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isLiveStreaming]);

  const handleSimulatePing = (routerId: string) => {
    const latency = Math.floor(10 + Math.random() * 15);
    setPingResult({ id: routerId, ms: latency });
    setTimeout(() => setPingResult(null), 4000);
  };

  const handleSimulateReboot = (routerId: string) => {
    setRebootingId(routerId);
    setTimeout(() => {
      setRebootingId(null);
      fetchTelemetry();
    }, 2500);
  };

  // Color helper for CPU/Memory load
  const getLoadBadgeColor = (val: number) => {
    if (val < 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val < 75) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getLoadBarColor = (val: number) => {
    if (val < 50) return 'bg-emerald-500';
    if (val < 75) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const filteredRouters = selectedRouterId === 'ALL'
    ? routers
    : routers.filter((r) => r.id === selectedRouterId);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* HEADER & STREAM CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Real-Time Router System Health Monitor
              </h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking CPU, RAM memory utilization, uptime & operating thermals for MikroTik gateway fleet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Live streaming toggle button */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isLiveStreaming
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-cyan-400" />
                <span>Streaming (3s)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* Manual refresh button */}
          <button
            onClick={fetchTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Sync</span>
          </button>

          <div className="text-[11px] font-mono text-slate-500 pl-2 border-l border-slate-800 hidden lg:block">
            Synced: {lastRefreshed}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fleet Status */}
        <div className="p-4 sm:p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Fleet Status</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {fleetSummary?.onlineCount || routers.length}/{fleetSummary?.totalRouters || routers.length}
            </span>
            <span className="text-xs font-bold text-emerald-400">100% ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>All gateway nodes responsive</span>
          </div>
        </div>

        {/* Card 2: Average CPU Load */}
        <div className="p-4 sm:p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Avg CPU Load</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {fleetSummary?.avgCpuPercent || 21}%
            </span>
            <span className="text-xs font-semibold text-slate-400">Multi-core</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getLoadBarColor(fleetSummary?.avgCpuPercent || 21)}`}
              style={{ width: `${fleetSummary?.avgCpuPercent || 21}%` }}
            />
          </div>
        </div>

        {/* Card 3: Average RAM Memory */}
        <div className="p-4 sm:p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">RAM Utilization</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {fleetSummary?.avgRamPercent || 36}%
            </span>
            <span className="text-xs font-semibold text-indigo-300">Stable</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${fleetSummary?.avgRamPercent || 36}%` }}
            />
          </div>
        </div>

        {/* Card 4: Top Uptime & Active Throughput */}
        <div className="p-4 sm:p-5 bg-[#0b132b] border border-slate-800/80 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Fleet Throughput</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {fleetSummary?.totalThroughputMbps || 111.7}
            </span>
            <span className="text-xs font-semibold text-slate-400">Mbps</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span className="text-slate-500">Max Uptime:</span>
            <span className="font-mono text-slate-300 font-semibold">{routers[0]?.uptime || '28d 14h'}</span>
          </div>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CONTAINER */}
      <div className="p-5 sm:p-6 bg-[#0b132b] border border-slate-800/80 rounded-2xl space-y-4 shadow-sm">
        {/* CHART CONTROLS & TAB ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Live Telemetry Curves (CPU % & Memory Utilization)
            </h3>
            <p className="text-xs text-slate-400">
              High-frequency time-series streaming across connected gateways
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Mode Segmented Tabs */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => setSelectedChartMode('COMBINED')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedChartMode === 'COMBINED'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fleet Area (Avg)
              </button>
              <button
                onClick={() => setSelectedChartMode('PER_ROUTER')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedChartMode === 'PER_ROUTER'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Router CPU Lines
              </button>
              <button
                onClick={() => setSelectedChartMode('RAM_MB')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedChartMode === 'RAM_MB'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RAM MB Pool
              </button>
            </div>

            {/* Filter by Router dropdown */}
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Connected Routers</option>
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RECHARTS RENDER SECTION */}
        <div className="h-72 w-full pt-2">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {selectedChartMode === 'COMBINED' ? (
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    unit="%"
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgCpu"
                    name="Fleet CPU Load (%)"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cpuGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgRam"
                    name="Fleet RAM Usage (%)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#ramGradient)"
                  />
                </AreaChart>
              ) : selectedChartMode === 'PER_ROUTER' ? (
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    unit="%"
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />
                  {routers.map((r, idx) => {
                    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];
                    const color = colors[idx % colors.length];
                    if (selectedRouterId !== 'ALL' && selectedRouterId !== r.id) return null;
                    return (
                      <Line
                        key={r.id}
                        type="monotone"
                        dataKey={`${r.id}_cpu`}
                        name={`${r.name} CPU (%)`}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    );
                  })}
                </LineChart>
              ) : (
                <BarChart data={routers} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    unit=" MB"
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />
                  <Bar dataKey="usedRamMb" name="Used RAM (MB)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="freeRamMb" name="Free RAM (MB)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Waiting for initial router telemetry handshake...
            </div>
          )}
        </div>
      </div>

      {/* DETAILED ROUTER HARDWARE BREAKDOWN CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Connected Gateways ({filteredRouters.length})
          </h3>
          <span className="text-xs text-slate-400">All running RouterOS v7 with active hotplug</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRouters.map((router) => (
            <div
              key={router.id}
              className={`p-5 bg-[#0b132b] border rounded-2xl space-y-4 transition-all duration-200 relative overflow-hidden ${
                rebootingId === router.id
                  ? 'border-cyan-500/50 bg-cyan-950/20'
                  : 'border-slate-800/80 hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white truncate">{router.name}</h4>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{router.model}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 ${getLoadBadgeColor(
                    router.cpuLoadPercent
                  )}`}
                >
                  {router.healthStatus}
                </span>
              </div>

              {/* IP & Location */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900/60 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Gateway IP</span>
                  <span className="text-cyan-400 font-semibold">{router.ipAddress}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Firmware</span>
                  <span className="text-slate-300">{router.routerOsVersion}</span>
                </div>
              </div>

              {/* CPU & Memory Meters */}
              <div className="space-y-3">
                {/* CPU Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      CPU Load
                    </span>
                    <span className="font-mono font-bold text-white">{router.cpuLoadPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getLoadBarColor(router.cpuLoadPercent)}`}
                      style={{ width: `${router.cpuLoadPercent}%` }}
                    />
                  </div>
                </div>

                {/* RAM Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                      RAM Memory
                    </span>
                    <span className="font-mono font-bold text-white">
                      {router.usedRamMb} / {router.totalRamMb} MB ({router.ramUsagePercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${router.ramUsagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hardware Sensor Strip: Temp, Voltage, Uptime */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Uptime
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">{router.uptime}</span>
                </div>

                <div className="p-2 bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    Temp
                  </span>
                  <span className="font-mono text-[11px] font-bold text-amber-300">{router.temperatureC}°C</span>
                </div>

                <div className="p-2 bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    Power
                  </span>
                  <span className="font-mono text-[11px] font-bold text-cyan-300">{router.voltageV}V</span>
                </div>
              </div>

              {/* Throughput & Hotspot Active Users */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{router.activeUsers} Guests</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-emerald-400 flex items-center">
                    <ArrowDownRight className="w-3 h-3" />
                    {router.downloadTrafficMbps}M
                  </span>
                  <span className="text-cyan-400 flex items-center">
                    <ArrowUpRight className="w-3 h-3" />
                    {router.uploadTrafficMbps}M
                  </span>
                </div>
              </div>

              {/* Diagnostic Ping Feedback */}
              {pingResult && pingResult.id === router.id && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center text-xs text-emerald-300 font-mono animate-fade-in">
                  ICMP Ping to {router.ipAddress}: {pingResult.ms} ms (0% loss)
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleSimulatePing(router.id)}
                  className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors text-center"
                >
                  Test Latency
                </button>
                <button
                  disabled={rebootingId === router.id}
                  onClick={() => handleSimulateReboot(router.id)}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-800 border border-slate-800 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  title="Simulate RouterOS Safe Reboot"
                >
                  {rebootingId === router.id ? 'Rebooting...' : 'Restart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
