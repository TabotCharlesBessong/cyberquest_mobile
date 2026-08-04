import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export const Brand = {
  primary: '#005db8',
  primaryDark: '#00468c',
  accent: '#7b3bc3',
  success: '#2BC48A',
  warning: '#F59E0B',
  danger: '#BA1A1A',
  surface: '#F8F9FF',
  card: '#FFFFFF',
  shadow: 'rgba(77, 150, 255, 0.12)',
} as const;

export const Surface = {
  surface: '#F8F9FF',
  surfaceDim: '#D7DAE2',
  surfaceBright: '#F8F9FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F0F4FB',
  surfaceContainer: '#EBEFF6',
  surfaceContainerHigh: '#E5E8F0',
  surfaceContainerHighest: '#DFE2EA',
  surfaceVariant: '#DFE2EA',
  onSurface: '#181C21',
  onSurfaceVariant: '#414753',
  outline: '#727784',
  outlineVariant: '#C1C6D5',
  inverseSurface: '#2C3137',
  inverseOnSurface: '#EEF1F9',
} as const;

export const Primary = {
  primary: '#005DB8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#4D96FF',
  onPrimaryContainer: '#002E61',
  inversePrimary: '#A9C7FF',
  primaryFixed: '#D6E3FF',
  primaryFixedDim: '#A9C7FF',
  onPrimaryFixed: '#001B3E',
  onPrimaryFixedVariant: '#00468C',
} as const;

export const Secondary = {
  secondary: '#7B3BC3',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#B374FE',
  onSecondaryContainer: '#41007A',
  secondaryFixed: '#EEDBFF',
  secondaryFixedDim: '#DAB9FF',
  onSecondaryFixed: '#2A0053',
  onSecondaryFixedVariant: '#611BAA',
} as const;

export const Tertiary = {
  tertiary: '#775A00',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#BD9000',
  onTertiaryContainer: '#3D2D00',
  tertiaryFixed: '#FFDF9A',
  tertiaryFixedDim: '#F4BF32',
  onTertiaryFixed: '#251A00',
  onTertiaryFixedVariant: '#5A4300',
} as const;

export const Error = {
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
} as const;

export const Avatars = ['🦊', '🐱', '🐶', '🦁', '🐼', '🐸', '🦄', '🐯', '🐵', '🐢'];

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  displayHero: {
    fontFamily: 'Spline Sans',
    fontSize: 48,
    fontWeight: '800' as const,
    lineHeight: 56,
    letterSpacing: -0.02,
  },
  headlineLg: {
    fontFamily: 'Spline Sans',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  headlineLgMobile: {
    fontFamily: 'Spline Sans',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  headlineMd: {
    fontFamily: 'Spline Sans',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  labelCaps: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 16,
    letterSpacing: 0.05,
  },
} as const;

export const Rounded = {
  sm: 8,
  DEFAULT: 16,
  md: 24,
  lg: 32,
  xl: 48,
  full: 9999,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Layout = {
  unit: 8,
  containerMarginMobile: 20,
  containerMarginDesktop: 40,
  gutter: 16,
  stackSm: 8,
  stackMd: 24,
  stackLg: 48,
  maxContentWidth: 1200,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = Layout.maxContentWidth;