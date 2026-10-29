import React, { useState } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Check,
  ShieldCheck,
  Send,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { EmailConfig } from '../../../types/index.ts';

interface EmailSettingsTabProps {
  ownerId: string;
}

export const EmailSettingsTab: React.FC<EmailSettingsTabProps> = ({ ownerId }) => {
  const [form, setForm] = useState<EmailConfig>({
    provider: 'resend',
    apiKey: 're_8291048201_brisk_kiambu_secure',
    senderEmail: 'billing@kiambuwifi.co.ke',
    senderName: 'Kiambu Smart WiFi Billing',
    domainVerified: true,
    status: 'CONNECTED',
    testRecipient: 'owner@briskconnect.co.ke',
  });

  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.saveOwnerIntegration(ownerId, {
        providerType: 'email',
        providerName: form.provider.toUpperCase(),
        environment: 'production',
        config: form,
      });
      setSuccessMsg('Email configuration saved and encrypted successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save email settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!form.testRecipient) {
      setErrorMsg('Please enter a test recipient email.');
      return;
    }
    setTesting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.sendTestNotification(ownerId, {
        channel: 'EMAIL',
        recipient: form.testRecipient,
        message: 'This is a test receipt and operational notice from BRISK Smart Connect.',
      });
      setSuccessMsg(res.message || `Test email sent to ${form.testRecipient}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send test email.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">Email Provider Configuration</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Verified Sender
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deliver branded PDF invoices, customer receipts, and network incident updates via email.
          </p>
        </div>
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
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="font-bold text-white text-sm">1. Delivery Engine & Sender Identity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Provider Adapter *</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="resend">Resend Developer API (Recommended)</option>
                <option value="brevo">Brevo (formerly Sendinblue)</option>
                <option value="sendgrid">Twilio SendGrid</option>
                <option value="smtp">Custom SMTP Server</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sender Display Name *</label>
              <input
                type="text"
                required
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Verified Sender Email *</label>
              <input
                type="email"
                required
                value={form.senderEmail}
                onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">API Key *</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <h3 className="font-bold text-white text-sm">2. Dispatch Test Email</h3>
          <div className="flex gap-2 max-w-md">
            <input
              type="email"
              value={form.testRecipient}
              onChange={(e) => setForm({ ...form, testRecipient: e.target.value })}
              placeholder="recipient@domain.com"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
            />
            <button
              type="button"
              disabled={testing}
              onClick={handleSendTestEmail}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testing ? 'Sending...' : 'Send Test'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Email Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
