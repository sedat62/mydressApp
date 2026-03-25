import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { Platform } from 'react-native';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCredential,
  OAuthProvider,
  updateProfile,
  deleteUser,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro';
  totalGenerations: number;
  credits: number;
  banned: boolean;
  role?: string;
  createdAt: any;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileUnsubRef = useRef<(() => void) | null>(null);

  const subscribeProfile = useCallback((u: User) => {
    if (profileUnsubRef.current) profileUnsubRef.current();
    const unsub = onSnapshot(
      doc(db, 'users', u.uid),
      (snap) => {
        if (snap.exists()) {
          setProfile({ uid: u.uid, ...snap.data() } as UserProfile);
        } else {
          setProfile(null);
        }
      },
      () => setProfile(null),
    );
    profileUnsubRef.current = unsub;
  }, []);

  const fetchProfile = useCallback(async (u: User) => {
    const snap = await getDoc(doc(db, 'users', u.uid));
    if (snap.exists()) {
      setProfile({ uid: u.uid, ...snap.data() } as UserProfile);
    } else {
      setProfile(null);
    }
  }, []);

  const ensureUserProfile = useCallback(async (u: User, fallbackDisplayName: string) => {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    const name = (u.displayName || fallbackDisplayName || 'Kullanıcı').trim() || 'Kullanıcı';
    const email = u.email ?? '';
    await u.getIdToken(true);
    await setDoc(ref, {
      displayName: name,
      email,
      avatar: getInitials(name),
      plan: 'free' as const,
      totalGenerations: 0,
      credits: 3,
      banned: false,
      role: 'user',
      createdAt: serverTimestamp(),
    });
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u);
        subscribeProfile(u);
      } else {
        if (profileUnsubRef.current) profileUnsubRef.current();
        profileUnsubRef.current = null;
        setProfile(null);
      }
      setLoading(false);
    });
    return () => {
      unsub();
      if (profileUnsubRef.current) profileUnsubRef.current();
    };
  }, [fetchProfile, subscribeProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await fetchProfile(cred.user);
    },
    [fetchProfile],
  );

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try {
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch {
        /* */
      }
      await cred.user.getIdToken(true);

      const userProfileFirestore = {
        displayName: name,
        email,
        avatar: getInitials(name),
        plan: 'free' as const,
        totalGenerations: 0,
        credits: 3,
        banned: false,
        role: 'user',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), userProfileFirestore);

      setProfile({
        uid: cred.user.uid,
        displayName: name,
        email,
        avatar: getInitials(name),
        plan: 'free',
        totalGenerations: 0,
        credits: 3,
        banned: false,
        createdAt: null,
      });
    } catch (e) {
      try {
        await deleteUser(cred.user);
      } catch {
        /* */
      }
      throw e;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      throw Object.assign(new Error('Apple ile giriş yalnızca iOS’ta desteklenir.'), { code: 'apple/unavailable' });
    }
    const AppleAuthentication = await import('expo-apple-authentication');
    const Crypto = await import('expo-crypto');

    if (!(await AppleAuthentication.isAvailableAsync())) {
      throw new Error('Bu cihazda Apple ile giriş kullanılamıyor.');
    }

    const rawNonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

    const apple = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!apple.identityToken) {
      throw new Error('Apple kimlik jetonu alınamadı.');
    }

    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: apple.identityToken,
      rawNonce,
    });
    const cred = await signInWithCredential(auth, credential);

    let displayName = cred.user.displayName?.trim() || '';
    if (!displayName && apple.fullName) {
      const fn = apple.fullName.givenName || '';
      const ln = apple.fullName.familyName || '';
      displayName = `${fn} ${ln}`.trim();
      if (displayName) {
        try {
          await updateProfile(cred.user, { displayName });
        } catch {
          /* */
        }
      }
    }
    if (!displayName) {
      displayName = cred.user.email?.split('@')[0] || 'Kullanıcı';
    }

    await cred.user.getIdToken(true);
    await ensureUserProfile(cred.user, displayName);
    await fetchProfile(cred.user);
  }, [ensureUserProfile, fetchProfile]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signInWithApple,
        signOut,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
