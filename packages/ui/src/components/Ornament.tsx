import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography } from '../tokens';

export type OrnamentKind = 'fleuron' | 'asterism' | 'dot' | 'rule';
export interface OrnamentProps { kind?: OrnamentKind; style?: ViewStyle; }
const GLYPHS: Record<OrnamentKind, string> = { fleuron: '❦', asterism: '⁂', dot: '·', rule: '———' };

export function Ornament({ kind = 'fleuron', style }: OrnamentProps) {
  return <Text style={[styles.ornament, style]}>{GLYPHS[kind]}</Text>;
}

const styles = StyleSheet.create({
  ornament: { fontFamily: typography.families.display, fontSize: 18, color: colors.bronze, textAlign: 'center' },
});
