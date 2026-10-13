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
} from '../types/index.ts';

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
}

export const api = {
  async fetchState(): Promise<AppState> {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to fetch state');
    return res.json();
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
    return res.json();
  },

  async redeemVoucher(code: string, userId: string) {
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
    const res = await fetch('/api/installations/request', {
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

  async connectRouter(data: {
    ownerId: string;
    name: string;
    location: string;
    networkName: string;
    model: string;
    ipAddress: string;
    connectionMethod: string;
  }) {
    const res = await fetch('/api/owner/routers/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to connect router');
    }
    return res.json();
  },

  async routerAction(data: { routerId: string; action: string; targetSessionId?: string }) {
    const res = await fetch('/api/owner/routers/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Router action failed');
    }
    return res.json();
  },

  async generateVouchers(data: { packageId: string; quantity: number; networkName: string }) {
    const res = await fetch('/api/owner/vouchers/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate vouchers');
    }
    return res.json();
  },

  async submitHostApplication(data: {
    fullName: string;
    phone: string;
    email?: string;
    location: string;
    internetProvider: string;
    speedMbps: number;
    routerModel: string;
    availability: string;
  }) {
    const res = await fetch('/api/host-application', {
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

  async adminWithdrawalAction(data: { withdrawalId: string; action: 'APPROVE' | 'REJECT'; notes?: string }) {
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

  async toggleUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const res = await fetch('/api/admin/users/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update user status');
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
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit ticket');
    }
    return res.json();
  },
};
