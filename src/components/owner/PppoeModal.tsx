import React, { useState } from 'react';
import { Network, X, CheckCircle2, ShieldCheck, Copy, Plus } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { RouterDevice } from '../../types/index.ts';

interface PppoeModalProps {
  isOpen: boolean;
  onClose: () => void;
  routers: RouterDevice[];
  onSuccess: () => void;
}

export const PppoeModal: React.FC<PppoeModalProps> = ({
  isOpen,
  onClose,
  routers,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('Secret2026!');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [routerName, setRouterName] = useState(routers[0]?.name || 'Kiambu Gateway');
  const [speed, setSpeed] = useState('20 Mbps / 15 Mbps');
  const [ipAddress, setIpAddress] = useState(`10.10.40.${Math.floor(10 + Math.random() * 200)}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedMikrotikCommand, setGeneratedMikrotikCommand] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.addPppoeUser({
        username: username.trim(),
        password,
        routerName,
        speed,
        ipAddress,
      });

      // Generate the exact MikroTik command for Winbox
      const cmd = `/ppp secret add name="${username.trim()}" password="${password}" service=pppoe profile="10M_Home" local-address=10.10.40.1 remote-address=${ipAddress} comment="${clientName || username} (${phone})"`;
      setGeneratedMikrotikCommand(cmd);

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create PPPoE subscriber');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              PPPoE Fixed Broadband Subscriber
            </div>
            <h3 className="text-xl font-black text-white">Add Fiber / PPPoE Client</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {generatedMikrotikCommand ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-2">
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Subscriber Added Successfully!</span>
              </div>
              <p className="text-xs text-slate-300">
                The account has been recorded in BRISK. Paste this command in your MikroTik terminal if running manual sync:
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">MikroTik CLI Secret Command:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedMikrotikCommand);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Command'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto">
                {generatedMikrotikCommand}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Samuel Karanja"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone (for M-Pesa)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">PPPoE Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. samuel_fiber"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">PPPoE Secret / Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Service Profile / Speed</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="10 Mbps / 10 Mbps">Home Standard (10 Mbps · KES 1,500/mo)</option>
                  <option value="20 Mbps / 15 Mbps">Home Ultra (20 Mbps · KES 2,500/mo)</option>
                  <option value="50 Mbps / 30 Mbps">Business Pro (50 Mbps · KES 4,500/mo)</option>
                  <option value="100 Mbps / 50 Mbps">Enterprise Dedicated (100 Mbps · KES 8,500/mo)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Static IP Address</label>
                <input
                  type="text"
                  required
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Target Gateway Router</label>
              <select
                value={routerName}
                onChange={(e) => setRouterName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                {routers.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.model} · {r.ipAddress})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'CREATE PPPOE SUBSCRIBER'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
