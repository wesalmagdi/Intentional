import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from './theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'ondark';
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'ondark' && styles.onDark,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'ghost' && styles.ghostText,
          variant === 'ondark' && styles.onDarkText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.bronze,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  onDark: {
    backgroundColor: theme.colors.ivory,
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: theme.colors.ivory,
  },
  ghostText: {
    color: theme.colors.bronze,
  },
  onDarkText: {
    color: theme.colors.forest,
  },
});
