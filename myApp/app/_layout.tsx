import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import BannedScreen from '@/components/BannedScreen';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A1A2E',
    border: '#E5E7EB',
    primary: '#6C63FF',
  },
};

export const unstable_settings = {
  initialRouteName: 'welcome',
};

function RootNavigator() {
  const { profile } = useAuth();

  if (profile?.banned) {
    return <BannedScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="paywall"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={LightTheme}>
        <RootNavigator />
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
