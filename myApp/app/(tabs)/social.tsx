import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useSocialPosts } from '@/hooks/useFirestoreData';
import { toggleLike } from '@/services/firestore';
import { SocialPostCard } from '@/components/social-post-card';
import ImageViewerModal from '@/components/ImageViewerModal';
import type { SocialPost, GeneratedImage } from '@/constants/mock-data';

export default function SocialScreen() {
  const { profile } = useAuth();
  const { posts, setPosts, loading } = useSocialPosts();
  const [viewerImage, setViewerImage] = useState<GeneratedImage | null>(null);

  const handleImagePress = useCallback((post: SocialPost) => {
    setViewerImage({
      id: post.id,
      productName: post.productName,
      createdAt: post.timeAgo,
      color: '#6C63FF',
    });
  }, []);

  const handleLike = useCallback((id: string) => {
    setPosts((prev: SocialPost[]) => {
      const post = prev.find((p) => p.id === id);
      if (post) {
        toggleLike(id, !post.liked).catch(() => {});
      }
      return prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      );
    });
  }, [setPosts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Social</Text>
          <Text style={styles.headerSubtitle}>Community try-on results</Text>
        </View>
        <View style={styles.headerBadge}>
          <MaterialIcons name="auto-awesome" size={14} color={Colors.primary} />
          <Text style={styles.headerBadgeText}>{posts.length} posts</Text>
        </View>
      </Animated.View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SocialPostCard post={item} onLike={handleLike} onImagePress={handleImagePress} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            tintColor={Colors.primary}
          />
        }
      />

      <ImageViewerModal
        visible={!!viewerImage}
        image={viewerImage}
        onClose={() => setViewerImage(null)}
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});
