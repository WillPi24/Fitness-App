import { EXERCISE_OPTIONS } from '../data/exercises';

// Static lookup for known exercise names from Strong, Hevy, Fitbod, FitNotes, etc.
const EXERCISE_NAME_MAP: Record<string, string> = {
  // ── Chest ──
  'Bench Press (Barbell)': 'Barbell Bench Press',
  'Barbell Bench Press': 'Barbell Bench Press',
  'Flat Barbell Bench Press': 'Barbell Bench Press',
  'Bench Press - Barbell': 'Barbell Bench Press',
  'Incline Bench Press (Barbell)': 'Incline Barbell Press',
  'Incline Barbell Bench Press': 'Incline Barbell Press',
  'Incline Bench Press - Barbell': 'Incline Barbell Press',
  'Decline Bench Press (Barbell)': 'Decline Barbell Press',
  'Decline Barbell Bench Press': 'Decline Barbell Press',
  'Chest Press (Dumbbell)': 'Dumbbell Chest Press',
  'Dumbbell Bench Press': 'Dumbbell Chest Press',
  'Flat Dumbbell Press': 'Dumbbell Chest Press',
  'Dumbbell Press': 'Dumbbell Chest Press',
  'Incline Chest Press (Dumbbell)': 'Incline Dumbbeell Chest Press',
  'Incline Dumbbell Press': 'Incline Dumbbeell Chest Press',
  'Incline Dumbbell Bench Press': 'Incline Dumbbeell Chest Press',
  'Chest Press (Machine)': 'Chest Press Machine',
  'Machine Chest Press': 'Chest Press Machine',
  'Chest Fly (Cable)': 'Cable Fly',
  'Cable Chest Fly': 'Cable Fly',
  'Cable Crossover': 'Cable Fly',
  'Chest Fly (Dumbbell)': 'Cable Fly',
  'Dumbbell Fly': 'Cable Fly',
  'Dumbbell Flye': 'Cable Fly',
  'Chest Dip': 'Dips',
  'Dip': 'Dips',
  'Dips': 'Dips',
  'Tricep Dip': 'Dips',
  'Pullover (Dumbbell)': 'Dumbbell Pullover',
  'Dumbbell Pullover': 'Dumbbell Pullover',

  // ── Back ──
  'Deadlift (Barbell)': 'Deadlift (Conventional)',
  'Conventional Deadlift (Barbell)': 'Deadlift (Conventional)',
  'Barbell Deadlift': 'Deadlift (Conventional)',
  'Conventional Deadlift': 'Deadlift (Conventional)',
  'Deadlift': 'Deadlift (Conventional)',
  'Bent Over Row (Barbell)': 'Bent-Over Row (Barbell)',
  'Barbell Row': 'Bent-Over Row (Barbell)',
  'Bent Over Barbell Row': 'Bent-Over Row (Barbell)',
  'Barbell Bent Over Row': 'Bent-Over Row (Barbell)',
  'Pendlay Row': 'Bent-Over Row (Barbell)',
  'Row (Dumbbell)': 'One-Arm Dumbbell Row',
  'Dumbbell Row': 'One-Arm Dumbbell Row',
  'One Arm Dumbbell Row': 'One-Arm Dumbbell Row',
  'Single Arm Dumbbell Row': 'One-Arm Dumbbell Row',
  'Seated Row (Cable)': 'Seated Cable Row',
  'Cable Row': 'Seated Cable Row',
  'Seated Cable Row': 'Seated Cable Row',
  'Seated Row': 'Seated Cable Row',
  'Lat Pulldown (Cable)': 'Lat Pulldown',
  'Lat Pulldown (Machine)': 'Lat Pulldown',
  'Lat Pull Down': 'Lat Pulldown',
  'Wide Grip Lat Pulldown': 'Lat Pulldown',
  'Pull Up': 'Pull-Up',
  'Pull-Up': 'Pull-Up',
  'Pullup': 'Pull-Up',
  'Pull Up (Assisted)': 'Pull-Up',
  'Chin Up': 'Pull-Up',
  'Chin-Up': 'Pull-Up',
  'Chinup': 'Pull-Up',
  'T-Bar Row': 'T-Bar Row',
  'T Bar Row': 'T-Bar Row',
  'Shrug (Barbell)': 'Barbell Shrug',
  'Barbell Shrug': 'Barbell Shrug',
  'Shrug (Dumbbell)': 'Dumbbell Shrugs',
  'Dumbbell Shrug': 'Dumbbell Shrugs',
  'Dumbbell Shrugs': 'Dumbbell Shrugs',

  // ── Shoulders ──
  'Overhead Press (Barbell)': 'Overhead Press (Military)',
  'Military Press (Barbell)': 'Overhead Press (Military)',
  'Overhead Press': 'Overhead Press (Military)',
  'Military Press': 'Overhead Press (Military)',
  'Barbell Overhead Press': 'Overhead Press (Military)',
  'Standing Barbell Press': 'Overhead Press (Military)',
  'Shoulder Press (Dumbbell)': 'Seated Dumbbell Press',
  'Dumbbell Shoulder Press': 'Seated Dumbbell Press',
  'Seated Dumbbell Shoulder Press': 'Seated Dumbbell Press',
  'Dumbbell Overhead Press': 'Seated Dumbbell Press',
  'Arnold Press': 'Seated Dumbbell Press',
  'Arnold Press (Dumbbell)': 'Seated Dumbbell Press',
  'Lateral Raise (Dumbbell)': 'Lateral Raise',
  'Lateral Raise (Cable)': 'Lateral Raise',
  'Dumbbell Lateral Raise': 'Lateral Raise',
  'Side Lateral Raise': 'Lateral Raise',
  'Front Raise (Dumbbell)': 'Front Raise',
  'Dumbbell Front Raise': 'Front Raise',
  'Reverse Fly (Machine)': 'Rear Delt Flye (Reverse)',
  'Rear Delt Fly': 'Rear Delt Flye (Reverse)',
  'Reverse Pec Deck': 'Rear Delt Flye (Reverse)',
  'Rear Delt Fly (Dumbbell)': 'Rear Delt Flye (Reverse)',
  'Rear Delt Raise': 'Rear Delt Flye (Reverse)',
  'Face Pull (Cable)': 'Face Pull',
  'Cable Face Pull': 'Face Pull',
  'Upright Row (Barbell)': 'Upright Row',
  'Barbell Upright Row': 'Upright Row',

  // ── Legs ──
  'Squat (Barbell)': 'Barbell Squat',
  'Back Squat (Barbell)': 'Barbell Squat',
  'Barbell Back Squat': 'Barbell Squat',
  'Back Squat': 'Barbell Squat',
  'Squat': 'Barbell Squat',
  'Front Squat (Barbell)': 'Front Squat',
  'Barbell Front Squat': 'Front Squat',
  'Hack Squat (Machine)': 'Hack Squat',
  'Machine Hack Squat': 'Hack Squat',
  'Leg Press (Machine)': 'Leg Press',
  'Leg Press': 'Leg Press',
  'Machine Leg Press': 'Leg Press',
  'Bulgarian Split Squat': 'Bulgarian Split Squat',
  'Lunge (Dumbbell)': 'Lunges (Walking/Reverse)',
  'Dumbbell Lunge': 'Lunges (Walking/Reverse)',
  'Walking Lunge': 'Lunges (Walking/Reverse)',
  'Reverse Lunge': 'Lunges (Walking/Reverse)',
  'Lunges': 'Lunges (Walking/Reverse)',
  'Leg Extension (Machine)': 'Leg Extension',
  'Machine Leg Extension': 'Leg Extension',
  'Leg Extensions': 'Leg Extension',
  'Romanian Deadlift (Barbell)': 'Romanian Deadlift (RDL)',
  'Romanian Deadlift (Dumbbell)': 'Romanian Deadlift (RDL)',
  'Romanian Deadlift': 'Romanian Deadlift (RDL)',
  'Barbell Romanian Deadlift': 'Romanian Deadlift (RDL)',
  'Dumbbell Romanian Deadlift': 'Romanian Deadlift (RDL)',
  'RDL': 'Romanian Deadlift (RDL)',
  'Stiff Leg Deadlift (Barbell)': 'Stiff-Legged Deadlift',
  'Stiff Legged Deadlift': 'Stiff-Legged Deadlift',
  'Hip Thrust (Barbell)': 'Hip Thrust',
  'Barbell Hip Thrust': 'Hip Thrust',
  'Glute Bridge': 'Hip Thrust',
  'Lying Leg Curl (Machine)': 'Lying Leg Curl',
  'Machine Lying Leg Curl': 'Lying Leg Curl',
  'Leg Curl': 'Lying Leg Curl',
  'Hamstring Curl': 'Lying Leg Curl',
  'Seated Leg Curl (Machine)': 'Seated Leg Curl',
  'Machine Seated Leg Curl': 'Seated Leg Curl',
  'Standing Calf Raise (Machine)': 'Standing Calf Raise',
  'Machine Standing Calf Raise': 'Standing Calf Raise',
  'Calf Raise': 'Standing Calf Raise',
  'Standing Calf Raise': 'Standing Calf Raise',
  'Seated Calf Raise (Machine)': 'Seated Calf Raise',
  'Machine Seated Calf Raise': 'Seated Calf Raise',

  // ── Triceps ──
  'Close Grip Bench Press (Barbell)': 'Close-Grip Bench Press',
  'Close Grip Bench Press': 'Close-Grip Bench Press',
  'Close Grip Barbell Bench Press': 'Close-Grip Bench Press',
  'Skullcrusher (Barbell)': 'Skullcrushers',
  'Skull Crusher': 'Skullcrushers',
  'Skull Crushers': 'Skullcrushers',
  'Lying Tricep Extension': 'Skullcrushers',
  'Triceps Pushdown (Cable)': 'Tricep Pushdown',
  'Tricep Pushdown (Cable)': 'Tricep Pushdown',
  'Cable Tricep Pushdown': 'Tricep Pushdown',
  'Tricep Rope Pushdown': 'Tricep Pushdown',
  'Rope Pushdown': 'Tricep Pushdown',
  'Triceps Rope Pushdown': 'Tricep Pushdown',
  'Tricep Pressdown': 'Tricep Pushdown',
  'Overhead Triceps Extension (Dumbbell)': 'Overhead Extension',
  'Overhead Triceps Extension (Cable)': 'Overhead Extension',
  'Overhead Tricep Extension': 'Overhead Extension',
  'Dumbbell Overhead Tricep Extension': 'Overhead Extension',
  'Cable Overhead Tricep Extension': 'Overhead Extension',
  'Tricep Kickback (Dumbbell)': 'Tricep Kickback',
  'Dumbbell Tricep Kickback': 'Tricep Kickback',
  'Tricep Kickbacks': 'Tricep Kickback',

  // ── Biceps ──
  'Bicep Curl (Barbell)': 'Barbell Curl',
  'Barbell Bicep Curl': 'Barbell Curl',
  'Standing Barbell Curl': 'Barbell Curl',
  'EZ Bar Curl': 'Barbell Curl',
  'EZ-Bar Curl': 'Barbell Curl',
  'Bicep Curl (Dumbbell)': 'Dumbbell Curl',
  'Dumbbell Bicep Curl': 'Dumbbell Curl',
  'Standing Dumbbell Curl': 'Dumbbell Curl',
  'Dumbbell Curl': 'Dumbbell Curl',
  'Alternating Dumbbell Curl': 'Dumbbell Curl',
  'Hammer Curl (Dumbbell)': 'Hammer Curl',
  'Dumbbell Hammer Curl': 'Hammer Curl',
  'Hammer Curls': 'Hammer Curl',
  'Preacher Curl (Barbell)': 'Preacher Curl',
  'Preacher Curl (Machine)': 'Preacher Curl',
  'EZ Bar Preacher Curl': 'Preacher Curl',
  'Machine Preacher Curl': 'Preacher Curl',
  'Incline Curl (Dumbbell)': 'Incline Dumbbell Curl',
  'Incline Dumbbell Curl': 'Incline Dumbbell Curl',
  'Concentration Curl (Dumbbell)': 'Concentration Curl',
  'Dumbbell Concentration Curl': 'Concentration Curl',
  'Cable Curl': 'Barbell Curl',
  'Cable Bicep Curl': 'Barbell Curl',

  // ── Core ──
  'Hanging Leg Raise': 'Hanging Leg Raise',
  'Hanging Knee Raise': 'Hanging Leg Raise',
  'Cable Crunch': 'Cable Crunch',
  'Cable Crunches': 'Cable Crunch',
  'Ab Wheel': 'Ab Wheel Rollout',
  'Ab Rollout': 'Ab Wheel Rollout',
  'Plank': 'Plank (Weighted)',
  'Weighted Plank': 'Plank (Weighted)',
  'Russian Twist': 'Russian Twist',
  'Crunch': 'Crunch',
  'Crunches': 'Crunch',
  'Sit Up': 'Crunch',
  'Sit-Up': 'Crunch',
  'Sit Ups': 'Crunch',
  'Leg Raise': 'Hanging Leg Raise',
};

// Build normalized lookup set of all Helm exercise names
const helmNamesNormalized = new Map<string, string>();
for (const exercise of EXERCISE_OPTIONS) {
  helmNamesNormalized.set(exercise.name.toLowerCase(), exercise.name);
}

/**
 * Maps a Strong exercise name to the closest Helm exercise name.
 * Returns the original name if no match is found.
 */
export function mapStrongExercise(strongName: string): string {
  const trimmed = strongName.trim();

  // Tier 1: Static lookup
  const staticMatch = EXERCISE_NAME_MAP[trimmed];
  if (staticMatch) {
    return staticMatch;
  }

  // Check if it already matches a Helm name exactly
  const directMatch = helmNamesNormalized.get(trimmed.toLowerCase());
  if (directMatch) {
    return directMatch;
  }

  // Tier 2: Pattern transform — extract equipment from parentheses
  const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (parenMatch) {
    const exercisePart = parenMatch[1].trim();
    const equipmentPart = parenMatch[2].trim();

    // Try "Equipment ExerciseName"
    const candidate = `${equipmentPart} ${exercisePart}`;
    const transformed = helmNamesNormalized.get(candidate.toLowerCase());
    if (transformed) {
      return transformed;
    }

    // Try just the exercise part
    const partMatch = helmNamesNormalized.get(exercisePart.toLowerCase());
    if (partMatch) {
      return partMatch;
    }
  }

  // Tier 3: Normalized substring matching
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [normalizedName, originalName] of helmNamesNormalized) {
    if (normalizedName.includes(lowerTrimmed) || lowerTrimmed.includes(normalizedName)) {
      return originalName;
    }
  }

  // No match — return original name
  return trimmed;
}
