import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import '../src/lib/i18n';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const theme = {
    ...(colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(colorScheme === 'dark' ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: '#DC2626', // Travel Lounge Red
      secondary: '#1E293B', // Slate 900
      tertiary: '#475569', // Slate 600
      background: colorScheme === 'dark' ? '#0F172A' : '#F8FAFC',
      surface: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF',
      outline: '#E2E8F0',
    },
  };

  /* 
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);
  */

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
        {/* <Stack.Screen name="(auth)" options={{ animation: 'fade' }} /> */}
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
        <RootLayoutNav />
      </WishlistProvider>
    </AuthProvider>
  );
}
