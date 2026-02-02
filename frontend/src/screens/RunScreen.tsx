import MapView, { Polyline } from 'react-native-maps';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
  if (meters <= 0) {
    return '--';
  }
  const minutesPerKm = (elapsedMs / 60000) / (meters / 1000);
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
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

  useEffect(() => {
    if (!activeRun || activeRun.isPaused) {
      return;
    }
    const interval = setInterval(() => {
      setTimerTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRun?.id, activeRun?.isPaused]);

  useEffect(() => {
    if (activeRun?.type === 'indoor') {
      const meters = activeRun.manualDistanceMeters ?? 0;
      setIndoorDistance(meters > 0 ? (meters / 1000).toFixed(2) : '');
    }
  }, [activeRun?.id, activeRun?.manualDistanceMeters, activeRun?.type]);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top, paddingBottom: spacing.xl + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Run tracker</Text>
        <Text style={styles.subtitle}>Track outdoor runs with GPS or log indoor distance.</Text>

        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

        {isLoading ? (
          <Card>
            <ActivityIndicator color={colors.accent} />
          </Card>
        ) : (
          <>
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
                  <Text style={styles.mapPlaceholderTitle}>
                    {activeRun?.type === 'indoor' ? 'Indoor run' : 'No GPS path yet'}
                  </Text>
                  <Text style={styles.mapPlaceholderText}>
                    {activeRun
                      ? 'Move outside with GPS enabled to see your route.'
                      : 'Start an outdoor run to display your route.'}
                  </Text>
                </View>
              )}
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
              <Text style={styles.statHint}>
                {activeRun
                  ? activeRun.type === 'outdoor'
                    ? 'GPS updates continue in the background.'
                    : 'Enter your treadmill distance below.'
                  : 'Choose an outdoor or indoor run to begin.'}
              </Text>
            </Card>

            {!activeRun ? (
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
                      Outdoor (GPS)
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
                      Indoor (Treadmill)
                    </Text>
                  </Pressable>
                </View>
                <Pressable style={styles.primaryButton} onPress={handleStart}>
                  <Text style={styles.primaryButtonText}>Start run</Text>
                </Pressable>
              </Card>
            ) : (
              <Card>
                <Text style={styles.sectionTitle}>
                  {activeRun.type === 'outdoor' ? 'Outdoor run' : 'Indoor run'}
                </Text>
                {activeRun.type === 'indoor' ? (
                  <View>
                    <Text style={styles.inputLabel}>Distance (km)</Text>
                    <TextInput
                      style={styles.input}
                      value={indoorDistance}
                      onChangeText={handleIndoorDistanceChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                ) : null}
                <View style={styles.controlRow}>
                  {activeRun.isPaused ? (
                    <Pressable style={styles.primaryButton} onPress={resumeRun}>
                      <Text style={styles.primaryButtonText}>Resume</Text>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.secondaryButton} onPress={pauseRun}>
                      <Text style={styles.secondaryButtonText}>Pause</Text>
                    </Pressable>
                  )}
                  <Pressable style={styles.primaryButton} onPress={finishRun}>
                    <Text style={styles.primaryButtonText}>Finish</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.tertiaryButton} onPress={discardRun}>
                  <Text style={styles.tertiaryButtonText}>Discard run</Text>
                </Pressable>
              </Card>
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
  controlRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
});
