import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, space, elevation } from '../tokens';

export function Surface({ style, ...props }: ViewProps) {
  return <View style={[styles.surface, style]} {...props} />;
}

const styles = StyleSheet.create({
  surface: { backgroundColor: colors.elevated, padding: space[5], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...elevation.subtle },
});
