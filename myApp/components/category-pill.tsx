import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';

interface CategoryPillProps {
  name: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryPill({ name, icon, selected, onPress }: CategoryPillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 15, stiffness: 250 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected, animatedStyle]}>
      <MaterialIcons
        name={icon as any}
        size={16}
        color={selected ? Colors.white : Colors.textSecondary}
      />
      <Text style={[styles.label, selected && styles.labelSelected]}>{name}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
});
