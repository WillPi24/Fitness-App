import type { BodyweightEntry } from '../store/bodyweightStore';
import type { CalorieDay, SavedMeal } from '../store/calorieStore';
import type { CustomExercise } from '../store/customExerciseStore';
import type { MeasurementEntry } from '../store/measurementStore';
import type { ProgressPhoto } from '../store/progressPhotoStore';
import type { RunSession } from '../store/runStore';
import type { UserProfile, WeightUnit } from '../store/userStore';
import { toDisplayWeight } from '../store/userStore';
import type { WorkoutSession, WorkoutTemplate } from '../store/workoutStore';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes(';')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Full snapshot of user-owned data. Used to satisfy UK GDPR Art 20
// (right to data portability) and the in-app "Export your data"
// promise. Every user-owned store should be represented here.
export type ExportData = {
  workouts: WorkoutSession[];
  workoutTemplates: WorkoutTemplate[];
  runs: RunSession[];
  calorieDays: CalorieDay[];
  savedMeals: SavedMeal[];
  bodyweightLog: BodyweightEntry[];
  measurements: MeasurementEntry[];
  progressPhotos: ProgressPhoto[];
  customPoses: string[];
  customExercises: CustomExercise[];
  userProfile: UserProfile | null;
};

export function exportToJSON(data: ExportData): string {
  const payload = {
    version: 2,
    app: 'helm',
    exportedAt: new Date().toISOString(),
    data: {
      workouts: data.workouts,
      workoutTemplates: data.workoutTemplates,
      runs: data.runs,
      calorieDays: data.calorieDays,
      savedMeals: data.savedMeals,
      bodyweightLog: data.bodyweightLog,
      measurements: data.measurements,
      progressPhotos: data.progressPhotos,
      customPoses: data.customPoses,
      customExercises: data.customExercises,
      userProfile: data.userProfile,
    },
  };
  return JSON.stringify(payload, null, 2);
}

export function exportWorkoutsToCSV(workouts: WorkoutSession[], unit: WeightUnit = 'kg'): string {
  const rows: string[] = [
    `Date,Workout Duration (min),Exercise Name,Set Order,Weight (${unit}),Reps`,
  ];

  for (const workout of workouts) {
    const durationMin = Math.round((workout.endedAt - workout.startedAt) / 60000);
    for (const exercise of workout.exercises) {
      for (let i = 0; i < exercise.sets.length; i++) {
        const set = exercise.sets[i];
        rows.push(
          [
            escapeCSV(workout.date),
            String(durationMin),
            escapeCSV(exercise.name),
            String(i + 1),
            String(toDisplayWeight(set.weight, unit)),
            String(set.reps),
          ].join(','),
        );
      }
    }
  }

  return rows.join('\n');
}

export function exportRunsToCSV(runs: RunSession[]): string {
  const rows: string[] = [
    'Date,Type,Activity,Duration (min),Distance (m),Avg Pace (min/km)',
  ];

  for (const run of runs) {
    const durationMin = Math.round(run.durationMs / 60000);
    const distanceKm = run.distanceMeters / 1000;
    const avgPace = distanceKm > 0 ? (run.durationMs / 60000 / distanceKm).toFixed(2) : '';

    rows.push(
      [
        escapeCSV(run.date),
        escapeCSV(run.type),
        escapeCSV(run.activity || ''),
        String(durationMin),
        String(Math.round(run.distanceMeters)),
        avgPace,
      ].join(','),
    );
  }

  return rows.join('\n');
}

export function exportCaloriesToCSV(calorieDays: CalorieDay[]): string {
  const rows: string[] = [
    'Date,Meal,Food Name,Brand,Calories,Protein,Carbs,Fat,Serving Size,Serving Unit,Servings',
  ];

  for (const day of calorieDays) {
    for (const meal of day.meals) {
      for (const food of meal.foods) {
        rows.push(
          [
            escapeCSV(day.date),
            escapeCSV(meal.name),
            escapeCSV(food.name),
            escapeCSV(food.brand || ''),
            String(food.calories),
            String(food.protein),
            String(food.carbs),
            String(food.fat),
            String(food.servingSize),
            escapeCSV(food.servingUnit),
            String(food.servings),
          ].join(','),
        );
      }
    }
  }

  return rows.join('\n');
}
