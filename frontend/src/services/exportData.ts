import type { CalorieDay } from '../store/calorieStore';
import type { RunSession } from '../store/runStore';
import type { WeightUnit } from '../store/userStore';
import { toDisplayWeight } from '../store/userStore';
import type { WorkoutSession } from '../store/workoutStore';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes(';')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToJSON(
  workouts: WorkoutSession[],
  runs: RunSession[],
  calorieDays: CalorieDay[],
): string {
  const payload = {
    version: 1,
    app: 'helm',
    exportedAt: new Date().toISOString(),
    data: {
      workouts,
      runs,
      calorieDays,
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
