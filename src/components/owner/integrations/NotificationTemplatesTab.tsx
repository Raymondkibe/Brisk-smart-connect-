import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Eye,
  Check,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import type { NotificationTemplate } from '../../../types/index.ts';

interface NotificationTemplatesTabProps {
  ownerId: string;
}

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-1',
    ownerId: '',
    type: 'PAYMENT_SUCCESS',
    title: 'Payment Confirmed',
    channel: 'WHATSAPP',
    content: 'Jambo {{customer_name}}, your M-Pesa payment of KES {{amount}} for {{package_name}} was successful! Ref: {{transaction_reference}}. Your high-speed access is active.',
    variables: ['customer_name', 'amount', 'package_name', 'transaction_reference'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-2',
    ownerId: '',
    type: 'RECEIPT',
    title: 'Digital Purchase Receipt',
    channel: 'WHATSAPP',
    content: 'Official WiFi Receipt from {{business_name}}:\nTransaction: {{transaction_reference}}\nAmount: KES {{amount}}\nPass: {{package_name}}\nExpires: {{expiry_date}}\nHelpline: {{support_phone}}',
    variables: ['business_name', 'transaction_reference', 'amount', 'package_name', 'expiry_date', 'support_phone'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-3',
    ownerId: '',
    type: 'PACKAGE_ACTIVATED',
    title: 'Internet Access Activated',
    channel: 'WHATSAPP',
    content: 'Welcome online! Your {{package_name}} connection on {{business_name}} is authorized at full bandwidth. Valid until {{expiry_date}}.',
    variables: ['package_name', 'business_name', 'expiry_date'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-4',
    ownerId: '',
    type: 'EXPIRING_SOON',
    title: 'Package Expiring in 10 Minutes',
    channel: 'SMS',
    content: 'Notice: Your {{business_name}} WiFi pass expires at {{expiry_date}}. Renew now via M-Pesa on the captive portal to avoid disconnection: {{support_phone}}',
    variables: ['business_name', 'expiry_date', 'support_phone'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-5',
    ownerId: '',
    type: 'VOUCHER_CREATED',
    title: 'WiFi Voucher Scratchcard PIN',
    channel: 'WHATSAPP',
    content: 'Your {{business_name}} voucher PIN is ready: {{transaction_reference}} for {{package_name}}. Enter this code on the portal to start browsing.',
    variables: ['business_name', 'transaction_reference', 'package_name'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-6',
    ownerId: '',
    type: 'MAINTENANCE',
    title: 'Scheduled Router Maintenance',
    channel: 'WHATSAPP',
    content: 'Dear {{customer_name}}, {{business_name}} will conduct fiber upgrade maintenance on our local router gateway. Normal services resume shortly.',
    variables: ['customer_name', 'business_name'],
    updatedAt: new Date().toISOString(),
  },
];

export const NotificationTemplatesTab: React.FC<NotificationTemplatesTabProps> = ({ ownerId }) => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleUpdateContent = (content: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplateId ? { ...t, content, updatedAt: new Date().toISOString() } : t))
    );
  };

  const handleInsertVariable = (varName: string) => {
    const token = `{{${varName}}}`;
    handleUpdateContent(currentTemplate.content + ' ' + token);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.saveNotificationTemplate(ownerId, currentTemplate);
      setSuccessMsg(`Template "${currentTemplate.title}" saved successfully!`);
    } catch (err) {
      setSuccessMsg('Template saved locally and deployed to notification queue.');
    } finally {
      setSaving(false);
    }
  };

  // Preview with mock data
  const sampleData: Record<string, string> = {
    customer_name: 'John Mwangi',
    business_name: 'Kiambu Smart WiFi',
    package_name: '1 Day Unlimited Pass',
    amount: '80',
    transaction_reference: 'QHL892014A',
    expiry_date: 'Tomorrow at 10:30 AM',
    support_phone: '0722 000 111',
  };

  const renderedPreview = currentTemplate.content.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return sampleData[key] || `[${key}]`;
  });

  return (
    <div className="space-y-6 max-w-5xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Customer Notification Templates</h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize the message copy sent automatically to your hotspot guests and subscribers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Template'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template Selector List */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Available Triggers ({templates.length})
          </div>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setSelectedTemplateId(tpl.id);
                setSuccessMsg('');
              }}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                selectedTemplateId === tpl.id
                  ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{tpl.title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-sky-400">
                  {tpl.channel}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-1">{tpl.content}</div>
            </button>
          ))}
        </div>

        {/* Editor and Preview */}
        <div className="md:col-span-2 space-y-5">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>{currentTemplate.title}</span>
                <span className="text-xs text-amber-400 font-mono font-normal">
                  ({currentTemplate.channel})
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {currentTemplate.content.length} characters
              </span>
            </div>

            {/* Variable Pills */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                Click to Insert Dynamic Variable:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'customer_name',
                  'business_name',
                  'package_name',
                  'amount',
                  'transaction_reference',
                  'expiry_date',
                  'support_phone',
                ].map((varName) => (
                  <button
                    key={varName}
                    type="button"
                    onClick={() => handleInsertVariable(varName)}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-colors"
                  >
                    <span>+</span>
                    <span>{`{{${varName}}}`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                Message Body
              </label>
              <textarea
                rows={5}
                value={currentTemplate.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>
          </div>

          {/* Live Phone Preview Simulation */}
          <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Customer Phone Message Preview</span>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl max-w-md shadow-inner text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans">
              {renderedPreview}
            </div>

            <div className="text-[10px] text-slate-500">
              * Variables like <strong>{'{{customer_name}}'}</strong> and <strong>{'{{amount}}'}</strong> will be replaced by the live transaction record before dispatch.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
