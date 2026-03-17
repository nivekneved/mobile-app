import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { WishlistProvider } from '../src/context/WishlistContext';
import '../src/lib/i18n';

function RootLayoutNav() {
  const { session, loading } = useAuth();
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

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

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
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="service-details/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="faq" options={{ title: 'FAQ', headerBackTitle: 'Back' }} />
        <Stack.Screen name="news" options={{ title: 'News', headerBackTitle: 'Back' }} />
        <Stack.Screen name="package-builder" options={{ title: 'Custom Plan', headerBackTitle: 'Back' }} />
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