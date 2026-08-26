import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from './theme';

export function Title({ style, ...props }: TextProps) {
  return <RNText style={[styles.title, style]} {...props} />;
}

export function Heading({ style, ...props }: TextProps) {
  return <RNText style={[styles.heading, style]} {...props} />;
}

export function Body({ style, ...props }: TextProps) {
  return <RNText style={[styles.body, style]} {...props} />;
}

export function Subtle({ style, ...props }: TextProps) {
  return <RNText style={[styles.subtle, style]} {...props} />;
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '700', color: theme.colors.text, letterSpacing: -0.5 },
  heading: { fontSize: 20, fontWeight: '600', color: theme.colors.text },
  body: { fontSize: 16, lineHeight: 24, color: theme.colors.text },
  subtle: { fontSize: 14, color: theme.colors.subtle, lineHeight: 20 },
});
