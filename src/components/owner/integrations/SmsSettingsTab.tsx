import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  ExternalLink,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { SmsConfig } from '../../../types/index.ts';

interface SmsSettingsTabProps {
  ownerId: string;
}

export const SmsSettingsTab: React.FC<SmsSettingsTabProps> = ({ ownerId }) => {
  const [form, setForm] = useState<SmsConfig>({
    provider: 'africas_talking',
    username: 'kiambuwifi_sandbox',
    apiKey: 'atsk_d8291048a9104f9810482910481048b',
    senderId: 'BRISK_WIFI',
    apiEndpoint: 'https://api.africastalking.com/version1/messaging',
    remainingCredits: 4850,
    status: 'CONNECTED',
    enabledNotifications: {
      paymentConfirm: true,
      voucherDelivery: true,
      expiryReminder: true,
    },
  });

  const [showKey, setShowKey] = useState(false);
  const [testPhone, setTestPhone] = useState('0799123456');
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
        providerType: 'sms',
        providerName: form.provider === 'africas_talking' ? "Africa's Talking" : 'Twilio SMS',
        environment: 'production',
        config: form,
      });
      setSuccessMsg('SMS Provider credentials saved and encrypted!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save SMS settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone) {
      setErrorMsg('Please specify a phone number for the SMS test.');
      return;
    }
    setTesting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.sendTestNotification(ownerId, {
        channel: 'SMS',
        recipient: testPhone,
        message: 'BRISK WiFi SMS Test: Your gateway connection is verified.',
      });
      setSuccessMsg(res.message || `Test SMS dispatched to ${testPhone} via ${form.provider}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'SMS test failed; verify your API key and balance.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">SMS Gateway Configuration</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Telco Gateway
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Send voucher PIN scratchcards and payment alerts directly to non-smartphone or offline users.
          </p>
        </div>

        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <Coins className="w-4 h-4 text-amber-400" />
          <div className="text-xs">
            <span className="text-slate-400">Available Credits:</span>{' '}
            <strong className="text-emerald-400 font-mono">KES {form.remainingCredits?.toLocaleString()}</strong>
          </div>
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
          <h3 className="font-bold text-white text-sm">1. SMS Provider Selection</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Provider Adapter *</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="africas_talking">Africa's Talking (Kenya / East Africa)</option>
                <option value="twilio">Twilio Global SMS</option>
                <option value="advanta">Advanta SMS Africa</option>
                <option value="sms_leopard">SMS Leopard</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sender ID (Branded Alpha Tag)</label>
              <input
                type="text"
                value={form.senderId}
                onChange={(e) => setForm({ ...form, senderId: e.target.value })}
                placeholder="e.g. BRISK_WIFI"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="font-bold text-white text-sm">2. Provider API Credentials</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username / Account ID *</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">API Key / Auth Token *</label>
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

        {/* Test SMS */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <h3 className="font-bold text-white text-sm">3. Dispatch Test SMS</h3>
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
              onClick={handleSendTestSms}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testing ? 'Sending...' : 'Send Test SMS'}</span>
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
            <span>{loading ? 'Saving...' : 'Save SMS Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
