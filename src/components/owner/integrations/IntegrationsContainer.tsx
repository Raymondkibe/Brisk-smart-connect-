import React, { useState } from 'react';
import {
  Layers,
  Smartphone,
  MessageSquare,
  Send,
  Mail,
  FileText,
  Clock,
  Globe,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { IntegrationsHub } from './IntegrationsHub.tsx';
import { MpesaSettingsTab } from './MpesaSettingsTab.tsx';
import { WhatsappSettingsTab } from './WhatsappSettingsTab.tsx';
import { SmsSettingsTab } from './SmsSettingsTab.tsx';
import { EmailSettingsTab } from './EmailSettingsTab.tsx';
import { NotificationTemplatesTab } from './NotificationTemplatesTab.tsx';
import { NotificationLogsTab } from './NotificationLogsTab.tsx';
import { WebhookSettingsTab } from './WebhookSettingsTab.tsx';
import { IntegrationSecurityTab } from './IntegrationSecurityTab.tsx';

export type IntegrationSubPage =
  | 'OVERVIEW'
  | 'MPESA'
  | 'WHATSAPP'
  | 'SMS'
  | 'EMAIL'
  | 'TEMPLATES'
  | 'LOGS'
  | 'WEBHOOKS'
  | 'SECURITY';

interface IntegrationsContainerProps {
  ownerId: string;
  initialSubTab?: IntegrationSubPage;
  onRefreshParent?: () => void;
}

export const IntegrationsContainer: React.FC<IntegrationsContainerProps> = ({
  ownerId,
  initialSubTab = 'OVERVIEW',
  onRefreshParent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<IntegrationSubPage>(initialSubTab);

  const subTabs: {
    id: IntegrationSubPage;
    label: string;
    pageFile: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'OVERVIEW',
      label: 'Main Dashboard',
      pageFile: 'integrations.html',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'MPESA',
      label: 'M-Pesa / Daraja',
      pageFile: 'mpesa-settings.html',
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      badge: 'STK Push',
    },
    {
      id: 'WHATSAPP',
      label: 'WhatsApp Business',
      pageFile: 'whatsapp-settings.html',
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      badge: 'Meta Cloud',
    },
    {
      id: 'SMS',
      label: 'SMS Provider',
      pageFile: 'sms-settings.html',
      icon: <Send className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'EMAIL',
      label: 'Email Provider',
      pageFile: 'email-settings.html',
      icon: <Mail className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'TEMPLATES',
      label: 'Templates',
      pageFile: 'notification-templates.html',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'LOGS',
      label: 'Delivery History',
      pageFile: 'notification-logs.html',
      icon: <Clock className="w-4 h-4 text-slate-300" />,
    },
    {
      id: 'WEBHOOKS',
      label: 'Webhook Endpoints',
      pageFile: 'webhook-settings.html',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'SECURITY',
      label: 'Security & Audit',
      pageFile: 'integration-security.html',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      badge: 'Vault',
    },
  ];

  // Map subTab IDs that come from IntegrationsHub navigation
  const handleNavigateFromHub = (tabKey: string) => {
    switch (tabKey) {
      case 'INTEGRATIONS_MPESA':
      case 'MPESA':
        setActiveSubTab('MPESA');
        break;
      case 'INTEGRATIONS_WHATSAPP':
      case 'WHATSAPP':
        setActiveSubTab('WHATSAPP');
        break;
      case 'INTEGRATIONS_SMS':
      case 'SMS':
        setActiveSubTab('SMS');
        break;
      case 'INTEGRATIONS_EMAIL':
      case 'EMAIL':
        setActiveSubTab('EMAIL');
        break;
      case 'INTEGRATIONS_TEMPLATES':
      case 'TEMPLATES':
        setActiveSubTab('TEMPLATES');
        break;
      case 'INTEGRATIONS_LOGS':
      case 'LOGS':
        setActiveSubTab('LOGS');
        break;
      case 'INTEGRATIONS_WEBHOOKS':
      case 'WEBHOOKS':
        setActiveSubTab('WEBHOOKS');
        break;
      case 'INTEGRATIONS_SECURITY':
      case 'SECURITY':
        setActiveSubTab('SECURITY');
        break;
      default:
        setActiveSubTab('OVERVIEW');
        break;
    }
  };

  const currentTabObj = subTabs.find((t) => t.id === activeSubTab) || subTabs[0];

  return (
    <div className="space-y-6">
      {/* Top Header with Breadcrumbs & HTML Spec indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Router Owner Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-sky-400">API Integrations Engine</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">{currentTabObj.label}</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            BRISK Smart Connect · Multi-Tenant API Hub
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Spec Target:</span>
          <span className="text-amber-400 font-bold">{currentTabObj.pageFile}</span>
        </div>
      </div>

      {/* 9-Page Tab Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-lg overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1 min-w-max">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subpage Contents */}
      <div className="transition-all">
        {activeSubTab === 'OVERVIEW' && (
          <IntegrationsHub
            ownerId={ownerId}
            onNavigateToTab={handleNavigateFromHub}
            onRefresh={onRefreshParent}
          />
        )}

        {activeSubTab === 'MPESA' && (
          <MpesaSettingsTab
            ownerId={ownerId}
            onNavigateToLogs={() => setActiveSubTab('LOGS')}
          />
        )}

        {activeSubTab === 'WHATSAPP' && (
          <WhatsappSettingsTab ownerId={ownerId} />
        )}

        {activeSubTab === 'SMS' && (
          <SmsSettingsTab ownerId={ownerId} />
        )}

        {activeSubTab === 'EMAIL' && (
          <EmailSettingsTab ownerId={ownerId} />
        )}

        {activeSubTab === 'TEMPLATES' && (
          <NotificationTemplatesTab ownerId={ownerId} />
        )}

        {activeSubTab === 'LOGS' && (
          <NotificationLogsTab ownerId={ownerId} />
        )}

        {activeSubTab === 'WEBHOOKS' && (
          <WebhookSettingsTab ownerId={ownerId} />
        )}

        {activeSubTab === 'SECURITY' && (
          <IntegrationSecurityTab
            ownerId={ownerId}
            onRefreshParent={onRefreshParent}
          />
        )}
      </div>
    </div>
  );
};
