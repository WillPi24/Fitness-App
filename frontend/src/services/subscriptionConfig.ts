import type { FeatureId } from './featureRegistry';

export const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? 'appl_dlPWYCpfkFXqVnzQURnNcsgipRl';
export const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? 'test_eedplghnocURrbvHMfsjoeDsQWn';

export const ENTITLEMENT_ID = 'Helm_Full_Sail';

export const PAID_FEATURE_IDS: readonly FeatureId[] = [
  // Registry features (toggleable in More Tools)
  'meetSim',
  'attemptSelector',
  'oneRepMaxCalc',
  'paceKeeper',
  'splitTimes',
  'racePredictor',
  'progressPhotos',
  // Non-registry features (always-on when subscribed)
  'barcodeScanning',
  'savedMeals',
  'workoutTemplates',
  'micronutrientTracking',
] as const;

export function isPaidFeature(featureId: string): boolean {
  return (PAID_FEATURE_IDS as readonly string[]).includes(featureId);
}
