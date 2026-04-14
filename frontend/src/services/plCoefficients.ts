import type { UserSex } from '../store/userStore';
import type { WorkoutSession } from '../store/workoutStore';
import { estimateOneRepMax, isWarmupSet } from '../store/workoutStore';

// ─── Wilks Coefficient ───
// Published 5th-order polynomial coefficients

const WILKS_MALE = [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8];
const WILKS_FEMALE = [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8];

export function wilksCoefficient(bodyweightKg: number, sex: UserSex): number {
  const c = sex === 'male' ? WILKS_MALE : WILKS_FEMALE;
  const bw = bodyweightKg;
  const denom = c[0] + c[1] * bw + c[2] * bw ** 2 + c[3] * bw ** 3 + c[4] * bw ** 4 + c[5] * bw ** 5;
  return 500 / Math.abs(denom);
}

export function wilksScore(totalKg: number, bodyweightKg: number, sex: UserSex): number {
  return totalKg * wilksCoefficient(bodyweightKg, sex);
}

// ─── DOTS Coefficient ───
// Published polynomial coefficients

const DOTS_MALE = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
const DOTS_FEMALE = [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];

export function dotsCoefficient(bodyweightKg: number, sex: UserSex): number {
  const c = sex === 'male' ? DOTS_MALE : DOTS_FEMALE;
  const bw = bodyweightKg;
  const denom = c[0] + c[1] * bw + c[2] * bw ** 2 + c[3] * bw ** 3 + c[4] * bw ** 4;
  return 500 / denom;
}

export function dotsScore(totalKg: number, bodyweightKg: number, sex: UserSex): number {
  return totalKg * dotsCoefficient(bodyweightKg, sex);
}

// ─── Best e1RM extraction for squat/bench/deadlift ───

const LIFT_PATTERNS: Record<string, RegExp> = {
  squat: /squat/i,
  bench: /bench/i,
  deadlift: /deadlift/i,
};

export function getBestE1RMForLifts(
  workouts: WorkoutSession[],
  windowDays: number = 28,
): Record<string, number> {
  const cutoff = Date.now() - windowDays * 86400000;
  const result: Record<string, number> = { squat: 0, bench: 0, deadlift: 0 };

  for (const workout of workouts) {
    if (workout.endedAt < cutoff) continue;

    for (const exercise of workout.exercises) {
      const name = exercise.name;

      for (const [liftKey, pattern] of Object.entries(LIFT_PATTERNS)) {
        if (!pattern.test(name)) continue;

        for (const set of exercise.sets) {
          if (isWarmupSet(set, exercise)) continue;
          const e1rm = estimateOneRepMax(set.weight, set.reps);
          if (e1rm > result[liftKey]) {
            result[liftKey] = e1rm;
          }
        }
      }
    }
  }

  return result;
}
