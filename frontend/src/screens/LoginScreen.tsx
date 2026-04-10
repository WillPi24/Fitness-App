import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

type LoginScreenProps = {
  onBack: () => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
};

export function LoginScreen({ onBack, onSuccess, onForgotPassword }: LoginScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { login, error, clearError } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    clearError();
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.backButton} onPress={onBack}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to your account.</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
                </Pressable>
              </View>
            </View>

            <Pressable onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Log In</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9dbd0',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
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
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.text,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 18,
  },
  forgotText: {
    ...typography.body,
    color: colors.accent,
    fontSize: 14,
    textAlign: 'right',
  },
});
