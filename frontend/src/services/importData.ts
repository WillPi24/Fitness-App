import type { CalorieDay, Meal, FoodItem } from '../store/calorieStore';
import type { RunSession } from '../store/runStore';
import type { WeightUnit } from '../store/userStore';
import type { WorkoutSession, WorkoutExercise, WorkoutSet } from '../store/workoutStore';
import { createEmptyMicronutrients } from '../nutrition/micronutrients';
import { mapStrongExercise } from './exerciseMapping';

const LBS_TO_KG = 1 / 2.20462;
const MILES_TO_METERS = 1609.34;

// ── File type detection ──

export type DetectedFileType =
  | 'helm-json'
  | 'strong-csv'
  | 'hevy-csv'
  | 'fitbod-csv'
  | 'fitnotes-csv'
  | 'strava-csv'
  | 'garmin-csv'
  | 'mfp-csv'
  | 'cronometer-csv'
  | 'unknown';

export type GarminDistanceUnit = 'km' | 'miles';

export function detectFileType(content: string): DetectedFileType {
  const trimmed = content.trim();

  // Try JSON first
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.app === 'helm' && parsed.version && parsed.data) {
        return 'helm-json';
      }
    } catch {
      // Not valid JSON
    }
  }

  const firstLine = trimmed.split('\n')[0] || '';

  // Strong CSV: "Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,..."
  if (
    firstLine.includes('Workout Name') &&
    firstLine.includes('Exercise Name') &&
    firstLine.includes('Set Order')
  ) {
    return 'strong-csv';
  }

  // Hevy CSV: "title,start_time,end_time,...,exercise_title,...,set_index,set_type,weight_kg,reps,..."
  if (
    firstLine.includes('exercise_title') &&
    firstLine.includes('set_index')
  ) {
    return 'hevy-csv';
  }

  // Fitbod CSV: "Date,Exercise,...,isWarmup,..."
  if (
    firstLine.includes('Exercise') &&
    firstLine.includes('isWarmup')
  ) {
    return 'fitbod-csv';
  }

  // FitNotes CSV: "Date,Exercise,Category,Weight...,Reps,..."
  if (
    firstLine.includes('Exercise') &&
    firstLine.includes('Category') &&
    firstLine.includes('Reps')
  ) {
    return 'fitnotes-csv';
  }

  // Strava CSV: "Activity Date,...,Activity Type,...,Elapsed Time,...,Distance,..."
  if (
    firstLine.includes('Activity Type') &&
    firstLine.includes('Elapsed Time') &&
    firstLine.includes('Distance')
  ) {
    return 'strava-csv';
  }

  // Garmin CSV: "Activity Type,Date,Favorite,Title,Distance,Calories,Time,..."
  if (
    firstLine.includes('Activity Type') &&
    firstLine.includes('Title') &&
    (firstLine.includes('Calories') || firstLine.includes('Favorite'))
  ) {
    return 'garmin-csv';
  }

  // MyFitnessPal CSV: "Date,Meal,Food Name,Calories,..."
  if (
    firstLine.includes('Meal') &&
    firstLine.includes('Food Name') &&
    firstLine.includes('Calories')
  ) {
    return 'mfp-csv';
  }

  // Cronometer CSV: "Day,...,Food Name,...,Energy (kcal),..."
  if (
    firstLine.includes('Food Name') &&
    firstLine.includes('Energy')
  ) {
    return 'cronometer-csv';
  }

  return 'unknown';
}

// ── Lightweight CSV parser ──

function parseCSVRow(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Auto-detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const headers = parseCSVRow(firstLine, delimiter);
  const rows = lines.slice(1).map((line) => parseCSVRow(line, delimiter));

  return { headers, rows };
}

export function detectGarminDistanceUnit(csvString: string): GarminDistanceUnit | null {
  const { headers } = parseCSV(csvString);
  if (headers.length === 0) return null;

  const distanceHeader = headers.find((header) => /distance/i.test(header));
  if (distanceHeader) {
    if (/\b(mi|mile|miles)\b/i.test(distanceHeader)) return 'miles';
    if (/\b(km|kilometer|kilometers)\b/i.test(distanceHeader)) return 'km';
  }

  const paceHeader = headers.find((header) => /pace/i.test(header));
  if (paceHeader) {
    if (/min\/mi|pace.*mile/i.test(paceHeader)) return 'miles';
    if (/min\/km|pace.*km/i.test(paceHeader)) return 'km';
  }

  return null;
}

// ── ID generation ──

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// ── Shared helpers ──

function parseDuration(durationStr: string): number {
  if (!durationStr) return 3600000; // default 1h

  let totalMinutes = 0;
  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minMatch = durationStr.match(/(\d+)\s*m/);
  const secMatch = durationStr.match(/(\d+)\s*s/);

  if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
  if (secMatch) totalMinutes += parseInt(secMatch[1], 10) / 60;

  // If pure number, treat as minutes
  if (!hourMatch && !minMatch && !secMatch) {
    const num = parseInt(durationStr, 10);
    if (Number.isFinite(num) && num > 0) {
      totalMinutes = num;
    }
  }

  return Math.max(totalMinutes, 1) * 60000;
}

function parseDateToYMD(dateStr: string): { date: string; startedAt: number } | null {
  if (!dateStr) return null;
  // Try ISO-style first: "YYYY-MM-DD ..."
  const isoMatch = dateStr.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    const date = isoMatch[1];
    const parsed = new Date(`${date}T12:00:00`);
    if (!isNaN(parsed.getTime())) {
      return { date, startedAt: parsed.getTime() };
    }
  }
  // Fall back to Date.parse
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    startedAt: parsed.getTime(),
  };
}

/** Parse "HH:MM:SS" or "MM:SS" or raw seconds string to milliseconds */
function parseTimeToMs(timeStr: string): number {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim();

  // Try HH:MM:SS or MM:SS
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const nums = parts.map((p) => parseFloat(p));
    if (nums.every((n) => Number.isFinite(n))) {
      if (parts.length === 3) {
        return Math.round((nums[0] * 3600 + nums[1] * 60 + nums[2]) * 1000);
      }
      return Math.round((nums[0] * 60 + nums[1]) * 1000);
    }
  }

  // Raw seconds
  const sec = parseFloat(trimmed);
  if (Number.isFinite(sec) && sec > 0) {
    return Math.round(sec * 1000);
  }

  return 0;
}

function buildWorkoutSessions(
  rowsByWorkout: Map<string, { dateStr: string; durationMs: number; exerciseRows: Map<string, { weight: number; reps: number }[]> }>,
): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];

  for (const [, workout] of rowsByWorkout) {
    const dateResult = parseDateToYMD(workout.dateStr);
    if (!dateResult) continue;

    const exercises: WorkoutExercise[] = [];
    for (const [exerciseName, setRows] of workout.exerciseRows) {
      const helmName = mapStrongExercise(exerciseName);
      const sets: WorkoutSet[] = [];

      for (const s of setRows) {
        if (Number.isFinite(s.weight) && s.weight >= 0 && Number.isFinite(s.reps) && s.reps > 0) {
          sets.push({ id: generateId(), weight: s.weight || 0, reps: s.reps });
        }
      }

      if (sets.length > 0) {
        exercises.push({ id: generateId(), name: helmName, sets });
      }
    }

    if (exercises.length > 0) {
      sessions.push({
        id: generateId(),
        date: dateResult.date,
        startedAt: dateResult.startedAt,
        endedAt: dateResult.startedAt + workout.durationMs,
        exercises,
        personalRecords: [],
      });
    }
  }

  return sessions.sort((a, b) => b.endedAt - a.endedAt);
}

function makeFoodItem(
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  brand?: string,
): FoodItem {
  return {
    id: generateId(),
    name: name || 'Unknown food',
    brand: brand || undefined,
    calories: Math.round(Math.max(0, calories || 0)),
    protein: Math.round(Math.max(0, protein || 0) * 10) / 10,
    carbs: Math.round(Math.max(0, carbs || 0) * 10) / 10,
    fat: Math.round(Math.max(0, fat || 0) * 10) / 10,
    servingSize: 1,
    servingUnit: 'serving',
    servings: 1,
    micronutrients: createEmptyMicronutrients(),
    hasMicronutrientData: false,
    timestamp: Date.now(),
  };
}

// ── Strong CSV parsing ──

export function parseStrongCSV(csvString: string, sourceUnit: WeightUnit = 'kg'): WorkoutSession[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  const dateIdx = col('Date');
  const workoutNameIdx = col('Workout Name');
  const durationIdx = col('Duration');
  const exerciseIdx = col('Exercise Name');
  const weightIdx = col('Weight');
  const repsIdx = col('Reps');

  if (dateIdx === -1 || exerciseIdx === -1) return [];

  // Strong header just says "Weight" - caller must provide the source unit
  const needsConversion = sourceUnit === 'lbs';

  // Group rows by workout (Date + Workout Name)
  const workoutGroups = new Map<string, typeof rows>();

  for (const row of rows) {
    if (row.length <= Math.max(dateIdx, exerciseIdx)) continue;
    const key = `${row[dateIdx]}||${workoutNameIdx >= 0 ? row[workoutNameIdx] : ''}`;
    const group = workoutGroups.get(key) ?? [];
    group.push(row);
    workoutGroups.set(key, group);
  }

  const sessions: WorkoutSession[] = [];

  for (const [key, group] of workoutGroups) {
    const [dateStr] = key.split('||');
    // Strong date format: "YYYY-MM-DD HH:MM:SS"
    const date = dateStr.trim().split(' ')[0];
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    const durationMs = durationIdx >= 0 && group[0][durationIdx]
      ? parseDuration(group[0][durationIdx])
      : 3600000;

    // Parse the date to get a timestamp
    const dateObj = new Date(`${date}T12:00:00`);
    const startedAt = dateObj.getTime();

    // Group rows by exercise name within this workout
    const exerciseMap = new Map<string, typeof group>();
    for (const row of group) {
      const strongName = row[exerciseIdx]?.trim();
      if (!strongName) continue;
      const exerciseGroup = exerciseMap.get(strongName) ?? [];
      exerciseGroup.push(row);
      exerciseMap.set(strongName, exerciseGroup);
    }

    const exercises: WorkoutExercise[] = [];
    for (const [strongName, exRows] of exerciseMap) {
      const helmName = mapStrongExercise(strongName);
      const sets: WorkoutSet[] = [];

      for (const row of exRows) {
        let weight = weightIdx >= 0 ? parseFloat(row[weightIdx]) : 0;
        const reps = repsIdx >= 0 ? parseInt(row[repsIdx], 10) : 0;

        if (Number.isFinite(weight) && weight >= 0 && Number.isFinite(reps) && reps > 0) {
          if (needsConversion && weight > 0) weight = Math.round(weight * LBS_TO_KG * 10) / 10;
          sets.push({
            id: generateId(),
            weight: weight || 0,
            reps,
          });
        }
      }

      if (sets.length > 0) {
        exercises.push({
          id: generateId(),
          name: helmName,
          sets,
        });
      }
    }

    if (exercises.length > 0) {
      sessions.push({
        id: generateId(),
        date,
        startedAt,
        endedAt: startedAt + durationMs,
        exercises,
        personalRecords: [],
      });
    }
  }

  return sessions.sort((a, b) => b.endedAt - a.endedAt);
}

// ── Hevy CSV parsing ──

export function parseHevyCSV(csvString: string): WorkoutSession[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  const titleIdx = col('title');
  const startIdx = col('start_time');
  const endIdx = col('end_time');
  const exerciseIdx = col('exercise_title');
  const weightIdx = col('weight_kg');
  const repsIdx = col('reps');
  const setTypeIdx = col('set_type');

  if (exerciseIdx === -1) return [];

  // Group by workout session (start_time is unique per session)
  const workoutGroups = new Map<string, typeof rows>();

  for (const row of rows) {
    if (row.length <= exerciseIdx) continue;
    const key = startIdx >= 0 ? row[startIdx] : (titleIdx >= 0 ? row[titleIdx] : '');
    if (!key) continue;
    const group = workoutGroups.get(key) ?? [];
    group.push(row);
    workoutGroups.set(key, group);
  }

  const sessions: WorkoutSession[] = [];

  for (const [, group] of workoutGroups) {
    const firstRow = group[0];
    const dateStr = startIdx >= 0 ? firstRow[startIdx] : '';
    const dateResult = parseDateToYMD(dateStr);
    if (!dateResult) continue;

    // Calculate duration from start/end times
    let durationMs = 3600000;
    if (startIdx >= 0 && endIdx >= 0) {
      const start = new Date(firstRow[startIdx]).getTime();
      const end = new Date(firstRow[endIdx]).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        durationMs = end - start;
      }
    }

    // Group by exercise
    const exerciseMap = new Map<string, typeof group>();
    for (const row of group) {
      const name = row[exerciseIdx]?.trim();
      if (!name) continue;
      const exerciseGroup = exerciseMap.get(name) ?? [];
      exerciseGroup.push(row);
      exerciseMap.set(name, exerciseGroup);
    }

    const exercises: WorkoutExercise[] = [];
    for (const [name, exRows] of exerciseMap) {
      const helmName = mapStrongExercise(name);
      const sets: WorkoutSet[] = [];

      for (const row of exRows) {
        // Skip warmup sets if desired - we include all sets
        const weight = weightIdx >= 0 ? parseFloat(row[weightIdx]) : 0;
        const reps = repsIdx >= 0 ? parseInt(row[repsIdx], 10) : 0;

        if (Number.isFinite(weight) && weight >= 0 && Number.isFinite(reps) && reps > 0) {
          sets.push({ id: generateId(), weight: weight || 0, reps });
        }
      }

      if (sets.length > 0) {
        exercises.push({ id: generateId(), name: helmName, sets });
      }
    }

    if (exercises.length > 0) {
      sessions.push({
        id: generateId(),
        date: dateResult.date,
        startedAt: dateResult.startedAt,
        endedAt: dateResult.startedAt + durationMs,
        exercises,
        personalRecords: [],
      });
    }
  }

  return sessions.sort((a, b) => b.endedAt - a.endedAt);
}

// ── Fitbod CSV parsing ──

export function parseFitbodCSV(csvString: string): WorkoutSession[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  const dateIdx = col('Date');
  const exerciseIdx = col('Exercise');
  const repsIdx = col('Reps');
  // Fitbod may use "Weight (lbs)" or "Weight (kgs)" or "Weight"
  const weightIdx = headers.findIndex((h) => h.startsWith('Weight'));
  const warmupIdx = col('isWarmup');

  // Detect source unit from header
  const weightHeader = weightIdx >= 0 ? headers[weightIdx] : '';
  const sourceIsLbs = /lbs/i.test(weightHeader);

  if (dateIdx === -1 || exerciseIdx === -1) return [];

  // Group by date to form workout sessions
  const dateGroups = new Map<string, typeof rows>();

  for (const row of rows) {
    if (row.length <= Math.max(dateIdx, exerciseIdx)) continue;
    // Skip warmup sets
    if (warmupIdx >= 0 && row[warmupIdx]?.trim() === '1') continue;
    const dateKey = row[dateIdx]?.trim();
    if (!dateKey) continue;
    const group = dateGroups.get(dateKey) ?? [];
    group.push(row);
    dateGroups.set(dateKey, group);
  }

  const sessions: WorkoutSession[] = [];

  for (const [dateKey, group] of dateGroups) {
    const dateResult = parseDateToYMD(dateKey);
    if (!dateResult) continue;

    const exerciseMap = new Map<string, typeof group>();
    for (const row of group) {
      const name = row[exerciseIdx]?.trim();
      if (!name) continue;
      const exerciseGroup = exerciseMap.get(name) ?? [];
      exerciseGroup.push(row);
      exerciseMap.set(name, exerciseGroup);
    }

    const exercises: WorkoutExercise[] = [];
    for (const [name, exRows] of exerciseMap) {
      const helmName = mapStrongExercise(name);
      const sets: WorkoutSet[] = [];

      for (const row of exRows) {
        let weight = weightIdx >= 0 ? parseFloat(row[weightIdx]) : 0;
        const reps = repsIdx >= 0 ? parseInt(row[repsIdx], 10) : 0;

        if (Number.isFinite(reps) && reps > 0) {
          if (sourceIsLbs && Number.isFinite(weight) && weight > 0) {
            weight = Math.round(weight * LBS_TO_KG * 10) / 10;
          }
          sets.push({ id: generateId(), weight: Number.isFinite(weight) ? Math.max(0, weight) : 0, reps });
        }
      }

      if (sets.length > 0) {
        exercises.push({ id: generateId(), name: helmName, sets });
      }
    }

    if (exercises.length > 0) {
      sessions.push({
        id: generateId(),
        date: dateResult.date,
        startedAt: dateResult.startedAt,
        endedAt: dateResult.startedAt + 3600000,
        exercises,
        personalRecords: [],
      });
    }
  }

  return sessions.sort((a, b) => b.endedAt - a.endedAt);
}

// ── FitNotes CSV parsing ──

export function parseFitNotesCSV(csvString: string): WorkoutSession[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  const dateIdx = col('Date');
  const exerciseIdx = col('Exercise');
  const repsIdx = col('Reps');
  const weightIdx = headers.findIndex((h) => h.startsWith('Weight'));

  // Detect source unit from header
  const weightHeader = weightIdx >= 0 ? headers[weightIdx] : '';
  const sourceIsLbs = /lbs/i.test(weightHeader);

  if (dateIdx === -1 || exerciseIdx === -1) return [];

  // Group by date
  const dateGroups = new Map<string, typeof rows>();

  for (const row of rows) {
    if (row.length <= Math.max(dateIdx, exerciseIdx)) continue;
    const dateKey = row[dateIdx]?.trim();
    if (!dateKey) continue;
    const group = dateGroups.get(dateKey) ?? [];
    group.push(row);
    dateGroups.set(dateKey, group);
  }

  const sessions: WorkoutSession[] = [];

  for (const [dateKey, group] of dateGroups) {
    const dateResult = parseDateToYMD(dateKey);
    if (!dateResult) continue;

    const exerciseMap = new Map<string, typeof group>();
    for (const row of group) {
      const name = row[exerciseIdx]?.trim();
      if (!name) continue;
      const exerciseGroup = exerciseMap.get(name) ?? [];
      exerciseGroup.push(row);
      exerciseMap.set(name, exerciseGroup);
    }

    const exercises: WorkoutExercise[] = [];
    for (const [name, exRows] of exerciseMap) {
      const helmName = mapStrongExercise(name);
      const sets: WorkoutSet[] = [];

      for (const row of exRows) {
        let weight = weightIdx >= 0 ? parseFloat(row[weightIdx]) : 0;
        const reps = repsIdx >= 0 ? parseInt(row[repsIdx], 10) : 0;

        if (Number.isFinite(reps) && reps > 0) {
          if (sourceIsLbs && Number.isFinite(weight) && weight > 0) {
            weight = Math.round(weight * LBS_TO_KG * 10) / 10;
          }
          sets.push({ id: generateId(), weight: Number.isFinite(weight) ? Math.max(0, weight) : 0, reps });
        }
      }

      if (sets.length > 0) {
        exercises.push({ id: generateId(), name: helmName, sets });
      }
    }

    if (exercises.length > 0) {
      sessions.push({
        id: generateId(),
        date: dateResult.date,
        startedAt: dateResult.startedAt,
        endedAt: dateResult.startedAt + 3600000,
        exercises,
        personalRecords: [],
      });
    }
  }

  return sessions.sort((a, b) => b.endedAt - a.endedAt);
}

// ── Strava CSV parsing ──

const CARDIO_ACTIVITY_MAP: Record<string, { type: 'outdoor' | 'indoor'; activity: string }> = {
  // Strava activity types
  'Run': { type: 'outdoor', activity: 'Run' },
  'Trail Run': { type: 'outdoor', activity: 'Run' },
  'Walk': { type: 'outdoor', activity: 'Walk' },
  'Hike': { type: 'outdoor', activity: 'Walk' },
  'Ride': { type: 'outdoor', activity: 'Ride' },
  'Virtual Ride': { type: 'indoor', activity: 'Ride' },
  'Virtual Run': { type: 'indoor', activity: 'Treadmill' },
  'Treadmill': { type: 'indoor', activity: 'Treadmill' },
  'Elliptical': { type: 'indoor', activity: 'Elliptical' },
  'Swim': { type: 'outdoor', activity: 'Swim' },
  'Pool Swim': { type: 'indoor', activity: 'Swim' },
  'Rowing': { type: 'indoor', activity: 'Row' },
  // Garmin activity types
  'Running': { type: 'outdoor', activity: 'Run' },
  'Trail Running': { type: 'outdoor', activity: 'Run' },
  'Treadmill Running': { type: 'indoor', activity: 'Treadmill' },
  'Walking': { type: 'outdoor', activity: 'Walk' },
  'Hiking': { type: 'outdoor', activity: 'Walk' },
  'Cycling': { type: 'outdoor', activity: 'Ride' },
  'Indoor Cycling': { type: 'indoor', activity: 'Ride' },
  'Swimming': { type: 'outdoor', activity: 'Swim' },
  'Pool Swimming': { type: 'indoor', activity: 'Swim' },
  'Lap Swimming': { type: 'indoor', activity: 'Swim' },
  'Open Water Swimming': { type: 'outdoor', activity: 'Swim' },
  'Indoor Rowing': { type: 'indoor', activity: 'Row' },
  'Elliptical Trainer': { type: 'indoor', activity: 'Elliptical' },
};

// Garmin/Strava strength-type activities to skip for cardio import
const SKIP_ACTIVITIES = new Set([
  'Weight Training', 'Workout', 'Strength Training',
  'Strength', 'Yoga', 'Pilates', 'Meditation',
]);

export function parseStravaCSV(csvString: string): RunSession[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  const dateIdx = col('Activity Date');
  const typeIdx = col('Activity Type');
  const elapsedIdx = col('Elapsed Time');
  const movingIdx = col('Moving Time');
  const distanceIdx = col('Distance');
  const distanceMetersIdx = col('Distance.1');

  // Activity Date is required
  if (dateIdx === -1) return [];

  const sessions: RunSession[] = [];

  for (const row of rows) {
    if (row.length <= dateIdx) continue;

    const dateResult = parseDateToYMD(row[dateIdx]);
    if (!dateResult) continue;

    const activityType = typeIdx >= 0 ? row[typeIdx]?.trim() : '';

    if (SKIP_ACTIVITIES.has(activityType)) continue;

    const mapped = CARDIO_ACTIVITY_MAP[activityType];
    const runType = mapped?.type ?? 'outdoor';
    const activity = mapped?.activity ?? (activityType || 'Run');

    // Elapsed time in seconds
    const elapsedSeconds = elapsedIdx >= 0 ? parseFloat(row[elapsedIdx]) : 0;
    const movingSeconds = movingIdx >= 0 ? parseFloat(row[movingIdx]) : 0;
    const durationSeconds = movingSeconds > 0 ? movingSeconds : elapsedSeconds;
    const durationMs = Math.round((Number.isFinite(durationSeconds) ? durationSeconds : 0) * 1000);

    if (durationMs <= 0) continue;

    let distanceMeters = distanceMetersIdx >= 0 ? parseFloat(row[distanceMetersIdx]) : NaN;
    if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) {
      distanceMeters = distanceIdx >= 0 ? parseFloat(row[distanceIdx]) : 0;
      if (!Number.isFinite(distanceMeters)) distanceMeters = 0;
      // Fallback: if distance < 100 and duration > 60s, likely km not meters
      if (distanceMeters > 0 && distanceMeters < 100 && durationSeconds > 60) {
        distanceMeters = distanceMeters * 1000;
      }
    }

    sessions.push({
      id: generateId(),
      date: dateResult.date,
      type: runType,
      activity,
      startedAt: dateResult.startedAt,
      endedAt: dateResult.startedAt + durationMs,
      durationMs,
      distanceMeters: Math.round(distanceMeters),
      route: [],
    });
  }

  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

// ── Garmin CSV parsing ──

export function parseGarminCSV(csvString: string, distanceUnit?: GarminDistanceUnit): RunSession[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  const typeIdx = col('Activity Type');
  const dateIdx = col('Date');
  const distanceIdx = col('Distance');
  const timeIdx = col('Time');

  if (dateIdx === -1) return [];

  const sessions: RunSession[] = [];

  for (const row of rows) {
    if (row.length <= dateIdx) continue;

    const dateResult = parseDateToYMD(row[dateIdx]);
    if (!dateResult) continue;

    const activityType = typeIdx >= 0 ? row[typeIdx]?.trim() : '';

    if (SKIP_ACTIVITIES.has(activityType)) continue;

    const mapped = CARDIO_ACTIVITY_MAP[activityType];
    const runType = mapped?.type ?? 'outdoor';
    const activity = mapped?.activity ?? (activityType || 'Run');

    // Garmin exports time as "HH:MM:SS" or seconds
    const durationMs = timeIdx >= 0 ? parseTimeToMs(row[timeIdx]) : 0;
    if (durationMs <= 0) continue;

    // Garmin distance is user-configurable in exports, so prefer an explicit unit
    let distanceMeters = distanceIdx >= 0 ? parseFloat(row[distanceIdx]) : 0;
    if (!Number.isFinite(distanceMeters)) distanceMeters = 0;
    if (distanceMeters > 0) {
      if (distanceUnit === 'miles') {
        distanceMeters = distanceMeters * MILES_TO_METERS;
      } else if (distanceUnit === 'km') {
        distanceMeters = distanceMeters * 1000;
      } else if (distanceMeters < 100 && durationMs > 60000) {
        distanceMeters = distanceMeters * 1000;
      }
    }

    sessions.push({
      id: generateId(),
      date: dateResult.date,
      type: runType,
      activity,
      startedAt: dateResult.startedAt,
      endedAt: dateResult.startedAt + durationMs,
      durationMs,
      distanceMeters: Math.round(distanceMeters),
      route: [],
    });
  }

  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

// ── MyFitnessPal CSV parsing ──

export function parseMFPCSV(csvString: string): CalorieDay[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  const dateIdx = col('Date');
  const mealIdx = col('Meal');
  const foodIdx = col('Food Name');
  const calIdx = col('Calories');
  const fatIdx = headers.findIndex((h) => h.includes('Fat'));
  const proteinIdx = headers.findIndex((h) => h.includes('Protein'));
  const carbsIdx = headers.findIndex((h) => h.includes('Carb'));

  if (dateIdx === -1 || foodIdx === -1) return [];

  // Group by date → meal → foods
  const dayMap = new Map<string, Map<string, FoodItem[]>>();

  for (const row of rows) {
    if (row.length <= Math.max(dateIdx, foodIdx)) continue;
    const dateStr = row[dateIdx]?.trim();
    const foodName = row[foodIdx]?.trim();
    if (!dateStr || !foodName) continue;

    const dateResult = parseDateToYMD(dateStr);
    if (!dateResult) continue;

    const mealName = mealIdx >= 0 ? (row[mealIdx]?.trim() || 'Meal') : 'Meal';
    const calories = calIdx >= 0 ? parseFloat(row[calIdx]) : 0;
    const fat = fatIdx >= 0 ? parseFloat(row[fatIdx]) : 0;
    const protein = proteinIdx >= 0 ? parseFloat(row[proteinIdx]) : 0;
    const carbs = carbsIdx >= 0 ? parseFloat(row[carbsIdx]) : 0;

    const food = makeFoodItem(foodName, calories, protein, carbs, fat);

    if (!dayMap.has(dateResult.date)) {
      dayMap.set(dateResult.date, new Map());
    }
    const meals = dayMap.get(dateResult.date)!;
    if (!meals.has(mealName)) {
      meals.set(mealName, []);
    }
    meals.get(mealName)!.push(food);
  }

  const calorieDays: CalorieDay[] = [];
  for (const [date, mealsMap] of dayMap) {
    const meals: Meal[] = [];
    for (const [mealName, foods] of mealsMap) {
      meals.push({ id: generateId(), name: mealName, foods });
    }
    calorieDays.push({ date, meals });
  }

  return calorieDays;
}

// ── Cronometer CSV parsing ──

export function parseCronometerCSV(csvString: string): CalorieDay[] {
  const { headers, rows } = parseCSV(csvString);
  if (headers.length === 0 || rows.length === 0) return [];

  const col = (name: string) => headers.indexOf(name);
  // Cronometer uses "Day" instead of "Date"
  let dateIdx = col('Day');
  if (dateIdx === -1) dateIdx = col('Date');
  const foodIdx = col('Food Name');
  const energyIdx = headers.findIndex((h) => h.includes('Energy'));
  const proteinIdx = headers.findIndex((h) => h.includes('Protein'));
  const carbsIdx = headers.findIndex((h) => h.includes('Carb'));
  const fatIdx = headers.findIndex((h) => /\bFat\b/.test(h));
  const groupIdx = col('Group');
  const mealIdx = col('Meal');

  if (dateIdx === -1 || foodIdx === -1) return [];

  const mealColIdx = mealIdx >= 0 ? mealIdx : groupIdx;

  const dayMap = new Map<string, Map<string, FoodItem[]>>();

  for (const row of rows) {
    if (row.length <= Math.max(dateIdx, foodIdx)) continue;
    const dateStr = row[dateIdx]?.trim();
    const foodName = row[foodIdx]?.trim();
    if (!dateStr || !foodName) continue;

    const dateResult = parseDateToYMD(dateStr);
    if (!dateResult) continue;

    const mealName = mealColIdx >= 0 ? (row[mealColIdx]?.trim() || 'Meal') : 'Meal';
    const calories = energyIdx >= 0 ? parseFloat(row[energyIdx]) : 0;
    const protein = proteinIdx >= 0 ? parseFloat(row[proteinIdx]) : 0;
    const carbs = carbsIdx >= 0 ? parseFloat(row[carbsIdx]) : 0;
    const fat = fatIdx >= 0 ? parseFloat(row[fatIdx]) : 0;

    const food = makeFoodItem(foodName, calories, protein, carbs, fat);

    if (!dayMap.has(dateResult.date)) {
      dayMap.set(dateResult.date, new Map());
    }
    const meals = dayMap.get(dateResult.date)!;
    if (!meals.has(mealName)) {
      meals.set(mealName, []);
    }
    meals.get(mealName)!.push(food);
  }

  const calorieDays: CalorieDay[] = [];
  for (const [date, mealsMap] of dayMap) {
    const meals: Meal[] = [];
    for (const [mealName, foods] of mealsMap) {
      meals.push({ id: generateId(), name: mealName, foods });
    }
    calorieDays.push({ date, meals });
  }

  return calorieDays;
}

// ── Helm JSON parsing ──

export type HelmImportData = {
  workouts: WorkoutSession[];
  runs: RunSession[];
  calorieDays: CalorieDay[];
};

export function parseHelmJSON(jsonString: string): HelmImportData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.app !== 'helm' || !parsed.data) return null;

    const data = parsed.data;
    const workouts: WorkoutSession[] = Array.isArray(data.workouts)
      ? data.workouts.filter(isValidWorkoutSession)
      : [];
    const runs: RunSession[] = Array.isArray(data.runs)
      ? data.runs.filter(isValidRunSession)
      : [];
    const calorieDays: CalorieDay[] = Array.isArray(data.calorieDays)
      ? data.calorieDays.filter(isValidCalorieDay)
      : [];

    return { workouts, runs, calorieDays };
  } catch {
    return null;
  }
}

// ── Validation helpers ──

function isValidWorkoutSession(value: unknown): value is WorkoutSession {
  if (!value || typeof value !== 'object') return false;
  const w = value as WorkoutSession;
  return (
    typeof w.id === 'string' &&
    typeof w.date === 'string' &&
    typeof w.startedAt === 'number' &&
    typeof w.endedAt === 'number' &&
    Array.isArray(w.exercises)
  );
}

function isValidRunSession(value: unknown): value is RunSession {
  if (!value || typeof value !== 'object') return false;
  const r = value as RunSession;
  return (
    typeof r.id === 'string' &&
    typeof r.date === 'string' &&
    typeof r.startedAt === 'number' &&
    typeof r.endedAt === 'number' &&
    typeof r.durationMs === 'number' &&
    typeof r.distanceMeters === 'number'
  );
}

function isValidCalorieDay(value: unknown): value is CalorieDay {
  if (!value || typeof value !== 'object') return false;
  const d = value as CalorieDay;
  return typeof d.date === 'string' && Array.isArray(d.meals);
}

// ── Merge logic ──

export type MergeResult = {
  workoutsAdded: number;
  workoutsDuplicate: number;
  runsAdded: number;
  runsDuplicate: number;
  calorieDaysAdded: number;
  calorieDaysDuplicate: number;
};

function normalizeSignatureNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return String(Math.round(value * 10) / 10);
}

function exerciseSignature(exercise: WorkoutExercise): string {
  const sets = exercise.sets
    .map((set) => `${normalizeSignatureNumber(set.weight)}x${set.reps}`)
    .join(',');
  return `${exercise.name.trim().toLowerCase()}[${sets}]`;
}

export function getWorkoutSignature(workout: WorkoutSession): string {
  const exercises = workout.exercises
    .map(exerciseSignature)
    .sort()
    .join('|');
  const durationMs = Number.isFinite(workout.endedAt - workout.startedAt)
    ? Math.max(0, Math.round(workout.endedAt - workout.startedAt))
    : 0;
  return `${workout.date}::${workout.startedAt}::${durationMs}::${exercises}`;
}

export function getRunSignature(run: RunSession): string {
  return `${run.date}::${run.startedAt}`;
}

export function getMealSignature(m: Meal): string {
  const foodNames = m.foods
    .map((f) => f.name.toLowerCase())
    .sort()
    .join('|');
  return `${m.name.toLowerCase()}::${foodNames}`;
}

export function mergeWorkouts(
  existing: WorkoutSession[],
  incoming: WorkoutSession[],
): { merged: WorkoutSession[]; added: number; duplicates: number } {
  const existingSigs = new Set(existing.map(getWorkoutSignature));
  let added = 0;
  let duplicates = 0;
  const result = [...existing];

  for (const workout of incoming) {
    const sig = getWorkoutSignature(workout);
    if (existingSigs.has(sig)) {
      duplicates++;
    } else {
      result.push(workout);
      existingSigs.add(sig);
      added++;
    }
  }

  return {
    merged: result.sort((a, b) => b.endedAt - a.endedAt),
    added,
    duplicates,
  };
}

export function mergeRuns(
  existing: RunSession[],
  incoming: RunSession[],
): { merged: RunSession[]; added: number; duplicates: number } {
  const existingSigs = new Set(existing.map(getRunSignature));
  let added = 0;
  let duplicates = 0;
  const result = [...existing];

  for (const run of incoming) {
    const sig = getRunSignature(run);
    if (existingSigs.has(sig)) {
      duplicates++;
    } else {
      result.push(run);
      existingSigs.add(sig);
      added++;
    }
  }

  return {
    merged: result.sort((a, b) => b.startedAt - a.startedAt),
    added,
    duplicates,
  };
}

export function mergeCalorieDays(
  existing: CalorieDay[],
  incoming: CalorieDay[],
): { merged: CalorieDay[]; added: number; duplicates: number } {
  const dayMap = new Map<string, CalorieDay>();
  for (const day of existing) {
    dayMap.set(day.date, { ...day, meals: [...day.meals] });
  }

  let added = 0;
  let duplicates = 0;

  for (const incomingDay of incoming) {
    const existingDay = dayMap.get(incomingDay.date);
    if (!existingDay) {
      dayMap.set(incomingDay.date, incomingDay);
      added++;
    } else {
      const existingMealSigs = new Set(existingDay.meals.map(getMealSignature));
      let dayHadNew = false;

      for (const meal of incomingDay.meals) {
        const sig = getMealSignature(meal);
        if (existingMealSigs.has(sig)) {
          duplicates++;
        } else {
          existingDay.meals.push(meal);
          existingMealSigs.add(sig);
          added++;
          dayHadNew = true;
        }
      }

      if (dayHadNew) {
        dayMap.set(incomingDay.date, existingDay);
      }
    }
  }

  return {
    merged: Array.from(dayMap.values()),
    added,
    duplicates,
  };
}
