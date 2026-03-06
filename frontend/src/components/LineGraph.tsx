import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, spacing, typography } from '../theme';

type LineGraphValue = number | null;

type LineGraphProps = {
  data: LineGraphValue[];
  labels?: string[];
  color?: string;
  height?: number;
  compact?: boolean;
  startLabel?: string;
  endLabel?: string;
  valueSuffix?: string;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
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

function pickAxisLabels(
  labels: string[],
  maxLabels: number,
): Array<{ index: number; label: string }> {
  if (labels.length <= maxLabels) {
    return labels.map((label, index) => ({ index, label }));
  }
  const result: Array<{ index: number; label: string }> = [];
  // Always include first and last
  result.push({ index: 0, label: labels[0] });
  const innerCount = maxLabels - 2;
  for (let i = 1; i <= innerCount; i++) {
    const idx = Math.round((i / (innerCount + 1)) * (labels.length - 1));
    result.push({ index: idx, label: labels[idx] });
  }
  result.push({ index: labels.length - 1, label: labels[labels.length - 1] });
  return result;
}

export function LineGraph({
  data,
  labels,
  color = colors.accent,
  height = 150,
  compact = false,
  startLabel,
  endLabel,
  valueSuffix,
  onInteractionStart,
  onInteractionEnd,
}: LineGraphProps) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const pointsRef = useRef<PlotPoint[]>([]);

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
    const result = data
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
    pointsRef.current = result;
    return result;
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

  const axisLabels = useMemo(() => {
    if (compact || !labels || labels.length === 0) {
      return null;
    }
    const maxLabels = Math.min(6, Math.max(2, Math.floor(width / 55)));
    return pickAxisLabels(labels, maxLabels);
  }, [compact, labels, width]);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  const findNearestPoint = useCallback(
    (touchX: number) => {
      const pts = pointsRef.current;
      if (pts.length === 0) {
        return null;
      }
      let nearest = pts[0];
      let bestDist = Math.abs(touchX - nearest.x);
      for (let i = 1; i < pts.length; i++) {
        const dist = Math.abs(touchX - pts[i].x);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = pts[i];
        }
      }
      return nearest;
    },
    [],
  );

  const handleTouch = useCallback(
    (event: GestureResponderEvent) => {
      const touchX = event.nativeEvent.locationX;
      const nearest = findNearestPoint(touchX);
      if (nearest) {
        setActiveIndex(nearest.index);
      }
    },
    [findNearestPoint],
  );

  const handleGrant = useCallback(
    (event: GestureResponderEvent) => {
      onInteractionStart?.();
      handleTouch(event);
    },
    [onInteractionStart, handleTouch],
  );

  const handleRelease = useCallback(() => {
    setActiveIndex(null);
    onInteractionEnd?.();
  }, [onInteractionEnd]);

  const activePoint = activeIndex !== null
    ? points.find((p) => p.index === activeIndex) ?? null
    : null;

  const activeLabel = activeIndex !== null && labels && labels[activeIndex]
    ? labels[activeIndex]
    : null;

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.plot, { height }]}
        onLayout={onLayout}
        onStartShouldSetResponder={() => !compact}
        onMoveShouldSetResponder={() => !compact}
        onResponderGrant={handleGrant}
        onResponderMove={handleTouch}
        onResponderRelease={handleRelease}
        onResponderTerminate={handleRelease}
      >
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

        {points.map((point, index) => {
          const isActive = point.index === activeIndex;
          const dotSize = isActive ? 10 : compact ? 4 : 6;
          return (
            <View
              key={`${index}-${point.x}-${point.y}`}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  left: point.x - dotSize / 2,
                  top: point.y - dotSize / 2,
                  backgroundColor: isActive ? colors.text : color,
                  borderWidth: isActive ? 2 : 0,
                  borderColor: isActive ? colors.surface : undefined,
                },
              ]}
            />
          );
        })}

        {/* Tooltip */}
        {activePoint && !compact ? (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.min(
                  Math.max(4, activePoint.x - 50),
                  width - 104,
                ),
                top: Math.max(4, activePoint.y - 46),
              },
            ]}
          >
            <Text style={styles.tooltipValue}>
              {formatValue(activePoint.value, valueSuffix)}
            </Text>
            {activeLabel ? (
              <Text style={styles.tooltipLabel}>{activeLabel}</Text>
            ) : null}
          </View>
        ) : null}
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
          {axisLabels ? (
            <View style={styles.labelRow}>
              {axisLabels.map((item) => (
                <Text
                  key={item.index}
                  style={[
                    styles.axisLabel,
                    {
                      textAlign:
                        item.index === 0
                          ? 'left'
                          : item.index === (labels?.length ?? 1) - 1
                            ? 'right'
                            : 'center',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              ))}
            </View>
          ) : startLabel || endLabel ? (
            <View style={styles.labelRow}>
              <Text style={styles.axisLabel}>{startLabel ?? ''}</Text>
              <Text style={styles.axisLabel}>{endLabel ?? ''}</Text>
            </View>
          ) : null}
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
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  tooltipValue: {
    ...typography.label,
    color: colors.surface,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'none',
    letterSpacing: 0,
  },
  tooltipLabel: {
    ...typography.body,
    color: colors.border,
    fontSize: 10,
    lineHeight: 14,
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
    flex: 1,
  },
});
