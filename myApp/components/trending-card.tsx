import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { formatTryOnCount, getCategoryName } from '@/constants/mock-data';
import type { Product } from '@/constants/mock-data';

interface TrendingCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TrendingCard({ product, onPress }: TrendingCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 180 }); }}
      onPress={() => onPress(product)}>
      <View style={[styles.imagePlaceholder, !product.imageUrl && { backgroundColor: product.color + '15' }]}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        ) : (
          <>
            <View style={[styles.colorDot, { backgroundColor: product.color }]} />
            <View style={[styles.colorRing, { borderColor: product.color + '25' }]} />
          </>
        )}
        <View style={styles.trendingBadge}>
          <MaterialIcons name="trending-up" size={12} color={Colors.white} />
          <Text style={styles.trendingText}>Trending</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={[styles.categoryTag, { backgroundColor: product.color + '18' }]}>
          <Text style={[styles.categoryText, { color: product.color }]}>
            {getCategoryName(product.categoryId)}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        <View style={styles.footer}>
          <View style={styles.tryOnRow}>
            <MaterialIcons name="people" size={14} color={Colors.primary} />
            <Text style={styles.tryOnCount}>{formatTryOnCount(product.tryOnCount)}</Text>
          </View>
          <View style={styles.tryBtn}>
            <MaterialIcons name="auto-awesome" size={14} color={Colors.primary} />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginRight: 14,
  },
  imagePlaceholder: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  colorDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  colorRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
  },
  trendingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  trendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  info: {
    padding: 14,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tryOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tryOnCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  tryBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
