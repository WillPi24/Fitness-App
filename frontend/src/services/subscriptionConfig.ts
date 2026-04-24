import type { FeatureId } from './featureRegistry';

// Test key - replace with platform-specific keys for production
export const REVENUECAT_API_KEY_IOS = 'test_eedplghnocURrbvHMfsjoeDsQWn';
export const REVENUECAT_API_KEY_ANDROID = 'test_eedplghnocURrbvHMfsjoeDsQWn';

export const ENTITLEMENT_ID = 'Helm+';

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
