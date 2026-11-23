import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  // Brand Colors (from specs)
  primary: '#174D37',       // Primary green
  secondary: '#23945D',     // Secondary green
  background: '#F6F8F3',    // Light background
  orange: '#E8A044',        // Orange accent

  // Additional Brand Palette
  primaryDark: '#0F3424',
  primaryLight: '#2D6B51',
  secondaryLight: '#38A76F',
  secondarySoft: '#EAF6F0',
  orangeSoft: '#FDF4E7',
  orangeDark: '#C98229',

  // Surfaces & Neutral
  white: '#FFFFFF',
  card: '#FFFFFF',
  surfaceLight: '#F0F4EC',
  border: '#E2E8DE',
  borderFocus: '#23945D',
  
  // Text Colors
  text: '#13241B',
  textDark: '#13241B',
  textSecondary: '#788278',
  textMuted: '#88988F',
  textLight: '#FFFFFF',

  // Status & Feedback
  success: '#1D8348',
  successBg: '#E8F8F0',
  error: '#C62828',
  errorBg: '#FDECEC',
  warning: '#E8A044',
  warningBg: '#FFF8EC',
  info: '#1565C0',
  infoBg: '#EBF3FB',

  // Role Badges
  farmer: '#23945D',
  farmerBg: '#EAF6F0',
  buyer: '#E8A044',
  buyerBg: '#FDF4E7',
  admin: '#1E293B',
  adminBg: '#F1F5F9',
  adminGold: '#D97706',

  // Compatibility themes for template components
  light: {
    text: '#13241B',
    background: '#F6F8F3',
    backgroundElement: '#EAF6F0',
    backgroundSelected: '#C2E5D4',
    textSecondary: '#5A6C63',
    tint: '#174D37',
    icon: '#5A6C63',
    tabIconDefault: '#88988F',
    tabIconSelected: '#174D37',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0F3424',
    backgroundElement: '#174D37',
    backgroundSelected: '#23945D',
    textSecondary: '#C2E5D4',
    tint: '#E8A044',
    icon: '#C2E5D4',
    tabIconDefault: '#5A6C63',
    tabIconSelected: '#E8A044',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
});

export const Shadows = StyleSheet.create({
  small: {
    ...Platform.select({
      ios: {
        shadowColor: '#174D37',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(23, 77, 55, 0.06)',
      } as any,
    }),
  },
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#174D37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.09,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 16px rgba(23, 77, 55, 0.08)',
      } as any,
    }),
  },
  floating: {
    ...Platform.select({
      ios: {
        shadowColor: '#174D37',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(23, 77, 55, 0.12)',
      } as any,
    }),
  },
});

export const Spacing = {
  // Numeric aliases
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,

  // Named aliases
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
  full: 9999,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
