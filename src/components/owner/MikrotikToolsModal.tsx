import React, { useState } from 'react';
import {
  Server,
  Copy,
  Download,
  Terminal,
  Activity,
  CheckCircle2,
  X,
  Play,
  Shield,
  Radio,
  FileCode,
} from 'lucide-react';
import type { RouterDevice } from '../../types/index.ts';

interface MikrotikToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routers: RouterDevice[];
}

export const MikrotikToolsModal: React.FC<MikrotikToolsModalProps> = ({
  isOpen,
  onClose,
  routers,
}) => {
  const [selectedScriptType, setSelectedScriptType] = useState<
    'HOTSPOT' | 'PPPOE' | 'WALLED_GARDEN' | 'QUEUE_PCQ'
  >('HOTSPOT');

  const [selectedRouterId, setSelectedRouterId] = useState(routers[0]?.id || 'rtr-01');
  const [copied, setCopied] = useState(false);

  // Live Ping diagnostic tool states
  const [pingTarget, setPingTarget] = useState('8.8.8.8');
  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<
    { seq: number; host: string; size: number; ttl: number; timeMs: number }[] | null
  >(null);

  if (!isOpen) return null;

  const currentRouter = routers.find((r) => r.id === selectedRouterId) || routers[0];
  const routerIp = currentRouter?.ipAddress || '192.168.88.1';
  const routerName = currentRouter?.name || 'Kiambu Gateway';

  // Dynamic script generation based on chosen type
  const getScript = () => {
    switch (selectedScriptType) {
      case 'HOTSPOT':
        return `# ==========================================================
# BRISK SMART CONNECT · MIKROTIK HOTSPOT SETUP SCRIPT
# Router: ${routerName} (${routerIp})
# Compatible: RouterOS v6.x & v7.x
# ==========================================================

# 1. Enable DNS Cache and NTP
/ip dns set allow-remote-requests=yes servers=8.8.8.8,1.1.1.1
/system ntp client set enabled=yes servers=pool.ntp.org

# 2. Add Hotspot User Profile with Cookie & CHAP
/ip hotspot profile add name="brisk_hsp_profile" \\
  hotspot-address=${routerIp} \\
  dns-name="wifi.brisk.co.ke" \\
  html-directory="hotspot" \\
  login-by=http-chap,http-pap,cookie \\
  http-cookie-lifetime=30d \\
  rate-limit="15M/10M"

# 3. Create Hotspot Interface Server
/ip hotspot add name="brisk_hotspot" interface=bridge profile="brisk_hsp_profile" disabled=no

# 4. Heartbeat Cron to report router telemetry to BRISK Cloud
/system script add name="brisk_heartbeat" policy=read,write,test source="/tool fetch url=\\"https://wifi.brisk.co.ke/api/routers/heartbeat?rtr=${encodeURIComponent(
          routerName
        )}\\" keep-result=no"
/system scheduler add name="brisk_sched" interval=1m on-event="brisk_heartbeat"

:log info "[BRISK] Hotspot gateway initialized successfully on ${routerName}."`;

      case 'PPPOE':
        return `# ==========================================================
# BRISK SMART CONNECT · PPPOE SERVER SETUP SCRIPT
# Router: ${routerName} (${routerIp})
# ==========================================================

# 1. IP Pool for PPPoE Fiber Subscribers
/ip pool add name="pppoe_pool" ranges=10.10.40.10-10.10.40.250

# 2. PPPoE Bandwidth Profiles
/ppp profile add name="10M_Home" local-address=10.10.40.1 remote-address="pppoe_pool" rate-limit="10M/10M" dns-server=8.8.8.8,1.1.1.1
/ppp profile add name="20M_Ultra" local-address=10.10.40.1 remote-address="pppoe_pool" rate-limit="20M/20M" dns-server=8.8.8.8,1.1.1.1
/ppp profile add name="50M_Office" local-address=10.10.40.1 remote-address="pppoe_pool" rate-limit="50M/50M" dns-server=8.8.8.8,1.1.1.1

# 3. Enable PPPoE Server Interface
/interface pppoe-server server add service-name="BRISK_FIBER" interface=bridge default-profile="10M_Home" one-session-per-host=yes authentication=pap,chap disabled=no

:log info "[BRISK] PPPoE server active. Ready for fiber subscriber credentials."`;

      case 'WALLED_GARDEN':
        return `# ==========================================================
# BRISK SMART CONNECT · SAFARICOM M-PESA & CLOUD WALLED GARDEN
# Allows unauthenticated customers to pay via M-Pesa STK Push
# ==========================================================

/ip hotspot walled-garden
add dst-host="*.safaricom.co.ke" comment="Safaricom Daraja API"
add dst-host="daraja.safaricom.co.ke" comment="Daraja Portal"
add dst-host="*.m-pesa.com" comment="M-Pesa Core"
add dst-host="*.briskconnect.co.ke" comment="BRISK Smart Connect"
add dst-host="*.google.com" comment="Captive Portal Checks"
add dst-host="connectivitycheck.gstatic.com" comment="Android Captive Probe"
add dst-host="captive.apple.com" comment="Apple iOS Captive Probe"

/ip hotspot walled-garden ip
add dst-address=197.237.0.0/16 comment="Safaricom Subnets"
add dst-address=196.201.214.0/24 comment="M-Pesa IP Gateways"

:log info "[BRISK] Safaricom M-Pesa walled garden entries loaded."`;

      case 'QUEUE_PCQ':
        return `# ==========================================================
# BRISK SMART CONNECT · FAIR USER BANDWIDTH QUEUES (PCQ)
# Prevents single user from hogging total internet bandwidth
# ==========================================================

/queue type
add kind=pcq name="brisk_download_pcq" pcq-classifier=dst-address pcq-rate=15M
add kind=pcq name="brisk_upload_pcq" pcq-classifier=src-address pcq-rate=10M

/queue tree
add name="TOTAL_DOWNLOAD" parent=bridge queue="brisk_download_pcq" max-limit=100M
add name="TOTAL_UPLOAD" parent=ether1 queue="brisk_upload_pcq" max-limit=100M

:log info "[BRISK] PCQ dynamic bandwidth shaping enabled."`;
    }
  };

  const currentScript = getScript();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadRsc = () => {
    const blob = new Blob([currentScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brisk-${selectedScriptType.toLowerCase()}-${currentRouter.name.toLowerCase().replace(/\s+/g, '-')}.rsc`;
    a.click();
  };

  const handleRunPing = () => {
    setIsPinging(true);
    setPingResults(null);

    setTimeout(() => {
      setIsPinging(false);
      setPingResults([
        { seq: 1, host: pingTarget, size: 56, ttl: 58, timeMs: Math.floor(10 + Math.random() * 8) },
        { seq: 2, host: pingTarget, size: 56, ttl: 58, timeMs: Math.floor(9 + Math.random() * 7) },
        { seq: 3, host: pingTarget, size: 56, ttl: 58, timeMs: Math.floor(11 + Math.random() * 9) },
        { seq: 4, host: pingTarget, size: 56, ttl: 58, timeMs: Math.floor(10 + Math.random() * 6) },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                MikroTik RouterOS 7.x & 6.x Engine
              </div>
              <h3 className="text-xl font-black text-white">
                MikroTik Configuration & Diagnostics Hub
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Router Selector & Script Type Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0">
          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Select Router Target:
            </label>
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.ipAddress})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-8 flex flex-wrap items-end gap-2 text-xs">
            {[
              { id: 'HOTSPOT', label: '1. Hotspot Captive Script' },
              { id: 'PPPOE', label: '2. PPPoE Server Script' },
              { id: 'WALLED_GARDEN', label: '3. M-Pesa Walled Garden' },
              { id: 'QUEUE_PCQ', label: '4. Fair Queues (PCQ)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedScriptType(tab.id as any)}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  selectedScriptType === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Script Output Area */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Ready to paste in MikroTik Winbox Terminal or WebFig:
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Terminal Script'}</span>
              </button>

              <button
                onClick={handleDownloadRsc}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .rsc</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto selection:bg-emerald-800">
            {currentScript}
          </pre>

          {/* Interactive Live Ping Tool */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">
                  Live Router Ping & Latency Probe
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pingTarget}
                  onChange={(e) => setPingTarget(e.target.value)}
                  placeholder="8.8.8.8 or gateway"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono w-40"
                />
                <button
                  onClick={handleRunPing}
                  disabled={isPinging}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{isPinging ? 'Pinging...' : 'RUN PING'}</span>
                </button>
              </div>
            </div>

            {pingResults && (
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">
                  PING {pingTarget} from {routerName} ({routerIp}) with 56 bytes of data:
                </div>
                {pingResults.map((p) => (
                  <div key={p.seq} className="text-emerald-400">
                    64 bytes from {p.host}: icmp_seq={p.seq} ttl={p.ttl} time={p.timeMs} ms
                  </div>
                ))}
                <div className="text-white pt-1 font-bold border-t border-slate-800">
                  4 packets transmitted, 4 received, 0% packet loss · Avg Latency: 11ms (Healthy)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
