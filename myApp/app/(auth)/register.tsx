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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithApple } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const code = err?.code ?? '';
      const msg =
        code === 'auth/email-already-in-use'
          ? 'Bu e-posta adresi zaten kullanılıyor.'
          : code === 'auth/invalid-email'
            ? 'Geçersiz e-posta adresi.'
            : code === 'auth/weak-password'
              ? 'Şifre çok zayıf. Daha uzun bir şifre dene.'
              : code === 'auth/network-request-failed'
                ? 'İnternet bağlantını kontrol et.'
              : code === 'auth/operation-not-allowed'
                ? 'E-posta ile kayıt Firebase Console’da kapalı. Authentication > Sign-in method > Email/Password aç.'
              : code === 'permission-denied'
                ? 'Firestore izni yok. Güvenlik kurallarını yayınla: users/{uid} için giriş yapmış kullanıcının kendi belgesini oluşturmasına izin ver.'
              : code === 'firestore/permission-denied'
                ? 'Veritabanı kaydı reddedildi. Firestore kurallarını kontrol et.'
              : err?.message
                ? `${err.message}`
                : 'Kayıt olurken bir hata oluştu.';
      Alert.alert('Kayıt Başarısız', firebaseAuthMessage(err, msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Yakında', `${provider} ile giriş yakında aktif olacak.`);
  };

  const handleAppleRegister = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (err: unknown) {
      if (isAppleUserCanceled(err)) return;
      const e = err as { code?: string; message?: string };
      const msg =
        e.code === 'auth/operation-not-allowed'
          ? 'Firebase’de Apple girişi kapalı veya Apple Developer ayarı eksik. Console → Authentication → Apple aç; Services ID, Key ve Team ID gir.'
          : e.code === 'permission-denied'
            ? 'Firestore kullanıcı kaydı reddedildi. Kuralları yayınla (users, role: user).'
            : e.message || 'Apple ile kayıt başarısız.';
      Alert.alert('Apple ile kayıt', firebaseAuthMessage(err, msg));
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
              <MaterialIcons name="person-add" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>AI deneme deneyimine başla</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <View style={styles.inputRow}>
                <MaterialIcons name="person-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Adınız Soyadınız"
                  placeholderTextColor={Colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

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
                  placeholder="En az 6 karakter"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre Tekrar</Text>
              <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreyi tekrar girin"
                  placeholderTextColor={Colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <MaterialIcons name="how-to-reg" size={20} color={Colors.white} />
                  <Text style={styles.primaryBtnText}>Kayıt Ol</Text>
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
              <Text style={styles.socialBtnText}>Google ile Kayıt</Text>
            </Pressable>

            {Platform.OS === 'ios' && (
              <Pressable style={styles.socialBtn} onPress={handleAppleRegister} disabled={loading}>
                <MaterialIcons name="apple" size={22} color={Colors.text} />
                <Text style={styles.socialBtnText}>Apple ile Kayıt</Text>
              </Pressable>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Giriş Yap</Text>
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
    marginTop: 8,
    marginBottom: 28,
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
    gap: 14,
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
