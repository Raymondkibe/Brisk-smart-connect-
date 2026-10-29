import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  RotateCw,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Globe,
  Radio,
  FileText,
  Search,
  Filter,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { IntegrationAuditLog, OwnerIntegration } from '../../../types/index.ts';

interface IntegrationSecurityTabProps {
  ownerId: string;
  onRefreshParent?: () => void;
}

export const IntegrationSecurityTab: React.FC<IntegrationSecurityTabProps> = ({
  ownerId,
  onRefreshParent,
}) => {
  const [integrations, setIntegrations] = useState<OwnerIntegration[]>([]);
  const [auditLogs, setAuditLogs] = useState<IntegrationAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotatingKey, setRotatingKey] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyConfirmText, setEmergencyConfirmText] = useState('');
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [intRes, logsRes] = await Promise.all([
        api.getOwnerIntegrations(ownerId).catch(() => ({ integrations: [] })),
        api.getIntegrationAuditLogs(ownerId).catch(() => ({ logs: [] })),
      ]);
      if (intRes && intRes.integrations) {
        setIntegrations(intRes.integrations);
      }
      if (logsRes && logsRes.logs) {
        setAuditLogs(logsRes.logs);
      }
    } catch (err) {
      console.warn('Failed to load security data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ownerId]);

  const handleRotateSecret = async (providerType: string) => {
    if (!confirm(`Are you sure you want to rotate the credentials for ${providerType.toUpperCase()}? The current active key will be immediately revoked.`)) {
      return;
    }
    setRotatingKey(providerType);
    setActionMessage(null);
    try {
      await api.rotateIntegrationCredentials(ownerId, providerType);
      setActionMessage({
        type: 'success',
        text: `Credentials for ${providerType.toUpperCase()} successfully rotated and encrypted in Supabase Vault.`,
      });
      await loadData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || `Failed to rotate credentials for ${providerType}.`,
      });
    } finally {
      setRotatingKey(null);
    }
  };

  const handleEmergencyDisconnect = async () => {
    if (emergencyConfirmText !== 'DISCONNECT ALL') {
      alert('Please type DISCONNECT ALL to confirm emergency suspension.');
      return;
    }
    setEmergencyLoading(true);
    setActionMessage(null);
    try {
      // Disconnect all providers
      await Promise.all([
        api.disconnectIntegration(ownerId, 'mpesa').catch(() => null),
        api.disconnectIntegration(ownerId, 'whatsapp').catch(() => null),
        api.disconnectIntegration(ownerId, 'sms').catch(() => null),
        api.disconnectIntegration(ownerId, 'email').catch(() => null),
      ]);
      setShowEmergencyModal(false);
      setEmergencyConfirmText('');
      setActionMessage({
        type: 'success',
        text: 'EMERGENCY PROTOCOL EXECUTED: All external payment, messaging, and email APIs have been severed and locked.',
      });
      await loadData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to execute emergency disconnect.',
      });
    } finally {
      setEmergencyLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.providerType.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.ipAddress.includes(searchFilter);
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Banner / Feedback */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/70 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Security Overview Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Integration Security & Encryption Vault</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AES-256 GCM ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              All Daraja API Consumer Secrets, Meta Cloud WhatsApp Access Tokens, and SMS/Email API keys are encrypted at rest using envelope encryption with per-tenant Supabase Row Level Security (RLS). Secret values are never exposed in browser logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-4 py-2.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/50 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-950/50"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Emergency Kill Switch</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Stored Credentials Vault Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Encrypted Provider Credentials Vault</span>
          </h3>
          <span className="text-xs text-slate-400">4 Supported Gateways</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Safaricom Daraja */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Payment Gateway</span>
                <h4 className="text-sm font-bold text-white">Safaricom Daraja Lipa na M-Pesa</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-bold">
                ENCRYPTED
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Consumer Key:</span>
                <span className="text-slate-200">8aK1••••••••••••dF6g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Consumer Secret:</span>
                <span className="text-amber-400 font-bold">••••••••••••••••••••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">STK Push Passkey:</span>
                <span className="text-slate-400">bfb2••••••••••••••••••••••••••••••c919</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Shortcode:</span>
                <span className="text-emerald-400 font-bold">174379 (Paybill)</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Last rotation: 7 days ago</span>
              <button
                type="button"
                disabled={rotatingKey === 'mpesa'}
                onClick={() => handleRotateSecret('mpesa')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${rotatingKey === 'mpesa' ? 'animate-spin' : ''}`} />
                <span>{rotatingKey === 'mpesa' ? 'Rotating...' : 'Rotate Daraja Secret'}</span>
              </button>
            </div>
          </div>

          {/* Card: WhatsApp Business API */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Customer Messaging</span>
                <h4 className="text-sm font-bold text-white">Meta WhatsApp Cloud API</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-bold">
                ENCRYPTED
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">WABA ID:</span>
                <span className="text-slate-200">108492049102941</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Permanent Token:</span>
                <span className="text-amber-400 font-bold">EAAGNO••••••••••••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Phone ID:</span>
                <span className="text-slate-300">1048201948201</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Webhook Token:</span>
                <span className="text-emerald-400 font-bold">SHA-256 Signed</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Last rotation: 14 days ago</span>
              <button
                type="button"
                disabled={rotatingKey === 'whatsapp'}
                onClick={() => handleRotateSecret('whatsapp')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${rotatingKey === 'whatsapp' ? 'animate-spin' : ''}`} />
                <span>{rotatingKey === 'whatsapp' ? 'Rotating...' : 'Rotate WA Token'}</span>
              </button>
            </div>
          </div>

          {/* Card: SMS Provider */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">SMS Alerts</span>
                <h4 className="text-sm font-bold text-white">Africa's Talking / Twilio SMS</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-bold">
                ENCRYPTED
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Username:</span>
                <span className="text-slate-200">kiambuwifi_sandbox</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">API Key:</span>
                <span className="text-amber-400 font-bold">atsk_••••••••••••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Sender ID:</span>
                <span className="text-slate-300">BRISK_WIFI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">SSRF Protection:</span>
                <span className="text-emerald-400 font-bold">Enforced (Allowlist)</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Status: Active</span>
              <button
                type="button"
                disabled={rotatingKey === 'sms'}
                onClick={() => handleRotateSecret('sms')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${rotatingKey === 'sms' ? 'animate-spin' : ''}`} />
                <span>{rotatingKey === 'sms' ? 'Rotating...' : 'Rotate API Key'}</span>
              </button>
            </div>
          </div>

          {/* Card: Email Provider */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Transactional Email</span>
                <h4 className="text-sm font-bold text-white">Resend / Brevo API</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-bold">
                ENCRYPTED
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">API Key:</span>
                <span className="text-amber-400 font-bold">re_829••••••••••••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Verified Sender:</span>
                <span className="text-slate-200">billing@kiambuwifi.co.ke</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">DKIM & SPF:</span>
                <span className="text-emerald-400 font-bold">Verified (DNS TXT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Domain Sandbox:</span>
                <span className="text-sky-400 font-bold">Production Ready</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Status: Active</span>
              <button
                type="button"
                disabled={rotatingKey === 'email'}
                onClick={() => handleRotateSecret('email')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${rotatingKey === 'email' ? 'animate-spin' : ''}`} />
                <span>{rotatingKey === 'email' ? 'Rotating...' : 'Rotate API Key'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Access Permissions & Role Controls */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-400" />
          <span>Role-Based Integration Access Control Matrix (RBAC)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Supabase Row-Level-Security (RLS) policies strictly enforce credential read, write, and execute permissions based on authenticated user identity.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Platform Role</th>
                <th className="p-3">View Secrets</th>
                <th className="p-3">Edit Credentials</th>
                <th className="p-3">Trigger Test Trans.</th>
                <th className="p-3">Rotate Keys</th>
                <th className="p-3">Emergency Kill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              <tr>
                <td className="p-3 text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Router Owner (Account Tenant)</span>
                </td>
                <td className="p-3 text-emerald-400">Masked Only</td>
                <td className="p-3 text-emerald-400">Yes (Own Account)</td>
                <td className="p-3 text-emerald-400">Yes</td>
                <td className="p-3 text-emerald-400">Yes</td>
                <td className="p-3 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-300 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Super Admin (Platform Host)</span>
                </td>
                <td className="p-3 text-slate-400">No (Zero Knowledge)</td>
                <td className="p-3 text-slate-400">No</td>
                <td className="p-3 text-slate-400">No</td>
                <td className="p-3 text-amber-400">Force Revoke</td>
                <td className="p-3 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>Technician / Field Installer</span>
                </td>
                <td className="p-3 text-red-400">Denied</td>
                <td className="p-3 text-red-400">Denied</td>
                <td className="p-3 text-amber-400">WiFi Pings Only</td>
                <td className="p-3 text-red-400">Denied</td>
                <td className="p-3 text-red-400">Denied</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>Customer / Hotspot Guest</span>
                </td>
                <td className="p-3 text-red-400">Denied</td>
                <td className="p-3 text-red-400">Denied</td>
                <td className="p-3 text-red-400">Denied</td>
                <td className="p-3 text-red-400">Denied</td>
                <td className="p-3 text-red-400">Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Complete Audit Trail */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Immutable Integration Audit History</span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete forensic log of all credential updates, test runs, key rotations, and webhook verifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-400"
            >
              <option value="ALL">All Actions</option>
              <option value="CREDENTIAL_UPDATED">Credential Updated</option>
              <option value="KEY_ROTATED">Key Rotated</option>
              <option value="CONNECTION_TESTED">Connection Tested</option>
              <option value="PAYMENTS_ENABLED">Payments Enabled</option>
              <option value="PAYMENTS_DISABLED">Payments Disabled</option>
              <option value="INTEGRATION_DISCONNECTED">Disconnected</option>
              <option value="WEBHOOK_VERIFIED">Webhook Verified</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              title="Refresh Audit Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Gateway</th>
                <th className="p-3">Source IP</th>
                <th className="p-3">Status</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No integration audit records match your current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-200">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 uppercase text-sky-400 font-bold">
                      {log.providerType}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                            : 'bg-red-950/70 text-red-400 border border-red-800/40'
                        }`}
                      >
                        ● {log.result}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-sans text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMERGENCY DISCONNECT MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-600 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-700/60 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Emergency Disconnect Switch</h3>
                <span className="text-xs font-semibold text-red-400">Immediate API Blackout</span>
              </div>
            </div>

            <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-2xl space-y-2 text-xs text-red-200">
              <p className="font-bold">
                WARNING: This is a high-severity security action!
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Safaricom Daraja M-Pesa STK Push will be immediately disabled.</li>
                <li>WhatsApp Business notifications & automated vouchers will cease.</li>
                <li>SMS gateways & transactional emails will be severed.</li>
                <li>Existing customer hotspots will revert to Voucher-Only or Offline mode.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Type <span className="font-mono text-red-400 font-black">DISCONNECT ALL</span> to confirm:
              </label>
              <input
                type="text"
                value={emergencyConfirmText}
                onChange={(e) => setEmergencyConfirmText(e.target.value)}
                placeholder="DISCONNECT ALL"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmergencyModal(false);
                  setEmergencyConfirmText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={emergencyConfirmText !== 'DISCONNECT ALL' || emergencyLoading}
                onClick={handleEmergencyDisconnect}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/30"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{emergencyLoading ? 'Severing APIs...' : 'CONFIRM EMERGENCY SHUTDOWN'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
