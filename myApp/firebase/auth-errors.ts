/**
 * Firebase Auth hata kodlarını kullanıcıya anlaşılır Türkçe metne çevirir.
 * auth/configuration-not-found → proje/API tarafı yapılandırma sorunu.
 */
export function firebaseAuthMessage(err: unknown, fallback: string): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: string }).code) : '';
  const raw = typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: string }).message) : '';

  if (code === 'auth/configuration-not-found' || raw.includes('configuration-not-found')) {
    return [
      'Firebase Authentication bu projede etkin değil veya yapılandırma eksik/hatalı.',
      '',
      'Kontrol listesi:',
      '1) Firebase Console → Build → Authentication → ilk kez açıyorsan "Get started".',
      '2) Sign-in method: E-posta/Parola (ve Apple için Apple) açık olsun.',
      '3) Google Cloud Console → APIs → "Identity Toolkit API" etkin olsun (aynı GCP projesi).',
      '4) Proje ayarları → Genel → Web uygulamanın apiKey, authDomain, projectId değerlerini uygulamadaki firebase/config.ts ile birebir karşılaştır.',
      '5) Google Cloud → API anahtarları: anahtar "HTTP yönlendirici" ile kısıtlıysa React Native istekleri reddedilebilir; test için kısıtlamayı kaldır veya iOS uygulaması kısıtı ekle.',
    ].join('\n');
  }

  return fallback;
}
