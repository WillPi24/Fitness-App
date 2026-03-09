import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { UserSex, useUserStore } from '../store/userStore';
import { colors, spacing, typography } from '../theme';

export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile, signOut } = useUserStore();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editWeight, setEditWeight] = useState('');
  const [editSex, setEditSex] = useState<UserSex>('male');
  const [editName, setEditName] = useState('');
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  if (!user) return null;

  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditWeight(user.bodyweightKg > 0 ? String(user.bodyweightKg) : '');
    setEditSex(user.sex);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updates: Partial<{ name: string; sex: UserSex; bodyweightKg: number }> = {};
    if (editName.trim() && editName.trim() !== user.name) {
      updates.name = editName.trim();
    }
    if (editSex !== user.sex) {
      updates.sex = editSex;
    }
    const kg = Number(editWeight);
    if (Number.isFinite(kg) && kg > 0 && kg !== user.bodyweightKg) {
      updates.bodyweightKg = kg;
    }
    if (Object.keys(updates).length > 0) {
      updateProfile(updates);
    }
    setEditModalOpen(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: spacing.lg + insets.top, paddingBottom: spacing.xl + insets.bottom },
        ]}
      >
        <Text style={styles.title}>Account</Text>

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Feather name="user" size={28} color={colors.accent} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <Pressable style={styles.editButton} onPress={handleOpenEdit}>
              <Feather name="edit-2" size={16} color={colors.accent} />
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sex</Text>
            <Text style={styles.infoValue}>{user.sex === 'male' ? 'Male' : 'Female'}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Bodyweight</Text>
            <Text style={styles.infoValue}>{user.bodyweightKg > 0 ? `${user.bodyweightKg} kg` : 'Not set'}</Text>
          </View>
        </Card>

        <Pressable style={styles.signOutButton} onPress={() => setConfirmSignOut(true)}>
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalOpen} transparent animationType="fade" onRequestClose={() => setEditModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
        >
          <Pressable style={styles.modalDismiss} onPress={() => setEditModalOpen(false)} />
          <Pressable style={styles.editModal} onPress={Keyboard.dismiss}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setEditModalOpen(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Sex</Text>
              <View style={styles.segmented}>
                <Pressable
                  style={[styles.segment, editSex === 'male' && styles.segmentActive]}
                  onPress={() => setEditSex('male')}
                >
                  <Text style={[styles.segmentText, editSex === 'male' && styles.segmentTextActive]}>Male</Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, editSex === 'female' && styles.segmentActive]}
                  onPress={() => setEditSex('female')}
                >
                  <Text style={[styles.segmentText, editSex === 'female' && styles.segmentTextActive]}>Female</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bodyweight (kg)</Text>
              <TextInput
                style={styles.input}
                value={editWeight}
                onChangeText={setEditWeight}
                placeholder="e.g. 75"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
              />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </Pressable>
          <Pressable style={styles.modalDismiss} onPress={() => setEditModalOpen(false)} />
        </KeyboardAvoidingView>
      </Modal>

      {/* Sign Out Confirmation */}
      <Modal visible={confirmSignOut} transparent animationType="fade" onRequestClose={() => setConfirmSignOut(false)}>
        <View style={styles.confirmBackdrop}>
          <Card style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Sign out?</Text>
            <Text style={styles.confirmText}>Your data is stored on this device. You can log back in with your email and password.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.confirmCancel} onPress={() => setConfirmSignOut(false)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmDanger} onPress={signOut}>
                <Text style={styles.confirmDangerText}>Sign Out</Text>
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  profileCard: {
    gap: spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.headline,
    color: colors.text,
  },
  profileEmail: {
    ...typography.body,
    color: colors.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    ...typography.body,
    color: colors.muted,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 14,
    marginTop: spacing.md,
  },
  signOutText: {
    ...typography.headline,
    color: colors.danger,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalDismiss: {
    flex: 1,
  },
  editModal: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },
  modalClose: {
    ...typography.body,
    color: colors.muted,
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
    backgroundColor: '#fff',
    ...typography.body,
    color: colors.text,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    ...typography.body,
    color: colors.text,
  },
  segmentTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 16,
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmModal: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.sm,
  },
  confirmText: {
    ...typography.body,
    color: colors.muted,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  confirmCancel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmCancelText: {
    ...typography.body,
    color: colors.text,
  },
  confirmDanger: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmDangerText: {
    ...typography.body,
    color: '#fff',
  },
});
