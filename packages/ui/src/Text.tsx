import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from './theme';

export function Display({ style, ...props }: TextProps) {
  return <RNText style={[styles.display, style]} {...props} />;
}

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

export function Label({ style, ...props }: TextProps) {
  return <RNText style={[styles.label, style]} {...props} />;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: theme.fonts.display,
    fontSize: 34,
    lineHeight: 42,
    color: theme.colors.ink,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 28,
    lineHeight: 36,
    color: theme.colors.ink,
  },
  heading: {
    fontFamily: theme.fonts.display,
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.ink,
  },
  body: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: theme.colors.ink,
  },
  subtle: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.grey,
  },
  label: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: theme.colors.grey,
  },
});
