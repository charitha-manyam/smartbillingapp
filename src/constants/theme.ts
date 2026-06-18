import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { LightColors, DarkColors } from './colors';

const fontConfig = {
  fontFamily: 'System',
};

export const PaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: LightColors.primary,
    primaryContainer: LightColors.primaryLight,
    secondary: LightColors.secondary,
    tertiary: LightColors.accent,
    background: LightColors.background,
    surface: LightColors.surface,
    surfaceVariant: LightColors.surfaceVariant,
    error: LightColors.error,
    onPrimary: LightColors.textInverse,
    onBackground: LightColors.text,
    onSurface: LightColors.text,
    outline: LightColors.border,
  },
};

export const PaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DarkColors.primary,
    primaryContainer: DarkColors.primaryLight,
    secondary: DarkColors.secondary,
    tertiary: DarkColors.accent,
    background: DarkColors.background,
    surface: DarkColors.surface,
    surfaceVariant: DarkColors.surfaceVariant,
    error: DarkColors.error,
    onPrimary: DarkColors.textInverse,
    onBackground: DarkColors.text,
    onSurface: DarkColors.text,
    outline: DarkColors.border,
  },
};
