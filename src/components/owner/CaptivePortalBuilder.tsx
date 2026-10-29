import React, { useState, useEffect } from 'react';
import {
  Palette,
  Layout,
  Settings,
  Package,
  CreditCard,
  Eye,
  History,
  CheckCircle2,
  AlertCircle,
  Save,
  Upload,
  Smartphone,
  Monitor,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  Check,
  Sliders,
  Type,
  FileText,
  RotateCcw,
  Zap,
  Globe,
  Radio,
  Wifi,
  Lock,
  Ticket,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  WifiPackage,
  RouterDevice,
  RouterOwnerProfile,
  PortalConfig,
  PortalPackageAssignment,
  PortalVersion,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { AddCustomPackageModal } from './AddCustomPackageModal.tsx';

interface CaptivePortalBuilderProps {
  ownerId: string;
  packages: WifiPackage[];
  routers: RouterDevice[];
  profile?: RouterOwnerProfile;
  onRefreshState?: () => void;
  onLaunchPortal?: () => void;
}

export const CaptivePortalBuilder: React.FC<CaptivePortalBuilderProps> = ({
  ownerId,
  packages,
  routers,
  profile,
  onRefreshState,
  onLaunchPortal,
}) => {
  const [activeTab, setActiveTab] = useState<
    'SETTINGS' | 'BRANDING' | 'PAGE_EDITOR' | 'PACKAGES' | 'AUTH_PAYMENT' | 'PREVIEW' | 'VERSIONS'
  >('SETTINGS');

  // Loading & notification states
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');

  // Portal Configuration State
  const [config, setConfig] = useState<PortalConfig>({
    id: `portal-${ownerId}`,
    tenantId: ownerId,
    portalName: profile?.businessName ? `${profile.businessName} Hotspot` : 'BRISK Smart Hotspot',
    businessDisplayName: profile?.businessName || 'Kiambu Smart WiFi Networks',
    locationName: profile?.businessLocation || 'Central Area Hub',
    welcomeHeading: 'High-Speed Internet Hotspot',
    welcomeDescription: 'Instant M-Pesa automated activations, ultra-fast fiber speeds, and 24/7 reliability across all devices.',
    logoPath: '',
    backgroundImagePath: '',
    primaryColor: '#f59e0b',
    secondaryColor: '#0284c7',
    backgroundColor: '#020617',
    textColor: '#f8fafc',
    theme: 'modern',
    fontFamily: 'Inter',
    defaultLanguage: 'en',
    enabledAuthMethods: ['ACCOUNT', 'REGISTER', 'MPESA', 'VOUCHER', 'TRIAL'],
    supportPhone: profile?.supportContact || '0722 000 111',
    supportEmail: 'support@briskconnect.co.ke',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    postLoginDestination: 'https://google.com',
    borderRadius: 'lg',
    isDarkMode: true,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Page Editor Content State
  const [pageContent, setPageContent] = useState<Record<string, any>>({
    welcomeHeading: 'High-Speed Internet Hotspot',
    welcomeSubheading: 'Select a package or enter your voucher PIN code below.',
    welcomeButtonText: 'Browse WiFi Packages',
    loginHeading: 'Sign In to Hotspot Account',
    loginSubheading: 'Enter your phone number or email to resume active session.',
    registerHeading: 'Join as Hotspot Subscriber',
    packagesHeading: 'Select Your High-Speed Internet Pass',
    packagesSubheading: 'Instant automated M-Pesa STK push activations without delay.',
    paymentNotice: 'Ensure your phone is unlocked with sufficient M-Pesa balance.',
    successTitle: 'Connection Authorized & Activated!',
    successMessage: 'Your high-speed session is active on this router gateway.',
    supportHelpText: 'Need connection assistance? Contact our local network operator.',
    termsNotice: 'By connecting, you agree to fair use and terms of service.',
  });

  // Package Assignments & Owner Packages State
  const [ownerPackagesList, setOwnerPackagesList] = useState<WifiPackage[]>([]);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [packageAssignments, setPackageAssignments] = useState<PortalPackageAssignment[]>([]);
  const [versions, setVersions] = useState<PortalVersion[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Preview Simulator State
  const [previewDevice, setPreviewDevice] = useState<'MOBILE' | 'DESKTOP'>('MOBILE');
  const [previewScreen, setPreviewScreen] = useState<'WELCOME' | 'LOGIN' | 'PACKAGES' | 'PAYMENT' | 'ACTIVE_SESSION'>('WELCOME');
  const [selectedPreviewPackage, setSelectedPreviewPackage] = useState<WifiPackage | null>(null);

  // Fetch initial portal configuration from backend
  useEffect(() => {
    loadPortalData();
  }, [ownerId]);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [data, pkgData] = await Promise.all([
        api.getPortalConfig(ownerId).catch(() => ({ config: null, versions: [], assignments: [] })),
        api.getOwnerPackages(ownerId).catch(() => ({ packages: [] })),
      ]);

      const currentOwnerPkgs: WifiPackage[] =
        pkgData?.packages && pkgData.packages.length > 0
          ? pkgData.packages
          : packages.filter((p) => p.isCustom);

      setOwnerPackagesList(currentOwnerPkgs);

      if (data?.config) {
        setConfig((prev) => ({ ...prev, ...data.config }));
      }
      if (data?.versions) {
        setVersions(data.versions);
      }

      if (data?.assignments && data.assignments.length > 0) {
        const validAssignments = data.assignments.filter((a: PortalPackageAssignment) =>
          currentOwnerPkgs.some((p) => p.id === a.officialPackageId)
        );
        if (validAssignments.length > 0) {
          setPackageAssignments(validAssignments);
        } else {
          setPackageAssignments(
            currentOwnerPkgs.map((pkg, idx) => ({
              id: `assign-${pkg.id}`,
              tenantId: ownerId,
              portalConfigId: config.id,
              officialPackageId: pkg.id,
              isEnabled: true,
              displayOrder: idx + 1,
              isHighlighted: pkg.isPopular || false,
              customDescription: pkg.description,
            }))
          );
        }
      } else if (currentOwnerPkgs.length > 0) {
        setPackageAssignments(
          currentOwnerPkgs.map((pkg, idx) => ({
            id: `assign-${pkg.id}`,
            tenantId: ownerId,
            portalConfigId: config.id,
            officialPackageId: pkg.id,
            isEnabled: true,
            displayOrder: idx + 1,
            isHighlighted: pkg.isPopular || false,
            customDescription: pkg.description,
          }))
        );
      }

      if (currentOwnerPkgs.length > 0 && !selectedPreviewPackage) {
        setSelectedPreviewPackage(currentOwnerPkgs[0]);
      }
    } catch (err) {
      console.warn('[PortalBuilder] Could not fetch remote config, using local state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageCreatedFromModal = (newPkg: WifiPackage) => {
    setOwnerPackagesList((prev) => [newPkg, ...prev]);
    setPackageAssignments((prev) => [
      {
        id: `assign-${newPkg.id}`,
        tenantId: ownerId,
        portalConfigId: config.id,
        officialPackageId: newPkg.id,
        isEnabled: true,
        displayOrder: 1,
        isHighlighted: false,
        customDescription: newPkg.description,
      },
      ...prev.map((item, idx) => ({ ...item, displayOrder: idx + 2 })),
    ]);
    setSelectedPreviewPackage(newPkg);
    setHasUnsavedChanges(true);
    if (onRefreshState) onRefreshState();
  };

  const handleDeletePackage = async (packageId: string, pkgName: string) => {
    if (!window.confirm(`Delete "${pkgName}"? It will be permanently removed from your captive portal.`)) {
      return;
    }
    try {
      await api.deleteCustomPackage(packageId);
      setOwnerPackagesList((prev) => prev.filter((p) => p.id !== packageId));
      setPackageAssignments((prev) => prev.filter((a) => a.officialPackageId !== packageId));
      setHasUnsavedChanges(true);
      if (onRefreshState) onRefreshState();
    } catch (err: any) {
      alert(err.message || 'Failed to delete package');
    }
  };

  // Preset Color Palettes
  const colorPresets = [
    { name: 'Amber Gold (BRISK Signature)', primary: '#f59e0b', secondary: '#0284c7', bg: '#020617', text: '#f8fafc' },
    { name: 'Cyber Blue & Slate', primary: '#0284c7', secondary: '#38bdf8', bg: '#0f172a', text: '#f1f5f9' },
    { name: 'Emerald High-Speed', primary: '#10b981', secondary: '#059669', bg: '#064e3b', text: '#ecfdf5' },
    { name: 'Electric Pink & Dark', primary: '#ec4899', secondary: '#f43f5e', bg: '#09090b', text: '#fafafa' },
    { name: 'Purple Neon Tech', primary: '#8b5cf6', secondary: '#6366f1', bg: '#0f0e17', text: '#fffffe' },
  ];

  const handleApplyPalette = (palette: typeof colorPresets[0]) => {
    setConfig((prev) => ({
      ...prev,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      backgroundColor: palette.bg,
      textColor: palette.text,
    }));
    setHasUnsavedChanges(true);
  };

  // Toggle Auth Method
  const toggleAuthMethod = (method: 'ACCOUNT' | 'REGISTER' | 'MPESA' | 'VOUCHER' | 'TRIAL') => {
    setConfig((prev) => {
      const exists = prev.enabledAuthMethods.includes(method);
      const updated = exists
        ? prev.enabledAuthMethods.filter((m) => m !== method)
        : [...prev.enabledAuthMethods, method];
      return { ...prev, enabledAuthMethods: updated };
    });
    setHasUnsavedChanges(true);
  };

  // Toggle Package Enabled Status
  const togglePackageEnabled = (packageId: string) => {
    setPackageAssignments((prev) =>
      prev.map((item) =>
        item.officialPackageId === packageId ? { ...item, isEnabled: !item.isEnabled } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Set Highlighted Package
  const setHighlightedPackage = (packageId: string) => {
    setPackageAssignments((prev) =>
      prev.map((item) => ({
        ...item,
        isHighlighted: item.officialPackageId === packageId ? !item.isHighlighted : false,
      }))
    );
    setHasUnsavedChanges(true);
  };

  // Move Package Up / Down in display order
  const movePackageOrder = (index: number, direction: 'UP' | 'DOWN') => {
    const newItems = [...packageAssignments];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // re-index display orders
    const updated = newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    setPackageAssignments(updated);
    setHasUnsavedChanges(true);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setLoading(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      await api.savePortalDraft({
        tenantId: ownerId,
        configurationJson: {
          ...config,
          pages: pageContent,
          packageAssignments,
        },
        createdBy: profile?.businessName || 'Owner',
      });
      setSaveSuccess('Portal draft saved successfully. Unpublished changes are saved securely.');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  // Publish Changes
  const handlePublish = async () => {
    setLoading(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const res = await api.publishPortal({
        tenantId: ownerId,
        publishedBy: profile?.businessName || 'Router Owner',
        summary: publishSummary || 'Published updated captive portal branding, colors, and package catalogue.',
        configuration: {
          ...config,
          pages: pageContent,
          packageAssignments,
        },
      });

      setSaveSuccess(`Captive portal version ${res.versionNumber || 'Live'} published to all active routers!`);
      setPublishModalOpen(false);
      setPublishSummary('');
      setHasUnsavedChanges(false);
      loadPortalData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brisk-portal-published', { detail: res.config }));
        localStorage.setItem('brisk_portal_last_updated', Date.now().toString());
      }
      if (onRefreshState) onRefreshState();
      setTimeout(() => setSaveSuccess(''), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to publish portal');
    } finally {
      setLoading(false);
    }
  };

  // Restore Previous Version
  const handleRestoreVersion = async (versionNumber: number) => {
    if (!window.confirm(`Are you sure you want to restore Version ${versionNumber}? This will replace current published settings.`)) {
      return;
    }
    setLoading(true);
    try {
      await api.restorePortalVersion({
        tenantId: ownerId,
        versionNumber,
      });
      setSaveSuccess(`Version ${versionNumber} successfully restored as the live captive portal!`);
      loadPortalData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brisk-portal-published'));
        localStorage.setItem('brisk_portal_last_updated', Date.now().toString());
      }
      if (onRefreshState) onRefreshState();
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to restore version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-400/10 shrink-0">
            <Layout className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                CAPTIVE PORTAL DESIGNER & CMS
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{config.status === 'PUBLISHED' ? 'LIVE & PUBLISHED' : 'DRAFT MODE'}</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-0.5">
              {config.portalName}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1">
              Customize your customer hotspot captive portal branding, themes, package displays, and M-Pesa instructions across all assigned MikroTik routers.
            </p>
          </div>
        </div>

        {/* Global Save & Publish Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveDraft}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-sky-400" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-400/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Publish Changes</span>
          </button>

          {onLaunchPortal && (
            <button
              type="button"
              onClick={onLaunchPortal}
              className="px-3.5 py-2.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Open full standalone captive portal in browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Live Portal</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs font-bold text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>You have unsaved changes in your portal configuration.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-[11px] font-bold text-amber-400 underline hover:text-amber-300"
          >
            Save Draft Now
          </button>
        </div>
      )}

      {/* Builder 7 Tabs Navigation */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl scrollbar-none">
        {[
          { id: 'SETTINGS', label: '1. Portal Settings', icon: <Settings className="w-3.5 h-3.5" /> },
          { id: 'BRANDING', label: '2. Branding & Appearance', icon: <Palette className="w-3.5 h-3.5" /> },
          { id: 'PAGE_EDITOR', label: '3. Page Editor', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'PACKAGES', label: '4. Package Display', icon: <Package className="w-3.5 h-3.5" /> },
          { id: 'AUTH_PAYMENT', label: '5. Auth & Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'PREVIEW', label: '6. Live Simulator', icon: <Eye className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'VERSIONS', label: '7. Version History', icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PORTAL SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">General Hotspot Settings</h3>
            <p className="text-xs text-slate-400">
              Configure identity, location descriptions, support contacts, and post-login redirects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Portal Internal Name</label>
              <input
                type="text"
                value={config.portalName}
                onChange={(e) => {
                  setConfig({ ...config, portalName: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Business Display Name</label>
              <input
                type="text"
                value={config.businessDisplayName}
                onChange={(e) => {
                  setConfig({ ...config, businessDisplayName: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Hotspot Physical Location</label>
              <input
                type="text"
                value={config.locationName}
                onChange={(e) => {
                  setConfig({ ...config, locationName: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Post-Login Destination URL</label>
              <input
                type="url"
                value={config.postLoginDestination}
                onChange={(e) => {
                  setConfig({ ...config, postLoginDestination: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="https://google.com or your website"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Support Phone / Helpline</label>
              <input
                type="tel"
                value={config.supportPhone}
                onChange={(e) => {
                  setConfig({ ...config, supportPhone: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Support Email Address</label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => {
                  setConfig({ ...config, supportEmail: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Terms of Service URL</label>
              <input
                type="text"
                value={config.termsUrl}
                onChange={(e) => {
                  setConfig({ ...config, termsUrl: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Default Language</label>
              <select
                value={config.defaultLanguage}
                onChange={(e) => {
                  setConfig({ ...config, defaultLanguage: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="en">English (Official)</option>
                <option value="sw">Kiswahili (East Africa)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Welcome Hero Heading</label>
              <input
                type="text"
                value={config.welcomeHeading}
                onChange={(e) => {
                  setConfig({ ...config, welcomeHeading: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Welcome Description Subtext</label>
              <textarea
                rows={2}
                value={config.welcomeDescription}
                onChange={(e) => {
                  setConfig({ ...config, welcomeDescription: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDING & APPEARANCE */}
      {activeTab === 'BRANDING' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Visual Identity & Styling</h3>
            <p className="text-xs text-slate-400">
              Customize colors, fonts, themes, card rounding, and background aesthetics.
            </p>
          </div>

          {/* Preset Palettes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Theme Color Palettes:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {colorPresets.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => handleApplyPalette(palette)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    config.primaryColor === palette.primary
                      ? 'border-amber-400 bg-amber-400/10 shadow-lg'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: palette.primary }} />
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: palette.secondary }} />
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: palette.bg }} />
                  </div>
                  <div className="text-xs font-bold text-white">{palette.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Primary Accent Color</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => {
                    setConfig({ ...config, primaryColor: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                />
                <span className="font-mono text-white text-xs">{config.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Secondary Accent Color</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => {
                    setConfig({ ...config, secondaryColor: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                />
                <span className="font-mono text-white text-xs">{config.secondaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Background Color</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => {
                    setConfig({ ...config, backgroundColor: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                />
                <span className="font-mono text-white text-xs">{config.backgroundColor}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Card Border Radius</label>
              <select
                value={config.borderRadius}
                onChange={(e) => {
                  setConfig({ ...config, borderRadius: e.target.value as any });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="none">Sharp Edges (0px)</option>
                <option value="sm">Subtle (6px)</option>
                <option value="md">Medium (12px)</option>
                <option value="lg">Rounded (18px - Recommended)</option>
                <option value="full">Ultra Rounded (26px)</option>
              </select>
            </div>
          </div>

          {/* Typography & Themes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-800">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Font Family</label>
              <select
                value={config.fontFamily}
                onChange={(e) => {
                  setConfig({ ...config, fontFamily: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="Inter">Inter (Clean Modern UI)</option>
                <option value="Poppins">Poppins (Friendly Geometric)</option>
                <option value="Outfit">Outfit (Bold High-Tech)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS Executive)</option>
                <option value="monospace">Monospace (Terminal / MikroTik)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Portal Visual Theme</label>
              <select
                value={config.theme}
                onChange={(e) => {
                  setConfig({ ...config, theme: e.target.value as any });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="modern">Modern Aurora Glass</option>
                <option value="classic">Classic Minimal White</option>
                <option value="minimal">Dark Executive Slate</option>
                <option value="aurora">Vibrant Neon Tech</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Dark Mode / Light Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfig({ ...config, isDarkMode: true });
                    setHasUnsavedChanges(true);
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    config.isDarkMode
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfig({ ...config, isDarkMode: false });
                    setHasUnsavedChanges(true);
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    !config.isDarkMode
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Light Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAGE EDITOR */}
      {activeTab === 'PAGE_EDITOR' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Captive Portal Page Content Editor</h3>
            <p className="text-xs text-slate-400">
              Customize copy, notices, and instructions across all customer portal views.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Section 1: Welcome & Packages Screen */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                1. Welcome & Packages Catalogue Copy
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Catalog Heading</label>
                  <input
                    type="text"
                    value={pageContent.packagesHeading}
                    onChange={(e) => {
                      setPageContent({ ...pageContent, packagesHeading: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Catalog Subheading</label>
                  <input
                    type="text"
                    value={pageContent.packagesSubheading}
                    onChange={(e) => {
                      setPageContent({ ...pageContent, packagesSubheading: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: M-Pesa Checkout & Verification */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                2. M-Pesa Checkout Notice & Payment Instructions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Payment Instructions</label>
                  <input
                    type="text"
                    value={pageContent.paymentNotice}
                    onChange={(e) => {
                      setPageContent({ ...pageContent, paymentNotice: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Helpline Callout</label>
                  <input
                    type="text"
                    value={pageContent.supportHelpText}
                    onChange={(e) => {
                      setPageContent({ ...pageContent, supportHelpText: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Activation Success & Active Session */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                3. Internet Activation & Active Session Dashboard
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Activation Success Title</label>
                  <input
                    type="text"
                    value={pageContent.successTitle}
                    onChange={(e) => {
                      setPageContent({ ...pageContent, successTitle: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Activation Message</label>
                  <input
                    type="text"
                    value={pageContent.successMessage}
                    onChange={(e) => {
                      setPageContent({ ...pageContent, successMessage: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PACKAGE DISPLAY (ROUTER OWNER CUSTOM PACKAGES ONLY) */}
      {activeTab === 'PACKAGES' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Hotspot Package Catalogue (Router Owner Packages)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Custom Rates
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official platform packages have been removed. Guests connecting to your captive portal only see packages you create and enable here.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddPackageModal(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-400/20 whitespace-nowrap transition-all"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>+ ADD YOUR OWN PACKAGE</span>
              </button>
              <div className="text-xs font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-3 py-2 rounded-xl whitespace-nowrap">
                {packageAssignments.filter((a) => a.isEnabled).length} Enabled
              </div>
            </div>
          </div>

          {ownerPackagesList.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-2xl border border-dashed border-slate-800 space-y-3">
              <Package className="w-10 h-10 text-amber-400/60 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-white">No Custom Packages Added Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Official platform packages are disabled for this portal. You must create your own custom rates (e.g., 2 Hours KES 30, Day Pass KES 60) so guests can purchase internet access.
              </p>
              <button
                type="button"
                onClick={() => setShowAddPackageModal(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 inline-flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Package</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {ownerPackagesList.map((pkg, index) => {
                const assignment = packageAssignments.find((a) => a.officialPackageId === pkg.id);
                const isEnabled = assignment ? assignment.isEnabled : true;
                const isHighlighted = assignment ? assignment.isHighlighted : false;
                const orderNum = assignment ? assignment.displayOrder : index + 1;

                return (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isEnabled
                        ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Reorder Arrows */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => movePackageOrder(index, 'UP')}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === ownerPackagesList.length - 1}
                          onClick={() => movePackageOrder(index, 'DOWN')}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{pkg.name}</span>
                          <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
                            Owner Package
                          </span>
                          {isHighlighted && (
                            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md">
                              HIGHLIGHTED / POPULAR
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            Order #{orderNum}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="text-amber-400 font-mono font-bold text-sm">
                            KES {pkg.priceKes.toLocaleString()}
                          </span>
                          <span>·</span>
                          <span>{pkg.durationLabel}</span>
                          <span>·</span>
                          <span className="text-sky-400 font-semibold">{pkg.speedLabel}</span>
                          {pkg.description && (
                            <>
                              <span>·</span>
                              <span className="text-slate-400 truncate max-w-xs">{pkg.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setHighlightedPackage(pkg.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isHighlighted
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {isHighlighted ? 'Highlighted' : 'Make Highlighted'}
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePackageEnabled(pkg.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isEnabled
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-xl border border-red-900/40 transition-colors"
                        title="Delete custom package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUTH & PAYMENT DISPLAY */}
      {activeTab === 'AUTH_PAYMENT' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Supported Customer Access & Payment Methods</h3>
            <p className="text-xs text-slate-400">
              Control which customer access tabs appear on your captive portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              {
                id: 'MPESA',
                title: 'M-Pesa STK Push Instant Checkout',
                desc: 'Customers enter Safaricom number and enter PIN on their handset for instant activation.',
                icon: <Zap className="w-5 h-5 text-emerald-400" />,
              },
              {
                id: 'VOUCHER',
                title: 'Scratchcard / Voucher PIN Code',
                desc: 'Allows redemption of physical thermal slips or printed batch voucher tickets.',
                icon: <Ticket className="w-5 h-5 text-amber-400" />,
              },
              {
                id: 'ACCOUNT',
                title: 'Returning Customer Account Login',
                desc: 'Registered customers can sign in with phone/password to manage packages.',
                icon: <Lock className="w-5 h-5 text-sky-400" />,
              },
              {
                id: 'REGISTER',
                title: 'New Customer Self-Registration',
                desc: 'Allows new hotspot users to sign up for an account directly on portal.',
                icon: <Smartphone className="w-5 h-5 text-purple-400" />,
              },
              {
                id: 'TRIAL',
                title: 'Free 3-Day Welcome Trial (1-Time)',
                desc: 'Promotional welcome package automatically assigned to eligible new devices.',
                icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
              },
            ].map((method) => {
              const isEnabled = config.enabledAuthMethods.includes(method.id as any);
              return (
                <div
                  key={method.id}
                  onClick={() => toggleAuthMethod(method.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isEnabled
                      ? 'bg-slate-950 border-amber-400/60 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {method.icon}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEnabled ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isEnabled ? 'ACTIVE ON PORTAL' : 'OFF'}
                      </span>
                    </div>
                    <div className="font-bold text-white text-xs">{method.title}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{method.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: LIVE PREVIEW SIMULATOR */}
      {activeTab === 'PREVIEW' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Interactive Captive Portal Simulator</h3>
                <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800/40 px-2 py-0.5 rounded-md font-mono font-bold">
                  HOT-RELOADING PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Test how your customized colors, fonts, packages, and copy render on both mobile and desktop.
              </p>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPreviewDevice('MOBILE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewDevice === 'MOBILE'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('DESKTOP')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewDevice === 'DESKTOP'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop Browser</span>
              </button>
            </div>
          </div>

          {/* Screen Switcher Pills */}
          <div className="flex overflow-x-auto gap-2 text-xs">
            {[
              { id: 'WELCOME', label: 'Welcome Screen' },
              { id: 'PACKAGES', label: 'Packages Catalogue' },
              { id: 'PAYMENT', label: 'M-Pesa STK Prompt' },
              { id: 'ACTIVE_SESSION', label: 'Active Session Dashboard' },
            ].map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => setPreviewScreen(screen.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                  previewScreen === screen.id
                    ? 'bg-slate-800 text-amber-400 border-amber-400/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {screen.label}
              </button>
            ))}
          </div>

          {/* Simulator Canvas Frame */}
          <div className="flex justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800 min-h-[500px]">
            <div
              className={`transition-all duration-300 shadow-2xl overflow-hidden border border-slate-700/80 ${
                previewDevice === 'MOBILE'
                  ? 'w-[370px] rounded-[36px] p-2 bg-slate-950 shadow-black'
                  : 'w-full max-w-4xl rounded-2xl bg-slate-950'
              }`}
            >
              {/* Phone Top Notch / Speaker (if mobile) */}
              {previewDevice === 'MOBILE' && (
                <div className="w-full flex justify-center py-1">
                  <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                    <span className="w-8 h-1 bg-slate-800 rounded-full" />
                  </div>
                </div>
              )}

              {/* Simulated Captive Portal Screen */}
              <div
                className="w-full h-full min-h-[520px] rounded-[28px] overflow-y-auto p-4 sm:p-6 space-y-4 font-sans relative"
                style={{
                  backgroundColor: config.backgroundColor || '#020617',
                  color: config.textColor || '#f8fafc',
                  fontFamily: config.fontFamily || 'Inter',
                }}
              >
                {/* Simulated Portal Top Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-slate-950 shadow-md"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      W
                    </div>
                    <div>
                      <div className="text-xs font-black leading-tight text-white">
                        {config.businessDisplayName}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {config.locationName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ROUTER 7.15 ONLINE
                  </span>
                </div>

                {/* Simulated Screen Content: WELCOME */}
                {previewScreen === 'WELCOME' && (
                  <div className="space-y-4 py-4 text-center">
                    <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg" style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}>
                      <Wifi className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-white">{config.welcomeHeading}</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                        {config.welcomeDescription}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewScreen('PACKAGES')}
                      className="w-full py-3 font-black text-slate-950 text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {pageContent.welcomeButtonText || 'Browse WiFi Packages'}
                    </button>

                    <div className="text-[11px] text-slate-400 pt-2">
                      Need helpline? Call <strong className="text-white">{config.supportPhone}</strong>
                    </div>
                  </div>
                )}

                {/* Simulated Screen Content: PACKAGES */}
                {previewScreen === 'PACKAGES' && (
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-black text-white">{pageContent.packagesHeading}</h4>
                      <p className="text-[11px] text-slate-400">{pageContent.packagesSubheading}</p>
                    </div>

                    <div className="space-y-2">
                      {ownerPackagesList.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 bg-white/5 rounded-xl border border-white/10 space-y-1">
                          <p>No custom packages created yet.</p>
                          <p className="text-[10px] text-amber-300">Click "+ Add Your Own Package" in Tab 4.</p>
                        </div>
                      ) : (
                        ownerPackagesList.slice(0, 4).map((pkg) => (
                          <div
                            key={pkg.id}
                            className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-white">{pkg.name}</div>
                              <div className="text-[11px] text-slate-400">{pkg.speedLabel} · {pkg.durationLabel}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPreviewPackage(pkg);
                                setPreviewScreen('PAYMENT');
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-black text-slate-950 shadow"
                              style={{ backgroundColor: config.primaryColor }}
                            >
                              KES {pkg.priceKes}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Simulated Screen Content: PAYMENT */}
                {previewScreen === 'PAYMENT' && (
                  <div className="space-y-4 py-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-[11px] text-slate-400">Selected Internet Package:</div>
                      <div className="text-sm font-bold text-white">{selectedPreviewPackage?.name || '1 Day Unlimited'}</div>
                      <div className="text-lg font-black font-mono mt-1" style={{ color: config.primaryColor }}>
                        KES {selectedPreviewPackage?.priceKes || 50}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-300 font-semibold block">Enter Safaricom M-Pesa Phone</label>
                      <input
                        type="tel"
                        disabled
                        value="07XX XXX XXX (Customer Phone)"
                        className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-xs font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewScreen('ACTIVE_SESSION')}
                      className="w-full py-3 font-black text-slate-950 text-xs rounded-xl shadow-lg"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      Simulate STK Push Success
                    </button>

                    <p className="text-[10px] text-slate-400 text-center">
                      {pageContent.paymentNotice}
                    </p>
                  </div>
                )}

                {/* Simulated Screen Content: ACTIVE_SESSION */}
                {previewScreen === 'ACTIVE_SESSION' && (
                  <div className="space-y-4 py-2 text-center">
                    <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{pageContent.successTitle}</h4>
                      <p className="text-[11px] text-slate-300">{pageContent.successMessage}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs">
                      <div className="text-slate-400">Time Remaining:</div>
                      <div className="text-xl font-black font-mono text-emerald-400">23h 58m 12s</div>
                      <div className="text-[10px] text-slate-500">Device IP: 192.168.88.245</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewScreen('WELCOME')}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Reset Simulator to Welcome View
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: VERSION HISTORY & RESTORE */}
      {activeTab === 'VERSIONS' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Captive Portal Immutable Version History</h3>
            <p className="text-xs text-slate-400">
              Audit all published portal versions with timestamps and restore previous configurations with 1-click.
            </p>
          </div>

          <div className="space-y-3">
            {versions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                No previous version history found. Publish your first captive portal version above.
              </div>
            ) : (
              versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-400">
                        Version {ver.versionNumber}
                      </span>
                      {ver.versionNumber === versions[0]?.versionNumber && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black">
                          CURRENT LIVE VERSION
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white font-semibold">{ver.summary}</div>
                    <div className="text-[11px] text-slate-400">
                      Published by {ver.publishedBy} on {new Date(ver.publishedAt).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={ver.versionNumber === versions[0]?.versionNumber}
                    onClick={() => handleRestoreVersion(ver.versionNumber)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-end sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                    <span>Restore Version {ver.versionNumber}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Confirm Captive Portal Publish</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Publishing will update the live customer captive portal across all assigned MikroTik routers and create an immutable record in Version History.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Release Notes / Summary (Optional):
              </label>
              <input
                type="text"
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                placeholder="e.g. Updated holiday package pricing and amber gold branding"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20"
              >
                {loading ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM PACKAGE MODAL (Directly from Captive Portal Studio) */}
      <AddCustomPackageModal
        isOpen={showAddPackageModal}
        onClose={() => setShowAddPackageModal(false)}
        ownerId={ownerId}
        onPackageCreated={handlePackageCreatedFromModal}
      />
    </div>
  );
};
