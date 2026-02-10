import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

type LineGraphValue = number | null;

type LineGraphProps = {
  data: LineGraphValue[];
  color?: string;
  height?: number;
  compact?: boolean;
  startLabel?: string;
  endLabel?: string;
  valueSuffix?: string;
};

type PlotPoint = {
  index: number;
  x: number;
  y: number;
  value: number;
};

function formatValue(value: number, suffix?: string) {
  const rounded = Number.isInteger(value) ? `${value}` : value.toFixed(1);
  return suffix ? `${rounded}${suffix}` : rounded;
}

export function LineGraph({
  data,
  color = colors.accent,
  height = 150,
  compact = false,
  startLabel,
  endLabel,
  valueSuffix,
}: LineGraphProps) {
  const [width, setWidth] = useState(0);

  const validValues = useMemo(
    () => data.filter((value): value is number => value !== null),
    [data],
  );

  const minValue = validValues.length > 0 ? Math.min(...validValues) : 0;
  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
  const range = Math.max(1, maxValue - minValue);

  const horizontalPadding = compact ? 2 : 8;
  const verticalPadding = compact ? 3 : 10;
  const plotHeight = Math.max(20, height - verticalPadding * 2);

  const points = useMemo(() => {
    if (width <= 0 || data.length === 0 || validValues.length === 0) {
      return [] as PlotPoint[];
    }
    return data
      .map((value, index) => {
        if (value === null) {
          return null;
        }
        const x =
          data.length <= 1
            ? width / 2
            : horizontalPadding +
              (index / (data.length - 1)) * Math.max(1, width - horizontalPadding * 2);
        const y =
          verticalPadding +
          ((maxValue - value) / range) * Math.max(1, plotHeight);
        return { index, x, y, value };
      })
      .filter((point): point is PlotPoint => point !== null);
  }, [data, validValues.length, width, horizontalPadding, verticalPadding, maxValue, range, plotHeight]);

  const segments = useMemo(() => {
    const list: { cx: number; cy: number; length: number; angle: number }[] = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const start = points[i];
      const end = points[i + 1];
      if (end.index !== start.index + 1) {
        continue;
      }
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      list.push({
        cx: (start.x + end.x) / 2,
        cy: (start.y + end.y) / 2,
        length,
        angle,
      });
    }
    return list;
  }, [points]);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.plot, { height }]} onLayout={onLayout}>
        {!compact
          ? [0.25, 0.5, 0.75].map((ratio) => (
              <View
                key={ratio}
                style={[
                  styles.gridLine,
                  {
                    top: verticalPadding + plotHeight * ratio,
                  },
                ]}
              />
            ))
          : null}

        {segments.map((segment, index) => (
          <View
            key={`${index}-${segment.cx}-${segment.cy}`}
            style={[
              styles.segment,
              {
                backgroundColor: color,
                width: segment.length,
                left: segment.cx - segment.length / 2,
                top: segment.cy - 1,
                transform: [{ rotate: `${segment.angle}deg` }],
              },
            ]}
          />
        ))}

        {points.map((point, index) => (
          <View
            key={`${index}-${point.x}-${point.y}`}
            style={[
              styles.dot,
              {
                width: compact ? 4 : 6,
                height: compact ? 4 : 6,
                borderRadius: compact ? 2 : 3,
                left: point.x - (compact ? 2 : 3),
                top: point.y - (compact ? 2 : 3),
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </View>

      {!compact ? (
        <>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>
              Min {formatValue(minValue, valueSuffix)}
            </Text>
            <Text style={styles.valueLabel}>
              Max {formatValue(maxValue, valueSuffix)}
            </Text>
          </View>
          <View style={styles.labelRow}>
            <Text style={styles.axisLabel}>{startLabel ?? ''}</Text>
            <Text style={styles.axisLabel}>{endLabel ?? ''}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  plot: {
    position: 'relative',
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  segment: {
    position: 'absolute',
    height: 2,
    borderRadius: 999,
  },
  dot: {
    position: 'absolute',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
    lineHeight: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  axisLabel: {
    ...typography.body,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
