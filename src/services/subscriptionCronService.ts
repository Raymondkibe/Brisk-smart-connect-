import { api } from './api.ts';
import type { RouterOwnerProfile, PppoeUser, SubscriptionPlan } from '../types/index.ts';

export interface SubscriptionAuditResult {
  id: string;
  name: string;
  type: 'ROUTER_OWNER' | 'PPPOE_CLIENT';
  phone: string;
  planName: string;
  amountKes: number;
  expiryDate: string;
  daysRemaining: number;
  status: 'HEALTHY' | 'EXPIRING_SOON' | 'EXPIRED';
  reminderTriggered: boolean;
  checkoutRequestId?: string;
  lastReminderSentAt?: string;
}

export interface SubscriptionServiceState {
  isActive: boolean;
  intervalMinutes: number;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  totalChecked: number;
  expiringSoonCount: number;
  expiredCount: number;
  healthyCount: number;
  totalMpesaPromptsDispatched: number;
  totalRevenueDueKes: number;
  items: SubscriptionAuditResult[];
  logs: string[];
}

type SubscriberListener = (state: SubscriptionServiceState) => void;

class SubscriptionCronService {
  private timer: any = null;
  private listeners: Set<SubscriberListener> = new Set();
  private sentRemindersMap: Map<string, number> = new Map(); // id -> timestamp

  private state: SubscriptionServiceState = {
    isActive: true,
    intervalMinutes: 10,
    lastCheckedAt: null,
    nextCheckAt: null,
    totalChecked: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    healthyCount: 0,
    totalMpesaPromptsDispatched: 0,
    totalRevenueDueKes: 0,
    items: [],
    logs: [],
  };

  constructor() {
    // Automatically start recurring evaluation loop
    this.startRecurringCheck(10);
  }

  public getState(): SubscriptionServiceState {
    return { ...this.state };
  }

  public subscribe(listener: SubscriberListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Subscription service listener error:', err);
      }
    });
  }

  private addLog(msg: string) {
    const timeStr = new Date().toLocaleTimeString();
    this.state.logs = [`[${timeStr}] ${msg}`, ...this.state.logs.slice(0, 49)];
  }

  /**
   * Run automated audit checking subscription status against current date
   */
  public async runAudit(options: { autoTriggerMpesa?: boolean } = { autoTriggerMpesa: true }): Promise<SubscriptionAuditResult[]> {
    this.addLog('Starting automated subscription status check against current date...');
    const now = new Date();
    const results: SubscriptionAuditResult[] = [];
    let expiringCount = 0;
    let expiredCount = 0;
    let healthyCount = 0;
    let revenueDue = 0;
    let promptsSent = 0;

    try {
      // 1. Fetch current live platform state
      const appState = await api.fetchState();
      const routerOwners = appState.routerOwnerProfiles || [];
      const pppoeUsers = appState.pppoeUsers || [];
      const subscriptionPlans = appState.subscriptionPlans || [];

      // 2. Audit Router Owner Subscriptions
      for (const [userId, profile] of routerOwners) {
        const user = appState.users.find((u) => u.id === userId);
        const plan = subscriptionPlans.find((p) => p.id === profile.subscriptionPlanId) || subscriptionPlans[0];
        const expiryStr = profile.trialEndsAt || profile.subscriptionExpiresAt || new Date(Date.now() + 86400000 * 2).toISOString();
        const expiryTime = new Date(expiryStr).getTime();
        const diffMs = expiryTime - now.getTime();
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let status: 'HEALTHY' | 'EXPIRING_SOON' | 'EXPIRED' = 'HEALTHY';
        if (daysRemaining <= 0) {
          status = 'EXPIRED';
          expiredCount++;
        } else if (daysRemaining <= 3) {
          status = 'EXPIRING_SOON';
          expiringCount++;
        } else {
          healthyCount++;
        }

        const amountKes = plan ? plan.priceKes : 950;
        let reminderTriggered = false;
        let checkoutId: string | undefined = undefined;

        // Trigger automated M-Pesa STK push for expiring or expired accounts
        if (options.autoTriggerMpesa && (status === 'EXPIRING_SOON' || status === 'EXPIRED')) {
          revenueDue += amountKes;
          const phone = user?.phone || '0799123456';
          const lastSent = this.sentRemindersMap.get(userId) || 0;
          const cooldownElapsed = Date.now() - lastSent > 1000 * 60 * 60 * 12; // 12hr cooldown

          if (cooldownElapsed) {
            try {
              const pushRes = await api.initiateMpesaStk({
                phone,
                amount: amountKes,
                type: 'ROUTER_OWNER_SUBSCRIPTION',
                reference: `SUB-RENEW-${userId.slice(-4)}`,
              });
              reminderTriggered = true;
              checkoutId = pushRes.checkoutRequestId;
              this.sentRemindersMap.set(userId, Date.now());
              promptsSent++;
              this.addLog(`Triggered M-Pesa STK push for ${user?.name || 'Owner'} (${phone}) KES ${amountKes}`);
            } catch (err: any) {
              this.addLog(`Note sending STK push to ${phone}: ${err.message}`);
            }
          }
        }

        results.push({
          id: userId,
          name: profile.businessName || user?.name || 'Router Owner',
          type: 'ROUTER_OWNER',
          phone: user?.phone || '07XXXXXXXX',
          planName: `${plan?.name || 'Growth ISP'} Plan`,
          amountKes,
          expiryDate: expiryStr,
          daysRemaining,
          status,
          reminderTriggered,
          checkoutRequestId: checkoutId,
        });
      }

      // 3. Audit Customer PPPoE Fiber Subscriptions
      for (const pppoe of pppoeUsers) {
        const expiryStr = pppoe.expiresAt || pppoe.expiryDate || new Date(Date.now() + 86400000 * 3).toISOString();
        const expiryTime = new Date(expiryStr).getTime();
        const diffMs = expiryTime - now.getTime();
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let status: 'HEALTHY' | 'EXPIRING_SOON' | 'EXPIRED' = 'HEALTHY';
        if (daysRemaining <= 0) {
          status = 'EXPIRED';
          expiredCount++;
        } else if (daysRemaining <= 3) {
          status = 'EXPIRING_SOON';
          expiringCount++;
        } else {
          healthyCount++;
        }

        let reminderTriggered = false;
        let checkoutId: string | undefined = undefined;
        const phone = pppoe.phone || '0799123456';
        const amountKes = pppoe.monthlyFeeKes || 2500;
        const customerName = pppoe.customerName || pppoe.username;
        const allocatedSpeed = pppoe.speed || pppoe.allocatedSpeed || '20 Mbps';

        if (options.autoTriggerMpesa && (status === 'EXPIRING_SOON' || status === 'EXPIRED')) {
          revenueDue += amountKes;
          const lastSent = this.sentRemindersMap.get(pppoe.id) || 0;
          const cooldownElapsed = Date.now() - lastSent > 1000 * 60 * 60 * 12;

          if (cooldownElapsed) {
            try {
              const pushRes = await api.initiateMpesaStk({
                phone,
                amount: amountKes,
                type: 'CUSTOMER_WIFI',
                reference: `PPPOE-${pppoe.username}`,
              });
              reminderTriggered = true;
              checkoutId = pushRes.checkoutRequestId;
              this.sentRemindersMap.set(pppoe.id, Date.now());
              promptsSent++;
              this.addLog(`Triggered PPPoE M-Pesa prompt for ${customerName} (${phone}) KES ${amountKes}`);
            } catch (err: any) {
              this.addLog(`Note for PPPoE reminder: ${err.message}`);
            }
          }
        }

        results.push({
          id: pppoe.id,
          name: `${customerName} (${pppoe.username})`,
          type: 'PPPOE_CLIENT',
          phone,
          planName: `${allocatedSpeed} Home Fiber`,
          amountKes,
          expiryDate: expiryStr,
          daysRemaining,
          status,
          reminderTriggered,
          checkoutRequestId: checkoutId,
        });
      }

      // Update state
      this.state.lastCheckedAt = now.toISOString();
      this.state.nextCheckAt = new Date(now.getTime() + this.state.intervalMinutes * 60 * 1000).toISOString();
      this.state.totalChecked = results.length;
      this.state.expiringSoonCount = expiringCount;
      this.state.expiredCount = expiredCount;
      this.state.healthyCount = healthyCount;
      this.state.totalMpesaPromptsDispatched += promptsSent;
      this.state.totalRevenueDueKes = revenueDue;
      this.state.items = results;

      this.addLog(`Audit finished: ${results.length} subscriptions evaluated. ${expiringCount} expiring soon, ${expiredCount} expired.`);
      this.notify();
      return results;
    } catch (err: any) {
      this.addLog(`Error during subscription audit: ${err.message}`);
      this.notify();
      return [];
    }
  }

  /**
   * Manually trigger instant renewal STK push for a specific subscription
   */
  public async triggerManualRenewalPush(item: SubscriptionAuditResult): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.initiateMpesaStk({
        phone: item.phone,
        amount: item.amountKes,
        type: item.type === 'ROUTER_OWNER' ? 'ROUTER_OWNER_SUBSCRIPTION' : 'CUSTOMER_WIFI',
        reference: `RENEW-${item.id.slice(-4)}`,
      });
      this.sentRemindersMap.set(item.id, Date.now());
      this.state.totalMpesaPromptsDispatched++;
      this.addLog(`Dispatched manual renewal STK push to ${item.phone} for KES ${item.amountKes}`);
      this.notify();
      return {
        success: true,
        message: `M-Pesa STK prompt sent to ${item.phone} (Checkout ID: ${res.checkoutRequestId || 'OK'})`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to dispatch M-Pesa STK push',
      };
    }
  }

  /**
   * Start recurring background subscription evaluation
   */
  public startRecurringCheck(intervalMinutes = 10) {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.state.isActive = true;
    this.state.intervalMinutes = intervalMinutes;
    this.state.nextCheckAt = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();

    // Run first audit shortly after boot
    setTimeout(() => {
      this.runAudit({ autoTriggerMpesa: false });
    }, 2000);

    this.timer = setInterval(() => {
      this.runAudit({ autoTriggerMpesa: true });
    }, intervalMinutes * 60 * 1000);

    this.notify();
  }

  public stopRecurringCheck() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state.isActive = false;
    this.notify();
  }
}

// Export singleton instance for the app
export const subscriptionCronService = new SubscriptionCronService();
