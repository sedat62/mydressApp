import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);

  const navigateToTabs = () => {
    router.replace('/(tabs)');
  };

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.8)) });

    pulseScale.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        3,
        true,
      ),
    );

    pulseOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.15, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 }),
        ),
        3,
        true,
      ),
    );

    ringScale.value = withDelay(300, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    ringOpacity.value = withDelay(300, withTiming(1, { duration: 700 }));

    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    taglineTranslateY.value = withDelay(500, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    logoOpacity.value = withSequence(
      withTiming(1, { duration: 800 }),
      withDelay(1600, withTiming(0, { duration: 400 }, () => runOnJS(navigateToTabs)())),
    );

    taglineOpacity.value = withSequence(
      withDelay(500, withTiming(1, { duration: 600 })),
      withDelay(1000, withTiming(0, { duration: 400 })),
    );

    ringOpacity.value = withSequence(
      withDelay(300, withTiming(1, { duration: 700 })),
      withDelay(1300, withTiming(0, { duration: 400 })),
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.pulseRing, pulseStyle]} />
          <Animated.View style={[styles.outerRing, ringStyle]} />
          <View style={styles.logoIcon}>
            <Animated.Text style={styles.logoEmoji}>✨</Animated.Text>
          </View>
        </View>
        <Animated.Text style={styles.appName}>TryOn AI</Animated.Text>
      </Animated.View>
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        See it on you before you buy
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 35,
    backgroundColor: Colors.primaryLight,
  },
  outerRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primary + '25',
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 38,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});
