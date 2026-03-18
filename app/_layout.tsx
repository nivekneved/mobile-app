import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import '../src/lib/i18n';

function RootLayoutNav() {
  const { session, isLoading: authLoading } = useAuth();
  const { mobileConfig, isLoading: settingsLoading } = useSettings();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const primaryColor = mobileConfig?.primaryColor || '#DC2626';

  const theme = {
    ...(colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(colorScheme === 'dark' ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: primaryColor,
      secondary: '#1E293B', // Slate 900
      tertiary: '#475569', // Slate 600
      background: colorScheme === 'dark' ? '#0F172A' : '#F8FAFC',
      surface: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF',
      outline: '#E2E8F0',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.secondary,
          headerTitleStyle: {
            fontWeight: '900',
          },
          headerShadowVisible: false,
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="faq" options={{ title: 'FAQ', headerShown: true }} />
        <Stack.Screen name="news" options={{ title: 'News', headerShown: true }} />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <SettingsProvider>
          <RootLayoutNav />
        </SettingsProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
