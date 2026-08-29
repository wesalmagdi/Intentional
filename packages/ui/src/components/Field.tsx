import React, { useState } from 'react';
import { View, TextInput, TextInputProps, Text, StyleSheet } from 'react-native';
import { colors, typography, space, radius } from '../tokens';

export interface FieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'underline' | 'boxed';
  multiline?: boolean;
}

export function Field({
  label, hint, error, icon, variant = 'underline', multiline, style, ...inputProps
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          variant === 'boxed' ? styles.boxed : styles.underline,
          focused && styles.focused,
          error && styles.error,
        ]}
      >
        {icon && <View style={[styles.icon, multiline && { marginTop: 4 }]}>{icon}</View>}
        <TextInput
          style={[styles.input, multiline && styles.multiline, style]}
          placeholderTextColor={colors.greyMuted}
          multiline={multiline}
          onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e); }}
          {...inputProps}
        />
      </View>
      {(hint || error) && (
        <Text style={[styles.hint, error && styles.errorText]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  label: {
    fontFamily: typography.families.bodySemibold,
    fontSize: typography.scale.eyebrow.size,
    letterSpacing: typography.scale.eyebrow.tracking,
    textTransform: 'uppercase',
    color: colors.grey,
    marginBottom: space[1],
  },
  field: { flexDirection: 'row', alignItems: 'flex-start' },
  underline: { borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingVertical: space[2] },
  boxed: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: space[3], paddingVertical: space[2] },
  focused: { borderBottomColor: colors.bronze, borderColor: colors.bronze },
  error: { borderBottomColor: colors.danger, borderColor: colors.danger },
  icon: { marginRight: space[2], marginTop: 2 },
  input: { flex: 1, fontFamily: typography.families.body, fontSize: typography.scale.body.size, lineHeight: typography.scale.body.line, color: colors.ink, paddingVertical: 0 },
  multiline: { minHeight: 110, textAlignVertical: 'top', paddingTop: space[1] },
  hint: { fontFamily: typography.families.body, fontSize: typography.scale.caption.size, color: colors.grey, marginTop: space[1] },
  errorText: { color: colors.danger },
});
