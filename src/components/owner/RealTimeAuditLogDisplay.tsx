import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Radio,
  Wifi,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  Settings,
  Server,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  Play,
  Pause,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Info,
  Sliders,
  DollarSign,
  Ticket,
  Maximize2,
  PlusCircle,
  X,
} from 'lucide-react';
import type { NetworkAuditEvent, NetworkAuditCategory } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface RealTimeAuditLogDisplayProps {
  ownerId: string;
  onRefreshParent?: () => void;
}

export const RealTimeAuditLogDisplay: React.FC<RealTimeAuditLogDisplayProps> = ({
  ownerId,
  onRefreshParent,
}) => {
  const [events, setEvents] = useState<NetworkAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'ALL' | NetworkAuditCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<NetworkAuditEvent | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [copiedText, setCopiedText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [flashNewId, setFlashNewId] = useState<string | null>(null);

  const fetchEvents = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.getNetworkAuditEvents(ownerId, activeCategory);
      if (res && res.events) {
        setEvents(res.events);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('[AuditLog] Error fetching events:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(true);
  }, [ownerId, activeCategory]);

  // Automated Real-Time Stream Poller (every 3.5 seconds when active)
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      fetchEvents(false);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveActive, activeCategory, ownerId]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Simulate Instant Real-Time Event (Interactive demo capability)
  const handleSimulateEvent = async (type: 'CONFIG' | 'GUEST') => {
    setIsSimulating(true);
    try {
      let mockEvent: Partial<NetworkAuditEvent>;
      const randId = Math.floor(10 + Math.random() * 89);
      const randOctet = Math.floor(50 + Math.random() * 150);

      if (type === 'CONFIG') {
        const configs = [
          {
            eventType: 'CONFIG_BANDWIDTH_LIMIT_CHANGED',
            title: 'Dynamic Bandwidth Queue Adjusted',
            description: `Bandwidth download limit set to ${randId} Mbps on interface bridge-hotspot for peak evening demand.`,
            severity: 'INFO' as const,
            metadata: { queue: 'Simple-Queue-Hotspot', rate: `${randId}M/15M` },
          },
          {
            eventType: 'CONFIG_HOTSPOT_PROFILE_SYNCED',
            title: 'Captive Portal Rate Card Re-synced',
            description: `Synchronized updated custom packages to Gateway (192.168.88.1). Active sessions notified.`,
            severity: 'SUCCESS' as const,
            metadata: { syncType: 'REST API', target: 'MikroTik Hotspot' },
          },
          {
            eventType: 'CONFIG_FIREWALL_NAT_APPLIED',
            title: 'Walled Garden Passthrough Rule Updated',
            description: `Added Safaricom STK Push gateway route (196.201.214.${randOctet}) to unauthenticated bypass list.`,
            severity: 'SUCCESS' as const,
          },
        ];
        const chosen = configs[Math.floor(Math.random() * configs.length)];
        mockEvent = {
          category: 'ROUTER_CONFIG',
          eventType: chosen.eventType,
          title: chosen.title,
          description: chosen.description,
          severity: chosen.severity,
          routerId: 'rtr-01',
          routerName: 'Kiambu Main Gateway',
          actor: 'Raymond Kamau (Router Owner)',
          targetIp: '192.168.88.1',
          metadata: chosen.metadata,
        };
      } else {
        const guests = [
          {
            eventType: 'GUEST_DEVICE_ASSOCIATED',
            title: 'New Guest Associated to AP',
            description: `Device associated on AP 01 Kiambu Market (Signal -${Math.floor(50 + Math.random() * 25)} dBm, WiFi 6).`,
            severity: 'INFO' as const,
            actor: 'AP 01 Kiambu Market',
          },
          {
            eventType: 'GUEST_SESSION_AUTHORIZED',
            title: 'Guest Authorized via M-Pesa STK Push',
            description: `Payment KES ${randId >= 50 ? '60' : '30'} verified. High-speed session unlocked for IP 192.168.88.${randOctet}.`,
            severity: 'SUCCESS' as const,
            actor: 'Daraja Callback IPN',
          },
          {
            eventType: 'GUEST_DHCP_LEASE_GRANTED',
            title: 'DHCP Dynamic IP Lease Issued',
            description: `Assigned 192.168.88.${randOctet} to client device (MAC E4:5F:01:AA:${randId}:${randId}).`,
            severity: 'INFO' as const,
            actor: 'RouterOS DHCP Server',
          },
        ];
        const chosen = guests[Math.floor(Math.random() * guests.length)];
        mockEvent = {
          category: chosen.eventType === 'GUEST_SESSION_AUTHORIZED' ? 'PAYMENT_AUTH' : 'GUEST_CONNECTION',
          eventType: chosen.eventType,
          title: chosen.title,
          description: chosen.description,
          severity: chosen.severity,
          routerId: 'rtr-01',
          routerName: 'Kiambu Main Gateway',
          accessPointName: 'AP 01 Kiambu Market',
          actor: chosen.actor,
          targetIp: `192.168.88.${randOctet}`,
          targetMac: `DC:A6:32:89:${randId}:${randId}`,
        };
      }

      const res = await api.createNetworkAuditEvent(ownerId, mockEvent);
      if (res && res.event) {
        setFlashNewId(res.event.id);
        setEvents((prev) => [res.event, ...prev]);
        setTimeout(() => setFlashNewId(null), 3000);
      }
    } catch (err) {
      console.warn('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (activeCategory !== 'ALL' && e.category !== activeCategory) return false;
    if (severityFilter !== 'ALL' && e.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        (e.targetIp && e.targetIp.includes(q)) ||
        (e.targetMac && e.targetMac.toLowerCase().includes(q)) ||
        (e.routerName && e.routerName.toLowerCase().includes(q)) ||
        (e.accessPointName && e.accessPointName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const configCount = events.filter((e) => e.category === 'ROUTER_CONFIG').length;
  const guestCount = events.filter((e) => e.category === 'GUEST_CONNECTION').length;
  const paymentCount = events.filter((e) => e.category === 'PAYMENT_AUTH').length;
  const securityCount = events.filter((e) => e.category === 'SECURITY').length;

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 15) return 'Just now';
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getCategoryIcon = (category: NetworkAuditCategory) => {
    switch (category) {
      case 'ROUTER_CONFIG':
        return <Settings className="w-4 h-4 text-amber-400" />;
      case 'GUEST_CONNECTION':
        return <Wifi className="w-4 h-4 text-sky-400" />;
      case 'PAYMENT_AUTH':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'SUCCESS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'INFO':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Top Header with Live Streaming Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Automated Network & Hardware Audit Stream
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  <span
                    className={`w-2 h-2 rounded-full bg-emerald-400 ${
                      isLiveActive ? 'animate-ping' : 'opacity-40'
                    }`}
                  />
                  <span>{isLiveActive ? 'LIVE STREAMING' : 'STREAM PAUSED'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time chronological telemetry highlighting router configuration changes and guest connection events.
              </p>
            </div>
          </div>
        </div>

        {/* Live Stream Controls & Test Simulators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              isLiveActive
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md'
            }`}
          >
            {isLiveActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulateEvent('CONFIG')}
            title="Inject simulated router config change"
            className="px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/30 text-amber-300 font-bold rounded-xl flex items-center gap-1 transition-all disabled:opacity-50"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Config Event</span>
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulateEvent('GUEST')}
            title="Inject simulated guest connection event"
            className="px-3 py-1.5 bg-sky-950/70 hover:bg-sky-900 border border-sky-500/30 text-sky-300 font-bold rounded-xl flex items-center gap-1 transition-all disabled:opacity-50"
          >
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Guest Event</span>
          </button>

          <button
            type="button"
            onClick={() => fetchEvents(false)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            title="Force refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Tabs & Quick Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'ALL'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All Telemetry</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === 'ALL' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {events.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('ROUTER_CONFIG')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'ROUTER_CONFIG'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Router Config Changes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === 'ROUTER_CONFIG'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
              }`}
            >
              {configCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('GUEST_CONNECTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'GUEST_CONNECTION'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Guest Connections</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === 'GUEST_CONNECTION'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-sky-950/60 text-sky-300 border border-sky-800/40'
              }`}
            >
              {guestCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('PAYMENT_AUTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'PAYMENT_AUTH'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Payments & Vouchers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === 'PAYMENT_AUTH'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
              }`}
            >
              {paymentCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('SECURITY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'SECURITY'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security Alerts</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === 'SECURITY'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
              }`}
            >
              {securityCount}
            </span>
          </button>
        </div>

        {/* Search & Severity Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IP, MAC, Router..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Severities</option>
            <option value="SUCCESS">Success</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Real-Time Feed List */}
      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
            <Activity className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-white">No Telemetry Events Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No router configuration changes or guest connection events match your current filter. Try adjusting search filters or trigger a test event.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                  setSeverityFilter('ALL');
                }}
                className="px-3 py-1.5 bg-slate-800 text-sky-400 text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => handleSimulateEvent('CONFIG')}
                className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Simulate Router Config Event
              </button>
            </div>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isJustAdded = evt.id === flashNewId;
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isJustAdded
                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 animate-pulse'
                    : 'bg-slate-950 hover:bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      evt.category === 'ROUTER_CONFIG'
                        ? 'bg-amber-400/10 border-amber-400/30'
                        : evt.category === 'GUEST_CONNECTION'
                        ? 'bg-sky-500/10 border-sky-500/30'
                        : evt.category === 'PAYMENT_AUTH'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    {getCategoryIcon(evt.category)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {evt.title}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-md text-[10px] font-bold uppercase border ${getSeverityBadge(
                          evt.severity
                        )}`}
                      >
                        {evt.severity}
                      </span>
                      {evt.category === 'ROUTER_CONFIG' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                          ROUTER CONFIG
                        </span>
                      )}
                      {evt.category === 'GUEST_CONNECTION' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-950/60 text-sky-400 border border-sky-800/40">
                          GUEST EVENT
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Metadata Pill Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
                      {evt.routerName && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-amber-400" />
                          <span>{evt.routerName}</span>
                        </span>
                      )}
                      {evt.accessPointName && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-sky-400" />
                          <span>{evt.accessPointName}</span>
                        </span>
                      )}
                      {evt.targetIp && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-sky-300">
                          IP: {evt.targetIp}
                        </span>
                      )}
                      {evt.targetMac && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">
                          MAC: {evt.targetMac}
                        </span>
                      )}
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">Actor: <strong className="text-white">{evt.actor}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right side relative time and inspect arrow */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400 font-semibold block">
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last automated sync: <strong className="text-white font-mono">{lastRefreshed}</strong></span>
          <span>·</span>
          <span>Buffer: <strong className="text-sky-400 font-mono">{events.length}</strong> events stored</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Integrated with MikroTik RouterOS API, Daraja STK Push callbacks & DHCP daemon
        </div>
      </div>

      {/* EVENT DETAILS INSPECTOR MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                  {getCategoryIcon(selectedEvent.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.2 rounded-md text-[10px] font-bold uppercase border ${getSeverityBadge(
                        selectedEvent.severity
                      )}`}
                    >
                      {selectedEvent.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {selectedEvent.category}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Description
                </label>
                <p className="text-sm text-slate-200 mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Event Type</span>
                  <div className="font-mono text-amber-300 font-bold">{selectedEvent.eventType}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Actor / Trigger</span>
                  <div className="text-white font-semibold">{selectedEvent.actor}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Router Gateway</span>
                  <div className="text-sky-400 font-semibold">{selectedEvent.routerName || 'Central Hub'}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Timestamp</span>
                  <div className="font-mono text-slate-300">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* IP / MAC Copy Controls */}
              {(selectedEvent.targetIp || selectedEvent.targetMac) && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 font-mono text-xs">
                    {selectedEvent.targetIp && <div>IP: <strong className="text-sky-400">{selectedEvent.targetIp}</strong></div>}
                    {selectedEvent.targetMac && <div>MAC: <strong className="text-emerald-400">{selectedEvent.targetMac}</strong></div>}
                  </div>

                  <div className="flex gap-2">
                    {selectedEvent.targetIp && (
                      <button
                        onClick={() => handleCopy(selectedEvent.targetIp!, 'IP')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedText === 'IP' ? 'Copied' : 'Copy IP'}</span>
                      </button>
                    )}
                    {selectedEvent.targetMac && (
                      <button
                        onClick={() => handleCopy(selectedEvent.targetMac!, 'MAC')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedText === 'MAC' ? 'Copied' : 'Copy MAC'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Raw Event Metadata Dump */}
              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Event Metadata Payload
                  </label>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto mt-1">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
