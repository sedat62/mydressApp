import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';

interface PhotoUploadAreaProps {
  imageUri: string | null;
  onPickFromGallery: () => void;
  onPickFromCamera: () => void;
  onRemove: () => void;
}

export function PhotoUploadArea({
  imageUri,
  onPickFromGallery,
  onPickFromCamera,
  onRemove,
}: PhotoUploadAreaProps) {
  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
        <Pressable style={styles.removeBtn} onPress={onRemove}>
          <MaterialIcons name="close" size={18} color={Colors.white} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.uploadContainer}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="add-a-photo" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Upload Your Photo</Text>
      <Text style={styles.subtitle}>Take a photo or choose from gallery</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.optionBtn, styles.cameraBtn]}
          onPress={onPickFromCamera}>
          <MaterialIcons name="camera-alt" size={20} color={Colors.white} />
          <Text style={styles.optionBtnTextLight}>Camera</Text>
        </Pressable>
        <Pressable
          style={[styles.optionBtn, styles.galleryBtn]}
          onPress={onPickFromGallery}>
          <MaterialIcons name="photo-library" size={20} color={Colors.primary} />
          <Text style={styles.optionBtnTextDark}>Gallery</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.card,
    gap: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cameraBtn: {
    backgroundColor: Colors.primary,
  },
  galleryBtn: {
    backgroundColor: Colors.primaryLight,
  },
  optionBtnTextLight: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  optionBtnTextDark: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  previewContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 20,
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
