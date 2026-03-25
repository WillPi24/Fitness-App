import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useBodyweightStore } from '../store/bodyweightStore';
import { toDisplayWeight, fromDisplayWeight, type WeightUnit } from '../store/userStore';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';
import { LineGraph } from './LineGraph';

type BodyweightTrackerProps = {
  weightUnit: WeightUnit;
};

export function BodyweightTracker({ weightUnit }: BodyweightTrackerProps) {
  const { entries, addEntry, deleteEntry } = useBodyweightStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.timestamp - b.timestamp),
    [entries],
  );

  const latest = entries.length > 0
    ? entries.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
    : null;

  const graphData = useMemo(
    () => sorted.map((e) => toDisplayWeight(e.weightKg, weightUnit)),
    [sorted, weightUnit],
  );

  const graphLabels = useMemo(
    () => sorted.map((e) => {
      const [, m, d] = e.date.split('-');
      return `${parseInt(m)}/${parseInt(d)}`;
    }),
    [sorted],
  );

  const handleAdd = () => {
    const value = parseFloat(weightInput);
    if (isNaN(value) || value <= 0) return;
    addEntry(fromDisplayWeight(value, weightUnit));
    setWeightInput('');
    setModalOpen(false);
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Bodyweight</Text>
        <Pressable style={styles.addButton} onPress={() => setModalOpen(true)}>
          <Feather name="plus" size={18} color={colors.accent} />
        </Pressable>
      </View>

      {latest ? (
        <Text style={styles.latestValue}>
          {toDisplayWeight(latest.weightKg, weightUnit)} {weightUnit}
        </Text>
      ) : (
        <Text style={styles.empty}>No entries yet. Tap + to log your weight.</Text>
      )}

      {sorted.length >= 2 ? (
        <LineGraph
          data={graphData}
          labels={graphLabels}
          color={colors.accent}
          height={100}
          valueSuffix={weightUnit}
          startLabel={graphLabels[0]}
          endLabel={graphLabels[graphLabels.length - 1]}
        />
      ) : null}

      {entries.length > 0 ? (
        <View style={styles.entryList}>
          {[...entries]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <Text style={styles.entryValue}>
                  {toDisplayWeight(entry.weightKg, weightUnit)} {weightUnit}
                </Text>
                <Pressable onPress={() => deleteEntry(entry.id)} hitSlop={8}>
                  <Feather name="trash-2" size={14} color={colors.muted} />
                </Pressable>
              </View>
            ))}
        </View>
      ) : null}

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.backdrop}>
          <Card style={styles.modal}>
            <Text style={styles.modalTitle}>Log Weight</Text>
            <Text style={styles.label}>Weight ({weightUnit})</Text>
            <TextInput
              style={styles.input}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalOpen(false)}>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestValue: {
    ...typography.title,
    color: colors.accent,
    fontSize: 32,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
  },
  entryList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
