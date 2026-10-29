import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { NotificationLog } from '../../../types/index.ts';

interface NotificationLogsTabProps {
  ownerId: string;
}

export const NotificationLogsTab: React.FC<NotificationLogsTabProps> = ({ ownerId }) => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'WHATSAPP' | 'SMS' | 'EMAIL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'SENT' | 'PENDING' | 'FAILED'>('ALL');
  const [search, setSearch] = useState('');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotificationLogs(ownerId, {
        channel: channelFilter !== 'ALL' ? channelFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res && res.logs) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [ownerId, channelFilter, statusFilter]);

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    try {
      await api.retryNotification(ownerId, logId);
      loadLogs();
    } catch (err: any) {
      alert(err.message || 'Retry failed.');
    } finally {
      setRetryingId(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (search && !log.recipientMasked.includes(search) && !log.providerMessageId.includes(search) && !log.notificationType.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Delivery History & Message Logs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery receipts, provider message IDs, and failure diagnostics across all channels.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient or ID..."
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs w-48 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['ALL', 'WHATSAPP', 'SMS', 'EMAIL'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  channelFilter === ch ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['ALL', 'DELIVERED', 'SENT', 'FAILED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  statusFilter === st ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          Showing <strong>{filteredLogs.length}</strong> events
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Notification Type</th>
                <th className="p-3.5">Recipient</th>
                <th className="p-3.5">Provider Ref ID</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No message delivery logs matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-bold">
                      <span className="flex items-center gap-1.5">
                        {log.channel === 'WHATSAPP' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                        {log.channel === 'SMS' && <Send className="w-3.5 h-3.5 text-sky-400" />}
                        {log.channel === 'EMAIL' && <Mail className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="text-slate-200">{log.channel}</span>
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      {log.notificationType.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {log.recipientMasked}
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-slate-400 max-w-[150px] truncate">
                      {log.providerMessageId}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'SENT'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : log.status === 'PENDING'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {log.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                        {log.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {log.status === 'FAILED' ? (
                        <button
                          type="button"
                          disabled={retryingId === log.id}
                          onClick={() => handleRetry(log.id)}
                          className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-300 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          {retryingId === log.id ? 'Retrying...' : 'Safe Retry'}
                        </button>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
