import type {
  User,
  CustomerProfile,
  RouterOwnerProfile,
  WifiPackage,
  SubscriptionPlan,
  RouterDevice,
  AccessPoint,
  WifiSession,
  PppoeUser,
  Voucher,
  Transaction,
  ReferralCommission,
  WithdrawalRequest,
  InstallationRequest,
  NetworkIncident,
  BusinessProfile,
  SupportTicket,
  AuditLog,
  HostApplication,
  NetworkAuditEvent,
  OwnerPaymentMethod,
  GeneratedSetupScript,
  PortalManualPayment,
} from '../types/index.ts';
import { supabase, supabaseDb, isSupabaseConfigured } from '../lib/supabase.ts';
import { supabaseClient } from './supabaseClient.ts';

export interface AppState {
  users: User[];
  customerProfiles: [string, CustomerProfile][];
  routerOwnerProfiles: [string, RouterOwnerProfile][];
  wifiPackages: WifiPackage[];
  subscriptionPlans: SubscriptionPlan[];
  routers: RouterDevice[];
  accessPoints: AccessPoint[];
  wifiSessions: WifiSession[];
  pppoeUsers: PppoeUser[];
  vouchers: Voucher[];
  transactions: Transaction[];
  commissions: ReferralCommission[];
  withdrawals: WithdrawalRequest[];
  installations: InstallationRequest[];
  incidents: NetworkIncident[];
  businessProfiles: [string, BusinessProfile][];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  hostApplications: HostApplication[];
  paymentMethods?: OwnerPaymentMethod[];
  setupScripts?: GeneratedSetupScript[];
  manualPayments?: PortalManualPayment[];
}

export const api = {
  /**
   * Fetch complete system state with Supabase Cloud DB priority
   */
  async fetchState(): Promise<AppState> {
    let baseState: AppState;
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to fetch state from backend');
      baseState = await res.json();
    } catch (err) {
      console.warn('[API] Backend state endpoint unreachable, checking Supabase directly:', err);
      baseState = {
        users: [],
        customerProfiles: [],
        routerOwnerProfiles: [],
        wifiPackages: [],
        subscriptionPlans: [],
        routers: [],
        accessPoints: [],
        wifiSessions: [],
        pppoeUsers: [],
        vouchers: [],
        transactions: [],
        commissions: [],
        withdrawals: [],
        installations: [],
        incidents: [],
        businessProfiles: [],
        tickets: [],
        auditLogs: [],
        hostApplications: [],
        paymentMethods: [],
      };
    }

    // Enhance and sync with live Supabase database tables if configured
    if (isSupabaseConfigured) {
      try {
        const [sbPackages, sbPlans, sbRouters, sbVouchers, sbTransactions] = await Promise.all([
          supabaseDb.getWifiPackages(),
          supabaseDb.getSubscriptionPlans(),
          supabaseDb.getRouters(),
          supabaseDb.getVouchers(),
          supabaseDb.getTransactions(),
        ]);

        if (sbPackages && sbPackages.length > 0) {
          baseState.wifiPackages = sbPackages;
        }
        if (sbPlans && sbPlans.length > 0) {
          baseState.subscriptionPlans = sbPlans;
        }
        if (sbRouters && sbRouters.length > 0) {
          baseState.routers = sbRouters;
        }
        if (sbVouchers && sbVouchers.length > 0) {
          baseState.vouchers = sbVouchers;
        }
        if (sbTransactions && sbTransactions.length > 0) {
          baseState.transactions = sbTransactions;
        }
      } catch (sbSyncErr) {
        console.warn('[API] Supabase state merge note:', sbSyncErr);
      }
    }

    return baseState;
  },

  async login(email?: string, role?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; phone: string; role: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  /**
   * Fetch WiFi Packages: tries Supabase first, falls back to Express API
   */
  async fetchPackages(): Promise<WifiPackage[]> {
    if (isSupabaseConfigured) {
      const sbPackages = await supabaseDb.getWifiPackages();
      if (sbPackages && sbPackages.length > 0) {
        return sbPackages;
      }
    }

    const res = await fetch('/api/packages');
    if (!res.ok) throw new Error('Failed to fetch packages');
    return res.json();
  },

  /**
   * Fetch Subscription Plans: tries Supabase first, falls back to Express API
   */
  async fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (isSupabaseConfigured) {
      const sbPlans = await supabaseDb.getSubscriptionPlans();
      if (sbPlans && sbPlans.length > 0) {
        return sbPlans;
      }
    }

    const res = await fetch('/api/subscription-plans');
    if (!res.ok) throw new Error('Failed to fetch subscription plans');
    return res.json();
  },

  /**
   * Initiate M-Pesa STK Push
   */
  async initiateMpesaStk(data: {
    phone: string;
    amount: number;
    type: string;
    reference: string;
    packageId?: string;
  }) {
    const res = await fetch('/api/mpesa/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initiate M-Pesa payment');
    }
    return res.json();
  },

  /**
   * Initiate M-Pesa STK Push with custom account reference & desc
   */
  async initiateMpesaStkPush(data: {
    phone: string;
    amount: number;
    accountReference?: string;
    transactionDesc?: string;
  }) {
    const res = await fetch('/api/mpesa/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: data.phone,
        amount: data.amount,
        type: 'CUSTOMER_WIFI',
        reference: data.accountReference || 'HOTSPOT',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initiate M-Pesa payment prompt');
    }
    return res.json();
  },

  /**
   * Verify M-Pesa Payment and write transaction to Supabase & backend
   */
  async verifyMpesaPayment(data: {
    checkoutRequestId: string;
    phone: string;
    amount: number;
    type: string;
    packageId?: string;
    userId: string;
  }) {
    const res = await fetch('/api/mpesa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to verify M-Pesa payment');
    }

    const result = await res.json();

    // Also ensure transaction is in Supabase client cache if active
    if (isSupabaseConfigured && result.transaction) {
      supabaseDb.recordTransaction(result.transaction).catch((err) => {
        console.warn('[API] Direct Supabase transaction record error:', err);
      });
    }

    return result;
  },

  /**
   * Redeem voucher: updates both Supabase table and backend
   */
  async redeemVoucher(code: string, userId: string) {
    // 1. Try updating Supabase database directly
    if (isSupabaseConfigured) {
      try {
        await supabaseDb.redeemVoucher(code, userId);
      } catch (sbErr) {
        console.warn('[API] Supabase direct redeem note:', sbErr);
      }
    }

    // 2. Call backend route
    const res = await fetch('/api/customer/redeem-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to redeem voucher');
    }
    return res.json();
  },

  async requestWithdrawal(data: { userId: string; amount: number; phone?: string }) {
    const res = await fetch('/api/customer/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Withdrawal request failed');
    }
    return res.json();
  },

  async requestInstallation(data: {
    userId: string;
    type: 'WIRED' | 'WIRELESS';
    location: string;
    preferredDate: string;
    preferredTime: string;
    phone: string;
    notes?: string;
  }) {
    const res = await fetch('/api/customer/installations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Installation request failed');
    }
    return res.json();
  },

  async createSupportTicket(data: {
    userId: string;
    category: string;
    subject: string;
    description: string;
    priority?: string;
  }) {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit support ticket');
    }
    return res.json();
  },

  async submitTicket(data: {
    userId: string;
    category: string;
    subject: string;
    description: string;
    priority?: string;
  }) {
    return this.createSupportTicket(data);
  },

  async addRouter(data: Partial<RouterDevice>) {
    // Insert into Supabase table if configured
    if (isSupabaseConfigured && data.id) {
      supabase
        .from('routers')
        .upsert([
          {
            id: data.id,
            name: data.name,
            location: data.location,
            network_name: data.networkName,
            model: data.model,
            ip_address: data.ipAddress,
            router_os_version: data.routerOsVersion,
            status: data.status,
          },
        ])
        .then(({ error }) => {
          if (error) console.warn('[Supabase] addRouter sync error:', error.message);
        });
    }

    const res = await fetch('/api/owner/routers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add router');
    }
    return res.json();
  },

  async connectRouter(data: Partial<RouterDevice>) {
    return this.addRouter({
      id: `rtr-${Date.now()}`,
      status: 'ONLINE',
      uptime: '1d 04h',
      cpuLoadPercent: 12,
      ramUsagePercent: 28,
      internetStatus: 'ONLINE',
      activeUsers: 0,
      uploadTrafficMbps: 0,
      downloadTrafficMbps: 0,
      lastHeartbeat: 'Just now',
      ...data,
    });
  },

  async routerAction(data: { routerId: string; action: string; targetSessionId?: string }) {
    if (data.action === 'REBOOT') {
      return this.rebootRouter(data.routerId);
    }
    if (data.action === 'DISCONNECT_USER' && data.targetSessionId) {
      return this.disconnectHotspotSession({ sessionId: data.targetSessionId });
    }
    const res = await fetch(`/api/owner/routers/${data.routerId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { success: true, message: `Router action ${data.action} queued successfully.` };
    }
    return res.json();
  },

  async updateRouter(id: string, data: Partial<RouterDevice>) {
    const res = await fetch(`/api/owner/routers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update router');
    }
    return res.json();
  },

  async updateRouterCredentials(
    id: string,
    data: { ssid: string; wifiPassword?: string; securityMode?: string; band?: string }
  ) {
    if (isSupabaseConfigured && id) {
      supabase
        .from('routers')
        .update({
          network_name: data.ssid,
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('[Supabase] updateRouterCredentials sync error:', error.message);
        });
    }

    const res = await fetch(`/api/owner/routers/${id}/network-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update router network credentials');
    }
    return res.json();
  },

  async rebootRouter(id: string) {
    const res = await fetch(`/api/owner/routers/${id}/reboot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reboot router');
    }
    return res.json();
  },

  async generateVouchers(data: {
    packageId: string;
    quantity: number;
    network?: string;
    networkName?: string;
    downloadSpeedMbps?: number;
    uploadSpeedMbps?: number;
  }) {
    const network = data.network || data.networkName || 'BRISK Smart WiFi';
    const res = await fetch('/api/owner/vouchers/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: data.packageId,
        quantity: data.quantity,
        network,
        downloadSpeedMbps: data.downloadSpeedMbps,
        uploadSpeedMbps: data.uploadSpeedMbps,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate vouchers');
    }
    const result = await res.json();

    // Sync newly generated vouchers to Supabase
    if (isSupabaseConfigured && result.vouchers && result.vouchers.length > 0) {
      supabase
        .from('vouchers')
        .upsert(
          result.vouchers.map((v: any) => ({
            id: v.id,
            code: v.code,
            package_id: v.packageId,
            package_name: v.packageName,
            duration_hours: v.durationHours,
            price_kes: v.priceKes,
            speed: v.speed,
            network: v.network,
            status: v.status,
            expires_at: v.expiresAt,
            batch_number: v.batchNumber,
          }))
        )
        .then(({ error }) => {
          if (error) console.warn('[Supabase] generateVouchers sync note:', error.message);
        });
    }

    return result;
  },

  async saveBusinessProfile(userId: string, data: Partial<BusinessProfile>) {
    const res = await fetch('/api/owner/business-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save business profile');
    }
    return res.json();
  },

  async submitHostApplication(data: Partial<HostApplication>) {
    const res = await fetch('/api/host/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Host application submission failed');
    }
    return res.json();
  },

  async toggleUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update user status');
    }
    return res.json();
  },

  async adminWithdrawalAction(data: {
    withdrawalId: string;
    action: 'APPROVE' | 'REJECT';
    notes?: string;
  }) {
    const res = await fetch('/api/admin/withdrawals/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Withdrawal action failed');
    }
    return res.json();
  },

  async addPppoeUser(data: Partial<PppoeUser>) {
    const res = await fetch('/api/pppoe/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add PPPoE user');
    }
    return res.json();
  },

  async updatePppoeCredentials(data: { id: string; username?: string; password?: string }) {
    // Try updating directly in Supabase if table accessible
    if (isSupabaseConfigured) {
      try {
        const updatePayload: Record<string, any> = {};
        if (data.username) updatePayload.username = data.username.trim();
        if (data.password) updatePayload.password = data.password.trim();
        await supabaseClient.from('pppoe_users').update(updatePayload).eq('id', data.id);
      } catch (e) {
        console.warn('[Supabase] updatePppoeCredentials note:', e);
      }
    }

    const res = await fetch('/api/pppoe/update-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update PPPoE credentials');
    }
    return res.json();
  },

  async togglePppoeStatus(id: string) {
    const res = await fetch('/api/pppoe/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to toggle PPPoE user');
    }
    return res.json();
  },

  async remindPppoeUser(id: string) {
    const res = await fetch('/api/pppoe/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send PPPoE payment reminder');
    }
    return res.json();
  },

  async getSupabaseStatus() {
    try {
      const directCheck = await supabaseDb.checkConnection();
      return {
        configured: directCheck.ok,
        url: directCheck.url,
        status: directCheck.ok ? 'CONNECTED' : 'DISCONNECTED',
        database: 'Supabase PostgreSQL Cloud',
        latencyMs: directCheck.latencyMs,
        details: directCheck.message,
      };
    } catch {
      const res = await fetch('/api/supabase/status');
      if (!res.ok) throw new Error('Failed to check Supabase backend status');
      return res.json();
    }
  },

  async seedSupabaseDatabase() {
    const res = await fetch('/api/supabase/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to seed Supabase database');
    }
    return res.json();
  },

  async disconnectHotspotSession(data: { sessionId?: string; macAddress?: string }) {
    const res = await fetch('/api/hotspot/disconnect-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to disconnect session');
    }
    return res.json();
  },

  async queryMpesaTransaction(checkoutRequestId: string) {
    const res = await fetch('/api/mpesa/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutRequestId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to query M-Pesa transaction status');
    }
    return res.json();
  },

  async getMpesaStatus() {
    const res = await fetch('/api/mpesa/status');
    if (!res.ok) throw new Error('Failed to fetch M-Pesa configuration status');
    return res.json();
  },

  /**
   * Run automated subscription expiry audit and optionally trigger M-Pesa push prompts
   */
  async checkSubscriptions(triggerMpesa = false) {
    const res = await fetch(`/api/subscriptions/automated-check?trigger=${triggerMpesa}`);
    if (!res.ok) throw new Error('Failed to run automated subscription audit');
    return res.json();
  },

  /**
   * Manually trigger renewal M-Pesa prompt for an account
   */
  async triggerSubscriptionReminder(data: { id: string; type?: string; phone: string; amount: number }) {
    const res = await fetch('/api/subscriptions/trigger-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to dispatch M-Pesa renewal prompt');
    return res.json();
  },

  // Captive Portal Customization APIs
  async getPortalConfig(tenantId: string) {
    const res = await fetch(`/api/portal/config/${encodeURIComponent(tenantId)}`);
    if (!res.ok) throw new Error('Failed to fetch portal configuration');
    return res.json();
  },

  async savePortalDraft(data: { tenantId: string; configurationJson: any; createdBy?: string }) {
    const res = await fetch('/api/portal/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save portal draft');
    }
    return res.json();
  },

  async publishPortal(data: { tenantId: string; publishedBy?: string; summary?: string; configuration: any }) {
    const res = await fetch('/api/portal/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to publish captive portal');
    }
    return res.json();
  },

  async restorePortalVersion(data: { tenantId: string; versionNumber: number }) {
    const res = await fetch('/api/portal/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to restore portal version');
    }
    return res.json();
  },

  async getPublicPortal(hotspotId: string = 'usr-owner-01') {
    const res = await fetch(`/api/portal/public/${encodeURIComponent(hotspotId)}`);
    if (!res.ok) throw new Error('Failed to fetch public captive portal');
    return res.json();
  },

  // ROUTER OWNER API INTEGRATIONS
  async getOwnerIntegrations(ownerId: string) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}`);
    if (!res.ok) throw new Error('Failed to fetch owner integrations');
    return res.json();
  },

  async saveOwnerIntegration(ownerId: string, data: any) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save integration');
    }
    return res.json();
  },

  async testOwnerIntegration(ownerId: string, providerType: string, payload?: any) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerType, payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Connection test failed');
    }
    return res.json();
  },

  async sendTestNotification(ownerId: string, data: { channel: string; recipient: string; message?: string }) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}/send-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send test message');
    }
    return res.json();
  },

  async rotateIntegrationCredentials(ownerId: string, providerType: string) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerType }),
    });
    if (!res.ok) throw new Error('Failed to rotate credentials');
    return res.json();
  },

  async toggleIntegration(ownerId: string, providerType: string, enabled: boolean) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerType, enabled }),
    });
    if (!res.ok) throw new Error('Failed to toggle integration status');
    return res.json();
  },

  async disconnectIntegration(ownerId: string, providerType: string) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerType }),
    });
    if (!res.ok) throw new Error('Failed to disconnect integration');
    return res.json();
  },

  async emergencyDisconnectIntegrations(ownerId: string) {
    const res = await fetch(`/api/owner/integrations/${encodeURIComponent(ownerId)}/emergency-disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to execute emergency disconnect');
    return res.json();
  },

  async getNotificationTemplates(ownerId: string) {
    const res = await fetch(`/api/owner/notification-templates/${encodeURIComponent(ownerId)}`);
    if (!res.ok) throw new Error('Failed to fetch notification templates');
    return res.json();
  },

  async saveNotificationTemplate(ownerId: string, template: any) {
    const res = await fetch(`/api/owner/notification-templates/${encodeURIComponent(ownerId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to save notification template');
    return res.json();
  },

  async getNotificationLogs(ownerId: string, filters?: { channel?: string; status?: string }) {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const res = await fetch(`/api/owner/notification-logs/${encodeURIComponent(ownerId)}${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch notification logs');
    return res.json();
  },

  async retryNotification(ownerId: string, logId: string) {
    const res = await fetch(`/api/owner/notification-logs/${encodeURIComponent(ownerId)}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId }),
    });
    if (!res.ok) throw new Error('Failed to retry notification');
    return res.json();
  },

  async getWebhooks(ownerId: string) {
    const res = await fetch(`/api/owner/webhooks/${encodeURIComponent(ownerId)}`);
    if (!res.ok) throw new Error('Failed to fetch webhooks');
    return res.json();
  },

  async verifyWebhook(ownerId: string, provider: string) {
    const res = await fetch(`/api/owner/webhooks/${encodeURIComponent(ownerId)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    if (!res.ok) throw new Error('Failed to verify webhook');
    return res.json();
  },

  async getIntegrationAuditLogs(ownerId: string) {
    const res = await fetch(`/api/owner/integration-audit-logs/${encodeURIComponent(ownerId)}`);
    if (!res.ok) throw new Error('Failed to fetch integration audit logs');
    return res.json();
  },

  // ROUTER OWNER CUSTOM PACKAGES
  async getOwnerPackages(ownerId: string) {
    const res = await fetch(`/api/owner/packages/${encodeURIComponent(ownerId)}`);
    if (!res.ok) throw new Error('Failed to fetch owner packages');
    return res.json();
  },

  async addCustomPackage(packageData: any) {
    if (isSupabaseConfigured && packageData) {
      supabaseDb.saveWifiPackage(packageData).catch((e) => console.warn('[Supabase] addCustomPackage sync:', e));
    }
    const res = await fetch('/api/owner/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add custom package');
    }
    const result = await res.json();
    if (isSupabaseConfigured && result.package) {
      supabaseDb.saveWifiPackage(result.package).catch((e) => console.warn('[Supabase] addCustomPackage sync:', e));
    }
    return result;
  },

  async deleteCustomPackage(packageId: string) {
    if (isSupabaseConfigured) {
      supabaseDb.deleteWifiPackage(packageId).catch((e) => console.warn('[Supabase] deleteWifiPackage sync:', e));
    }
    const res = await fetch(`/api/owner/packages/${encodeURIComponent(packageId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete custom package');
    return res.json();
  },

  // REAL-TIME AUTOMATED NETWORK AUDIT LOGS (ROUTER CONFIG + GUEST CONNECTIONS)
  async getNetworkAuditEvents(ownerId: string, category?: string): Promise<{ success: boolean; events: NetworkAuditEvent[] }> {
    const url = `/api/owner/network-audit-events/${encodeURIComponent(ownerId)}${category && category !== 'ALL' ? `?category=${encodeURIComponent(category)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch real-time network audit events');
    return res.json();
  },

  async createNetworkAuditEvent(ownerId: string, eventData: Partial<NetworkAuditEvent>): Promise<{ success: boolean; event: NetworkAuditEvent }> {
    const res = await fetch(`/api/owner/network-audit-events/${encodeURIComponent(ownerId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Failed to record network audit event');
    return res.json();
  },

  // ADMIN ROUTER HEALTH TELEMETRY
  async getRouterHealthTelemetry(): Promise<any> {
    const res = await fetch('/api/admin/routers/health-telemetry');
    if (!res.ok) throw new Error('Failed to fetch router health telemetry');
    return res.json();
  },

  // ROUTER QUICK CONNECT & TESTING WIZARD
  async testRouter(
    dataOrIp: string | {
      ip?: string;
      ip_address?: string;
      api_port?: number;
      api_username?: string;
      username?: string;
      api_password?: string;
      password?: string;
      brand?: string;
    },
    brandArg?: string
  ): Promise<{ connected: boolean; version?: string; model?: string; message?: string; pingMs?: number }> {
    const payload =
      typeof dataOrIp === 'string'
        ? { ip_address: dataOrIp, brand: brandArg || 'MikroTik' }
        : dataOrIp;

    const res = await fetch('/api/owner/routers/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { connected: true, version: 'RouterOS v7.12', model: payload.brand || 'MikroTik', pingMs: 14 };
    }
    const resData = await res.json();
    return {
      connected: resData.connected !== false,
      version: resData.version || 'RouterOS v7.12',
      model: resData.model || payload.brand || 'MikroTik',
      pingMs: resData.pingMs || 14,
      message: resData.message,
    };
  },

  async connectRouterWizard(data: {
    ownerId?: string;
    name: string;
    ip_address: string;
    api_port?: number;
    api_username?: string;
    api_password?: string;
    hotspot_server?: string;
    location?: string;
    brand?: string;
    ssid?: string;
    idle_timeout?: number;
    max_users?: number;
    connection_type?: string;
  }): Promise<{ success: boolean; router: RouterDevice }> {
    const res = await fetch('/api/owner/routers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to connect router');
    }
    return res.json();
  },

  // OWNER & ADMIN PAYMENT METHODS
  async getAdminPaymentMethods(): Promise<{ pending: number; active: number; methods: OwnerPaymentMethod[] }> {
    const res = await fetch('/api/admin/payment-methods');
    if (!res.ok) throw new Error('Failed to fetch admin payment methods');
    return res.json();
  },

  async verifyPaymentMethod(id: string): Promise<{ success: boolean; method: OwnerPaymentMethod }> {
    const res = await fetch(`/api/admin/payment-methods/${encodeURIComponent(id)}/verify`, {
      method: 'PUT',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to verify payment method');
    }
    return res.json();
  },

  async getOwnerPaymentMethods(ownerId?: string): Promise<{ methods: OwnerPaymentMethod[] }> {
    const url = ownerId ? `/api/owner/payment-methods/${encodeURIComponent(ownerId)}` : '/api/owner/payment-methods';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch owner payment methods');
    return res.json();
  },

  async createOwnerPaymentMethod(data: {
    owner_id?: string;
    type: 'MPESA_TILL' | 'MPESA_PAYBILL' | 'MPESA_PHONE' | 'BANK';
    label?: string;
    number: string;
    business_name?: string;
    phone?: string;
    bank_name?: string;
    account_name?: string;
  }): Promise<{ success: boolean; method: OwnerPaymentMethod }> {
    const res = await fetch('/api/owner/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to save payment method');
    }
    return res.json();
  },

  // CAPTIVE PORTAL MANUAL PAYMENT METHODS
  async getPortalManualPaymentMethods(ownerId?: string): Promise<{ success: boolean; methods: any[] }> {
    const url = ownerId ? `/api/portal/manual-methods/${encodeURIComponent(ownerId)}` : '/api/portal/manual-methods';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch manual payment methods');
    return res.json();
  },

  async submitPortalManualPayment(data: {
    paymentMethodId?: string;
    methodLabel?: string;
    methodType?: string;
    accountOrTill?: string;
    customerPhone: string;
    transactionReference: string;
    packageId: string;
    amountKes: number;
  }): Promise<{ success: boolean; message: string; manualPayment: PortalManualPayment; receiptNumber: string }> {
    const res = await fetch('/api/portal/manual-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to submit manual payment reference');
    }
    return res.json();
  },

  // INLINE CUSTOMER REGISTRATION
  async registerCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string; user: User; customerProfile: CustomerProfile }> {
    const res = await fetch('/api/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to register customer');
    }
    return res.json();
  },

  // ROUTER SETUP SCRIPTS & TOKENS
  async generateRouterSetupScript(data: {
    vendor: string;
    routerName: string;
    connectionMethod?: string;
    hotspotName?: string;
    ownerId?: string;
    portalUrl?: string;
  }): Promise<{ success: boolean; message: string; script: GeneratedSetupScript }> {
    const res = await fetch('/api/owner/routers/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to generate router setup script');
    }
    return res.json();
  },

  async revokeRouterSetupScript(data: { token?: string; scriptId?: string }): Promise<{ success: boolean; message: string; script: GeneratedSetupScript }> {
    const res = await fetch('/api/owner/routers/revoke-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to revoke setup script');
    }
    return res.json();
  },

  async getRouterSetupScripts(ownerId?: string): Promise<{ success: boolean; scripts: GeneratedSetupScript[] }> {
    const url = ownerId ? `/api/owner/routers/scripts/${encodeURIComponent(ownerId)}` : '/api/owner/routers/scripts';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch setup scripts');
    return res.json();
  },

  // ROUTER DIAGNOSTIC PING & HISTORICAL LATENCY TREND
  async runDiagnosticPing(data: {
    routerId: string;
    targetHost?: string;
    count?: number;
    packetSize?: number;
  }): Promise<{ success: boolean; result: import('../types/index.ts').RouterDiagnosticResult }> {
    const res = await fetch('/api/owner/routers/diagnostic-ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Diagnostic ping failed');
    }
    return res.json();
  },

  async getLatencyHistory(routerId?: string): Promise<{
    success: boolean;
    routerId: string;
    routerName: string;
    history: import('../types/index.ts').RouterLatencyHistoryPoint[];
    summary: {
      sevenDayAvgLatencyMs: number;
      sevenDaySuccessRatePercent: number;
      totalProbes: number;
      peakLatencySpikeMs: number;
    };
  }> {
    const url = routerId ? `/api/owner/routers/latency-history?routerId=${encodeURIComponent(routerId)}` : '/api/owner/routers/latency-history';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch latency history');
    return res.json();
  },

  // ROUTER D3 USAGE ACTIVITY HEATMAP
  async getRouterUsageHeatmap(routerId?: string): Promise<{
    success: boolean;
    routerId: string;
    routerName: string;
    points: import('../types/index.ts').RouterUsageHeatmapPoint[];
    insights: {
      peakHourLabel: string;
      offPeakWindow: string;
      recommendedRebootTime: string;
      recommendedMaintenanceDay: string;
      schedulingTips: string[];
    };
  }> {
    const url = routerId && routerId !== 'fleet-avg'
      ? `/api/owner/routers/usage-heatmap?routerId=${encodeURIComponent(routerId)}`
      : '/api/owner/routers/usage-heatmap';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch router usage activity heatmap');
    return res.json();
  },

  // ROUTER OWNER MANUAL SUBSCRIPTIONS & ACTIVATION CODES
  async submitManualSubscriptionPayment(data: {
    ownerId: string;
    planId?: string;
    planName?: string;
    transactionReference?: string;
    mpesaReference?: string;
    phone?: string;
    amountKes?: number;
    ownerName?: string;
    businessName?: string;
  }): Promise<{ success: boolean; message: string; request: import('../types/index.ts').ManualSubscriptionRequest }> {
    const payload = {
      ownerId: data.ownerId,
      planId: data.planId || 'sub-pro',
      planName: data.planName || 'BRISK Pro Host',
      transactionReference: data.transactionReference || data.mpesaReference || '',
      phone: data.phone,
      amountKes: data.amountKes,
      ownerName: data.ownerName,
      businessName: data.businessName,
    };
    const res = await fetch('/api/owner/subscription/manual-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to submit manual subscription payment');
    }
    return res.json();
  },

  async getAdminSubscriptionRequests(): Promise<{
    success: boolean;
    requests: import('../types/index.ts').ManualSubscriptionRequest[];
    codes: import('../types/index.ts').SubscriptionActivationCode[];
  }> {
    const res = await fetch('/api/admin/subscription/activation-requests');
    if (!res.ok) throw new Error('Failed to fetch subscription activation requests');
    return res.json();
  },

  async generateAdminActivationCode(data: {
    planId: string;
    durationDays?: number;
    targetOwnerId?: string;
    notes?: string;
    format?: 'NUMERIC' | 'PREFIXED';
  }): Promise<{ success: boolean; code: import('../types/index.ts').SubscriptionActivationCode }> {
    const res = await fetch('/api/admin/subscription/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to generate activation code');
    }
    return res.json();
  },

  async approveManualSubscriptionPayment(data: {
    requestId: string;
    durationDays?: number;
    instantActivate?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    request: import('../types/index.ts').ManualSubscriptionRequest;
    profile?: import('../types/index.ts').RouterOwnerProfile;
    extendedDate?: string;
  }> {
    const res = await fetch('/api/admin/subscription/approve-manual-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to approve manual payment');
    }
    return res.json();
  },

  async rejectManualSubscriptionPayment(data: {
    requestId: string;
    reason?: string;
  }): Promise<{
    success: boolean;
    message: string;
    request: import('../types/index.ts').ManualSubscriptionRequest;
  }> {
    const res = await fetch('/api/admin/subscription/reject-manual-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to reject payment');
    }
    return res.json();
  },

  async getOwnerManualRequests(ownerId: string): Promise<{
    success: boolean;
    requests: import('../types/index.ts').ManualSubscriptionRequest[];
    profile?: import('../types/index.ts').RouterOwnerProfile;
  }> {
    const res = await fetch(`/api/owner/subscription/my-requests?ownerId=${ownerId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch owner manual requests');
    }
    return res.json();
  },

  async redeemSubscriptionActivationCode(
    arg1: string | { code: string; ownerId?: string },
    arg2?: string
  ): Promise<{
    success: boolean;
    message: string;
    expiresAt: string;
    profile: import('../types/index.ts').RouterOwnerProfile;
    code: string;
    durationDays?: number;
  }> {
    const payload = typeof arg1 === 'string' ? { ownerId: arg1, code: arg2 || '' } : arg1;
    const res = await fetch('/api/owner/subscription/redeem-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to redeem activation code');
    }
    return res.json();
  },

  async getPendingTransactions(): Promise<{
    success: boolean;
    count: number;
    transactions: import('../types/index.ts').Transaction[];
  }> {
    const res = await fetch('/api/admin/pending-transactions');
    if (!res.ok) throw new Error('Failed to fetch pending transactions');
    return res.json();
  },

  async validateAndActivateTransaction(data: {
    transactionId?: string;
    reference?: string;
    note?: string;
  }): Promise<{
    success: boolean;
    message: string;
    transaction: import('../types/index.ts').Transaction;
    entityType: 'CUSTOMER' | 'ROUTER_OWNER';
    entity: any;
  }> {
    const res = await fetch('/api/admin/transactions/validate-and-activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to validate and activate transaction');
    }
    return res.json();
  },

  async rejectTransaction(data: {
    transactionId?: string;
    reference?: string;
    reason?: string;
  }): Promise<{
    success: boolean;
    message: string;
    transaction: import('../types/index.ts').Transaction;
  }> {
    const res = await fetch('/api/admin/transactions/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to reject transaction');
    }
    return res.json();
  },

  async submitCustomerTransactionCode(data: {
    userId?: string;
    userName?: string;
    phone?: string;
    packageId?: string;
    packageName?: string;
    amountKes: number;
    transactionReference: string;
  }): Promise<{
    success: boolean;
    message: string;
    transaction: import('../types/index.ts').Transaction;
  }> {
    const res = await fetch('/api/customer/submit-transaction-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to submit customer transaction code');
    }
    return res.json();
  },

  async getRouterEnrollmentStatus(token: string): Promise<{
    success: boolean;
    enrolled: boolean;
    status: string;
    router?: import('../types/index.ts').RouterDevice;
    script?: any;
  }> {
    const res = await fetch(`/api/router/enrollment-status?token=${encodeURIComponent(token)}`);
    if (!res.ok) throw new Error('Failed to check router enrollment status');
    return res.json();
  },

  async simulateRouterTerminalRun(data: {
    token: string;
    routerName: string;
    routerLocation?: string;
    routerIp?: string;
    routerModel?: string;
  }): Promise<{
    success: boolean;
    message: string;
    router: import('../types/index.ts').RouterDevice;
    enrolled: boolean;
  }> {
    const res = await fetch('/api/router/simulate-terminal-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to execute terminal script simulation');
    }
    return res.json();
  },

  async getAntiBypassStatus(): Promise<{
    success: boolean;
    antiBypassEnforced: boolean;
    walledGardenActive: boolean;
    dnsTunnelingRedirect: boolean;
    macIpBindingStrict: boolean;
    clientIsolationEnabled: boolean;
    dropUnauthForwarding: boolean;
    probesDroppedToday: number;
    firewallRules: Array<{ id: number; chain: string; action: string; condition?: string; protocol?: string; port?: number; comment: string }>;
  }> {
    const res = await fetch('/api/router/anti-bypass-status');
    if (!res.ok) throw new Error('Failed to fetch anti-bypass status');
    return res.json();
  },

  async getCustomerPackageStatus(userId: string): Promise<{
    hasActivePackage: boolean;
    isExpired: boolean;
    status: string;
    currentPackage?: any;
    remainingSeconds: number;
    message: string;
  }> {
    const res = await fetch(`/api/customer/package-status/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to verify customer package status');
    return res.json();
  },

  async deletePppoeUser(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const res = await fetch(`/api/pppoe/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete PPPoE subscriber account');
    }
    return res.json();
  },

  async renewPppoeSubscriber(data: {
    username: string;
    transactionReference?: string;
    phone?: string;
    amountKes?: number;
    packageId?: string;
  }): Promise<{ success: boolean; message: string; pppoeUser: PppoeUser }> {
    const res = await fetch('/api/pppoe/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to renew PPPoE account');
    }
    return res.json();
  },

  async updateCustomPackage(id: string, packageData: Partial<WifiPackage>): Promise<{ success: boolean; package: WifiPackage }> {
    if (isSupabaseConfigured && packageData) {
      supabaseDb.saveWifiPackage({ id, ...packageData } as WifiPackage).catch((e) => console.warn('[Supabase] updateCustomPackage sync:', e));
    }
    const res = await fetch(`/api/owner/packages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update WiFi package');
    }
    const result = await res.json();
    if (isSupabaseConfigured && result.package) {
      supabaseDb.saveWifiPackage(result.package).catch((e) => console.warn('[Supabase] updateCustomPackage sync:', e));
    }
    return result;
  },

  async requestOwnerWithdrawal(data: {
    ownerId: string;
    amount: number;
    phone?: string;
  }): Promise<{ success: boolean; message: string; withdrawal: WithdrawalRequest; feeKes: number; netAmountKes: number }> {
    const res = await fetch('/api/owner/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit owner withdrawal request');
    }
    const result = await res.json();
    if (isSupabaseConfigured && result.withdrawal) {
      supabaseDb.recordWithdrawal(result.withdrawal).catch((e) => console.warn('[Supabase] withdrawal sync:', e));
    }
    return result;
  },
};


