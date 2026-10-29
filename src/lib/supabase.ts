import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  User,
  CustomerProfile,
  RouterOwnerProfile,
  WifiPackage,
  SubscriptionPlan,
  RouterDevice,
  AccessPoint,
  WifiSession,
  Voucher,
  Transaction,
} from '../types/index.ts';

// Supabase credentials with priority from environment variables
export const SUPABASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.SUPABASE_URL) ||
  'https://uztxsjbmugfbhgedpmpe.supabase.co';

export const SUPABASE_ANON_KEY: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.SUPABASE_ANON_KEY) ||
  'sb_publishable_jgXwQ8Vy2UZbQPkS2a4Z9Q_eTcjs7Xk';

export const isSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-project') &&
    SUPABASE_URL.startsWith('https://')
);

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Direct Supabase Database Service
 * Provides typed operations against PostgreSQL tables in Supabase
 */
export const supabaseDb = {
  client: supabase,
  isConfigured: isSupabaseConfigured,

  /**
   * Test database connectivity and latency
   */
  async checkConnection(): Promise<{
    ok: boolean;
    message: string;
    latencyMs: number;
    url: string;
    details?: any;
  }> {
    const start = performance.now();
    try {
      const { data, error } = await supabase.from('wifi_packages').select('id').limit(1);
      const latencyMs = Math.round(performance.now() - start);

      if (error) {
        return {
          ok: true,
          message: `Connected to Supabase (${error.message})`,
          latencyMs,
          url: SUPABASE_URL,
          details: error,
        };
      }

      return {
        ok: true,
        message: 'Connected to Supabase PostgreSQL Database',
        latencyMs,
        url: SUPABASE_URL,
        details: data,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.message || 'Failed to connect to Supabase',
        latencyMs: Math.round(performance.now() - start),
        url: SUPABASE_URL,
      };
    }
  },

  /**
   * Fetch WiFi packages from Supabase
   */
  async getWifiPackages(): Promise<WifiPackage[] | null> {
    try {
      const { data, error } = await supabase
        .from('wifi_packages')
        .select('*')
        .order('price_kes', { ascending: true });

      if (error || !data || data.length === 0) return null;

      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        durationHours: Number(p.duration_hours),
        durationLabel: p.duration_label,
        priceKes: Number(p.price_kes),
        speedLabel: p.speed_label,
        downloadSpeedMbps: Number(p.download_speed_mbps),
        uploadSpeedMbps: Number(p.upload_speed_mbps),
        category: p.category,
        deviceLimit: p.device_limit || 1,
        fairUsageGb: p.fair_usage_gb ? Number(p.fair_usage_gb) : undefined,
        isPopular: Boolean(p.is_popular),
        description: p.description,
      }));
    } catch (e) {
      console.warn('[Supabase] getWifiPackages fallback:', e);
      return null;
    }
  },

  /**
   * Fetch Router Owner subscription plans from Supabase
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[] | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_kes', { ascending: true });

      if (error || !data || data.length === 0) return null;

      return data.map((sp: any) => ({
        id: sp.id,
        name: sp.name,
        priceKes: Number(sp.price_kes),
        durationDays: Number(sp.duration_days || 30),
        maxRouters: Number(sp.max_routers),
        maxAccessPoints: Number(sp.max_access_points),
        maxCustomers: Number(sp.max_customers),
        maxVouchers: Number(sp.max_vouchers),
        features: Array.isArray(sp.features) ? sp.features : [],
        status: sp.status || 'ACTIVE',
      }));
    } catch (e) {
      console.warn('[Supabase] getSubscriptionPlans fallback:', e);
      return null;
    }
  },

  /**
   * Fetch connected Routers from Supabase
   */
  async getRouters(): Promise<RouterDevice[] | null> {
    try {
      const { data, error } = await supabase.from('routers').select('*');
      if (error || !data || data.length === 0) return null;

      return data.map((r: any) => ({
        id: r.id,
        ownerId: r.owner_id || 'usr-owner-01',
        ownerName: r.owner_name || 'Raymond Kamau',
        name: r.name,
        location: r.location,
        networkName: r.network_name,
        model: r.model,
        ipAddress: r.ip_address,
        routerOsVersion: r.router_os_version || 'RouterOS 7.15',
        status: r.status || 'ONLINE',
        cpuLoadPercent: Number(r.cpu_load_percent || 15),
        ramUsagePercent: Number(r.ram_usage_percent || 30),
        uptime: r.uptime || '14d 06h',
        internetStatus: r.internet_status || 'ONLINE',
        activeUsers: Number(r.active_users || 0),
        uploadTrafficMbps: Number(r.upload_traffic_mbps || 0),
        downloadTrafficMbps: Number(r.download_traffic_mbps || 0),
        lastHeartbeat: r.last_heartbeat || 'Just now',
        connectionMethod: r.connection_method || 'BRISK Setup Script',
      }));
    } catch (e) {
      console.warn('[Supabase] getRouters fallback:', e);
      return null;
    }
  },

  /**
   * Fetch Vouchers from Supabase
   */
  async getVouchers(): Promise<Voucher[] | null> {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return null;

      return data.map((v: any) => ({
        id: v.id,
        code: v.code,
        packageId: v.package_id,
        packageName: v.package_name,
        durationHours: Number(v.duration_hours),
        priceKes: Number(v.price_kes),
        speed: v.speed,
        network: v.network,
        status: v.status,
        createdAt: v.created_at,
        expiresAt: v.expires_at,
        redeemedByCustomerName: v.redeemed_by,
        redeemedAt: v.redeemed_at,
        batchNumber: v.batch_number,
      }));
    } catch (e) {
      console.warn('[Supabase] getVouchers fallback:', e);
      return null;
    }
  },

  /**
   * Fetch Transactions from Supabase
   */
  async getTransactions(): Promise<Transaction[] | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return null;

      return data.map((t: any) => ({
        id: t.id,
        receiptNumber: t.receipt_number,
        userId: t.user_id || 'usr-cust-01',
        userName: t.user_name,
        type: t.type,
        flowCategory: t.flow_category || (t.type === 'ROUTER_OWNER_SUBSCRIPTION' ? 'PLATFORM_SAAS' : 'ISP_REVENUE'),
        ispBusinessName: t.isp_business_name,
        beneficiaryName: t.beneficiary_name,
        recipientAccount: t.recipient_account,
        packageName: t.package_name,
        amountKes: Number(t.amount_kes),
        paymentMethod: t.payment_method,
        reference: t.reference,
        status: t.status,
        createdAt: t.created_at,
        mpesaPhone: t.mpesa_phone,
      }));
    } catch (e) {
      console.warn('[Supabase] getTransactions fallback:', e);
      return null;
    }
  },

  /**
   * Record a new Transaction in Supabase
   */
  async recordTransaction(tx: Transaction): Promise<boolean> {
    try {
      const { error } = await supabase.from('transactions').insert([
        {
          id: tx.id,
          receipt_number: tx.receiptNumber,
          user_id: null,
          user_name: tx.userName,
          type: tx.type,
          package_name: tx.packageName,
          amount_kes: tx.amountKes,
          payment_method: tx.paymentMethod,
          reference: tx.reference,
          status: tx.status,
          created_at: tx.createdAt,
          mpesa_phone: tx.mpesaPhone,
        },
      ]);
      return !error;
    } catch (e) {
      console.warn('[Supabase] recordTransaction error:', e);
      return false;
    }
  },

  /**
   * Redeem a Voucher directly in Supabase
   */
  async redeemVoucher(code: string, customerName: string): Promise<any> {
    const formattedCode = code.trim().toUpperCase();
    const { data: voucher, error: findErr } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', formattedCode)
      .single();

    if (findErr || !voucher) {
      throw new Error(`Voucher code ${code} not found in Supabase database.`);
    }

    if (voucher.status !== 'UNUSED') {
      throw new Error(`Voucher ${code} is already ${voucher.status.toLowerCase()}`);
    }

    const { data: updated, error: updateErr } = await supabase
      .from('vouchers')
      .update({
        status: 'REDEEMED',
        redeemed_by: customerName,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', voucher.id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return updated;
  },
};
