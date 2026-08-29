import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, space, radius } from '../tokens';

export interface PullQuoteProps { text: string; attribution?: string; }
export function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar} />
      <View style={styles.content}>
        <Text style={styles.text}>"{text}"</Text>
        {attribution && <Text style={styles.attribution}>— {attribution}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingVertical: space[4], paddingHorizontal: space[2] },
  bar: { width: 2, backgroundColor: colors.bronze, borderRadius: radius.hair, marginRight: space[4] },
  content: { flex: 1, gap: space[2] },
  text: { fontFamily: typography.families.displayItalic, fontSize: 22, lineHeight: 30, color: colors.inkSoft },
  attribution: { fontFamily: typography.families.bodySemibold, fontSize: typography.scale.caption.size, color: colors.grey, letterSpacing: 0.5 },
});
