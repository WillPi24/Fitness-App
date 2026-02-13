import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { Card } from './Card';

export type CanonicalBodyPart =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'quads'
  | 'hamsGlutes'
  | 'calves'
  | 'triceps'
  | 'biceps'
  | 'forearms'
  | 'absCore';

type WeeklyMuscleMapProps = {
  bodyPartCounts: Partial<Record<CanonicalBodyPart, number>>;
};

const BODY_PART_LABELS: Record<CanonicalBodyPart, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  quads: 'Quads',
  hamsGlutes: 'Hamstrings/Glutes',
  calves: 'Calves',
  triceps: 'Triceps',
  biceps: 'Biceps',
  forearms: 'Forearms',
  absCore: 'Abs/Core',
};

const MUSCLE_IMAGE = require('../../assets/Male_Transparent.png');

const MASK_IMAGE_BY_PART: Record<CanonicalBodyPart, number> = {
  chest: require('../../assets/muscle-masks/chest.png'),
  back: require('../../assets/muscle-masks/back.png'),
  shoulders: require('../../assets/muscle-masks/shoulders.png'),
  quads: require('../../assets/muscle-masks/quads.png'),
  hamsGlutes: require('../../assets/muscle-masks/hamsGlutes.png'),
  calves: require('../../assets/muscle-masks/calves.png'),
  triceps: require('../../assets/muscle-masks/triceps.png'),
  biceps: require('../../assets/muscle-masks/biceps.png'),
  forearms: require('../../assets/muscle-masks/forearms.png'),
  absCore: require('../../assets/muscle-masks/absCore.png'),
};

export function WeeklyMuscleMap({ bodyPartCounts }: WeeklyMuscleMapProps) {
  const activeBodyParts = useMemo(
    () =>
      (Object.keys(bodyPartCounts) as CanonicalBodyPart[])
        .filter((bodyPart) => (bodyPartCounts[bodyPart] ?? 0) > 0)
        .sort((a, b) => (bodyPartCounts[b] ?? 0) - (bodyPartCounts[a] ?? 0)),
    [bodyPartCounts],
  );

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Muscles worked this week</Text>
      <View style={styles.figureWrapper}>
        <Image source={MUSCLE_IMAGE} style={styles.figureImage} resizeMode="contain" />
        {activeBodyParts.map((bodyPart) => {
          const count = bodyPartCounts[bodyPart] ?? 0;
          const opacity = Math.min(0.18 + count * 0.06, 0.5);
          return (
            <Image
              key={bodyPart}
              source={MASK_IMAGE_BY_PART[bodyPart]}
              style={[styles.maskImage, { opacity }]}
              resizeMode="contain"
            />
          );
        })}
      </View>
      {activeBodyParts.length === 0 ? (
        <Text style={styles.emptyText}>No mapped muscle groups logged this week.</Text>
      ) : (
        <View style={styles.legend}>
          {activeBodyParts.map((bodyPart) => (
            <View key={bodyPart} style={styles.legendPill}>
              <Text style={styles.legendText}>{BODY_PART_LABELS[bodyPart]}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  title: {
    ...typography.label,
    color: colors.muted,
  },
  figureWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1702 / 1536,
    borderRadius: 16,
    overflow: 'hidden',
  },
  figureImage: {
    width: '100%',
    height: '100%',
  },
  maskImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    tintColor: colors.accent,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  legendPill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  legendText: {
    ...typography.label,
    color: colors.accent,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
});
