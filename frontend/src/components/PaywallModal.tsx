import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSubscription } from '../store/subscriptionStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

const FEATURES = [
  { icon: 'camera' as const, label: 'Barcode scanning' },
  { icon: 'bookmark' as const, label: 'Saved meals' },
  { icon: 'layers' as const, label: 'Workout templates' },
  { icon: 'activity' as const, label: 'Micronutrient tracking' },
  { icon: 'image' as const, label: 'Progress photos' },
  { icon: 'target' as const, label: 'Meet simulator & attempt selector' },
  { icon: 'zap' as const, label: '1RM calculator' },
  { icon: 'headphones' as const, label: 'Live pace keeper & split times' },
  { icon: 'trending-up' as const, label: 'Race predictor' },
];

export function PaywallModal() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { paywallVisible, hidePaywall, offerings, purchasePackage, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const yearlyPackage = offerings?.current?.annual ?? null;
  const monthlyPackage = offerings?.current?.monthly ?? null;

  const yearlyPrice = yearlyPackage?.product.priceString ?? '£29.99/year';
  const monthlyPrice = monthlyPackage?.product.priceString ?? '£2.99/month';

  // £30/year vs £2.99*12=£35.88/year = ~16% savings

  // Calculate monthly equivalent for yearly
  const yearlyMonthly = yearlyPackage?.product.price
    ? `${yearlyPackage.product.currencyCode === 'GBP' ? '£' : ''}${(yearlyPackage.product.price / 12).toFixed(2)}/mo`
    : '£2.50/mo'; // £30/12

  const handlePurchase = async () => {
    const pkg: PurchasesPackage | null = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;
    if (!pkg) {
      Alert.alert('Unavailable', 'Subscriptions are not available right now. Please try again later.');
      return;
    }
    setLoading(true);
    const ok = await purchasePackage(pkg);
    setLoading(false);
    if (ok) hidePaywall();
  };

  const handleRestore = async () => {
    setRestoring(true);
    const ok = await restorePurchases();
    setRestoring(false);
    if (ok) {
      hidePaywall();
    } else {
      Alert.alert('No subscription found', 'We couldn\'t find an active subscription for this account.');
    }
  };

  return (
    <Modal visible={paywallVisible} animationType="slide" onRequestClose={hidePaywall}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable style={styles.closeButton} onPress={hidePaywall}>
            <Feather name="x" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Unlock Full Sail</Text>
            <Text style={styles.subtitle}>Get the most out of your training with premium tools and features.</Text>
          </View>

          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureRow}>
                <Feather name={f.icon} size={18} color={colors.accent} />
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <View style={styles.planSelector}>
            <Pressable
              style={[styles.planOption, selectedPlan === 'yearly' && styles.planOptionSelected]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameSelected]}>Yearly</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 17%</Text>
                </View>
              </View>
              <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>{yearlyPrice}</Text>
              <Text style={[styles.planSubtext, selectedPlan === 'yearly' && styles.planSubtextSelected]}>{yearlyMonthly}</Text>
            </Pressable>

            <Pressable
              style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionSelected]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text style={[styles.planName, selectedPlan === 'monthly' && styles.planNameSelected]}>Monthly</Text>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceSelected]}>{monthlyPrice}</Text>
            </Pressable>
          </View>

          <Pressable style={[styles.subscribeButton, loading && { opacity: 0.6 }]} onPress={handlePurchase} disabled={loading || restoring}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeButtonText}>Subscribe</Text>}
          </Pressable>

          <Pressable style={styles.restoreButton} onPress={handleRestore} disabled={loading || restoring}>
            {restoring ? (
              <ActivityIndicator color={colors.muted} size="small" />
            ) : (
              <Text style={styles.restoreText}>Restore Purchases</Text>
            )}
          </Pressable>

          <Text style={styles.legalText}>
            Payment will be charged to your App Store or Google Play account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 24,
  },
  featureList: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
  },
  planSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  planOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    gap: 4,
  },
  planOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planName: {
    ...typography.headline,
    color: colors.text,
    fontSize: 16,
  },
  planNameSelected: {
    color: colors.text,
  },
  saveBadge: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveBadgeText: {
    ...typography.label,
    color: '#fff',
    fontSize: 10,
  },
  planPrice: {
    ...typography.headline,
    color: colors.text,
    fontSize: 20,
  },
  planPriceSelected: {
    color: colors.text,
  },
  planSubtext: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
  planSubtextSelected: {
    color: colors.muted,
  },
  subscribeButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 18,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  restoreText: {
    ...typography.body,
    color: colors.muted,
    fontSize: 14,
  },
  legalText: {
    ...typography.body,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
