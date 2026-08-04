import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

import { Brand, Primary } from '@/constants/theme';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'hero';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  variant = 'primary',
  fullWidth,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'hero' && styles.hero,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && variant === 'hero' && styles.heroPressed,
        pressed && !disabled && variant !== 'hero' && styles.pressed,
        style as ViewStyle,
      ]}
      {...rest}>
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.labelPrimary,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'ghost' && styles.labelGhost,
          variant === 'hero' && styles.labelHero,
          disabled && styles.labelDisabled,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primary: {
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
  },
  secondary: {
    backgroundColor: '#fff',
    borderBottomWidth: 4,
    borderBottomColor: '#dfe6f3',
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  hero: {
    backgroundColor: Primary.primary,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    shadowColor: Brand.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ translateY: 2 }], shadowOpacity: 0 },
  heroPressed: { transform: [{ translateY: 4 }], shadowOffset: { width: 0, height: 0 } },
  label: { fontSize: 18, fontWeight: '800' },
  labelPrimary: { color: '#fff' },
  labelSecondary: { color: Brand.primary },
  labelGhost: { color: Brand.primary },
  labelHero: {
    color: '#fff',
    fontFamily: 'SplineSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  labelDisabled: { color: 'rgba(255,255,255,0.8)' },
});
