import React from 'react';
import { View, ViewProps, StyleSheet, Pressable } from 'react-native';
import { colors, radius, elevation, space } from '../tokens';

export type CardVariant = 'elevated' | 'sunken' | 'ghost' | 'accent';
export interface CardProps extends ViewProps { 
  variant?: CardVariant; 
  padding?: keyof typeof space | 0; 
  onPress?: () => void; 
}

export function Card({ variant = 'elevated', padding = 5, style, onPress, children, ...props }: CardProps) {
  const vStyle = variant === 'elevated' ? styles.elevated : variant === 'sunken' ? styles.sunken : variant === 'accent' ? styles.accent : styles.ghost;
  
  // Resolve padding: if it's 0, use 0. Otherwise, look it up in the space scale.
  const padValue = padding === 0 ? 0 : space[padding as keyof typeof space];

  const content = (
    <View style={[styles.base, vStyle, { padding: padValue }, style]} {...(onPress ? {} : props)}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, overflow: 'hidden' },
  elevated: { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border, ...elevation.card },
  sunken: { backgroundColor: colors.sunken, borderWidth: 1, borderColor: colors.borderSubtle },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.hairline },
  accent: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.bronzeHairline, borderLeftWidth: 3, borderLeftColor: colors.bronze },
  pressed: { opacity: 0.85 },
});
