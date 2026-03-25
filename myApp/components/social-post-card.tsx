import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import type { SocialPost } from '@/constants/mock-data';

interface SocialPostCardProps {
  post: SocialPost;
  onLike: (id: string) => void;
  onImagePress?: (post: SocialPost) => void;
  index?: number;
}

export function SocialPostCard({ post, onLike, onImagePress, index = 0 }: SocialPostCardProps) {
  const heartScale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    heartScale.value = withSpring(1.3, { damping: 6, stiffness: 300 }, () => {
      heartScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
    onLike(post.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(450).springify().damping(16)}
      style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.userAvatar}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <Pressable hitSlop={8}>
          <MaterialIcons name="more-horiz" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <Pressable style={styles.imageContainer} onPress={() => onImagePress?.(post)}>
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="auto-awesome" size={32} color={Colors.primary} />
          <Text style={styles.productLabel}>{post.productName}</Text>
          <View style={styles.aiBadge}>
            <MaterialIcons name="auto-awesome" size={10} color={Colors.primary} />
            <Text style={styles.aiLabel}>AI Generated</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={handleLike}>
          <Animated.View style={heartStyle}>
            <MaterialIcons
              name={post.liked ? 'favorite' : 'favorite-border'}
              size={22}
              color={post.liked ? '#EF4444' : Colors.textSecondary}
            />
          </Animated.View>
          <Text style={[styles.actionCount, post.liked && styles.likedCount]}>{post.likes}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <MaterialIcons name="share" size={20} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.spacer} />
        <Pressable style={styles.actionBtn}>
          <MaterialIcons name="bookmark-border" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  imageContainer: {
    marginHorizontal: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 280,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  productLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
  },
  actionCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  likedCount: {
    color: '#EF4444',
  },
  spacer: {
    flex: 1,
  },
});
