import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { useCalorieStore, CalorieDay } from '../store/calorieStore';
import { useRunStore } from '../store/runStore';
import { UserSex, WeightUnit, toDisplayWeight, fromDisplayWeight, useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { colors, spacing, typography } from '../theme';
import { exportToJSON, exportWorkoutsToCSV, exportRunsToCSV, exportCaloriesToCSV } from '../services/exportData';
import { detectFileType, parseStrongCSV, parseHevyCSV, parseFitbodCSV, parseFitNotesCSV, parseStravaCSV, parseGarminCSV, parseMFPCSV, parseCronometerCSV, parseHelmJSON, mergeWorkouts, mergeRuns, mergeCalorieDays, MergeResult } from '../services/importData';
import { writeAndShareFile, pickAndReadFile } from '../services/fileIO';

type ExportFormat = 'json' | 'csv';

export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile, signOut } = useUserStore();
  const { workouts, importWorkouts } = useWorkoutStore();
  const { runs, importRuns } = useRunStore();
  const { calorieDays, importCalorieDays } = useCalorieStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editWeight, setEditWeight] = useState('');
  const [editSex, setEditSex] = useState<UserSex>('male');
  const [editWeightUnit, setEditWeightUnit] = useState<WeightUnit>('kg');
  const [editName, setEditName] = useState('');
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  // Data management state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<MergeResult | null>(null);
  const [importResultModalOpen, setImportResultModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!user) return null;

  const handleEditUnitChange = (newUnit: WeightUnit) => {
    if (newUnit === editWeightUnit) return;
    const value = Number(editWeight);
    if (Number.isFinite(value) && value > 0) {
      // Convert current value: old unit → kg → new unit
      const kg = fromDisplayWeight(value, editWeightUnit);
      setEditWeight(String(toDisplayWeight(kg, newUnit)));
    }
    setEditWeightUnit(newUnit);
  };

  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditWeightUnit(user.weightUnit);
    setEditWeight(user.bodyweightKg > 0 ? String(toDisplayWeight(user.bodyweightKg, user.weightUnit)) : '');
    setEditSex(user.sex);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updates: Partial<{ name: string; sex: UserSex; bodyweightKg: number; weightUnit: WeightUnit }> = {};
    if (editName.trim() && editName.trim() !== user.name) {
      updates.name = editName.trim();
    }
    if (editSex !== user.sex) {
      updates.sex = editSex;
    }
    if (editWeightUnit !== user.weightUnit) {
      updates.weightUnit = editWeightUnit;
    }
    const value = Number(editWeight);
    if (Number.isFinite(value) && value > 0) {
      const kg = fromDisplayWeight(value, editWeightUnit);
      if (kg !== user.bodyweightKg) {
        updates.bodyweightKg = kg;
      }
    }
    if (Object.keys(updates).length > 0) {
      updateProfile(updates);
    }
    setEditModalOpen(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === 'json') {
        const json = exportToJSON(workouts, runs, calorieDays);
        await writeAndShareFile('helm-export.json', json, 'application/json');
      } else {
        const workoutCSV = exportWorkoutsToCSV(workouts, user.weightUnit);
        await writeAndShareFile('helm-workouts.csv', workoutCSV, 'text/csv');
        const runCSV = exportRunsToCSV(runs);
        await writeAndShareFile('helm-cardio.csv', runCSV, 'text/csv');
        const calorieCSV = exportCaloriesToCSV(calorieDays);
        await writeAndShareFile('helm-calories.csv', calorieCSV, 'text/csv');
      }
      setExportModalOpen(false);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setImportError(null);
    try {
      const file = await pickAndReadFile();
      if (!file) return;

      setIsImporting(true);

      const fileType = detectFileType(file.content);

      if (fileType === 'unknown') {
        setImportError('Unrecognized file format. Please use a JSON or CSV export from your fitness app.');
        setIsImporting(false);
        return;
      }

      const result: MergeResult = {
        workoutsAdded: 0,
        workoutsDuplicate: 0,
        runsAdded: 0,
        runsDuplicate: 0,
        calorieDaysAdded: 0,
        calorieDaysDuplicate: 0,
      };

      // ── Workout imports (Strong, Hevy, Fitbod, FitNotes) ──
      if (fileType === 'strong-csv' || fileType === 'hevy-csv' || fileType === 'fitbod-csv' || fileType === 'fitnotes-csv') {
        const parsers = {
          'strong-csv': (c: string) => parseStrongCSV(c, user.weightUnit),
          'hevy-csv': (c: string) => parseHevyCSV(c),
          'fitbod-csv': (c: string) => parseFitbodCSV(c),
          'fitnotes-csv': (c: string) => parseFitNotesCSV(c),
        };
        const parsed = parsers[fileType](file.content);
        if (parsed.length === 0) {
          setImportError('No workout data found in this CSV file.');
          setIsImporting(false);
          return;
        }
        const merged = mergeWorkouts(workouts, parsed);
        const existingSigs = new Set(workouts.map(w => `${w.date}::${w.exercises.map(e => e.name.toLowerCase()).sort().join('|')}`));
        const newWorkouts = parsed.filter(w => {
          const sig = `${w.date}::${w.exercises.map(e => e.name.toLowerCase()).sort().join('|')}`;
          return !existingSigs.has(sig);
        });
        if (newWorkouts.length > 0) importWorkouts(newWorkouts);
        result.workoutsAdded = merged.added;
        result.workoutsDuplicate = merged.duplicates;

      // ── Cardio imports (Strava, Garmin) ──
      } else if (fileType === 'strava-csv' || fileType === 'garmin-csv') {
        const parsed = fileType === 'strava-csv' ? parseStravaCSV(file.content) : parseGarminCSV(file.content);
        if (parsed.length === 0) {
          setImportError('No cardio activities found in this CSV file.');
          setIsImporting(false);
          return;
        }
        const rMerge = mergeRuns(runs, parsed);
        const existingRunSigs = new Set(runs.map(r => `${r.date}::${r.startedAt}`));
        const newRuns = parsed.filter(r => !existingRunSigs.has(`${r.date}::${r.startedAt}`));
        if (newRuns.length > 0) importRuns(newRuns);
        result.runsAdded = rMerge.added;
        result.runsDuplicate = rMerge.duplicates;

      // ── Nutrition imports (MyFitnessPal, Cronometer) ──
      } else if (fileType === 'mfp-csv' || fileType === 'cronometer-csv') {
        const parsed = fileType === 'mfp-csv' ? parseMFPCSV(file.content) : parseCronometerCSV(file.content);
        if (parsed.length === 0) {
          setImportError('No nutrition data found in this CSV file.');
          setIsImporting(false);
          return;
        }
        const cMerge = mergeCalorieDays(calorieDays, parsed);
        const existingDates = new Set(calorieDays.map(d => d.date));
        const newDays = parsed.filter(d => !existingDates.has(d.date));
        const updatedDays = parsed
          .filter(d => existingDates.has(d.date))
          .map(d => {
            const existing = calorieDays.find(ed => ed.date === d.date);
            if (!existing) return d;
            const existingMealSigs = new Set(
              existing.meals.map(m => `${m.name.toLowerCase()}::${m.foods.map(f => f.name.toLowerCase()).sort().join('|')}`)
            );
            const newMeals = d.meals.filter(m => {
              const sig = `${m.name.toLowerCase()}::${m.foods.map(f => f.name.toLowerCase()).sort().join('|')}`;
              return !existingMealSigs.has(sig);
            });
            if (newMeals.length === 0) return null;
            return { date: d.date, meals: newMeals };
          })
          .filter(Boolean) as CalorieDay[];
        const toImport = [...newDays, ...updatedDays];
        if (toImport.length > 0) importCalorieDays(toImport);
        result.calorieDaysAdded = cMerge.added;
        result.calorieDaysDuplicate = cMerge.duplicates;

      // ── Helm JSON (all data types) ──
      } else if (fileType === 'helm-json') {
        const parsed = parseHelmJSON(file.content);
        if (!parsed) {
          setImportError('Could not parse this Helm export file.');
          setIsImporting(false);
          return;
        }

        if (parsed.workouts.length > 0) {
          const wMerge = mergeWorkouts(workouts, parsed.workouts);
          const existingSigs = new Set(workouts.map(w => `${w.date}::${w.exercises.map(e => e.name.toLowerCase()).sort().join('|')}`));
          const newWorkouts = parsed.workouts.filter(w => {
            const sig = `${w.date}::${w.exercises.map(e => e.name.toLowerCase()).sort().join('|')}`;
            return !existingSigs.has(sig);
          });
          if (newWorkouts.length > 0) importWorkouts(newWorkouts);
          result.workoutsAdded = wMerge.added;
          result.workoutsDuplicate = wMerge.duplicates;
        }

        if (parsed.runs.length > 0) {
          const rMerge = mergeRuns(runs, parsed.runs);
          const existingRunSigs = new Set(runs.map(r => `${r.date}::${r.startedAt}`));
          const newRuns = parsed.runs.filter(r => !existingRunSigs.has(`${r.date}::${r.startedAt}`));
          if (newRuns.length > 0) importRuns(newRuns);
          result.runsAdded = rMerge.added;
          result.runsDuplicate = rMerge.duplicates;
        }

        if (parsed.calorieDays.length > 0) {
          const cMerge = mergeCalorieDays(calorieDays, parsed.calorieDays);
          const existingDates = new Set(calorieDays.map(d => d.date));
          const newDays = parsed.calorieDays.filter(d => !existingDates.has(d.date));
          const updatedDays = parsed.calorieDays
            .filter(d => existingDates.has(d.date))
            .map(d => {
              const existing = calorieDays.find(ed => ed.date === d.date);
              if (!existing) return d;
              const existingMealSigs = new Set(
                existing.meals.map(m => `${m.name.toLowerCase()}::${m.foods.map(f => f.name.toLowerCase()).sort().join('|')}`)
              );
              const newMeals = d.meals.filter(m => {
                const sig = `${m.name.toLowerCase()}::${m.foods.map(f => f.name.toLowerCase()).sort().join('|')}`;
                return !existingMealSigs.has(sig);
              });
              if (newMeals.length === 0) return null;
              return { date: d.date, meals: newMeals };
            })
            .filter(Boolean) as typeof parsed.calorieDays;
          const toImport = [...newDays, ...updatedDays];
          if (toImport.length > 0) importCalorieDays(toImport);
          result.calorieDaysAdded = cMerge.added;
          result.calorieDaysDuplicate = cMerge.duplicates;
        }
      }

      setImportModalOpen(false);
      setImportResult(result);
      setImportResultModalOpen(true);
    } catch (e) {
      console.error('Import failed', e);
      setImportError('Something went wrong during import. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: spacing.lg + insets.top, paddingBottom: spacing.xl + insets.bottom },
        ]}
      >
        <Text style={styles.title}>Account</Text>

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Feather name="user" size={28} color={colors.accent} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <Pressable style={styles.editButton} onPress={handleOpenEdit}>
              <Feather name="edit-2" size={16} color={colors.accent} />
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sex</Text>
            <Text style={styles.infoValue}>{user.sex === 'male' ? 'Male' : 'Female'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unit</Text>
            <Text style={styles.infoValue}>{user.weightUnit === 'lbs' ? 'Imperial (lbs)' : 'Metric (kg)'}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Bodyweight</Text>
            <Text style={styles.infoValue}>{user.bodyweightKg > 0 ? `${toDisplayWeight(user.bodyweightKg, user.weightUnit)} ${user.weightUnit}` : 'Not set'}</Text>
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.xs }]}>Data Management</Text>
          <Pressable style={styles.dataRow} onPress={() => { setImportError(null); setImportModalOpen(true); }}>
            <Feather name="download-cloud" size={20} color={colors.accent} />
            <Text style={[styles.infoValue, { flex: 1 }]}>Import Data</Text>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
          <Pressable style={[styles.dataRow, styles.infoRowLast]} onPress={() => setExportModalOpen(true)}>
            <Feather name="upload-cloud" size={20} color={colors.accent} />
            <Text style={[styles.infoValue, { flex: 1 }]}>Export Data</Text>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </Card>

        <Pressable style={styles.signOutButton} onPress={() => setConfirmSignOut(true)}>
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalOpen} transparent animationType="fade" onRequestClose={() => setEditModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
        >
          <Pressable style={styles.modalDismiss} onPress={() => setEditModalOpen(false)} />
          <Pressable style={styles.editModal} onPress={Keyboard.dismiss}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setEditModalOpen(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Sex</Text>
              <View style={styles.segmented}>
                <Pressable
                  style={[styles.segment, editSex === 'male' && styles.segmentActive]}
                  onPress={() => setEditSex('male')}
                >
                  <Text style={[styles.segmentText, editSex === 'male' && styles.segmentTextActive]}>Male</Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, editSex === 'female' && styles.segmentActive]}
                  onPress={() => setEditSex('female')}
                >
                  <Text style={[styles.segmentText, editSex === 'female' && styles.segmentTextActive]}>Female</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.segmented}>
                <Pressable
                  style={[styles.segment, editWeightUnit === 'kg' && styles.segmentActive]}
                  onPress={() => handleEditUnitChange('kg')}
                >
                  <Text style={[styles.segmentText, editWeightUnit === 'kg' && styles.segmentTextActive]}>kg</Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, editWeightUnit === 'lbs' && styles.segmentActive]}
                  onPress={() => handleEditUnitChange('lbs')}
                >
                  <Text style={[styles.segmentText, editWeightUnit === 'lbs' && styles.segmentTextActive]}>lbs</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bodyweight ({editWeightUnit})</Text>
              <TextInput
                style={styles.input}
                value={editWeight}
                onChangeText={setEditWeight}
                placeholder="e.g. 75"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
              />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </Pressable>
          <Pressable style={styles.modalDismiss} onPress={() => setEditModalOpen(false)} />
        </KeyboardAvoidingView>
      </Modal>

      {/* Export Modal */}
      <Modal visible={exportModalOpen} transparent animationType="fade" onRequestClose={() => setExportModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
        >
          <Pressable style={styles.modalDismiss} onPress={() => setExportModalOpen(false)} />
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Data</Text>
              <Pressable onPress={() => setExportModalOpen(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Format</Text>
              <View style={styles.segmented}>
                <Pressable
                  style={[styles.segment, exportFormat === 'json' && styles.segmentActive]}
                  onPress={() => setExportFormat('json')}
                >
                  <Text style={[styles.segmentText, exportFormat === 'json' && styles.segmentTextActive]}>JSON</Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, exportFormat === 'csv' && styles.segmentActive]}
                  onPress={() => setExportFormat('csv')}
                >
                  <Text style={[styles.segmentText, exportFormat === 'csv' && styles.segmentTextActive]}>CSV</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.exportHint}>
              {exportFormat === 'json'
                ? 'Single file with all your data. Best for backup and re-import.'
                : 'Three separate files (workouts, cardio, calories). Best for spreadsheets.'}
            </Text>

            <Pressable style={[styles.saveButton, isExporting && styles.buttonDisabled]} onPress={handleExport} disabled={isExporting}>
              {isExporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Export</Text>
              )}
            </Pressable>
          </View>
          <Pressable style={styles.modalDismiss} onPress={() => setExportModalOpen(false)} />
        </KeyboardAvoidingView>
      </Modal>

      {/* Import Modal */}
      <Modal visible={importModalOpen} transparent animationType="fade" onRequestClose={() => setImportModalOpen(false)}>
        <View style={styles.confirmBackdrop}>
          <Card style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Import Data</Text>
            <Text style={styles.confirmText}>
              Select a JSON or CSV file to import. Workout, cardio, and nutrition formats are automatically detected.
            </Text>

            {importError && (
              <Text style={styles.errorText}>{importError}</Text>
            )}

            <View style={styles.importActions}>
              <Pressable style={styles.importCancel} onPress={() => setImportModalOpen(false)} disabled={isImporting}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.importChoose, isImporting && styles.buttonDisabled]} onPress={handleImport} disabled={isImporting}>
                {isImporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Choose File</Text>
                )}
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>

      {/* Import Result Modal */}
      <Modal visible={importResultModalOpen} transparent animationType="fade" onRequestClose={() => setImportResultModalOpen(false)}>
        <View style={styles.confirmBackdrop}>
          <Card style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Import Complete</Text>
            {importResult && (
              <View style={{ gap: spacing.xs }}>
                {(importResult.workoutsAdded > 0 || importResult.workoutsDuplicate > 0) && (
                  <Text style={styles.confirmText}>
                    Added {importResult.workoutsAdded} workout{importResult.workoutsAdded !== 1 ? 's' : ''}
                    {importResult.workoutsDuplicate > 0 ? ` (${importResult.workoutsDuplicate} duplicate${importResult.workoutsDuplicate !== 1 ? 's' : ''} skipped)` : ''}
                  </Text>
                )}
                {(importResult.runsAdded > 0 || importResult.runsDuplicate > 0) && (
                  <Text style={styles.confirmText}>
                    Added {importResult.runsAdded} run{importResult.runsAdded !== 1 ? 's' : ''}
                    {importResult.runsDuplicate > 0 ? ` (${importResult.runsDuplicate} duplicate${importResult.runsDuplicate !== 1 ? 's' : ''} skipped)` : ''}
                  </Text>
                )}
                {(importResult.calorieDaysAdded > 0 || importResult.calorieDaysDuplicate > 0) && (
                  <Text style={styles.confirmText}>
                    Added {importResult.calorieDaysAdded} calorie entr{importResult.calorieDaysAdded !== 1 ? 'ies' : 'y'}
                    {importResult.calorieDaysDuplicate > 0 ? ` (${importResult.calorieDaysDuplicate} duplicate${importResult.calorieDaysDuplicate !== 1 ? 's' : ''} skipped)` : ''}
                  </Text>
                )}
                {importResult.workoutsAdded === 0 && importResult.runsAdded === 0 && importResult.calorieDaysAdded === 0 && (
                  <Text style={styles.confirmText}>All data was already present. Nothing new to import.</Text>
                )}
              </View>
            )}
            <Pressable style={[styles.saveButton, { marginTop: spacing.sm }]} onPress={() => setImportResultModalOpen(false)}>
              <Text style={styles.saveButtonText}>Done</Text>
            </Pressable>
          </Card>
        </View>
      </Modal>

      {/* Sign Out Confirmation */}
      <Modal visible={confirmSignOut} transparent animationType="fade" onRequestClose={() => setConfirmSignOut(false)}>
        <View style={styles.confirmBackdrop}>
          <Card style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Sign out?</Text>
            <Text style={styles.confirmText}>Your data is stored on this device. You can log back in with your email and password.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.confirmCancel} onPress={() => setConfirmSignOut(false)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmDanger} onPress={signOut}>
                <Text style={styles.confirmDangerText}>Sign Out</Text>
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  profileCard: {
    gap: spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.headline,
    color: colors.text,
  },
  profileEmail: {
    ...typography.body,
    color: colors.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    ...typography.body,
    color: colors.muted,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 14,
    marginTop: spacing.md,
  },
  signOutText: {
    ...typography.headline,
    color: colors.danger,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalDismiss: {
    flex: 1,
  },
  editModal: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },
  modalClose: {
    ...typography.body,
    color: colors.muted,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    ...typography.body,
    color: colors.text,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    ...typography.body,
    color: colors.text,
  },
  segmentTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  importActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  importCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importChoose: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportHint: {
    ...typography.body,
    color: colors.muted,
    fontSize: 14,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    fontSize: 14,
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmModal: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.sm,
  },
  confirmText: {
    ...typography.body,
    color: colors.muted,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  confirmCancel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmCancelText: {
    ...typography.body,
    color: colors.text,
  },
  confirmDanger: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmDangerText: {
    ...typography.body,
    color: '#fff',
  },
});
