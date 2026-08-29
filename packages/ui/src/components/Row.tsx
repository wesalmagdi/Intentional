import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, typography, space } from '../tokens';

export interface RowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trailing?: 'chevron' | 'arrow' | 'none';
  onPress?: () => void;
  rightIcon?: React.ReactNode;
}

export function Row({ title, subtitle, icon, trailing = 'chevron', onPress, rightIcon }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightIcon}
      {trailing === 'chevron' && <Text style={styles.chevron}>›</Text>}
      {trailing === 'arrow' && <Text style={styles.arrow}>→</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[4],
    gap: space[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  pressed: { opacity: 0.7 },
  iconBox: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: {
    fontFamily: typography.families.bodySemibold,
    fontSize: typography.scale.body.size,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.scale.bodySmall.size,
    color: colors.grey,
  },
  chevron: { fontSize: 18, color: colors.greyMuted, marginLeft: 'auto' },
  arrow: { fontSize: 16, color: colors.bronze, marginLeft: 'auto' },
});
