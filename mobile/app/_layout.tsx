import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { BackgroundWrapper } from '@/components/BackgroundWrapper';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BackgroundWrapper>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="register" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="provider-dashboard" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="admin-dashboard" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="checkout" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="order-confirmation" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="cart" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </BackgroundWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}
