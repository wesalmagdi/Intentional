import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, space, typography } from '../tokens';

export interface ChipProps { label: string; active?: boolean; onPress?: () => void; }
export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.active, pressed && styles.pressed]}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.canvas },
  active: { backgroundColor: colors.ink, borderColor: colors.ink }, pressed: { opacity: 0.75 },
  label: { fontFamily: typography.families.bodyMedium, fontSize: typography.scale.bodySmall.size, color: colors.ink }, activeLabel: { color: colors.ivory },
});
