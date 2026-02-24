import MapView, { Polyline } from 'react-native-maps';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { ActiveRun, RunSession, useRunStore } from '../store/runStore';
import { colors, spacing, typography } from '../theme';

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = `${minutes}`.padStart(2, '0');
  const paddedSeconds = `${seconds}`.padStart(2, '0');
  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${minutes}:${paddedSeconds}`;
}

function formatDistanceKm(meters: number) {
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatPace(elapsedMs: number, meters: number) {
  if (!Number.isFinite(elapsedMs) || !Number.isFinite(meters) || meters < 10) {
    return '--';
  }
  const minutesPerKm = (elapsedMs / 60000) / (meters / 1000);
  if (!Number.isFinite(minutesPerKm) || minutesPerKm <= 0) {
    return '--';
  }
  let minutes = Math.floor(minutesPerKm);
  let seconds = Math.round((minutesPerKm - minutes) * 60);
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }
  const paddedSeconds = `${seconds}`.padStart(2, '0');
  return `${minutes}:${paddedSeconds} /km`;
}

function getElapsedMs(activeRun: ActiveRun | null, tick: number) {
  if (!activeRun) {
    return 0;
  }
  return activeRun.elapsedMs + (activeRun.isPaused ? 0 : tick - activeRun.segmentStartedAt);
}

function formatRunDate(run: RunSession) {
  const date = new Date(run.startedAt);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RunScreen() {
  const {
    runs,
    activeRun,
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    discardRun,
    updateIndoorDistance,
    isLoading,
    error,
    clearError,
  } = useRunStore();
  const insets = useSafeAreaInsets();

  const [runType, setRunType] = useState<'outdoor' | 'indoor'>('outdoor');
  const [timerTick, setTimerTick] = useState(Date.now());
  const [indoorDistance, setIndoorDistance] = useState('');
  const [confirmAction, setConfirmAction] = useState<'finish' | 'discard' | null>(null);
  const [showIndoorPicker, setShowIndoorPicker] = useState(false);
  const [indoorActivity, setIndoorActivity] = useState('Treadmill');
  const [isEditingIndoorDistance, setIsEditingIndoorDistance] = useState(false);

  const indoorOptions = useMemo(
    () => [
      'Treadmill',
      'Elliptical',
      'Indoor Bike',
      'Rowing Machine',
      'Stair Master',
      'Indoor Track',
      'Other',
    ],
    []
  );

  useEffect(() => {
    if (!activeRun || activeRun.isPaused) {
      return;
    }
    setTimerTick(Date.now());
    const interval = setInterval(() => {
      setTimerTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRun?.id, activeRun?.isPaused]);

  useEffect(() => {
    if (!activeRun || activeRun.type !== 'indoor' || isEditingIndoorDistance) {
      return;
    }
    const meters = activeRun.manualDistanceMeters ?? 0;
    setIndoorDistance(meters > 0 ? (meters / 1000).toFixed(2) : '');
  }, [activeRun?.id, activeRun?.manualDistanceMeters, activeRun?.type, isEditingIndoorDistance]);

  const elapsedMs = useMemo(() => getElapsedMs(activeRun, timerTick), [activeRun, timerTick]);
  const distanceMeters = useMemo(() => {
    if (!activeRun) {
      return 0;
    }
    if (activeRun.type === 'indoor') {
      return activeRun.manualDistanceMeters ?? 0;
    }
    return activeRun.distanceMeters;
  }, [activeRun]);

  const pace = useMemo(() => formatPace(elapsedMs, distanceMeters), [elapsedMs, distanceMeters]);
  const routeCoords = useMemo(
    () => (activeRun?.route ?? []).map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    })),
    [activeRun?.route]
  );
  const lastPoint =
    activeRun && activeRun.route.length > 0
      ? activeRun.route[activeRun.route.length - 1]
      : undefined;

  const recentRuns = useMemo(() => runs.slice(0, 5), [runs]);

  const handleStart = async () => {
    const ok = await startRun(runType);
    if (ok && runType === 'indoor') {
      setIndoorDistance('');
    }
  };

  const handleIndoorDistanceChange = async (value: string) => {
    setIndoorDistance(value);
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
      await updateIndoorDistance(numeric * 1000);
    }
  };

  const handleConfirm = async () => {
    if (confirmAction === 'finish') {
      await finishRun();
    } else if (confirmAction === 'discard') {
      await discardRun();
    }
    setConfirmAction(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top, paddingBottom: spacing.xl + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Cardio tracker</Text>
        <Text style={styles.subtitle}>Track outdoor runs with GPS or indoor cardio by logging distance.</Text>

        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

        {isLoading ? (
          <Card>
            <ActivityIndicator color={colors.accent} />
          </Card>
        ) : (
          <>
            {!activeRun ? (
              <>
                <Card>
                  <Text style={styles.sectionTitle}>Start a run</Text>
                  <View style={styles.segmented}>
                    <Pressable
                      style={[
                        styles.segment,
                        runType === 'outdoor' && styles.segmentActive,
                      ]}
                      onPress={() => setRunType('outdoor')}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          runType === 'outdoor' && styles.segmentTextActive,
                        ]}
                      >
                        Outdoor
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.segment,
                        runType === 'indoor' && styles.segmentActive,
                      ]}
                      onPress={() => setRunType('indoor')}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          runType === 'indoor' && styles.segmentTextActive,
                        ]}
                      >
                        Indoor
                      </Text>
                    </Pressable>
                  </View>
                  {runType === 'indoor' ? (
                    <View style={styles.indoorRow}>
                      <Text style={styles.indoorLabel}>Indoor activity</Text>
                      <Pressable
                        style={styles.indoorValueButton}
                        onPress={() => setShowIndoorPicker(true)}
                      >
                        <Text style={styles.indoorValueText}>{indoorActivity}</Text>
                      </Pressable>
                    </View>
                  ) : null}
                  <Pressable style={styles.primaryButton} onPress={handleStart}>
                    <Text style={styles.primaryButtonText}>Start run</Text>
                  </Pressable>
                </Card>

                <Card style={styles.statsCard}>
                  <View style={styles.statRow}>
                    <View>
                      <Text style={styles.statLabel}>Duration</Text>
                      <Text style={styles.statValue}>{formatDuration(elapsedMs)}</Text>
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Distance</Text>
                      <Text style={styles.statValue}>{formatDistanceKm(distanceMeters)}</Text>
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Pace</Text>
                      <Text style={styles.statValue}>{pace}</Text>
                    </View>
                  </View>
                  <Text style={styles.statHint}>Choose an outdoor or indoor exercise to begin.</Text>
                </Card>

                <Card style={styles.mapCard}>
                  <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderTitle}>No GPS path yet</Text>
                    <Text style={styles.mapPlaceholderText}>
                      Start an outdoor run to display your route.
                    </Text>
                  </View>
                </Card>
              </>
            ) : (
              <>
                <Card style={styles.statsCard}>
                  <View style={styles.statRow}>
                    <View>
                      <Text style={styles.statLabel}>Duration</Text>
                      <Text style={styles.statValue}>{formatDuration(elapsedMs)}</Text>
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Distance</Text>
                      <Text style={styles.statValue}>{formatDistanceKm(distanceMeters)}</Text>
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Pace</Text>
                      <Text style={styles.statValue}>{pace}</Text>
                    </View>
                  </View>
                  <Text style={styles.statHint}>
                    {activeRun.type === 'outdoor'
                      ? 'GPS updates continue in the background.'
                      : 'Enter your distance below.'}
                  </Text>
                </Card>

                {activeRun.type !== 'indoor' ? (
                  <Card style={styles.mapCard}>
                    {activeRun?.type === 'outdoor' && routeCoords.length > 0 && lastPoint ? (
                      <MapView
                        style={styles.map}
                        showsUserLocation
                        followsUserLocation
                        initialRegion={{
                          latitude: lastPoint.latitude,
                          longitude: lastPoint.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                      >
                        <Polyline coordinates={routeCoords} strokeColor={colors.accent} strokeWidth={4} />
                      </MapView>
                    ) : (
                      <View style={styles.mapPlaceholder}>
                        <Text style={styles.mapPlaceholderTitle}>No GPS path yet</Text>
                        <Text style={styles.mapPlaceholderText}>
                          {activeRun
                            ? 'Move outside with GPS enabled to see your route.'
                            : 'Start an outdoor run to display your route.'}
                        </Text>
                      </View>
                    )}
                  </Card>
                ) : null}

                <Card>
                  <Text style={styles.sectionTitle}>
                    {activeRun.type === 'outdoor'
                      ? 'Outdoor run'
                      : `Indoor run · ${indoorActivity}`}
                  </Text>
                  {activeRun.type === 'indoor' ? (
                    <View>
                      <Text style={styles.inputLabel}>Distance (km)</Text>
                      <TextInput
                        style={styles.input}
                        value={indoorDistance}
                        onChangeText={handleIndoorDistanceChange}
                        onFocus={() => setIsEditingIndoorDistance(true)}
                        onBlur={() => {
                          setIsEditingIndoorDistance(false);
                          const numeric = Number(indoorDistance);
                          if (Number.isFinite(numeric) && numeric >= 0) {
                            setIndoorDistance(numeric > 0 ? numeric.toFixed(2) : '');
                            updateIndoorDistance(numeric * 1000);
                          }
                        }}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        placeholderTextColor={colors.muted}
                      />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.controlRow,
                      activeRun.type === 'indoor' && styles.controlRowSpaced,
                    ]}
                  >
                    {activeRun.isPaused ? (
                      <Pressable style={styles.controlButton} onPress={resumeRun}>
                        <Text style={styles.controlButtonText}>Resume</Text>
                      </Pressable>
                    ) : (
                      <Pressable style={styles.controlButton} onPress={pauseRun}>
                        <Text style={styles.controlButtonText}>Pause</Text>
                      </Pressable>
                    )}
                    <Pressable style={styles.controlButton} onPress={() => setConfirmAction('finish')}>
                      <Text style={styles.controlButtonText}>Finish</Text>
                    </Pressable>
                  </View>
                  <Pressable style={styles.tertiaryButton} onPress={() => setConfirmAction('discard')}>
                    <Text style={styles.tertiaryButtonText}>Discard run</Text>
                  </Pressable>
                </Card>
              </>
            )}

            <Card>
              <Text style={styles.sectionTitle}>Recent runs</Text>
              {recentRuns.length === 0 ? (
                <Text style={styles.emptyText}>No runs logged yet.</Text>
              ) : (
                recentRuns.map((run) => (
                  <View key={run.id} style={styles.runRow}>
                    <View>
                      <Text style={styles.runLabel}>
                        {run.type === 'outdoor' ? 'Outdoor' : 'Indoor'} · {formatRunDate(run)}
                      </Text>
                      <Text style={styles.runSub}>
                        {formatDuration(run.durationMs)} · {formatPace(run.durationMs, run.distanceMeters)}
                      </Text>
                    </View>
                    <Text style={styles.runValue}>{formatDistanceKm(run.distanceMeters)}</Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showIndoorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIndoorPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose indoor activity</Text>
            <View style={styles.modalList}>
              {indoorOptions.map((option) => {
                const isSelected = option === indoorActivity;
                return (
                  <Pressable
                    key={option}
                    style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                    onPress={() => {
                      setIndoorActivity(option);
                      setShowIndoorPicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
                    {isSelected ? <Text style={styles.modalOptionBadge}>Selected</Text> : null}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalGhostButton} onPress={() => setShowIndoorPicker(false)}>
                <Text style={styles.modalGhostText}>Close</Text>
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>

      <Modal visible={confirmAction !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {confirmAction === 'finish' ? 'Finish this run?' : 'Discard this run?'}
            </Text>
            <Text style={styles.modalText}>
              {confirmAction === 'finish'
                ? 'This will save your run to history.'
                : 'This will permanently remove the active run.'}
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalGhostButton} onPress={() => setConfirmAction(null)}>
                <Text style={styles.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryButton} onPress={handleConfirm}>
                <Text style={styles.modalPrimaryText}>Confirm</Text>
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
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 220,
  },
  mapPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.accentSoft,
  },
  mapPlaceholderTitle: {
    ...typography.headline,
    color: colors.text,
  },
  mapPlaceholderText: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  statsCard: {
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    ...typography.label,
    color: colors.muted,
  },
  statValue: {
    ...typography.headline,
    color: colors.text,
  },
  statHint: {
    ...typography.body,
    color: colors.muted,
  },
  indoorRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  indoorLabel: {
    ...typography.label,
    color: colors.muted,
  },
  indoorValue: {
    marginTop: spacing.xs,
  },
  indoorValueButton: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentSoft,
  },
  indoorValueText: {
    ...typography.body,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
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
    paddingVertical: 10,
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
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryButtonText: {
    ...typography.body,
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.accent,
  },
  controlButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
  },
  controlButtonText: {
    ...typography.body,
    color: '#fff',
  },
  controlRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  controlRowSpaced: {
    marginTop: spacing.md,
  },
  tertiaryButton: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    ...typography.body,
    color: colors.muted,
  },
  inputLabel: {
    ...typography.label,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
  runRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  runLabel: {
    ...typography.body,
    color: colors.text,
  },
  runSub: {
    ...typography.body,
    color: colors.muted,
  },
  runValue: {
    ...typography.headline,
    color: colors.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 26, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },
  modalText: {
    ...typography.body,
    color: colors.muted,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalList: {
    gap: spacing.sm,
  },
  modalOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.text,
  },
  modalOptionBadge: {
    ...typography.label,
    color: colors.accent,
  },
  modalGhostButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalGhostText: {
    ...typography.body,
    color: colors.text,
  },
  modalPrimaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalPrimaryText: {
    ...typography.body,
    color: '#fff',
  },
});
