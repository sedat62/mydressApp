import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  LinearTransition,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { useProducts } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/auth-context';
import { addGeneration } from '@/services/firestore';
import { uploadImageBase64, createTryOnTask, pollTaskResult, type TaskState } from '@/services/kie-ai';
import { getCategoryName } from '@/constants/mock-data';
import { PhotoUploadArea } from '@/components/photo-upload-area';
import { ActionButton } from '@/components/action-button';
import { WatermarkOverlay } from '@/components/WatermarkOverlay';
import type { Product } from '@/constants/mock-data';

type Step = 1 | 2 | 3;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MiniProductCard({
  item,
  selected,
  onPress,
  index,
}: {
  item: Product;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (selected) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <AnimatedPressable
      entering={ZoomIn.delay(index * 50).duration(400).springify().damping(12).stiffness(100)}
      style={[styles.miniCard, selected && styles.miniCardSelected, cardStyle]}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 12, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 8, stiffness: 150 }); }}
      onPress={onPress}>
      {selected && (
        <Animated.View style={[styles.miniGlow, { backgroundColor: item.color + '15' }, glowStyle]} />
      )}
      <View style={[styles.miniColor, !item.imageUrl && { backgroundColor: item.color + '18' }]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.miniImage} />
        ) : (
          <View style={[styles.miniDot, { backgroundColor: item.color }]} />
        )}
        {selected && (
          <Animated.View style={[styles.miniCheckBadge, glowStyle]}>
            <MaterialIcons name="check" size={10} color={Colors.white} />
          </Animated.View>
        )}
      </View>
      <Text style={[styles.miniName, selected && styles.miniNameSelected]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.miniCategory}>{getCategoryName(item.categoryId)}</Text>
    </AnimatedPressable>
  );
}

export default function GenerateScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const router = useRouter();
  const { products } = useProducts();
  const { user, profile } = useAuth();
  const isFocused = useIsFocused();
  const hasMounted = useRef(false);
  const processedParamRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isFocused && !hasMounted.current) {
      hasMounted.current = true;
      const t = setTimeout(() => setReady(true), 80);
      return () => clearTimeout(t);
    }
  }, [isFocused]);

  useEffect(() => {
    if (productId && productId !== processedParamRef.current) {
      processedParamRef.current = productId;
      const found = products.find((p) => p.id === productId);
      if (found) {
        setSelectedProduct(found);
        setStep(2);
        setPhotoUri(null);
        setGenerated(false);
        setGenerating(false);
        if (!hasMounted.current) {
          hasMounted.current = true;
          setReady(true);
        }
      }
    }
  }, [productId, products]);

  const pickFromGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!user) {
      Alert.alert(
        'Giriş gerekli',
        'Görsel oluşturmak için hesap aç veya giriş yap.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Kayıt ol', onPress: () => router.push('/(auth)/register') },
          { text: 'Giriş yap', onPress: () => router.push('/(auth)/login') },
        ],
      );
      return;
    }
    if (!profile || (profile.credits ?? 0) < 1) {
      Alert.alert('Yetersiz Kredi', 'Görsel oluşturmak için en az 1 kredin olmalı.');
      return;
    }
    if (!photoUri || !selectedProduct) return;

    if (!selectedProduct.imageUrl) {
      Alert.alert('Görsel Eksik', 'Bu ürünün görseli henüz eklenmemiş. Lütfen başka bir ürün seçin.');
      return;
    }

    setGenerating(true);
    setProgressText('Fotoğraf yükleniyor...');

    try {
      const uploadedUrl = await uploadImageBase64(photoUri);

      setProgressText('AI görsel oluşturuyor...');
      const taskId = await createTryOnTask(uploadedUrl, selectedProduct.imageUrl, selectedProduct.name);

      const imageUrl = await pollTaskResult(taskId, (state: TaskState) => {
        const labels: Record<TaskState, string> = {
          waiting: 'Sırada bekleniyor...',
          queuing: 'İşlem kuyruğunda...',
          generating: 'AI görsel oluşturuyor...',
          success: 'Tamamlandı!',
          fail: 'Hata oluştu.',
        };
        setProgressText(labels[state] || 'İşleniyor...');
      });

      setResultImageUrl(imageUrl);

      await addGeneration(
        user.uid,
        selectedProduct.id,
        selectedProduct.name,
        selectedProduct.color,
        imageUrl,
      );

      setGenerating(false);
      setGenerated(true);
      setStep(3);
    } catch (err: any) {
      setGenerating(false);
      setProgressText('');
      Alert.alert('Hata', err?.message || 'Görsel oluşturulurken bir sorun oluştu.');
    }
  }, [user, profile, selectedProduct, photoUri, router]);

  const handleReset = useCallback(() => {
    setStep(1);
    setSelectedProduct(null);
    setPhotoUri(null);
    setGenerated(false);
    setGenerating(false);
    setProgressText('');
    setResultImageUrl(null);
  }, []);

  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setStep(2);
  }, []);

  const renderStepIndicator = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.stepRow}>
      {([1, 2, 3] as const).map((s) => (
        <View key={s} style={styles.stepItem}>
          <Animated.View
            layout={LinearTransition.springify().damping(14)}
            style={[styles.stepDot, step >= s && styles.stepDotActive]}>
            {step > s ? (
              <MaterialIcons name="check" size={14} color={Colors.white} />
            ) : (
              <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
            )}
          </Animated.View>
          <Text style={[styles.stepLabel, step >= s && styles.stepLabelActive]}>
            {s === 1 ? 'Select' : s === 2 ? 'Upload' : 'Result'}
          </Text>
          {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
        </View>
      ))}
    </Animated.View>
  );

  const renderStep1 = () => (
    <Animated.View
      key="step1"
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.stepContentFlex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.stepTitle}>
          Choose a Product
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.stepSubtitle}>
          Select an item to try on virtually
        </Animated.Text>

        <View style={styles.miniGrid}>
          {products.map((item, index) => (
            <MiniProductCard
              key={item.id}
              item={item}
              selected={selectedProduct?.id === item.id}
              onPress={() => handleSelectProduct(item)}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      key="step2"
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.stepContentFlex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {selectedProduct && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.selectedBanner}>
            <View style={[styles.selectedDot, { backgroundColor: selectedProduct.color }]} />
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedText}>{selectedProduct.name}</Text>
              <Text style={styles.selectedCategory}>{getCategoryName(selectedProduct.categoryId)}</Text>
            </View>
            <Pressable style={styles.changeBtn} onPress={() => setStep(1)}>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <PhotoUploadArea
            imageUri={photoUri}
            onPickFromGallery={pickFromGallery}
            onPickFromCamera={pickFromCamera}
            onRemove={() => setPhotoUri(null)}
          />
        </Animated.View>

        {photoUri && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.generateRow}>
            <ActionButton
              title={generating ? (progressText || 'Generating...') : 'Generate Try-On'}
              onPress={handleGenerate}
              variant="primary"
              size="large"
              disabled={generating}
              icon={
                <MaterialIcons
                  name={generating ? 'hourglass-top' : 'auto-awesome'}
                  size={20}
                  color={Colors.white}
                />
              }
              style={styles.generateBtn}
            />
            {profile && (
              <Text style={styles.creditHint}>
                Kalan kredi: {profile.credits ?? 0}
              </Text>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      key="step3"
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(250)}
      style={styles.stepContentFlex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(500).springify()}
          style={styles.resultContainer}>
          {resultImageUrl ? (
            <View style={styles.resultImageWrapper}>
              <Image
                source={{ uri: resultImageUrl }}
                style={styles.resultImage}
                resizeMode="cover"
              />
              <WatermarkOverlay visible={profile?.plan !== 'pro'} />
            </View>
          ) : (
            <View style={styles.resultImagePlaceholder}>
              <View style={styles.resultIconBg}>
                <MaterialIcons name="auto-awesome" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.resultLabel}>AI Generated Result</Text>
              <Text style={styles.resultProduct}>{selectedProduct?.name}</Text>
              <View style={styles.resultBadge}>
                <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                <Text style={styles.resultBadgeText}>Ready</Text>
              </View>
            </View>
          )}
          <View style={styles.resultMeta}>
            <Text style={styles.resultProduct}>{selectedProduct?.name}</Text>
            <View style={styles.resultBadge}>
              <MaterialIcons name="check-circle" size={14} color={Colors.success} />
              <Text style={styles.resultBadgeText}>Ready</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.resultActions}>
          <ActionButton
            title="Download"
            onPress={() => Alert.alert('Download', 'Image saved to gallery!')}
            variant="primary"
            size="large"
            icon={<MaterialIcons name="file-download" size={20} color={Colors.white} />}
            style={styles.resultBtn}
          />
          <ActionButton
            title="Share"
            onPress={() => Alert.alert('Share', 'Shared to social feed!')}
            variant="secondary"
            size="large"
            icon={<MaterialIcons name="share" size={20} color={Colors.primary} />}
            style={styles.resultBtn}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <ActionButton
            title="Try Another"
            onPress={handleReset}
            variant="outline"
            size="medium"
            style={styles.resetBtn}
          />
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {step > 1 ? (
          <Pressable
            style={styles.backBtn}
            onPress={() => setStep((step - 1) as Step)}
            hitSlop={8}>
            <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.headerTitle}>Generate</Text>
        {profile ? (
          <View style={styles.creditBadge}>
            <MaterialIcons name="toll" size={16} color={Colors.primary} />
            <Text style={styles.creditBadgeText}>{profile.credits ?? 0}</Text>
          </View>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      {renderStepIndicator()}

      {ready && step === 1 && renderStep1()}
      {ready && step === 2 && renderStep2()}
      {ready && step === 3 && renderStep3()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  creditBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stepNumActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  stepLine: {
    width: 28,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
    borderRadius: 1,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  stepContentFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniCard: {
    width: '31%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    padding: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  miniCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  miniGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  miniCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniColor: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  miniImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  miniName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  miniNameSelected: {
    color: Colors.primary,
  },
  miniCategory: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 10,
  },
  selectedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  generateRow: {
    marginTop: 20,
  },
  generateBtn: {
    width: '100%',
  },
  creditHint: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  resultContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  resultImageWrapper: {
    width: '100%',
    height: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  resultMeta: {
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  resultImagePlaceholder: {
    height: 360,
    backgroundColor: Colors.card,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  resultIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  resultProduct: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  resultBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resultBtn: {
    flex: 1,
  },
  resetBtn: {
    marginTop: 14,
    alignSelf: 'center',
  },
});
