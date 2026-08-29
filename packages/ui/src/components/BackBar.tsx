import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, typography, space } from '../tokens';

export interface BackBarProps { label?: string; onPress: () => void; onDark?: boolean; }
export function BackBar({ label = 'Back', onPress, onDark = false }: BackBarProps) {
  return (
    <Pressable style={styles.bar} onPress={onPress} hitSlop={16}>
      <Text style={[styles.arrow, onDark && styles.dark]}>←</Text>
      <Text style={[styles.label, onDark && styles.dark]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: space[2], alignSelf: 'flex-start', paddingVertical: space[2], paddingRight: space[5] },
  arrow: { fontSize: 16, color: colors.grey, marginBottom: 1 },
  label: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.grey, letterSpacing: 0.2 },
  dark: { color: colors.ivory },
});
