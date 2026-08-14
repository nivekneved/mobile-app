import React, { useEffect, useCallback } from 'react';
import { Platform, Text as RNText, TextInput as RNTextInput, BackHandler } from 'react-native';
import { safeGoBack } from '../src/utils/navigation';

// GLOBAL FIX: Cap system font scaling to maintain pixel-perfect UI designs
interface TextWithDefaultProps extends RNText {
    defaultProps?: { maxFontSizeMultiplier?: number };
}
interface TextInputWithDefaultProps extends RNTextInput {
    defaultProps?: { maxFontSizeMultiplier?: number };
}

((RNText as unknown) as TextWithDefaultProps).defaultProps = ((RNText as unknown) as TextWithDefaultProps).defaultProps || {};
((RNText as unknown) as TextWithDefaultProps).defaultProps!.maxFontSizeMultiplier = 1.1;

((RNTextInput as unknown) as TextInputWithDefaultProps).defaultProps = ((RNTextInput as unknown) as TextInputWithDefaultProps).defaultProps || {};
((RNTextInput as unknown) as TextInputWithDefaultProps).defaultProps!.maxFontSizeMultiplier = 1.1;

// POLYFILL: Hermes in some environments (SDK 52) may lack WeakRef
// L-05 FIX: Use WeakRef with proper GC behavior via FinalizationRegistry if available
if (typeof WeakRef === 'undefined') {
  (global as any).WeakRef = class WeakRef<T extends object> {
    private ref: T | undefined;
    constructor(target: T) {
      this.ref = target;
    }
    deref(): T | undefined {
      return this.ref;
    }
  };
}
import { Stack, useRouter, useSegments } from 'expo-router';
import { 
  PaperProvider, 
  MD3LightTheme, 
  MD3DarkTheme, 
  configureFonts, 
  adaptNavigationTheme,
  Text 
} from 'react-native-paper';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import { Colors } from '../src/theme/colors';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';

import '../src/lib/i18n';
import '../src/styles/global.css';
import { PopupManager } from '../src/components/PopupManager';
import { AIConcierge } from '../src/components/AIConcierge';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading: authLoading } = useAuth();
  const { mobileConfig, isLoading: settingsLoading } = useSettings();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });


  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      const segmentsArr = segments as string[];
      const isHome = segmentsArr.length === 0 || 
                    (segmentsArr[0] === '(tabs)' && (segmentsArr.length === 1 || segmentsArr[1] === 'index'));

      if (router.canGoBack()) {
        router.back();
        return true;
      }
      
      // If not on the main Home tab screen, navigate back to the Home tab
      if (!isHome) {
        router.replace('/(tabs)');
        return true;
      }

      // Only minimize when already on the main Home tab with no navigation history
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [segments, router]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const primaryColor = mobileConfig?.primaryColor || Colors.primary;

  const fontConfig = {
    displaySmall: { fontFamily: 'Outfit_300Light' },
    displayMedium: { fontFamily: 'Outfit_400Regular' },
    displayLarge: { fontFamily: 'Outfit_500Medium' },
    headlineSmall: { fontFamily: 'Outfit_600SemiBold' },
    headlineMedium: { fontFamily: 'Outfit_700Bold' },
    headlineLarge: { fontFamily: 'Outfit_800ExtraBold' },
    titleSmall: { fontFamily: 'Outfit_500Medium' },
    titleMedium: { fontFamily: 'Outfit_700Bold' },
    titleLarge: { fontFamily: 'Outfit_900Black' },
    labelSmall: { fontFamily: 'Outfit_500Medium' },
    labelMedium: { fontFamily: 'Outfit_700Bold' },
    labelLarge: { fontFamily: 'Outfit_800ExtraBold' },
    bodySmall: { fontFamily: 'Outfit_400Regular' },
    bodyMedium: { fontFamily: 'Outfit_500Medium' },
    bodyLarge: { fontFamily: 'Outfit_600SemiBold' },
  };

  const theme = {
    ...(colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme),
    fonts: configureFonts({ config: fontConfig }),
    colors: {
      ...(colorScheme === 'dark' ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: primaryColor,
      secondary: Colors.charcoal,
      tertiary: Colors.textSecondary,
      background: colorScheme === 'dark' ? '#0F172A' : '#FFFFFF',
      surface: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF',
      outline: Colors.border,
    },
  };

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        {/* PopupManager disabled per user request */}
        {/* <PopupManager /> */}
        <AIConcierge />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: Colors.charcoal,
            headerTitleStyle: {
              fontFamily: 'Outfit_900Black',
              fontSize: 18,
            },
            headerShadowVisible: false,
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors.white,
            }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="faq" 
            options={{ 
              headerShown: true,
              title: 'FAQ',
              headerTitleStyle: {
                fontFamily: 'Outfit_900Black',
                fontSize: 14,
              },
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
            }} 
          />
          {/* NOTE: 'news' is a tab route (tabs)/_layout.tsx, not a stack route. */}
          {/* Registering it here as a Stack.Screen causes navigation hierarchy conflicts. Removed. */}
        </Stack>
      </PaperProvider>
    </View>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('CRITICAL APP ERROR:', error, errorInfo);
    // Ensure splash screen is hidden on crash
    SplashScreen.hideAsync().catch(() => {});
  }
  render() {
    if (this.state.hasError) {
      // Final guard: try to hide splash screen during render if it's still showing
      SplashScreen.hideAsync().catch(() => {});
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
          <Text variant="headlineSmall" style={{ marginBottom: 10, color: '#0F172A' }}>Something went wrong</Text>
          <Text style={{ textAlign: 'center', color: '#64748B', marginBottom: 20 }}>
            {this.state.error?.message || 'The app encountered a critical error during startup. This is usually due to missing environment variables or a network failure.'}
          </Text>
          {/* M-07 FIX: Only show stack traces in development mode */}
          {__DEV__ && (
            <Text style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center' }}>
              {this.state.error?.stack?.substring(0, 200)}
            </Text>
          )}
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  useEffect(() => {
    // TOP-LEVEL Failsafe: Hide splash screen after 5 seconds even if providers hang
    if (__DEV__) console.log('[RootLayout] Global startup timer started...');
    const timer = setTimeout(async () => {
      if (__DEV__) console.log('[RootLayout] Failsafe: Hiding splash screen manually...');
      await SplashScreen.hideAsync().catch(() => {});
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <WishlistProvider>
            <SettingsProvider>
              <RootLayoutNav />
            </SettingsProvider>
          </WishlistProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
