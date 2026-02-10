import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { colors, spacing, typography } from '../theme';

export function SummaryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: spacing.lg + insets.top }]}>
        <Text style={styles.title}>Information</Text>
        <Text style={styles.subtitle}>Coming soon.</Text>
        <Card>
          <Text style={styles.emptyText}>Info content will appear here.</Text>
        </Card>
      </View>
    </View>
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
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
});
