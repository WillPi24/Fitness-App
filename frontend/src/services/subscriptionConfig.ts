import { Platform } from 'react-native';

import type { FeatureId } from './featureRegistry';

export const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? 'appl_dlPWYCpfkFXqVnzQURnNcsgipRl';

// The Android fallback is a SANDBOX key — shipping it in a release build
// means real purchases silently fail (audit finding M3). Fail loudly at
// startup instead so a misconfigured build can't reach the store.
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
if (!androidKey && Platform.OS === 'android' && !__DEV__) {
  throw new Error(
    'RevenueCat Android production key missing: set EXPO_PUBLIC_REVENUECAT_ANDROID_KEY before building a release.',
  );
}
export const REVENUECAT_API_KEY_ANDROID = androidKey ?? 'test_eedplghnocURrbvHMfsjoeDsQWn';

export const ENTITLEMENT_ID = 'Helm_Full_Sail';

export const PAID_FEATURE_IDS: readonly FeatureId[] = [
  // Registry features (toggleable in More Tools)
  'meetSim',
  'attemptSelector',
  'oneRepMaxCalc',
  'paceKeeper',
  'splitTimes',
  'racePredictor',
  // Non-registry features (always-on when subscribed)
  'barcodeScanning',
  'savedMeals',
  'workoutTemplates',
  'micronutrientTracking',
] as const;

export function isPaidFeature(featureId: string): boolean {
  return (PAID_FEATURE_IDS as readonly string[]).includes(featureId);
}

// Progress photos are the physique-tracking hook: free users get a monthly
// taste, while unlimited photos and side-by-side compare require Full Sail.
export const FREE_PROGRESS_PHOTOS_PER_MONTH = 1;
