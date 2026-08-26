import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from './theme';

interface BackBarProps {
  label?: string;
  onPress: () => void;
  onDark?: boolean;
}

export function BackBar({ label = 'Back', onPress, onDark = false }: BackBarProps) {
  return (
    <Pressable style={styles.bar} onPress={onPress} hitSlop={16}>
      <Text style={[styles.arrow, onDark && styles.dark]}>←</Text>
      <Text style={[styles.label, onDark && styles.dark]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 20 },
  arrow: { fontSize: 16, color: theme.colors.grey, marginBottom: 1 },
  label: { fontFamily: theme.fonts.bodyMedium, fontSize: 13, color: theme.colors.grey, letterSpacing: 0.2 },
  dark: { color: theme.colors.ivory },
});
