import type { RouterOwnerProfile, CustomerPackage, WifiPackage } from '../types/index.ts';

/**
 * Extracts and parses the subscription end date for a Router Owner.
 * Supports 'subscriptionEndDate', 'subscriptionExpiresAt', and 'subscriptionExpiry'.
 */
export function getRouterOwnerSubscriptionEndDate(profile?: RouterOwnerProfile | null): Date | null {
  if (!profile) return null;
  const rawDate = profile.subscriptionEndDate || profile.subscriptionExpiresAt || profile.subscriptionExpiry;
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Globally checks if a Router Owner's subscription is expired.
 * Compares 'subscriptionEndDate' / 'subscriptionExpiresAt' against current timestamp,
 * or verifies explicit 'EXPIRED' subscriptionStatus.
 */
export function isRouterOwnerSubscriptionExpired(profile?: RouterOwnerProfile | null): boolean {
  if (!profile) return true;
  if (profile.subscriptionStatus === 'EXPIRED' || profile.subscriptionStatus === 'SUSPENDED') {
    return true;
  }
  const endDate = getRouterOwnerSubscriptionEndDate(profile);
  if (!endDate) {
    // If no expiration date is configured and not in active trial, consider expired
    return profile.subscriptionStatus !== 'ACTIVE' && profile.subscriptionStatus !== 'TRIAL';
  }
  return endDate.getTime() < Date.now();
}

/**
 * Extracts and parses the expiry date for a customer WiFi package.
 * Supports 'expiryDate' and 'expiresAt'.
 */
export function getWifiPackageExpiryDate(pkg?: CustomerPackage | WifiPackage | null): Date | null {
  if (!pkg) return null;
  const rawDate = (pkg as any).expiryDate || (pkg as any).expiresAt;
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Globally checks if a WiFi package is expired.
 * Compares 'expiryDate' / 'expiresAt' against current timestamp or status.
 */
export function isWifiPackageExpired(pkg?: CustomerPackage | WifiPackage | null): boolean {
  if (!pkg) return true;
  if ((pkg as any).status === 'EXPIRED') return true;
  const expiryDate = getWifiPackageExpiryDate(pkg);
  if (!expiryDate) return false;
  return expiryDate.getTime() < Date.now();
}

/**
 * Helper to compute human-readable remaining time until an end date.
 */
export function formatRemainingTime(targetDate: Date | null): {
  isExpired: boolean;
  text: string;
  days: number;
  hours: number;
  minutes: number;
} {
  if (!targetDate) {
    return { isExpired: true, text: 'No active validity', days: 0, hours: 0, minutes: 0 };
  }

  const diffMs = targetDate.getTime() - Date.now();
  if (diffMs <= 0) {
    return { isExpired: true, text: 'Expired', days: 0, hours: 0, minutes: 0 };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m remaining`;
  } else {
    text = `${minutes}m remaining`;
  }

  return { isExpired: false, text, days, hours, minutes };
}
