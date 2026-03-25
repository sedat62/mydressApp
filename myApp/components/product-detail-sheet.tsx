import React, { useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { formatTryOnCount, getCategoryName } from '@/constants/mock-data';
import type { Product } from '@/constants/mock-data';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.82;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProductDetailSheetProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onTryOn: (product: Product) => void;
}

function FeatureItem({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureDot, { backgroundColor: color }]} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export function ProductDetailSheet({ product, visible, onClose, onTryOn }: ProductDetailSheetProps) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const sheetOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200, mass: 0.8 });
      sheetOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    }
  }, [visible]);

  const handleClose = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    sheetOpacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(SHEET_HEIGHT, {
      duration: 280,
      easing: Easing.in(Easing.cubic),
    }, () => {
      runOnJS(onClose)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: sheetOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}>
            <View style={[styles.heroImage, { backgroundColor: product.color + '0D' }]}>
              <View style={[styles.heroDot, { backgroundColor: product.color }]} />
              <View style={[styles.heroRing, { borderColor: product.color + '20' }]} />
              <View style={[styles.heroRingOuter, { borderColor: product.color + '10' }]} />

              <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
                <MaterialIcons name="close" size={20} color={Colors.text} />
              </Pressable>

              {product.isTrending && (
                <View style={styles.trendBadge}>
                  <MaterialIcons name="trending-up" size={12} color={Colors.white} />
                  <Text style={styles.trendText}>Trending</Text>
                </View>
              )}
            </View>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <View style={styles.titleInfo}>
                  <View style={[styles.categoryTag, { backgroundColor: product.color + '18' }]}>
                    <Text style={[styles.categoryText, { color: product.color }]}>
                      {getCategoryName(product.categoryId)}
                    </Text>
                  </View>
                  <Text style={styles.productName}>{product.name}</Text>
                </View>
                <View style={styles.tryOnStat}>
                  <MaterialIcons name="people" size={16} color={Colors.primary} />
                  <Text style={styles.tryOnNumber}>{formatTryOnCount(product.tryOnCount)}</Text>
                  <Text style={styles.tryOnLabel}>tried</Text>
                </View>
              </View>

              <Text style={styles.description}>{product.description}</Text>

              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>Features</Text>
                <View style={styles.featuresList}>
                  {product.features.map((f) => (
                    <FeatureItem key={f} text={f} color={product.color} />
                  ))}
                </View>
              </View>

              <View style={styles.colorSection}>
                <Text style={styles.colorLabel}>Color</Text>
                <View style={styles.colorRow}>
                  <View style={[styles.colorSwatch, { backgroundColor: product.color }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: product.color + '80' }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: product.color + '40' }]} />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.ctaContainer}>
            <AnimatedPressable
              style={[styles.ctaButton, ctaStyle]}
              onPressIn={() => { ctaScale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
              onPressOut={() => { ctaScale.value = withSpring(1, { damping: 12, stiffness: 180 }); }}
              onPress={() => {
                const p = product;
                handleClose();
                setTimeout(() => onTryOn(p), 300);
              }}>
              <MaterialIcons name="auto-awesome" size={20} color={Colors.white} />
              <Text style={styles.ctaText}>AI ile Dene</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroImage: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  heroRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  heroRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendBadge: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  tryOnStat: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tryOnNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  tryOnLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  featuresList: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  colorSection: {
    marginBottom: 10,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
