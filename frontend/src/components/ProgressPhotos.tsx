import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  DEFAULT_POSES,
  type ProgressPhoto,
  savePhotoFile,
  useProgressPhotoStore,
} from '../store/progressPhotoStore';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function ProgressPhotos() {
  const { photos, addPhoto, deletePhoto, customPoses, addCustomPose, removeCustomPose, allPoses } = useProgressPhotoStore();
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [selectedPose, setSelectedPose] = useState(DEFAULT_POSES[0] as string);
  const [customPoseInput, setCustomPoseInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedPoseFilter, setSelectedPoseFilter] = useState<string | null>(null);

  const filteredPhotos = useMemo(
    () => selectedPoseFilter
      ? [...photos].filter((p) => p.pose === selectedPoseFilter).sort((a, b) => b.timestamp - a.timestamp)
      : [],
    [photos, selectedPoseFilter],
  );

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<ProgressPhoto[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const sorted = [...photos].sort((a, b) => a.timestamp - b.timestamp);

  // ─── Camera capture ───

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        const savedUri = await savePhotoFile(photo.uri);
        setCapturedUri(savedUri);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Camera error', msg);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const savedUri = await savePhotoFile(result.assets[0].uri);
      setCapturedUri(savedUri);
    }
  };

  const handleSavePhoto = () => {
    if (!capturedUri) return;
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    addPhoto({ date, pose: selectedPose, uri: capturedUri });
    setCapturedUri(null);
    setCaptureModalOpen(false);
  };

  const handleOpenCapture = async () => {
    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }
    setCapturedUri(null);
    setCaptureModalOpen(true);
  };

  // ─── Comparison ───

  const handlePhotoTap = (photo: ProgressPhoto) => {
    if (!compareMode) return;
    setComparePhotos((prev) => {
      if (prev.find((p) => p.id === photo.id)) {
        return prev.filter((p) => p.id !== photo.id);
      }
      if (prev.length >= 2) {
        return [prev[1], photo];
      }
      return [...prev, photo];
    });
  };

  const startCompare = () => {
    setCompareMode(true);
    setComparePhotos([]);
  };

  const viewComparison = () => {
    if (comparePhotos.length === 2) {
      setCompareModalOpen(true);
    }
  };

  return (
    <Card>
      <View style={styles.cardRow}>
        <View style={styles.cardTextCol}>
          <Text style={styles.title}>Progress Photos</Text>
          <Pressable style={styles.viewButton} onPress={() => setGalleryOpen(true)}>
            <Text style={styles.viewButtonText}>View Photos</Text>
            <Feather name="chevron-right" size={16} color={colors.accent} />
          </Pressable>
        </View>
        <Pressable style={styles.addButton} onPress={handleOpenCapture}>
          <Feather name="camera" size={26} color={colors.accent} />
        </Pressable>
      </View>

      {/* Gallery Modal */}
      <Modal visible={galleryOpen} animationType="slide" onRequestClose={() => { setGalleryOpen(false); setSelectedPoseFilter(null); setCompareMode(false); }}>
        <View style={styles.galleryContainer}>
          <View style={styles.galleryHeader}>
            <Pressable onPress={() => {
              if (selectedPoseFilter) {
                setSelectedPoseFilter(null);
                setCompareMode(false);
              } else {
                setGalleryOpen(false);
                setCompareMode(false);
              }
            }}>
              <Feather name="arrow-left" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.galleryTitle}>{selectedPoseFilter ?? 'Progress Photos'}</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedPoseFilter === null ? (
            // Pose category list
            sorted.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="image" size={48} color={colors.muted} />
                <Text style={styles.empty}>No photos yet. Tap the camera to start tracking your progress.</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.poseListContainer}>
                {allPoses.map((pose) => {
                  const posePhotos = photos.filter((p) => p.pose === pose);
                  if (posePhotos.length === 0) return null;
                  const latest = posePhotos.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
                  return (
                    <Pressable
                      key={pose}
                      style={styles.poseRow}
                      onPress={() => setSelectedPoseFilter(pose)}
                    >
                      <Image source={{ uri: latest.uri }} style={styles.poseThumbnail} />
                      <View style={styles.poseInfo}>
                        <Text style={styles.poseName}>{pose}</Text>
                        <Text style={styles.poseCount}>{posePhotos.length} photo{posePhotos.length !== 1 ? 's' : ''}</Text>
                      </View>
                      <Feather name="chevron-right" size={20} color={colors.muted} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )
          ) : (
            // Photos for selected pose
            <>
              {filteredPhotos.length >= 2 ? (
                <View style={styles.galleryActions}>
                  <Pressable style={styles.actionButton} onPress={compareMode ? () => setCompareMode(false) : startCompare}>
                    <Text style={styles.actionText}>{compareMode ? 'Cancel' : 'Compare'}</Text>
                  </Pressable>
                </View>
              ) : null}

              {compareMode ? (
                <Text style={styles.compareHint}>
                  Select 2 photos to compare ({comparePhotos.length}/2)
                  {comparePhotos.length === 2 ? (
                    <Text onPress={viewComparison} style={{ color: colors.accent }}> — View</Text>
                  ) : null}
                </Text>
              ) : null}

              <FlatList
                data={filteredPhotos}
                numColumns={3}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.photoGrid}
                renderItem={({ item }) => {
                  const isSelected = comparePhotos.some((p) => p.id === item.id);
                  return (
                    <Pressable
                      style={[styles.photoCard, isSelected && styles.photoCardSelected]}
                      onPress={() => compareMode ? handlePhotoTap(item) : null}
                      onLongPress={() => deletePhoto(item.id)}
                    >
                      <Image source={{ uri: item.uri }} style={styles.photoImage} />
                      <Text style={styles.photoDate}>{item.date}</Text>
                    </Pressable>
                  );
                }}
              />
            </>
          )}
        </View>
      </Modal>

      {/* Capture Modal */}
      <Modal visible={captureModalOpen} animationType="slide" onRequestClose={() => setCaptureModalOpen(false)}>
        <View style={styles.captureContainer}>
          {capturedUri ? (
            <KeyboardAvoidingView style={styles.previewContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Image source={{ uri: capturedUri }} style={styles.previewImage} />
              <Text style={styles.poseLabel}>Tag this photo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.poseList} style={styles.poseScroll}>
                {allPoses.map((pose) => (
                  <Pressable
                    key={pose}
                    style={[styles.poseChip, selectedPose === pose && styles.poseChipActive]}
                    onPress={() => setSelectedPose(pose)}
                    onLongPress={() => {
                      if (customPoses.includes(pose)) {
                        Alert.alert('Remove pose?', `Delete "${pose}" from your poses?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => removeCustomPose(pose) },
                        ]);
                      }
                    }}
                  >
                    <Text style={[styles.poseChipText, selectedPose === pose && styles.poseChipTextActive]}>
                      {pose}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={[styles.poseChip, styles.poseChipAdd]}
                  onPress={() => setShowCustomInput(true)}
                >
                  <Text style={styles.poseChipAddText}>+ Custom</Text>
                </Pressable>
              </ScrollView>
              {showCustomInput ? (
                <View style={styles.customInputRow}>
                  <TextInput
                    style={styles.customInput}
                    value={customPoseInput}
                    onChangeText={setCustomPoseInput}
                    placeholder="Pose name"
                    placeholderTextColor={colors.muted}
                    autoFocus
                    onSubmitEditing={() => {
                      if (customPoseInput.trim()) {
                        addCustomPose(customPoseInput);
                        setSelectedPose(customPoseInput.trim());
                        setCustomPoseInput('');
                        setShowCustomInput(false);
                      }
                    }}
                  />
                  <Pressable
                    style={styles.customInputSave}
                    onPress={() => {
                      if (customPoseInput.trim()) {
                        addCustomPose(customPoseInput);
                        setSelectedPose(customPoseInput.trim());
                        setCustomPoseInput('');
                        setShowCustomInput(false);
                      }
                    }}
                  >
                    <Text style={styles.customInputSaveText}>Add</Text>
                  </Pressable>
                  <Pressable onPress={() => { setShowCustomInput(false); setCustomPoseInput(''); }}>
                    <Text style={styles.customInputCancel}>Cancel</Text>
                  </Pressable>
                </View>
              ) : null}
              <View style={styles.previewActions}>
                <Pressable style={styles.retakeButton} onPress={() => setCapturedUri(null)}>
                  <Text style={styles.retakeText}>Retake</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSavePhoto}>
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.cameraContainer}>
              {cameraPermission?.granted ? (
                <CameraView ref={cameraRef} style={styles.camera} facing="back" />
              ) : (
                <View style={styles.noPermission}>
                  <Feather name="camera-off" size={48} color={colors.muted} />
                  <Text style={styles.noPermissionText}>Camera permission required</Text>
                </View>
              )}
              <View style={styles.cameraActions}>
                <Pressable style={styles.cancelCameraButton} onPress={() => setCaptureModalOpen(false)}>
                  <Text style={styles.cancelCameraText}>Cancel</Text>
                </Pressable>
                {cameraPermission?.granted ? (
                  <Pressable style={styles.shutterButton} onPress={handleTakePhoto}>
                    <View style={styles.shutterInner} />
                  </Pressable>
                ) : null}
                <Pressable style={styles.galleryButton} onPress={handlePickFromGallery}>
                  <Feather name="image" size={24} color={colors.text} />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Comparison Modal */}
      <Modal visible={compareModalOpen} animationType="fade" onRequestClose={() => setCompareModalOpen(false)}>
        <View style={styles.compareContainer}>
          <Pressable style={styles.compareClose} onPress={() => setCompareModalOpen(false)}>
            <Feather name="x" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.compareImages}>
            {comparePhotos.map((photo) => (
              <View key={photo.id} style={styles.compareImageWrapper}>
                <Image source={{ uri: photo.uri }} style={styles.compareImage} />
                <Text style={styles.compareLabel}>{photo.date}</Text>
                <Text style={styles.comparePose}>{photo.pose}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextCol: {
    flex: 1,
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  viewButtonText: {
    ...typography.body,
    color: colors.accent,
  },
  // Gallery modal
  galleryContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    padding: spacing.lg,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  galleryTitle: {
    ...typography.headline,
    color: colors.text,
  },
  galleryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  actionText: {
    ...typography.label,
    color: colors.accent,
    fontSize: 12,
  },
  compareHint: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  poseListContainer: {
    gap: spacing.xs,
  },
  poseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  poseThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  poseInfo: {
    flex: 1,
    gap: 2,
  },
  poseName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  poseCount: {
    ...typography.label,
    color: colors.muted,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  photoGrid: {
    gap: spacing.xs,
  },
  photoCard: {
    flex: 1 / 3,
    margin: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoCardSelected: {
    borderColor: colors.accent,
  },
  photoImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.border,
  },
  photoDate: {
    ...typography.body,
    color: colors.text,
    fontSize: 11,
    paddingHorizontal: spacing.xs,
    paddingTop: 4,
  },
  photoPose: {
    ...typography.label,
    color: colors.muted,
    fontSize: 10,
    paddingHorizontal: spacing.xs,
    paddingBottom: 4,
  },
  // Capture modal
  captureContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  noPermission: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  noPermissionText: {
    ...typography.body,
    color: colors.muted,
  },
  cameraActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cancelCameraButton: {
    padding: spacing.sm,
  },
  cancelCameraText: {
    ...typography.body,
    color: '#fff',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Preview
  previewContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 60,
    gap: spacing.md,
  },
  previewImage: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  poseLabel: {
    ...typography.label,
    color: colors.muted,
  },
  poseScroll: {
    flexGrow: 0,
  },
  poseList: {
    gap: spacing.xs,
  },
  poseChipAdd: {
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  poseChipAddText: {
    ...typography.body,
    color: colors.accent,
    fontSize: 13,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customInput: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.background,
    flex: 1,
  },
  customInputSave: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  customInputSaveText: {
    ...typography.body,
    color: '#fff',
    fontSize: 13,
  },
  customInputCancel: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
  poseChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  poseChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  poseChipText: {
    ...typography.body,
    color: colors.text,
    fontSize: 13,
  },
  poseChipTextActive: {
    color: colors.accent,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 24,
  },
  retakeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retakeText: {
    ...typography.body,
    color: colors.muted,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  saveText: {
    ...typography.body,
    color: '#fff',
  },
  // Comparison
  compareContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    padding: spacing.lg,
  },
  compareClose: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  compareImages: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compareImageWrapper: {
    flex: 1,
    gap: 4,
  },
  compareImage: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  compareLabel: {
    ...typography.body,
    color: colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
  comparePose: {
    ...typography.label,
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
  },
});
