import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { WebhookEndpoint } from '../../../types/index.ts';

interface WebhookSettingsTabProps {
  ownerId: string;
}

export const WebhookSettingsTab: React.FC<WebhookSettingsTabProps> = ({ ownerId }) => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState('');

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const res = await api.getWebhooks(ownerId);
      if (res && res.webhooks) {
        setWebhooks(res.webhooks);
      }
    } catch (err) {
      console.warn('Failed to load webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, [ownerId]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSimulateWebhook = async (provider: string) => {
    setSimulating(provider);
    setResultMsg('');
    try {
      await api.verifyWebhook(ownerId, provider);
      setResultMsg(`Mock IPN test ping for ${provider.toUpperCase()} processed with HTTP 200 and signature validated!`);
      loadWebhooks();
    } catch (err: any) {
      setResultMsg(`Webhook verification failed: ${err.message}`);
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Inbound Webhook Endpoints</h2>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated HTTPS callback endpoints for Safaricom Daraja IPN, Meta WhatsApp Cloud webhooks, and SMS delivery receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadWebhooks}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {resultMsg && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resultMsg}</span>
        </div>
      )}

      {/* Webhook Endpoints List */}
      <div className="space-y-4">
        {webhooks.map((wh) => (
          <div
            key={wh.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs uppercase">
                  {wh.provider.slice(0, 3)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {wh.provider === 'mpesa'
                      ? 'Safaricom Daraja Lipa na M-Pesa IPN'
                      : wh.provider === 'whatsapp'
                      ? 'Meta WhatsApp Cloud API Webhook'
                      : wh.provider === 'sms'
                      ? 'SMS Delivery Receipts (DLR) Webhook'
                      : 'Email Event Webhook'}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Signature Header: <span className="font-mono text-amber-300">{wh.signatureHeader}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{wh.status}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {wh.eventsReceived.toLocaleString()} events received
                </span>
              </div>
            </div>

            {/* URL Box */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="font-mono text-emerald-400 truncate">{wh.endpointUrl}</span>
              <button
                type="button"
                onClick={() => handleCopy(wh.id, wh.endpointUrl)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedId === wh.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === wh.id ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>

            {/* Secret & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="text-slate-400 text-[11px]">
                Secret Token: <strong className="font-mono text-white">{wh.secretToken}</strong> · Last callback: <span className="text-slate-300">{wh.lastReceivedAt || 'Today at 11:20 AM'}</span>
              </div>

              <button
                type="button"
                disabled={simulating === wh.provider}
                onClick={() => handleSimulateWebhook(wh.provider)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{simulating === wh.provider ? 'Simulating...' : 'Simulate Ping (200 OK)'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
