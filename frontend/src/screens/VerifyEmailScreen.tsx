import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

type VerifyEmailScreenProps = {
  email: string;
  onBack: () => void;
  onVerified: () => void;
};

export function VerifyEmailScreen({ email, onBack, onVerified }: VerifyEmailScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { verifySignUpOtp, resendSignUpOtp, error, clearError } = useUserStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown timer on mount (code was just sent)
  useEffect(() => {
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleVerify = async () => {
    clearError();
    if (code.length !== 8) return;
    setLoading(true);
    try {
      const ok = await verifySignUpOtp(email, code);
      if (ok) onVerified();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    clearError();
    const ok = await resendSignUpOtp(email);
    if (ok) {
      setCooldown(60);
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [cooldown, email, clearError, resendSignUpOtp]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>We sent a verification code to {email}</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
            placeholder="00000000"
            placeholderTextColor={colors.border}
            keyboardType="number-pad"
            maxLength={8}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.primaryButton, (loading || code.length !== 8) && { opacity: 0.6 }]}
            onPress={handleVerify}
            disabled={loading || code.length !== 8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verify</Text>}
          </Pressable>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive a code? </Text>
            {cooldown > 0 ? (
              <Text style={styles.resendCooldown}>Resend in {cooldown}s</Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={styles.resendLink}>Resend</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
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
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    ...typography.title,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    width: 280,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 18,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLabel: {
    ...typography.body,
    color: colors.muted,
    fontSize: 14,
  },
  resendCooldown: {
    ...typography.body,
    color: colors.muted,
    fontSize: 14,
  },
  resendLink: {
    ...typography.body,
    color: colors.accent,
    fontSize: 14,
  },
});
