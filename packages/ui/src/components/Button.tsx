import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors, radius, space, typography } from '../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'ondark';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  label, variant = 'primary', size = 'md', loading, fullWidth, style, disabled, leftIcon, rightIcon, ...props
}: ButtonProps) {
  const sStyle = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const vStyle = variant === 'primary' ? styles.primary : variant === 'secondary' ? styles.secondary : variant === 'ghost' ? styles.ghost : variant === 'outline' ? styles.outline : styles.ondark;
  const textColor = variant === 'primary' ? colors.ivory : variant === 'secondary' ? colors.ink : variant === 'ghost' ? colors.bronze : variant === 'outline' ? colors.ink : colors.forest;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sStyle,
        vStyle,
        fullWidth && styles.fullWidth,
        (pressed || disabled) && styles.pressed,
        style as any,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {leftIcon}
          <Text style={[styles.label, { color: textColor, fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15 }]}>
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  sizeSm: { paddingVertical: space[2], paddingHorizontal: space[3] },
  sizeMd: { paddingVertical: space[3] + 2, paddingHorizontal: space[5] },
  sizeLg: { paddingVertical: space[4], paddingHorizontal: space[6] },
  inner: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  label: { fontFamily: typography.families.bodySemibold, letterSpacing: 0.2 },
  primary: { backgroundColor: colors.bronze },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.bronze },
  ondark: { backgroundColor: colors.ivory },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.7 },
});
