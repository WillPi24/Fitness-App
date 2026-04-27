import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesOfferings, type PurchasesPackage } from 'react-native-purchases';

import { supabase } from '../services/supabase';
import { ENTITLEMENT_ID, REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS, isPaidFeature } from '../services/subscriptionConfig';

const SUBSCRIPTION_CACHE_KEY = 'fitnessapp.subscriptionActive.v1';

type SubscriptionContextValue = {
  isSubscribed: boolean;
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  paywallVisible: boolean;
  showPaywall: () => void;
  hidePaywall: () => void;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  purchaseCelebrationVisible: boolean;
  dismissPurchaseCelebration: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

function checkEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [purchaseCelebrationVisible, setPurchaseCelebrationVisible] = useState(false);

  useEffect(() => {
    // In dev mode, bypass RevenueCat entirely
    if (__DEV__) {
      console.log('[subscription] DEV MODE: subscription bypassed, all features unlocked');
      setIsSubscribed(true);
      setIsLoading(false);
      return;
    }

    const init = async () => {
      // Load cached status for instant UI
      try {
        const cached = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
        if (cached === 'true') setIsSubscribed(true);
      } catch {}

      // Initialize RevenueCat
      try {
        const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
        Purchases.configure({ apiKey });

        // Alias the RC customer to the Supabase user ID if signed in,
        // so the subscription follows the user across devices/reinstalls.
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          try {
            await Purchases.logIn(session.user.id);
          } catch (e) {
            console.warn('[subscription] initial logIn failed:', e);
          }
        }

        const info = await Purchases.getCustomerInfo();
        const active = checkEntitlement(info);
        setIsSubscribed(active);
        await AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, String(active));

        const offeringsResult = await Purchases.getOfferings();
        setOfferings(offeringsResult);
      } catch (e) {
        console.warn('[subscription] init error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Listen for subscription changes
    Purchases.addCustomerInfoUpdateListener((info) => {
      const active = checkEntitlement(info);
      setIsSubscribed(active);
      AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, String(active)).catch(() => {});
    });

    // Keep RC's app-user-id in sync with Supabase auth state
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        Purchases.logIn(session.user.id).catch((e) => {
          console.warn('[subscription] logIn failed:', e);
        });
      } else if (event === 'SIGNED_OUT') {
        Purchases.logOut().catch((e) => {
          console.warn('[subscription] logOut failed:', e);
        });
      }
    });

    // Re-check on app foreground
    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        Purchases.getCustomerInfo().then((info) => {
          const active = checkEntitlement(info);
          setIsSubscribed(active);
          AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, String(active)).catch(() => {});
        }).catch(() => {});
      }
    });

    return () => {
      authSubscription.unsubscribe();
      appStateListener.remove();
    };
  }, []);

  const showPaywall = useCallback(() => setPaywallVisible(true), []);
  const hidePaywall = useCallback(() => setPaywallVisible(false), []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (__DEV__) {
      setPurchaseCelebrationVisible(true);
      return true;
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const active = checkEntitlement(customerInfo);
      setIsSubscribed(active);
      await AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, String(active));
      if (active) setPurchaseCelebrationVisible(true);
      return active;
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean };
      if (!err.userCancelled) {
        console.warn('[subscription] purchase error:', e);
      }
      return false;
    }
  }, []);

  const dismissPurchaseCelebration = useCallback(() => {
    setPurchaseCelebrationVisible(false);
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (__DEV__) return true;
    try {
      const info = await Purchases.restorePurchases();
      const active = checkEntitlement(info);
      setIsSubscribed(active);
      await AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, String(active));
      return active;
    } catch (e) {
      console.warn('[subscription] restore error:', e);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      isSubscribed,
      isLoading,
      offerings,
      paywallVisible,
      showPaywall,
      hidePaywall,
      purchasePackage,
      restorePurchases,
      purchaseCelebrationVisible,
      dismissPurchaseCelebration,
    }),
    [isSubscribed, isLoading, offerings, paywallVisible, showPaywall, hidePaywall, purchasePackage, restorePurchases, purchaseCelebrationVisible, dismissPurchaseCelebration],
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
}

export function useRequireSubscription(featureId: string) {
  const { isSubscribed, showPaywall } = useSubscription();
  const isLocked = isPaidFeature(featureId) && !isSubscribed;
  return { isLocked, showPaywall };
}
