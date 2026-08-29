import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, space } from '../tokens';

export interface HairlineProps { label?: string; variant?: 'solid' | 'dashed'; spacing?: 'compact' | 'normal' | 'loose'; }
export function Hairline({ label, variant = 'solid', spacing = 'normal' }: HairlineProps) {
  const margin = spacing === 'compact' ? space[3] : spacing === 'loose' ? space[6] : space[4];
  return (
    <View style={[styles.wrap, { marginVertical: margin }]}>
      <View style={[styles.line, variant === 'dashed' && styles.dashed]} />
      {label && (<><View style={styles.gap} /><Text style={styles.label}>{label}</Text><View style={styles.gap} /><View style={[styles.line, variant === 'dashed' && styles.dashed, styles.lineFill]} /></>)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' }, line: { flex: 1, height: 1, backgroundColor: colors.hairline }, lineFill: { flex: 1 },
  dashed: { borderStyle: 'dashed', borderWidth: 0.5, borderColor: colors.hairline, backgroundColor: 'transparent', height: 0 },
  gap: { width: space[3] }, label: { fontFamily: typography.families.bodySemibold, fontSize: typography.scale.eyebrow.size, letterSpacing: typography.scale.eyebrow.tracking, textTransform: 'uppercase', color: colors.greyMuted },
});
