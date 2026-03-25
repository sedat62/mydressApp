import { initializeApp } from 'firebase/app';
import { initializeFirestore, getFirestore, type Firestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBerxBgRE2B3U8pPNLI4PfUREaBZNWanq8',
  authDomain: 'myappdress.firebaseapp.com',
  projectId: 'myappdress',
  storageBucket: 'myappdress.firebasestorage.app',
  messagingSenderId: '1099138728323',
  appId: '1:1099138728323:web:82f4c24563d0232a15f6b6',
  measurementId: 'G-LL4ZZ4FNCF',
};

const app = initializeApp(firebaseConfig);

/** React Native'de WebChannel hatalarını azaltmak için long polling kullan (Listen transport errored). */
function createFirestore(): Firestore {
  if (Platform.OS === 'web') {
    return getFirestore(app);
  }
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createFirestore();
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const storage = getStorage(app);
export default app;
