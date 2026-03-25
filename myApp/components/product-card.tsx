import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { formatTryOnCount, getCategoryName } from '@/constants/mock-data';
import type { Product } from '@/constants/mock-data';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({ product, onPress, index = 0 }: ProductCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 80).duration(400).springify().damping(16)}
      style={[styles.card, animatedStyle]}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 180 }); }}
      onPress={() => onPress(product)}>
      <View style={[styles.imagePlaceholder, !product.imageUrl && { backgroundColor: product.color + '18' }]}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        ) : (
          <>
            <View style={[styles.colorDot, { backgroundColor: product.color }]} />
            <View style={[styles.colorRing, { borderColor: product.color + '30' }]} />
          </>
        )}
        <View style={[styles.categoryBadge, { backgroundColor: product.imageUrl ? 'rgba(0,0,0,0.45)' : product.color + '20' }]}>
          <Text style={[styles.categoryText, { color: product.imageUrl ? '#fff' : product.color }]}>
            {getCategoryName(product.categoryId)}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.tryOnRow}>
          <MaterialIcons name="people-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.tryOnText}>{formatTryOnCount(product.tryOnCount)} tried</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imagePlaceholder: {
    height: 140,
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  info: {
    padding: 12,
    backgroundColor: Colors.white,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tryOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tryOnText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
