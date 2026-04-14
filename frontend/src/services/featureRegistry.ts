import type { TrainingFocus } from '../store/userStore';

export type FeatureId =
  | 'meetSim'
  | 'attemptSelector'
  | 'oneRepMaxCalc'
  | 'paceKeeper'
  | 'splitTimes'
  | 'racePredictor'
  | 'bodyMeasurements'
  | 'progressPhotos'
  | 'bodyweightTracker'
  | 'barcodeScanning'
  | 'savedMeals'
  | 'workoutTemplates'
  | 'micronutrientTracking';

export type FeatureDefinition = {
  id: FeatureId;
  name: string;
  description: string;
  screen: 'Progress' | 'Log' | 'Cardio' | 'Calories' | 'Account';
  defaultFocus: TrainingFocus[];
  tier: 'free' | 'pro';
  showInToolsScreen: boolean;
};

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // Strength
  {
    id: 'meetSim',
    name: 'Meet Simulator',
    description: 'Simulate a powerlifting meet with squat, bench, and deadlift attempts. Calculates Wilks and DOTS scores.',
    screen: 'Progress',
    defaultFocus: ['strength'],
    tier: 'pro',
    showInToolsScreen: true,
  },
  {
    id: 'attemptSelector',
    name: 'Attempt Selector',
    description: 'Suggests opener, second, and third attempts for competition based on your training history.',
    screen: 'Progress',
    defaultFocus: ['strength'],
    tier: 'pro',
    showInToolsScreen: true,
  },
  {
    id: 'oneRepMaxCalc',
    name: '1RM Calculator',
    description: 'Dedicated tool to estimate your one-rep max from any weight and rep combination.',
    screen: 'Log',
    defaultFocus: ['strength'],
    tier: 'pro',
    showInToolsScreen: true,
  },

  // Cardio
  {
    id: 'paceKeeper',
    name: 'Live Pace Keeper',
    description: 'Audio cues during outdoor runs comparing your current pace to your personal best.',
    screen: 'Cardio',
    defaultFocus: ['cardio'],
    tier: 'pro',
    showInToolsScreen: true,
  },
  {
    id: 'splitTimes',
    name: 'Split Times',
    description: 'Per-kilometre split times shown during and after runs.',
    screen: 'Cardio',
    defaultFocus: ['cardio'],
    tier: 'pro',
    showInToolsScreen: true,
  },
  {
    id: 'racePredictor',
    name: 'Race Predictor',
    description: 'Estimate your 5K, 10K, and half marathon times from training data.',
    screen: 'Progress',
    defaultFocus: ['cardio'],
    tier: 'pro',
    showInToolsScreen: true,
  },

  // Bodybuilding
  {
    id: 'bodyMeasurements',
    name: 'Body Measurements',
    description: 'Track arms, chest, waist, quads, and other measurements over time with graphs.',
    screen: 'Account',
    defaultFocus: ['bodybuilding'],
    tier: 'free',
    showInToolsScreen: true,
  },
  {
    id: 'progressPhotos',
    name: 'Progress Photos',
    description: 'Take or import photos tagged by date and pose, with side-by-side comparison.',
    screen: 'Account',
    defaultFocus: ['bodybuilding'],
    tier: 'pro',
    showInToolsScreen: true,
  },
  {
    id: 'bodyweightTracker',
    name: 'Bodyweight Tracker',
    description: 'Log weigh-ins over time and track your bodyweight trend.',
    screen: 'Account',
    defaultFocus: ['bodybuilding'],
    tier: 'free',
    showInToolsScreen: true,
  },

  // Non-toggleable paid features (gated at screen level only)
  {
    id: 'barcodeScanning',
    name: 'Barcode Scanning',
    description: 'Scan food barcodes to quickly log nutritional information.',
    screen: 'Calories',
    defaultFocus: [],
    tier: 'pro',
    showInToolsScreen: false,
  },
  {
    id: 'savedMeals',
    name: 'Saved Meals',
    description: 'Save and reuse frequent meals for faster food logging.',
    screen: 'Calories',
    defaultFocus: [],
    tier: 'pro',
    showInToolsScreen: false,
  },
  {
    id: 'workoutTemplates',
    name: 'Workout Templates',
    description: 'Save and start workouts from reusable templates.',
    screen: 'Log',
    defaultFocus: [],
    tier: 'pro',
    showInToolsScreen: false,
  },
  {
    id: 'micronutrientTracking',
    name: 'Micronutrient Tracking',
    description: 'Track vitamins and minerals beyond basic macros.',
    screen: 'Calories',
    defaultFocus: [],
    tier: 'pro',
    showInToolsScreen: false,
  },
];

export function getDefaultFeatures(focus: TrainingFocus): FeatureId[] {
  if (focus === 'general') return [];
  return FEATURE_REGISTRY
    .filter((f) => f.defaultFocus.includes(focus))
    .map((f) => f.id);
}

export function getFeaturesByScreen(screen: FeatureDefinition['screen']): FeatureDefinition[] {
  return FEATURE_REGISTRY.filter((f) => f.screen === screen);
}
