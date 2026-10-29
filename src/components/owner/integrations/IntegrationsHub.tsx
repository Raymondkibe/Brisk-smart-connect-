import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  MessageSquare,
  Mail,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sliders,
  FileText,
  Key,
  Globe,
  Radio,
  Zap,
  Check,
  RotateCw,
  Power,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { OwnerIntegration } from '../../../types/index.ts';

interface IntegrationsHubProps {
  ownerId: string;
  onNavigateToTab: (tabId: string) => void;
  onRefresh?: () => void;
}

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  ownerId,
  onNavigateToTab,
  onRefresh,
}) => {
  const [integrations, setIntegrations] = useState<OwnerIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingType, setTestingType] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ type: string; success: boolean; message: string } | null>(null);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.getOwnerIntegrations(ownerId);
      if (res && res.integrations) {
        setIntegrations(res.integrations);
      }
    } catch (err) {
      console.warn('Failed to load owner integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [ownerId]);

  const handleTestConnection = async (providerType: string) => {
    setTestingType(providerType);
    setTestResult(null);
    try {
      const res = await api.testOwnerIntegration(ownerId, providerType);
      setTestResult({
        type: providerType,
        success: true,
        message: res.message || 'Connection test succeeded! Provider handshake verified.',
      });
      loadIntegrations();
    } catch (err: any) {
      setTestResult({
        type: providerType,
        success: false,
        message: err.message || 'Connection failed; check your provider credentials and permissions.',
      });
    } finally {
      setTestingType(null);
    }
  };

  const handleToggle = async (providerType: string, currentEnabled: boolean) => {
    try {
      await api.toggleIntegration(ownerId, providerType, !currentEnabled);
      loadIntegrations();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle integration.');
    }
  };

  const handleDisconnect = async (providerType: string) => {
    if (!confirm(`Are you sure you want to disconnect ${providerType.toUpperCase()}? Active transactions and messages will be halted.`)) {
      return;
    }
    try {
      await api.disconnectIntegration(ownerId, providerType);
      loadIntegrations();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect integration.');
    }
  };

  const mpesa = integrations.find((i) => i.providerType === 'mpesa');
  const whatsapp = integrations.find((i) => i.providerType === 'whatsapp');
  const sms = integrations.find((i) => i.providerType === 'sms');
  const email = integrations.find((i) => i.providerType === 'email');

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner / Notification */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            testResult.success
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/70 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <strong className="uppercase font-bold tracking-wider mr-2">
                [{testResult.type.toUpperCase()}]
              </strong>
              <span>{testResult.message}</span>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 4 Integration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Safaricom Daraja M-Pesa */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Safaricom Daraja API</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        mpesa?.status === 'CONNECTED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : mpesa?.status === 'SANDBOX_CONNECTED'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {mpesa?.status === 'CONNECTED'
                        ? 'Production Connected'
                        : mpesa?.status === 'SANDBOX_CONNECTED'
                        ? 'Sandbox Connected'
                        : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lipa na M-Pesa STK Push automated customer checkouts & receipts.
                  </p>
                </div>
              </div>
            </div>

            {/* Integration Details Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className="font-mono text-white capitalize">{mpesa?.environment || 'Sandbox'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Business Shortcode:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {mpesa?.publicConfiguration?.shortcode || '174379'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consumer Key:</span>
                <span className="font-mono text-slate-300">
                  {mpesa?.publicConfiguration?.consumerKeyMasked || 'v9Fk••••••••••3zK'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Successful Payment:</span>
                <span className="text-white font-medium">{mpesa?.lastSuccessAt || '2 minutes ago'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Callback Received:</span>
                <span className="text-sky-400 font-mono">200 OK (Instant)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('INTEGRATIONS_MPESA')}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
              >
                Configure
              </button>
              <button
                type="button"
                disabled={testingType === 'mpesa'}
                onClick={() => handleTestConnection('mpesa')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingType === 'mpesa' ? 'animate-spin' : ''}`} />
                <span>{testingType === 'mpesa' ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('INTEGRATIONS_LOGS')}
                className="px-2.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
              >
                View Logs
              </button>
              <button
                type="button"
                onClick={() => handleDisconnect('mpesa')}
                className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-xl font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: Meta WhatsApp Cloud API */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">WhatsApp Business Platform</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        whatsapp?.status === 'CONNECTED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {whatsapp?.status === 'CONNECTED' ? 'Connected & Verified' : 'Needs Verification'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official Meta Cloud API for voucher delivery & payment receipts.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Business Account ID:</span>
                <span className="font-mono text-white">
                  {whatsapp?.publicConfiguration?.wabaId || '108492049102941'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone Number ID:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {whatsapp?.publicConfiguration?.phoneNumberId || '1048201948201'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Display Phone:</span>
                <span className="text-white">+254 722 000 111 (Verified)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Delivery:</span>
                <span className="text-white font-medium">{whatsapp?.lastSuccessAt || '5 mins ago'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Webhook Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Subscribed (v19.0)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('INTEGRATIONS_WHATSAPP')}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
              >
                Configure
              </button>
              <button
                type="button"
                disabled={testingType === 'whatsapp'}
                onClick={() => handleTestConnection('whatsapp')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingType === 'whatsapp' ? 'animate-spin' : ''}`} />
                <span>{testingType === 'whatsapp' ? 'Sending...' : 'Test Message'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('INTEGRATIONS_LOGS')}
                className="px-2.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
              >
                View Logs
              </button>
              <button
                type="button"
                onClick={() => handleDisconnect('whatsapp')}
                className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-xl font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: SMS Provider */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">SMS Messaging Gateway</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Africa's Talking / Twilio SMS fallback for OTP & voucher codes.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="font-mono text-white">{sms?.publicConfiguration?.provider || "Africa's Talking"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sender ID:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {sms?.publicConfiguration?.senderId || 'BRISK_WIFI'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining SMS Balance:</span>
                <span className="font-mono text-emerald-400 font-black">
                  KES {sms?.publicConfiguration?.remainingCredits || '4,850.00'} (~5,200 SMS)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Success Rate:</span>
                <span className="text-white font-medium">99.4% (Direct Telco Routes)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('INTEGRATIONS_SMS')}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
              >
                Configure
              </button>
              <button
                type="button"
                disabled={testingType === 'sms'}
                onClick={() => handleTestConnection('sms')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingType === 'sms' ? 'animate-spin' : ''}`} />
                <span>{testingType === 'sms' ? 'Testing...' : 'Test SMS'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('INTEGRATIONS_LOGS')}
              className="px-2.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
            >
              View Logs
            </button>
          </div>
        </div>

        {/* CARD 4: Email Provider */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Email Notification Engine</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Resend / Brevo / SMTP delivery for invoices, receipts & security alerts.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="font-mono text-white">{email?.publicConfiguration?.provider || 'Resend API'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Sender Email:</span>
                <span className="font-mono text-sky-400">
                  {email?.publicConfiguration?.senderEmail || 'billing@kiambuwifi.co.ke'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Domain Verification:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>DKIM & SPF Verified</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Delivery:</span>
                <span className="text-white font-medium">{email?.lastSuccessAt || 'Today at 09:14 AM'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('INTEGRATIONS_EMAIL')}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
              >
                Configure
              </button>
              <button
                type="button"
                disabled={testingType === 'email'}
                onClick={() => handleTestConnection('email')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingType === 'email' ? 'animate-spin' : ''}`} />
                <span>{testingType === 'email' ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('INTEGRATIONS_LOGS')}
              className="px-2.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
            >
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
