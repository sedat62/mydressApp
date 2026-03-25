import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import ViewShot, { captureRef } from 'react-native-view-shot';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '@/constants/theme';
import { WatermarkOverlay } from '@/components/WatermarkOverlay';
import type { GeneratedImage } from '@/constants/mock-data';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  image: GeneratedImage | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isPremium?: boolean;
}

export default function ImageViewerModal({ visible, image, onClose, onDelete, isPremium = false }: Props) {
  const captureViewRef = useRef<any>(null);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const [actionsVisible, setActionsVisible] = useState(true);

  const resetTransforms = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, { damping: 15 });
    savedScale.value = 1;
    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  const toggleActions = useCallback(() => {
    setActionsVisible((v) => !v);
  }, []);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15 });
        savedScale.value = 1;
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 4) {
        scale.value = withSpring(4, { damping: 15 });
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd((e) => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      if (savedScale.value <= 1 && Math.abs(e.translationY) > 100) {
        runOnJS(onClose)();
        resetTransforms();
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (savedScale.value > 1) {
        resetTransforms();
      } else {
        scale.value = withSpring(2.5, { damping: 15 });
        savedScale.value = 2.5;
      }
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      runOnJS(toggleActions)();
    });

  const composedGesture = Gesture.Race(
    Gesture.Simultaneous(pinchGesture, panGesture),
    doubleTapGesture,
    singleTapGesture,
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleClose = useCallback(() => {
    resetTransforms();
    onClose();
  }, [onClose, resetTransforms]);

  const getImageUri = useCallback(async (): Promise<string | null> => {
    if (!image?.resultImageUrl) return null;

    if (isPremium) {
      const localUri = FileSystem.cacheDirectory + `tryon_${Date.now()}.jpg`;
      const download = await FileSystem.downloadAsync(image.resultImageUrl, localUri);
      return download.uri;
    }

    if (!captureViewRef.current) return null;
    const uri = await captureRef(captureViewRef, { format: 'jpg', quality: 0.9 });
    return uri;
  }, [image, isPremium]);

  const handleDownload = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Galeriye kaydetmek için izin vermen gerekiyor.');
        return;
      }
      const uri = await getImageUri();
      if (!uri) { Alert.alert('Hata', 'Görsel bulunamadı.'); return; }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Başarılı', 'Fotoğraf galeriye kaydedildi!');
    } catch {
      Alert.alert('Hata', 'Fotoğraf kaydedilirken bir sorun oluştu.');
    }
  }, [getImageUri]);

  const handleShare = useCallback(async () => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Paylaşım', 'Bu cihazda paylaşım desteklenmiyor.');
        return;
      }
      const uri = await getImageUri();
      if (!uri) { Alert.alert('Hata', 'Görsel bulunamadı.'); return; }
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Hata', 'Paylaşım sırasında bir sorun oluştu.');
    }
  }, [getImageUri]);

  const handleDelete = useCallback(() => {
    if (!image) return;
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğine emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            onDelete?.(image.id);
            handleClose();
          },
        },
      ],
    );
  }, [image, onDelete, handleClose]);

  if (!image) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.backdrop} />

        {actionsVisible && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.topBar}>
            <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
              <MaterialIcons name="close" size={24} color="#FFF" />
            </Pressable>
            <View style={styles.topInfo}>
              <Text style={styles.topTitle} numberOfLines={1}>{image.productName}</Text>
              <Text style={styles.topDate}>{image.createdAt}</Text>
            </View>
            <View style={styles.closeBtnPlaceholder} />
          </Animated.View>
        )}

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.imageArea, animatedImageStyle]}>
            {image.resultImageUrl ? (
              <View ref={captureViewRef} collapsable={false} style={styles.realImageWrapper}>
                <Image
                  source={{ uri: image.resultImageUrl }}
                  style={styles.realImage}
                  resizeMode="contain"
                />
                <WatermarkOverlay visible={!isPremium} />
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: image.color + '20' }]}>
                <View style={[styles.iconBg, { backgroundColor: image.color + '30' }]}>
                  <MaterialIcons name="auto-awesome" size={48} color={image.color} />
                </View>
                <Text style={styles.placeholderLabel}>{image.productName}</Text>
                <View style={styles.aiBadge}>
                  <MaterialIcons name="auto-awesome" size={12} color={Colors.primary} />
                  <Text style={styles.aiLabel}>AI Generated</Text>
                </View>
              </View>
            )}
          </Animated.View>
        </GestureDetector>

        {actionsVisible && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.bottomBar}>
            <Pressable style={styles.actionBtn} onPress={handleDownload}>
              <View style={styles.actionCircle}>
                <MaterialIcons name="file-download" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>İndir</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleShare}>
              <View style={styles.actionCircle}>
                <MaterialIcons name="share" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>Paylaş</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleDelete}>
              <View style={[styles.actionCircle, styles.deleteCircle]}>
                <MaterialIcons name="delete-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>Sil</Text>
            </Pressable>
          </Animated.View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPlaceholder: {
    width: 40,
  },
  topInfo: {
    flex: 1,
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  topDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realImageWrapper: {
    width: SCREEN_W,
    height: SCREEN_W * 1.33,
    borderRadius: 12,
    overflow: 'hidden',
  },
  realImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: SCREEN_W - 32,
    height: SCREEN_W * 1.2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingBottom: Platform.OS === 'ios' ? 42 : 24,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCircle: {
    backgroundColor: 'rgba(239,68,68,0.6)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
