import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';

const FREE_FEATURES = [
  { text: '3 AI generations per day', icon: 'auto-awesome' as const },
  { text: 'Standard resolution (720p)', icon: 'photo-size-select-large' as const },
  { text: 'Watermark on images', icon: 'branding-watermark' as const },
  { text: 'Basic product catalog', icon: 'inventory-2' as const },
  { text: 'View social feed', icon: 'visibility' as const },
  { text: 'Save up to 10 images', icon: 'photo-library' as const },
];

const PRO_FEATURES = [
  { text: 'Unlimited AI generations', icon: 'all-inclusive' as const },
  { text: 'HD & 4K resolution', icon: 'hd' as const },
  { text: 'No watermark', icon: 'hide-image' as const },
  { text: 'Full product catalog', icon: 'category' as const },
  { text: 'Priority processing (2-3x faster)', icon: 'speed' as const },
  { text: 'Multiple angle generation', icon: '360' as const },
  { text: 'Color variants', icon: 'palette' as const },
  { text: 'Full social features', icon: 'people' as const },
  { text: 'Unlimited gallery storage', icon: 'cloud-done' as const },
  { text: 'Multiple download formats', icon: 'file-download' as const },
  { text: 'Custom product upload', icon: 'add-photo-alternate' as const },
  { text: 'Early access to new features', icon: 'new-releases' as const },
  { text: 'No ads', icon: 'block' as const },
];

function FeatureRow({
  text,
  icon,
  included,
  index,
}: {
  text: string;
  icon: string;
  included: boolean;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(350).springify().damping(16)}
      style={styles.featureRow}>
      <View style={[styles.featureIcon, included ? styles.featureIconPro : styles.featureIconFree]}>
        <MaterialIcons
          name={icon as any}
          size={16}
          color={included ? Colors.primary : Colors.textSecondary}
        />
      </View>
      <Text style={[styles.featureText, included && styles.featureTextPro]}>{text}</Text>
      <MaterialIcons
        name={included ? 'check-circle' : 'radio-button-unchecked'}
        size={20}
        color={included ? Colors.success : Colors.border}
      />
    </Animated.View>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const ctaScale = useSharedValue(1);

  const ctaPulse = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  React.useEffect(() => {
    ctaScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="close" size={24} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
          <View style={styles.proBadge}>
            <MaterialIcons name="workspace-premium" size={32} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>TryOn AI Pro</Text>
          <Text style={styles.heroSubtitle}>Unlock the full power of AI fashion</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={styles.priceAmount}>7.99</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <Text style={styles.trialText}>Start with a 7-day free trial</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="star" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Pro Features</Text>
          </View>
          {PRO_FEATURES.map((f, i) => (
            <FeatureRow key={f.text} text={f.text} icon={f.icon} included index={i} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person-outline" size={18} color={Colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Free Tier</Text>
          </View>
          {FREE_FEATURES.map((f, i) => (
            <FeatureRow key={f.text} text={f.text} icon={f.icon} included={false} index={i} />
          ))}
        </Animated.View>

        <View style={styles.ctaSection}>
          <Animated.View style={ctaPulse}>
            <Pressable
              style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
              onPress={() => Alert.alert('Free Trial', 'Your 7-day free trial has started!')}>
              <MaterialIcons name="rocket-launch" size={22} color={Colors.white} />
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </Pressable>
          </Animated.View>
          <Text style={styles.ctaNote}>Cancel anytime. No charge for 7 days.</Text>
          <Pressable
            style={styles.restoreBtn}
            onPress={() => Alert.alert('Restore', 'Looking for previous purchases...')}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  proBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  priceCard: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceCurrency: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 52,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  trialText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconPro: {
    backgroundColor: Colors.primaryLight,
  },
  featureIconFree: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  featureTextPro: {
    color: Colors.text,
    fontWeight: '600',
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  ctaNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  restoreBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
