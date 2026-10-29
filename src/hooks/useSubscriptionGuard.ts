import { useState, useMemo, useCallback } from 'react';
import type { RouterOwnerProfile, CustomerPackage, WifiPackage } from '../types/index.ts';
import {
  isRouterOwnerSubscriptionExpired,
  getRouterOwnerSubscriptionEndDate,
  isWifiPackageExpired,
  getWifiPackageExpiryDate,
  formatRemainingTime,
} from '../lib/subscriptionUtils.ts';

export interface UseSubscriptionGuardOptions {
  ownerProfile?: RouterOwnerProfile | null;
  customerPackage?: CustomerPackage | WifiPackage | null;
  onOpenActivateModal?: () => void;
}

export function useSubscriptionGuard(options: UseSubscriptionGuardOptions = {}) {
  const { ownerProfile, customerPackage, onOpenActivateModal } = options;
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [blockedActionName, setBlockedActionName] = useState<string | null>(null);

  // Router Owner calculations
  const ownerEndDate = useMemo(() => {
    return getRouterOwnerSubscriptionEndDate(ownerProfile);
  }, [ownerProfile]);

  const isOwnerExpired = useMemo(() => {
    return isRouterOwnerSubscriptionExpired(ownerProfile);
  }, [ownerProfile]);

  const ownerRemaining = useMemo(() => {
    return formatRemainingTime(ownerEndDate);
  }, [ownerEndDate]);

  // WiFi Package calculations
  const packageExpiryDate = useMemo(() => {
    return getWifiPackageExpiryDate(customerPackage);
  }, [customerPackage]);

  const isPackageExpired = useMemo(() => {
    return isWifiPackageExpired(customerPackage);
  }, [customerPackage]);

  const packageRemaining = useMemo(() => {
    return formatRemainingTime(packageExpiryDate);
  }, [packageExpiryDate]);

  // Access rights
  const canManageRouters = !isOwnerExpired;
  const canAccessConnectionFeatures = !isPackageExpired && !isOwnerExpired;

  /**
   * Guards a network management action. If subscription is expired, prevents
   * execution, sets the blocked action name, opens the Activate Service modal,
   * and returns false. Otherwise runs the callback and returns true.
   */
  const guardRouterManagement = useCallback(
    (actionCallback?: () => void, actionName: string = 'Network Management'): boolean => {
      if (isOwnerExpired) {
        setBlockedActionName(actionName);
        setShowActivateModal(true);
        if (onOpenActivateModal) onOpenActivateModal();
        return false;
      }
      if (actionCallback) actionCallback();
      return true;
    },
    [isOwnerExpired, onOpenActivateModal]
  );

  /**
   * Guards a connection feature (speed test, internet traffic). If package is expired,
   * prevents execution and returns false.
   */
  const guardConnectionFeature = useCallback(
    (actionCallback?: () => void, actionName: string = 'Internet Access'): boolean => {
      if (isPackageExpired) {
        setBlockedActionName(actionName);
        return false;
      }
      if (actionCallback) actionCallback();
      return true;
    },
    [isPackageExpired]
  );

  return {
    // Owner Subscription State
    isOwnerExpired,
    ownerEndDate,
    ownerRemaining,
    canManageRouters,
    guardRouterManagement,

    // Customer Package State
    isPackageExpired,
    packageExpiryDate,
    packageRemaining,
    canAccessConnectionFeatures,
    guardConnectionFeature,

    // Activate Service Modal State
    showActivateModal,
    setShowActivateModal,
    openActivateModal: () => setShowActivateModal(true),
    closeActivateModal: () => setShowActivateModal(false),
    blockedActionName,
  };
}
