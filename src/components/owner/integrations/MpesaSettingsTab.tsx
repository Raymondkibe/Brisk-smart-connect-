import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  RotateCw,
  Lock,
  ExternalLink,
  ShieldCheck,
  Save,
  Power,
  Zap,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { MpesaConfig } from '../../../types/index.ts';

interface MpesaSettingsTabProps {
  ownerId: string;
  onNavigateToLogs?: () => void;
}

export const MpesaSettingsTab: React.FC<MpesaSettingsTabProps> = ({
  ownerId,
  onNavigateToLogs,
}) => {
  const [form, setForm] = useState<MpesaConfig>({
    integrationName: 'Daraja Lipa na M-Pesa Production',
    environment: 'production',
    provider: 'daraja',
    consumerKey: '8aK12x9vL0mP4qW7rT2yU5iO8sA3dF6g',
    consumerSecret: '9bL23y0wM1nQ5rX8sU3zV6jP9tB4eG7h',
    shortcode: '174379',
    passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    accountReference: 'BRISK WiFi',
    transactionDesc: 'WiFi Hotspot Access Package',
    callbackUrl: '',
    paymentsEnabled: true,
  });

  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Auto-generate callback URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const generated = `${window.location.origin}/api/webhooks/mpesa/${ownerId}`;
      setForm((prev) => ({ ...prev, callbackUrl: generated }));
    }
  }, [ownerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.saveOwnerIntegration(ownerId, {
        providerType: 'mpesa',
        providerName: 'Safaricom Daraja API',
        environment: form.environment,
        config: form,
      });
      setSuccessMsg('M-Pesa API configuration saved and encrypted successfully on backend!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.testOwnerIntegration(ownerId, 'mpesa', form);
      setSuccessMsg(res.message || 'Daraja authentication successful! Sandbox token generated.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection test failed; verify your Consumer Key and Secret.');
    } finally {
      setTesting(false);
    }
  };

  const handleRotateCredentials = async () => {
    if (!confirm('Rotate M-Pesa Daraja application credentials? Current secret will be revoked.')) return;
    try {
      await api.rotateIntegrationCredentials(ownerId, 'mpesa');
      setSuccessMsg('Credentials rotated. New key version registered in audit ledger.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Rotation failed.');
    }
  };

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(form.callbackUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">Safaricom Daraja M-Pesa Settings</h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                form.environment === 'production'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {form.environment} Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connect your own Till or PayBill number for automated STK Push guest WiFi payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRotateCredentials}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate Keys</span>
          </button>
          {onNavigateToLogs && (
            <button
              type="button"
              onClick={onNavigateToLogs}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-semibold"
            >
              View IPN Logs
            </button>
          )}
        </div>
      </div>

      {/* Notification Banners */}
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

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Environment & Integration Name */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="font-bold text-white text-sm">1. Environment & API Product</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Environment Mode *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, environment: 'sandbox' })}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    form.environment === 'sandbox'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Sandbox (Testing)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, environment: 'production' })}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    form.environment === 'production'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Production (Live M-Pesa)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Integration Label</label>
              <input
                type="text"
                value={form.integrationName}
                onChange={(e) => setForm({ ...form, integrationName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Daraja Credentials Box */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">2. Daraja API Credentials</h3>
            <a
              href="https://developer.safaricom.co.ke/"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Get Safaricom Keys</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Consumer Key *</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  value={form.consumerKey}
                  onChange={(e) => setForm({ ...form, consumerKey: e.target.value })}
                  placeholder="Enter Safaricom Consumer Key"
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

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Consumer Secret *</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={form.consumerSecret}
                  onChange={(e) => setForm({ ...form, consumerSecret: e.target.value })}
                  placeholder="Enter Safaricom Consumer Secret"
                  className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Business Shortcode (Paybill/Till) *</label>
              <input
                type="text"
                required
                value={form.shortcode}
                onChange={(e) => setForm({ ...form, shortcode: e.target.value })}
                placeholder="e.g. 174379 or your Paybill/Till"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Reference</label>
              <input
                type="text"
                value={form.accountReference}
                onChange={(e) => setForm({ ...form, accountReference: e.target.value })}
                placeholder="e.g. WiFi Pass"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Passkey (Required for STK Push) *</label>
            <div className="relative">
              <input
                type={showPasskey ? 'text' : 'password'}
                required
                value={form.passkey}
                onChange={(e) => setForm({ ...form, passkey: e.target.value })}
                placeholder="Enter Safaricom Daraja Online Passkey"
                className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Callback URL Box */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <h3 className="font-bold text-white text-sm">3. Platform Callback & Webhook URL</h3>
          <p className="text-slate-400">
            Paste this URL into your Safaricom Developer Portal App under <strong>Validation / Confirmation URL</strong>.
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <span className="font-mono text-emerald-400 truncate">{form.callbackUrl}</span>
            <button
              type="button"
              onClick={handleCopyCallback}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.paymentsEnabled}
              onChange={(e) => setForm({ ...form, paymentsEnabled: e.target.checked })}
              className="rounded border-slate-700 text-amber-400 focus:ring-0 w-4 h-4"
            />
            <span className="font-semibold text-white">Enable Live M-Pesa checkouts on Captive Portal</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
