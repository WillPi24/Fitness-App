import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { useSubscription } from '../store/subscriptionStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

const AUTO_DISMISS_MS = 9000;
const WHEEL_SIZE = 200;

const AnimatedG = Animated.createAnimatedComponent(G);

function HelmWheel({ colors, rotation }: { colors: ThemeColors; rotation: Animated.AnimatedInterpolation<string> }) {
  return (
    <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox="0 0 200 200">
      <AnimatedG style={{ transform: [{ rotate: rotation }] }} originX={100} originY={100}>
        {/* 8 spokes — drawn first so the rim covers their middles, leaving handles outside */}
        <G stroke={colors.accent} strokeWidth={14} strokeLinecap="round">
          <Line x1={100} y1={100} x2={100} y2={14} />
          <Line x1={100} y1={100} x2={100} y2={186} />
          <Line x1={100} y1={100} x2={14} y2={100} />
          <Line x1={100} y1={100} x2={186} y2={100} />
          <Line x1={100} y1={100} x2={39} y2={39} />
          <Line x1={100} y1={100} x2={161} y2={39} />
          <Line x1={100} y1={100} x2={39} y2={161} />
          <Line x1={100} y1={100} x2={161} y2={161} />
        </G>

        {/* Outer rim — donut shape via fill-rule="evenodd" */}
        <Path
          d="M 100 30 A 70 70 0 1 0 100 170 A 70 70 0 1 0 100 30 Z M 100 46 A 54 54 0 1 1 100 154 A 54 54 0 1 1 100 46 Z"
          fill={colors.accent}
          fillRule="evenodd"
        />

        {/* Hub — solid disc with hollow centre matching card surface */}
        <Circle cx={100} cy={100} r={18} fill={colors.accent} />
        <Circle cx={100} cy={100} r={9} fill={colors.surface} />
      </AnimatedG>
    </Svg>
  );
}

export function PurchaseSuccessOverlay() {
  const { purchaseCelebrationVisible, dismissPurchaseCelebration } = useSubscription();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  const scrim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const wheelTurn = useRef(new Animated.Value(0)).current;
  const headline = useRef(new Animated.Value(0)).current;
  const subhead = useRef(new Animated.Value(0)).current;
  const cta = useRef(new Animated.Value(0)).current;

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!purchaseCelebrationVisible) return;

    if (reduceMotion) {
      scrim.setValue(1);
      logoScale.setValue(1);
      logoOpacity.setValue(1);
      headline.setValue(1);
      subhead.setValue(1);
      cta.setValue(1);
    } else {
      scrim.setValue(0);
      logoScale.setValue(0);
      logoOpacity.setValue(0);
      wheelTurn.setValue(0);
      headline.setValue(0);
      subhead.setValue(0);
      cta.setValue(0);

      Animated.parallel([
        Animated.timing(scrim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(logoScale, {
              toValue: 1,
              duration: 700,
              easing: Easing.out(Easing.back(1.6)),
              useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          ]),
        ]),
      ]).start();

      Animated.sequence([
        Animated.delay(600),
        Animated.timing(headline, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.delay(-100),
        Animated.timing(subhead, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.delay(100),
        Animated.timing(cta, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();

      const wheelLoop = Animated.loop(
        Animated.timing(wheelTurn, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      wheelLoopRef.current = wheelLoop;
      wheelLoop.start();
    }

    dismissTimerRef.current = setTimeout(() => {
      dismissPurchaseCelebration();
    }, AUTO_DISMISS_MS);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (wheelLoopRef.current) wheelLoopRef.current.stop();
    };
  }, [purchaseCelebrationVisible, reduceMotion]);

  const wheelRotation = wheelTurn.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={purchaseCelebrationVisible} transparent animationType="none" onRequestClose={dismissPurchaseCelebration}>
      <Animated.View style={[styles.scrim, { opacity: scrim }]}>
        <View style={styles.card}>
          <Animated.View
            style={[
              styles.stage,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <HelmWheel colors={colors} rotation={wheelRotation} />
          </Animated.View>

          <Animated.Text style={[styles.headline, { opacity: headline }]}>Welcome aboard</Animated.Text>
          <Animated.Text style={[styles.subhead, { opacity: subhead }]}>Full Sail unlocked</Animated.Text>

          <Animated.View style={{ opacity: cta, width: '100%' }}>
            <Pressable style={styles.cta} onPress={dismissPurchaseCelebration}>
              <Text style={styles.ctaText}>Get started</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(11, 22, 35, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  stage: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  subhead: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xs,
    width: '100%',
  },
  ctaText: {
    ...typography.headline,
    color: '#FFFFFF',
    fontSize: 17,
  },
});
