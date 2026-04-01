import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MEASUREMENT_TYPES, useMeasurementStore, type MeasurementType } from '../store/measurementStore';
import type { WeightUnit } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { useTheme } from '../store/themeStore';
import { Card } from './Card';
import { LineGraph } from './LineGraph';

type BodyMeasurementsProps = {
  weightUnit: WeightUnit;
};

const CM_PER_INCH = 2.54;

function toDisplayLength(cm: number, unit: WeightUnit): number {
  return unit === 'lbs'
    ? Math.round((cm / CM_PER_INCH) * 10) / 10
    : Math.round(cm * 10) / 10;
}

function fromDisplayLength(value: number, unit: WeightUnit): number {
  return unit === 'lbs' ? value * CM_PER_INCH : value;
}

function lengthUnit(unit: WeightUnit): string {
  return unit === 'lbs' ? 'in' : 'cm';
}

export function BodyMeasurements({ weightUnit }: BodyMeasurementsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { measurements, addMeasurement, deleteMeasurement } = useMeasurementStore();
  const [selectedType, setSelectedType] = useState<MeasurementType | null>(null);
  const [addModalType, setAddModalType] = useState<MeasurementType | null>(null);
  const [valueInput, setValueInput] = useState('');

  const latestByType = useMemo(() => {
    const map: Partial<Record<MeasurementType, { value: number; date: string }>> = {};
    for (const entry of measurements) {
      const existing = map[entry.type];
      if (!existing || entry.timestamp > (measurements.find(e => e.id === existing.date)?.timestamp ?? 0)) {
        map[entry.type] = { value: entry.valueCm, date: entry.date };
      }
    }
    // Recalculate properly — sort once
    const sorted = [...measurements].sort((a, b) => b.timestamp - a.timestamp);
    const result: Partial<Record<MeasurementType, { value: number; date: string }>> = {};
    for (const entry of sorted) {
      if (!result[entry.type]) {
        result[entry.type] = { value: entry.valueCm, date: entry.date };
      }
    }
    return result;
  }, [measurements]);

  const historyForType = useMemo(() => {
    if (!selectedType) return [];
    return measurements
      .filter((e) => e.type === selectedType)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [measurements, selectedType]);

  const handleAdd = () => {
    if (!addModalType) return;
    const value = parseFloat(valueInput);
    if (isNaN(value) || value <= 0) return;
    addMeasurement(addModalType, fromDisplayLength(value, weightUnit));
    setValueInput('');
    setAddModalType(null);
  };

  const lu = lengthUnit(weightUnit);

  return (
    <Card>
      <Text style={styles.title}>Body Measurements</Text>

      {MEASUREMENT_TYPES.map((type) => {
        const latest = latestByType[type];
        return (
          <Pressable
            key={type}
            style={styles.typeRow}
            onPress={() => setSelectedType(type)}
          >
            <Text style={styles.typeName}>{type}</Text>
            <Text style={styles.typeValue}>
              {latest ? `${toDisplayLength(latest.value, weightUnit)} ${lu}` : '—'}
            </Text>
            <Pressable
              style={styles.addSmall}
              onPress={() => setAddModalType(type)}
              hitSlop={8}
            >
              <Feather name="plus" size={14} color={colors.accent} />
            </Pressable>
          </Pressable>
        );
      })}

      {/* Detail view for selected type */}
      <Modal
        visible={selectedType !== null}
        animationType="slide"
        onRequestClose={() => setSelectedType(null)}
      >
        <View style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <Pressable onPress={() => setSelectedType(null)}>
              <Feather name="arrow-left" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.detailTitle}>{selectedType}</Text>
            <Pressable onPress={() => { if (selectedType) setAddModalType(selectedType); }}>
              <Feather name="plus" size={24} color={colors.accent} />
            </Pressable>
          </View>

          {historyForType.length >= 2 ? (
            <View style={styles.graphContainer}>
              <LineGraph
                data={historyForType.map((e) => toDisplayLength(e.valueCm, weightUnit))}
                labels={historyForType.map((e) => {
                  const [, m, d] = e.date.split('-');
                  return `${parseInt(m)}/${parseInt(d)}`;
                })}
                color={colors.accent}
                height={140}
                valueSuffix={lu}
                startLabel={historyForType[0].date}
                endLabel={historyForType[historyForType.length - 1].date}
              />
            </View>
          ) : null}

          <ScrollView style={styles.detailList}>
            {[...historyForType].reverse().map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <Text style={styles.entryValue}>
                  {toDisplayLength(entry.valueCm, weightUnit)} {lu}
                </Text>
                <Pressable onPress={() => deleteMeasurement(entry.id)} hitSlop={8}>
                  <Feather name="trash-2" size={14} color={colors.muted} />
                </Pressable>
              </View>
            ))}
            {historyForType.length === 0 ? (
              <Text style={styles.empty}>No entries yet for {selectedType}.</Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      {/* Add entry modal */}
      <Modal
        visible={addModalType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalType(null)}
      >
        <View style={styles.backdrop}>
          <Card style={styles.modal}>
            <Text style={styles.modalTitle}>Add {addModalType}</Text>
            <Text style={styles.label}>Value ({lu})</Text>
            <TextInput
              style={styles.input}
              value={valueInput}
              onChangeText={setValueInput}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setAddModalType(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>
    </Card>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  typeName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  typeValue: {
    ...typography.body,
    color: colors.muted,
    fontSize: 14,
  },
  addSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    padding: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailTitle: {
    ...typography.headline,
    color: colors.text,
  },
  graphContainer: {
    marginBottom: spacing.md,
  },
  detailList: {
    flex: 1,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryDate: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    flex: 1,
  },
  entryValue: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },
  label: {
    ...typography.label,
    color: colors.muted,
  },
  input: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.body,
    color: colors.muted,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  saveText: {
    ...typography.body,
    color: '#fff',
  },
});
