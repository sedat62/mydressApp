import { useState, useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useUserGenerations } from '@/hooks/useFirestoreData';
import { GeneratedImageCard } from '@/components/generated-image-card';
import ImageViewerModal from '@/components/ImageViewerModal';
import { deleteGeneration } from '@/services/firestore';
import type { GeneratedImage } from '@/constants/mock-data';

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const { generations } = useUserGenerations(profile?.uid);
  const [viewerImage, setViewerImage] = useState<GeneratedImage | null>(null);

  const handleImagePress = useCallback((image: GeneratedImage) => {
    setViewerImage(image);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteGeneration(id);
    } catch {
      Alert.alert('Hata', 'Fotoğraf silinirken bir sorun oluştu.');
    }
  }, []);

  const displayName = profile?.displayName ?? user?.displayName ?? 'Misafir';
  const email = profile?.email ?? user?.email ?? '';
  const avatar =
    profile?.avatar ??
    (displayName.length >= 2 ? displayName.slice(0, 2).toUpperCase() : '?');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={isAuthenticated ? generations : []}
        numColumns={3}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
              <Text style={styles.headerTitle}>Account</Text>
              <Pressable
                style={styles.settingsBtn}
                onPress={() => router.push('/(tabs)/account/settings')}>
                <MaterialIcons name="settings" size={22} color={Colors.text} />
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.profileSection}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatar}</Text>
                </View>
              </View>
              <Text style={styles.name}>{displayName}</Text>
              {email ? (
                <Text style={styles.email}>{email}</Text>
              ) : (
                <Text style={styles.emailMuted}>Giriş yapmadın — üretimlerin burada görünür</Text>
              )}

              {!isAuthenticated ? (
                <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.guestActions}>
                  <Pressable style={styles.primaryBtn} onPress={() => router.push('/(auth)/login')}>
                    <MaterialIcons name="login" size={18} color={Colors.white} />
                    <Text style={styles.primaryBtnText}>Giriş yap</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryBtn} onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.secondaryBtnText}>Hesap oluştur</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <>
                  <View style={styles.planBadge}>
                    <MaterialIcons
                      name={profile?.plan === 'pro' ? 'workspace-premium' : 'person'}
                      size={14}
                      color={profile?.plan === 'pro' ? '#F59E0B' : Colors.textSecondary}
                    />
                    <Text style={[styles.planText, profile?.plan === 'pro' && styles.planTextPro]}>
                      {profile?.plan === 'pro' ? 'Pro' : 'Free'} Plan
                    </Text>
                  </View>

                  <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {profile?.credits ?? 0}
                      </Text>
                      <Text style={styles.statLabel}>Credits</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {profile?.totalGenerations ?? generations.length}
                      </Text>
                      <Text style={styles.statLabel}>Generated</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{generations.length}</Text>
                      <Text style={styles.statLabel}>Gallery</Text>
                    </View>
                  </Animated.View>
                </>
              )}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Generations</Text>
              {isAuthenticated && (
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{generations.length}</Text>
                </View>
              )}
            </Animated.View>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.imageWrapper}>
            <GeneratedImageCard image={item} onPress={handleImagePress} index={index} isPremium={profile?.plan === 'pro'} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="auto-awesome" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.emptyText}>
              {isAuthenticated ? 'No generations yet' : 'Giriş yapınca üretimlerin burada'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isAuthenticated
                ? 'Try on some products to see them here'
                : 'Hesabın yoksa ücretsiz kayıt olabilirsin'}
            </Text>
          </View>
        }
      />

      <ImageViewerModal
        visible={!!viewerImage}
        image={viewerImage}
        onClose={() => setViewerImage(null)}
        onDelete={handleDelete}
        isPremium={profile?.plan === 'pro'}
      />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emailMuted: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  guestActions: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 28,
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  planTextPro: {
    color: '#F59E0B',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  gridContent: {
    paddingHorizontal: 14,
    paddingBottom: 100,
  },
  imageWrapper: {
    flex: 1,
    padding: 3,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
