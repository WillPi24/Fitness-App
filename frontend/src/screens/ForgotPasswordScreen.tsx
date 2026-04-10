import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

type ForgotPasswordScreenProps = {
  onBack: () => void;
  onSuccess: () => void;
};

type InternalStep = 'email' | 'code' | 'newPassword';

export function ForgotPasswordScreen({ onBack, onSuccess }: ForgotPasswordScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { sendPasswordReset, verifyPasswordResetOtp, updatePassword, error, clearError } = useUserStore();

  const [step, setStep] = useState<InternalStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async () => {
    clearError();
    setLocalError(null);
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const ok = await sendPasswordReset(email.trim().toLowerCase());
      if (ok) {
        startCooldown();
        setStep('code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    clearError();
    setLocalError(null);
    if (code.length !== 8) return;
    setLoading(true);
    try {
      const ok = await verifyPasswordResetOtp(email.trim().toLowerCase(), code);
      if (ok) {
        setStep('newPassword');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    clearError();
    setLocalError(null);
    const ok = await sendPasswordReset(email.trim().toLowerCase());
    if (ok) startCooldown();
  }, [cooldown, email, clearError, sendPasswordReset, startCooldown]);

  const handleResetPassword = async () => {
    clearError();
    setLocalError(null);
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const ok = await updatePassword(password);
      if (ok) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  const handleBack = () => {
    clearError();
    setLocalError(null);
    if (step === 'email') {
      onBack();
    } else if (step === 'code') {
      setStep('email');
      setCode('');
    } else {
      setStep('code');
      setPassword('');
      setConfirmPassword('');
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
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>

          {step === 'email' && (
            <>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>Enter your email and we'll send you a reset code.</Text>

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
                    autoFocus
                  />
                </View>

                {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

                <Pressable style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleSendCode} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send Reset Code</Text>}
                </Pressable>
              </View>
            </>
          )}

          {step === 'code' && (
            <>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

              <View style={[styles.form, { alignItems: 'center' }]}>
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

                {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

                <Pressable
                  style={[styles.primaryButton, { width: 200 }, (loading || code.length !== 8) && { opacity: 0.6 }]}
                  onPress={handleVerifyCode}
                  disabled={loading || code.length !== 8}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verify Code</Text>}
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
            </>
          )}

          {step === 'newPassword' && (
            <>
              <Text style={styles.title}>Set new password</Text>
              <Text style={styles.subtitle}>Choose a new password for your account.</Text>

              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>New Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="At least 6 characters"
                      placeholderTextColor={colors.muted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                    />
                    <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

                <Pressable style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Reset Password</Text>}
                </Pressable>
              </View>
            </>
          )}
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
    letterSpacing: 0,
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
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
