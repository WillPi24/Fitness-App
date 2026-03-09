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
  sex?: 'male' | 'female';
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

const MALE_FIGURE = require('../../assets/Male_Transparent.png');
const FEMALE_FIGURE = require('../../assets/Female_Transparent.png');

const MALE_MASKS: Record<CanonicalBodyPart, number> = {
  chest: require('../../assets/muscle-masks/male/chest.png'),
  back: require('../../assets/muscle-masks/male/back.png'),
  shoulders: require('../../assets/muscle-masks/male/shoulders.png'),
  quads: require('../../assets/muscle-masks/male/quads.png'),
  hamsGlutes: require('../../assets/muscle-masks/male/hamsGlutes.png'),
  calves: require('../../assets/muscle-masks/male/calves.png'),
  triceps: require('../../assets/muscle-masks/male/triceps.png'),
  biceps: require('../../assets/muscle-masks/male/biceps.png'),
  forearms: require('../../assets/muscle-masks/male/forearms.png'),
  absCore: require('../../assets/muscle-masks/male/absCore.png'),
};

const FEMALE_MASKS: Record<CanonicalBodyPart, number> = {
  chest: require('../../assets/muscle-masks/female/chest.png'),
  back: require('../../assets/muscle-masks/female/back.png'),
  shoulders: require('../../assets/muscle-masks/female/shoulders.png'),
  quads: require('../../assets/muscle-masks/female/quads.png'),
  hamsGlutes: require('../../assets/muscle-masks/female/hamsGlutes.png'),
  calves: require('../../assets/muscle-masks/female/calves.png'),
  triceps: require('../../assets/muscle-masks/female/triceps.png'),
  biceps: require('../../assets/muscle-masks/female/biceps.png'),
  forearms: require('../../assets/muscle-masks/female/forearms.png'),
  absCore: require('../../assets/muscle-masks/female/absCore.png'),
};

export function WeeklyMuscleMap({ bodyPartCounts, sex = 'male' }: WeeklyMuscleMapProps) {
  const figureImage = sex === 'female' ? FEMALE_FIGURE : MALE_FIGURE;
  const maskImages = sex === 'female' ? FEMALE_MASKS : MALE_MASKS;
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
        <Image source={figureImage} style={styles.figureImage} resizeMode="contain" />
        {activeBodyParts.map((bodyPart) => {
          const count = bodyPartCounts[bodyPart] ?? 0;
          const opacity = Math.min(0.18 + count * 0.06, 0.5);
          return (
            <Image
              key={bodyPart}
              source={maskImages[bodyPart]}
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
