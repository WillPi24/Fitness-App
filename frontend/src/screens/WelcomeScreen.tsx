import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

const APP_LOGO = require('../../assets/helm-app-icon.png');

type WelcomeScreenProps = {
  onSignUp: () => void;
  onLogin: () => void;
};

export function WelcomeScreen({ onSignUp, onLogin }: WelcomeScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.hero}>
          <Text style={styles.appName}>Helm</Text>
          <Text style={styles.tagline}>Track your workouts, nutrition, and progress — all in one place.</Text>
        </View>
        <View style={styles.logoContainer}>
          <Image source={APP_LOGO} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={onSignUp}>
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onLogin}>
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9dbd0',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: {
    gap: spacing.md,
  },
  appName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 42,
    lineHeight: 48,
    color: colors.text,
  },
  tagline: {
    ...typography.body,
    color: colors.muted,
    fontSize: 18,
    lineHeight: 26,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 340,
    height: 340,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 18,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    ...typography.headline,
    color: colors.text,
    fontSize: 18,
  },
});
