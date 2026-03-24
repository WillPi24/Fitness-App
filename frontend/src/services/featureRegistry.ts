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
  | 'bodyweightTracker';

export type FeatureDefinition = {
  id: FeatureId;
  name: string;
  description: string;
  screen: 'Progress' | 'Log' | 'Cardio' | 'Calories' | 'Account';
  defaultFocus: TrainingFocus[];
};

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // Strength
  {
    id: 'meetSim',
    name: 'Meet Simulator',
    description: 'Simulate a powerlifting meet with squat, bench, and deadlift attempts. Calculates Wilks and DOTS scores.',
    screen: 'Progress',
    defaultFocus: ['strength'],
  },
  {
    id: 'attemptSelector',
    name: 'Attempt Selector',
    description: 'Suggests opener, second, and third attempts for competition based on your training history.',
    screen: 'Progress',
    defaultFocus: ['strength'],
  },
  {
    id: 'oneRepMaxCalc',
    name: '1RM Calculator',
    description: 'Dedicated tool to estimate your one-rep max from any weight and rep combination.',
    screen: 'Log',
    defaultFocus: ['strength'],
  },

  // Cardio
  {
    id: 'paceKeeper',
    name: 'Live Pace Keeper',
    description: 'Audio cues during outdoor runs comparing your current pace to your personal best.',
    screen: 'Cardio',
    defaultFocus: ['cardio'],
  },
  {
    id: 'splitTimes',
    name: 'Split Times',
    description: 'Per-kilometre split times shown during and after runs.',
    screen: 'Cardio',
    defaultFocus: ['cardio'],
  },
  {
    id: 'racePredictor',
    name: 'Race Predictor',
    description: 'Estimate your 5K, 10K, and half marathon times from training data.',
    screen: 'Progress',
    defaultFocus: ['cardio'],
  },

  // Bodybuilding
  {
    id: 'bodyMeasurements',
    name: 'Body Measurements',
    description: 'Track arms, chest, waist, quads, and other measurements over time with graphs.',
    screen: 'Account',
    defaultFocus: ['bodybuilding'],
  },
  {
    id: 'progressPhotos',
    name: 'Progress Photos',
    description: 'Take or import photos tagged by date and pose, with side-by-side comparison.',
    screen: 'Account',
    defaultFocus: ['bodybuilding'],
  },
  {
    id: 'bodyweightTracker',
    name: 'Bodyweight Tracker',
    description: 'Log weigh-ins over time and track your bodyweight trend.',
    screen: 'Account',
    defaultFocus: ['bodybuilding'],
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
