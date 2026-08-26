import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from './theme';

export function Surface({ style, ...props }: ViewProps) {
  return <View style={[styles.surface, style]} {...props} />;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
});
