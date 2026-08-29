import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, space } from '../tokens';

export interface SectionProps { eyebrow?: string; title?: string; description?: string; children: React.ReactNode; style?: ViewStyle; }
export function Section({ eyebrow, title, description, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      {(eyebrow || title || description) && (
        <View style={styles.header}>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[3] }, header: { gap: space[1], marginBottom: space[2] },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: typography.scale.eyebrow.size, letterSpacing: typography.scale.eyebrow.tracking, textTransform: 'uppercase', color: colors.bronze },
  title: { fontFamily: typography.families.displayItalic, fontSize: typography.scale.title.size, lineHeight: typography.scale.title.line, color: colors.ink },
  description: { fontFamily: typography.families.body, fontSize: typography.scale.bodySmall.size, lineHeight: typography.scale.bodySmall.line, color: colors.grey, marginTop: space[1] },
});
