import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';

export default function BannedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="block" size={56} color={Colors.danger} />
        </View>

        <Text style={styles.title}>Hesabınız Askıya Alındı</Text>

        <Text style={styles.description}>
          Topluluk kurallarının ihlali nedeniyle hesabınız askıya alınmıştır.
          Uygulamayı kullanmaya devam edemezsiniz.
        </Text>

        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            Bunun bir hata olduğunu düşünüyorsanız destek ekibiyle iletişime geçin.
          </Text>
        </View>

        <Text style={styles.email}>destek@myappdress.com</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
});
