import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { useTheme } from '../store/themeStore';
import { Card } from './Card';

type CollapsibleSectionProps = {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function CollapsibleSection({
  title,
  summary,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card>
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSummary}>{summary}</Text>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.muted}
        />
      </Pressable>
      {expanded ? <View style={styles.sectionBody}>{children}</View> : null}
    </Card>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  sectionSummary: {
    ...typography.body,
    color: colors.muted,
  },
  sectionBody: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
});
