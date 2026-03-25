import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  POSE_TAGS,
  type PoseTag,
  type ProgressPhoto,
  savePhotoFile,
  useProgressPhotoStore,
} from '../store/progressPhotoStore';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function ProgressPhotos() {
  const { photos, addPhoto, deletePhoto } = useProgressPhotoStore();
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [selectedPose, setSelectedPose] = useState<PoseTag>('Front Relaxed');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<ProgressPhoto[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const sorted = [...photos].sort((a, b) => a.timestamp - b.timestamp);

  // ─── Camera capture ───

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      const savedUri = await savePhotoFile(photo.uri);
      setCapturedUri(savedUri);
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
      <View style={styles.header}>
        <Text style={styles.title}>Progress Photos</Text>
        <View style={styles.headerActions}>
          {photos.length >= 2 ? (
            <Pressable style={styles.actionButton} onPress={compareMode ? () => setCompareMode(false) : startCompare}>
              <Text style={styles.actionText}>{compareMode ? 'Cancel' : 'Compare'}</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.addButton} onPress={handleOpenCapture}>
            <Feather name="camera" size={18} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      {compareMode ? (
        <Text style={styles.compareHint}>
          Select 2 photos to compare ({comparePhotos.length}/2)
          {comparePhotos.length === 2 ? (
            <Text onPress={viewComparison} style={{ color: colors.accent }}> — View</Text>
          ) : null}
        </Text>
      ) : null}

      {sorted.length === 0 ? (
        <Text style={styles.empty}>No photos yet. Tap the camera to start tracking your progress.</Text>
      ) : (
        <FlatList
          data={sorted}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.timeline}
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
                <Text style={styles.photoPose}>{item.pose}</Text>
              </Pressable>
            );
          }}
        />
      )}

      {/* Capture Modal */}
      <Modal visible={captureModalOpen} animationType="slide" onRequestClose={() => setCaptureModalOpen(false)}>
        <View style={styles.captureContainer}>
          {capturedUri ? (
            // Preview + pose selection
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedUri }} style={styles.previewImage} />
              <Text style={styles.poseLabel}>Tag this photo</Text>
              <FlatList
                data={POSE_TAGS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.poseList}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.poseChip, selectedPose === item && styles.poseChipActive]}
                    onPress={() => setSelectedPose(item)}
                  >
                    <Text style={[styles.poseChipText, selectedPose === item && styles.poseChipTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
              <View style={styles.previewActions}>
                <Pressable style={styles.retakeButton} onPress={() => setCapturedUri(null)}>
                  <Text style={styles.retakeText}>Retake</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSavePhoto}>
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            // Camera view
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareHint: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
  },
  timeline: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  photoCard: {
    width: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoCardSelected: {
    borderColor: colors.accent,
  },
  photoImage: {
    width: 120,
    height: 160,
    backgroundColor: colors.border,
  },
  photoDate: {
    ...typography.body,
    color: colors.text,
    fontSize: 12,
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
  poseList: {
    gap: spacing.xs,
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
