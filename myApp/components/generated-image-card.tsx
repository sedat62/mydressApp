import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { WatermarkOverlay } from '@/components/WatermarkOverlay';
import type { GeneratedImage } from '@/constants/mock-data';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onPress: (image: GeneratedImage) => void;
  index?: number;
  isPremium?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GeneratedImageCard({ image, onPress, index = 0, isPremium = false }: GeneratedImageCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInUp.delay(index * 70).duration(400).springify().damping(16)}
      style={[styles.card, animatedStyle]}
      onPressIn={() => { scale.value = withSpring(0.94, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 180 }); }}
      onPress={() => onPress(image)}>
      {image.resultImageUrl ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image.resultImageUrl }} style={styles.realImage} resizeMode="cover" />
          <WatermarkOverlay visible={!isPremium} />
        </View>
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: image.color + '15' }]}>
          <View style={[styles.iconBg, { backgroundColor: image.color + '20' }]}>
            <MaterialIcons name="auto-awesome" size={22} color={image.color} />
          </View>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{image.productName}</Text>
        <Text style={styles.date}>{image.createdAt}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imageWrapper: {
    aspectRatio: 1,
    width: '100%',
    overflow: 'hidden',
  },
  realImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 8,
    paddingTop: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  date: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
