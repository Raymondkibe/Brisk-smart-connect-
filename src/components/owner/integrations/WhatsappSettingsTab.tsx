import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Save,
  Globe,
  Bell,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { WhatsappConfig } from '../../../types/index.ts';

interface WhatsappSettingsTabProps {
  ownerId: string;
}

export const WhatsappSettingsTab: React.FC<WhatsappSettingsTabProps> = ({ ownerId }) => {
  const [form, setForm] = useState<WhatsappConfig>({
    integrationName: 'Meta WhatsApp Cloud API',
    provider: 'meta_cloud',
    wabaId: '108492049102941',
    phoneNumberId: '1048201948201',
    displayPhoneNumber: '+254 722 000 111',
    accessToken: 'EAAGNO4ZB29••••••••••••••••••••••••••••••••••••••••••••••••••',
    appId: '82910492810',
    appSecret: '7c8d9e0f1a2b3c4d5e6f',
    webhookVerifyToken: 'brisk_wa_verify_2026_kiambu',
    webhookStatus: 'VERIFIED',
    defaultLanguage: 'en_US',
    enabledNotifications: {
      paymentConfirm: true,
      receipt: true,
      packageActive: true,
      expiryReminder: true,
      voucherDelivery: true,
      outageAlert: true,
      supportUpdate: true,
      securityAlert: true,
    },
  });

  const [showToken, setShowToken] = useState(false);
  const [testPhone, setTestPhone] = useState('0799123456');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/whatsapp/${ownerId}`
    : `https://brisksmartconnect.vercel.app/api/webhooks/whatsapp/${ownerId}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.saveOwnerIntegration(ownerId, {
        providerType: 'whatsapp',
        providerName: 'Meta WhatsApp Cloud API',
        environment: 'production',
        config: form,
      });
      setSuccessMsg('WhatsApp Cloud API settings saved successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone) {
      setErrorMsg('Please enter a recipient phone number for the test.');
      return;
    }
    setTesting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.sendTestNotification(ownerId, {
        channel: 'WHATSAPP',
        recipient: testPhone,
        message: 'Hello from BRISK Smart Connect! Your WhatsApp notifications are operational.',
      });
      setSuccessMsg(res.message || `Test message dispatched to ${testPhone} via WhatsApp Cloud API!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send WhatsApp test message.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">WhatsApp Business API Settings</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Meta Cloud API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch automatic WhatsApp receipts, voucher codes, and expiry alerts to customers.
          </p>
        </div>

        <a
          href="https://developers.facebook.com/docs/whatsapp/cloud-api"
          target="_blank"
          rel="noreferrer"
          className="text-sky-400 hover:underline flex items-center gap-1.5 text-xs font-semibold"
        >
          <span>Meta Cloud API Documentation</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-950/70 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* API Credentials */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="font-bold text-white text-sm">1. Meta Business Account Identifiers</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">WhatsApp Business Account ID (WABA) *</label>
              <input
                type="text"
                required
                value={form.wabaId}
                onChange={(e) => setForm({ ...form, wabaId: e.target.value })}
                placeholder="e.g. 108492049102941"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number ID *</label>
              <input
                type="text"
                required
                value={form.phoneNumberId}
                onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
                placeholder="e.g. 1048201948201"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Permanent System User Access Token *</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                required
                value={form.accessToken}
                onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
                placeholder="EAAGNO4..."
                className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="font-bold text-white text-sm">2. Meta Inbound Webhook Settings</h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Webhook Callback URL</label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <span className="font-mono text-emerald-400 truncate">{webhookUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2500);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Webhook Verify Token</label>
            <input
              type="text"
              value={form.webhookVerifyToken}
              onChange={(e) => setForm({ ...form, webhookVerifyToken: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
            />
          </div>
        </div>

        {/* Notification Event Toggles */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="font-bold text-white text-sm">3. Automated WhatsApp Event Triggers</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'paymentConfirm', label: 'Payment Confirmation', desc: 'Instant WhatsApp message after M-Pesa' },
              { key: 'receipt', label: 'Digital Purchase Receipt', desc: 'Formatted receipt with transaction code' },
              { key: 'packageActive', label: 'Internet Access Activated', desc: 'Welcome message & speed details' },
              { key: 'expiryReminder', label: 'Expiry Warning (10 mins)', desc: 'Prompt to renew before disconnection' },
              { key: 'voucherDelivery', label: 'Voucher PIN Delivery', desc: 'Send scratchcard PIN via WhatsApp' },
              { key: 'outageAlert', label: 'Router Outage Notification', desc: 'Alert owner when router goes offline' },
              { key: 'supportUpdate', label: 'Support Ticket Replies', desc: 'Send support agent answers' },
              { key: 'securityAlert', label: 'Security & Login Alerts', desc: 'Notice on unfamiliar owner sign-in' },
            ].map((item) => (
              <label
                key={item.key}
                className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(form.enabledNotifications as any)[item.key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      enabledNotifications: {
                        ...form.enabledNotifications,
                        [item.key]: e.target.checked,
                      },
                    })
                  }
                  className="mt-1 rounded border-slate-700 text-amber-400 focus:ring-0"
                />
                <div>
                  <div className="font-bold text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Test Message Runner */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <h3 className="font-bold text-white text-sm">4. Send Test WhatsApp Message</h3>
          <p className="text-slate-400">
            Verify your Meta Business token and phone template by sending an instant test ping.
          </p>
          <div className="flex gap-2 max-w-md">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="0712 345 678"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
            />
            <button
              type="button"
              disabled={testing}
              onClick={handleSendTestMessage}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testing ? 'Sending...' : 'Send Test'}</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save WhatsApp Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
