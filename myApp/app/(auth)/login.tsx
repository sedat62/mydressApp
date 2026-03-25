import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { firebaseAuthMessage } from '@/firebase/auth-errors';

function isAppleUserCanceled(err: unknown): boolean {
  const c = (err as { code?: string })?.code;
  return c === 'ERR_REQUEST_CANCELED' || c === 'ERR_CANCELED';
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'E-posta ve şifre alanlarını doldurun.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential'
          ? 'E-posta veya şifre hatalı.'
          : err.code === 'auth/too-many-requests'
            ? 'Çok fazla deneme. Lütfen biraz bekleyin.'
            : 'Giriş yapılırken bir hata oluştu.';
      Alert.alert('Giriş Başarısız', firebaseAuthMessage(err, msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Yakında', `${provider} ile giriş yakında aktif olacak.`);
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (err: unknown) {
      if (isAppleUserCanceled(err)) return;
      const e = err as { code?: string; message?: string };
      const msg =
        e.code === 'auth/operation-not-allowed'
          ? 'Firebase Console’da Apple girişini aç: Authentication → Sign-in method → Apple. Ayrıca Apple Developer’da Sign in with Apple ve Services ID / Key tanımlı olmalı.'
          : e.code === 'auth/account-exists-with-different-credential'
            ? 'Bu hesap başka bir giriş yöntemiyle kayıtlı. E-posta ile giriş dene.'
            : e.code === 'auth/invalid-credential'
              ? 'Apple kimlik bilgisi geçersiz veya yapılandırma eksik. Firebase’de Apple provider ayarlarını kontrol et.'
              : e.message || 'Apple ile giriş başarısız.';
      Alert.alert('Apple ile giriş', firebaseAuthMessage(err, msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text} />
          </Pressable>

          <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="auto-awesome" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Tekrar Hoş Geldin</Text>
            <Text style={styles.subtitle}>Hesabına giriş yap</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta</Text>
              <View style={styles.inputRow}>
                <MaterialIcons name="mail-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <MaterialIcons name="login" size={20} color={Colors.white} />
                  <Text style={styles.primaryBtnText}>Giriş Yap</Text>
                </>
              )}
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.socialBtns}>
            <Pressable
              style={styles.socialBtn}
              onPress={() => handleSocialLogin('Google')}>
              <MaterialIcons name="g-mobiledata" size={24} color="#EA4335" />
              <Text style={styles.socialBtnText}>Google ile Giriş</Text>
            </Pressable>

            {Platform.OS === 'ios' && (
              <Pressable style={styles.socialBtn} onPress={handleAppleLogin} disabled={loading}>
                <MaterialIcons name="apple" size={22} color={Colors.text} />
                <Text style={styles.socialBtnText}>Apple ile Giriş</Text>
              </Pressable>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <Pressable onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.footerLink}>Kayıt Ol</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  socialBtns: {
    gap: 12,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
