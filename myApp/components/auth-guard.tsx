import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  message?: string;
}

export function AuthGuard({ children, message = 'Bu özelliği kullanmak için giriş yapmalısın.' }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;
  if (isAuthenticated) return <>{children}</>;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.iconWrap}>
          <MaterialIcons name="lock-outline" size={48} color={Colors.primary} />
        </Animated.View>
        <Animated.Text entering={FadeInUp.delay(200).duration(500)} style={styles.title}>
          Giriş Gerekli
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(300).duration(500)} style={styles.message}>
          {message}
        </Animated.Text>
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.btns}>
          <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <MaterialIcons name="login" size={20} color={Colors.white} />
            <Text style={styles.loginText}>Giriş Yap</Text>
          </Pressable>
          <Pressable style={styles.registerBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerText}>Kayıt Ol</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  btns: {
    gap: 12,
    width: '100%',
    marginTop: 12,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  registerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  registerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
