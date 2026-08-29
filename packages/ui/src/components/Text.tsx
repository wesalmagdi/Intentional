import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../tokens';

type Props = TextProps;
export function DisplayText({ style, ...props }: Props) { return <RNText style={[styles.display, style]} {...props} />; }
export function TitleText({ style, ...props }: Props) { return <RNText style={[styles.title, style]} {...props} />; }
export function HeadingText({ style, ...props }: Props) { return <RNText style={[styles.heading, style]} {...props} />; }
export function BodyText({ style, ...props }: Props) { return <RNText style={[styles.body, style]} {...props} />; }
export function SmallText({ style, ...props }: Props) { return <RNText style={[styles.small, style]} {...props} />; }
export function CaptionText({ style, ...props }: Props) { return <RNText style={[styles.caption, style]} {...props} />; }
export function EyebrowText({ style, ...props }: Props) { return <RNText style={[styles.eyebrow, style]} {...props} />; }

// Legacy aliases
export const Display = DisplayText; export const Title = TitleText; export const Heading = HeadingText;
export const Body = BodyText; export const Subtle = SmallText; export const Label = EyebrowText;

const styles = StyleSheet.create({
  display: { fontFamily: typography.families.displayItalic, fontSize: typography.scale.display.size, lineHeight: typography.scale.display.line, letterSpacing: typography.scale.display.tracking, color: colors.ink },
  title: { fontFamily: typography.families.display, fontSize: typography.scale.title.size, lineHeight: typography.scale.title.line, letterSpacing: typography.scale.title.tracking, color: colors.ink },
  heading: { fontFamily: typography.families.display, fontSize: typography.scale.heading.size, lineHeight: typography.scale.heading.line, letterSpacing: typography.scale.heading.tracking, color: colors.ink },
  body: { fontFamily: typography.families.body, fontSize: typography.scale.body.size, lineHeight: typography.scale.body.line, color: colors.ink },
  small: { fontFamily: typography.families.body, fontSize: typography.scale.bodySmall.size, lineHeight: typography.scale.bodySmall.line, color: colors.grey },
  caption: { fontFamily: typography.families.body, fontSize: typography.scale.caption.size, lineHeight: typography.scale.caption.line, color: colors.greyMuted },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: typography.scale.eyebrow.size, letterSpacing: typography.scale.eyebrow.tracking, textTransform: 'uppercase', color: colors.bronze },
});
