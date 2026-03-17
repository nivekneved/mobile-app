import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Colors } from './colors';

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 64,
  },
  // Add other font styles as needed
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.charcoal,
    error: Colors.error,
    background: Colors.background,
    surface: Colors.surface,
    outline: Colors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};
