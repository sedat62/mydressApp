import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  showArrow?: boolean;
  index?: number;
}

function SettingsItem({ icon, label, onPress, color, showArrow = true, index = 0 }: SettingsItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(350)}>
      <Pressable
        style={({ pressed }) => [styles.settingsItem, pressed && styles.pressed]}
        onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: (color || Colors.textSecondary) + '14' }]}>
          <MaterialIcons name={icon as any} size={20} color={color || Colors.textSecondary} />
        </View>
        <Text style={[styles.itemLabel, color ? { color } : {}]}>{label}</Text>
        {showArrow && (
          <MaterialIcons name="chevron-right" size={20} color={Colors.border} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, profile, isAuthenticated } = useAuth();

  const showAlert = (title: string) => {
    Alert.alert(title, 'This feature is coming soon.');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isAuthenticated && (
          <Animated.View entering={FadeInDown.delay(40).duration(400)} style={styles.guestBanner}>
            <MaterialIcons name="person-outline" size={28} color={Colors.primary} />
            <Text style={styles.guestBannerTitle}>Hesabına giriş yap</Text>
            <Text style={styles.guestBannerText}>
              Ayarlar ve çıkış için önce giriş yap veya kayıt ol.
            </Text>
            <Pressable style={styles.guestBannerBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.guestBannerBtnText}>Giriş / Kayıt</Text>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(80).duration(400).springify()} style={styles.proCard}>
          <View style={styles.proCardHeader}>
            <View style={styles.proBadge}>
              <MaterialIcons name="workspace-premium" size={22} color={Colors.white} />
            </View>
            <View style={styles.proInfo}>
              <Text style={styles.proTitle}>TryOn AI Pro</Text>
              <Text style={styles.proStatus}>
                {!isAuthenticated ? '—' : profile?.plan === 'pro' ? 'Pro' : 'Free'} Plan
              </Text>
            </View>
            <View style={styles.proTrialBadge}>
              <Text style={styles.proTrialText}>7-day trial</Text>
            </View>
          </View>
          <View style={styles.proFeatureList}>
            <View style={styles.proFeatureItem}>
              <MaterialIcons name="check-circle" size={16} color={Colors.success} />
              <Text style={styles.proFeatureText}>Unlimited generations</Text>
            </View>
            <View style={styles.proFeatureItem}>
              <MaterialIcons name="check-circle" size={16} color={Colors.success} />
              <Text style={styles.proFeatureText}>HD & 4K resolution</Text>
            </View>
            <View style={styles.proFeatureItem}>
              <MaterialIcons name="check-circle" size={16} color={Colors.success} />
              <Text style={styles.proFeatureText}>No watermark or ads</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.goProBtn, pressed && styles.goProPressed]}
            onPress={() => router.push('/paywall')}>
            <MaterialIcons name="rocket-launch" size={18} color={Colors.white} />
            <Text style={styles.goProText}>Go Pro — $7.99/month</Text>
          </Pressable>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(100).duration(300)} style={styles.sectionLabel}>
          General
        </Animated.Text>
        <View style={styles.section}>
          <SettingsItem
            icon="notifications"
            label="Notifications"
            color="#F59E0B"
            onPress={() => showAlert('Notifications')}
            index={0}
          />
          <SettingsItem
            icon="lock"
            label="Privacy"
            color="#6C63FF"
            onPress={() => showAlert('Privacy')}
            index={1}
          />
          <SettingsItem
            icon="language"
            label="Language"
            color="#10B981"
            onPress={() => showAlert('Language')}
            index={2}
          />
        </View>

        <Animated.Text entering={FadeInDown.delay(250).duration(300)} style={styles.sectionLabel}>
          Support
        </Animated.Text>
        <View style={styles.section}>
          <SettingsItem
            icon="help-outline"
            label="Help & FAQ"
            color="#3B82F6"
            onPress={() => showAlert('Help & FAQ')}
            index={3}
          />
          <SettingsItem
            icon="info-outline"
            label="About"
            color="#8B5CF6"
            onPress={() => showAlert('About')}
            index={4}
          />
          <SettingsItem
            icon="description"
            label="Terms of Service"
            color="#6B7280"
            onPress={() => showAlert('Terms of Service')}
            index={5}
          />
        </View>

        {isAuthenticated && (
          <>
            <Animated.Text entering={FadeInDown.delay(400).duration(300)} style={styles.sectionLabel}>
              Account
            </Animated.Text>
            <View style={styles.section}>
              <SettingsItem
                icon="logout"
                label="Log Out"
                color="#EF4444"
                showArrow={false}
                index={6}
                onPress={() =>
                  Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Çıkış Yap', style: 'destructive', onPress: handleLogout },
                  ])
                }
              />
            </View>
          </>
        )}

        <Animated.Text
          entering={FadeInDown.delay(500).duration(300)}
          style={styles.versionText}>
          TryOn AI v1.0.0
        </Animated.Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  guestBanner: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
    gap: 8,
  },
  guestBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  guestBannerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  guestBannerBtn: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  guestBannerBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pressed: {
    backgroundColor: Colors.card,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  proCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  proBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInfo: {
    flex: 1,
  },
  proTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  proStatus: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  proTrialBadge: {
    backgroundColor: Colors.success + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  proTrialText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  proFeatureList: {
    gap: 8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proFeatureText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  goProBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  goProPressed: {
    opacity: 0.85,
  },
  goProText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 32,
  },
});
