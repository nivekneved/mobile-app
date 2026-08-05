import { router } from 'expo-router';

/**
 * Safely navigates back to the previous screen in the stack history.
 * If there is no previous history (e.g. opened via deep link or direct route reset),
 * it navigates gracefully to the fallback route (default: '/(tabs)') instead of exiting the app.
 */
export const safeGoBack = (fallbackRoute: string = '/(tabs)') => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
};
