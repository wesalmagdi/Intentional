import { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCountdown } from '../lib/timer';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

const TOTAL = 10 * 60 * 1000;

export default function ChallengeScreen() {
  const { prompt, intention, category } = useLocalSearchParams();
  const { remainingMs, isPaused, pause, resume, isDone } = useCountdown(TOTAL);

  useEffect(() => {
    if (isDone) router.replace({ pathname: '/reflection', params: { prompt, intention, category } });
  }, [isDone]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');
  const progress = (TOTAL - remainingMs) / TOTAL;

  function finish() {
    router.replace({ pathname: '/reflection', params: { prompt, intention, category } });
  }

  return (
    <LinearGradient colors={[theme.colors.forest, theme.colors.forestDeep]} style={styles.gradient}>
      <Text style={styles.ghost}>?</Text>

      <View style={styles.top}>
        <BackBar label="Leave" onPress={() => router.push('/')} onDark />
        {isPaused && <Label style={styles.pausedLabel}>PAUSED — THE CLOCK IS SAFE</Label>}
      </View>

      <View style={styles.middle}>
        <Text style={styles.timer}>{minutes}:{seconds}</Text>
        <Display style={styles.question}>{prompt}</Display>
        {intention ? <Body style={styles.focus}>Focus — {intention}</Body> : null}
      </View>

      <View style={styles.bottom}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(progress * 100).toFixed(1)}%` as any }]} />
        </View>
        <Subtle style={styles.copy}>Search. Read. Follow the question. You can leave the app.</Subtle>
        <Pressable style={styles.pill} onPress={() => (isPaused ? resume() : pause())}>
          <Body style={styles.pillText}>{isPaused ? 'Resume' : 'Pause'}</Body>
        </Pressable>
        <Pressable onPress={finish} hitSlop={12}>
          <Subtle style={styles.early}>Finish early</Subtle>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, padding: theme.spacing.lg },
  ghost: { position: 'absolute', top: 90, right: -20, fontFamily: theme.fonts.displayItalic, fontSize: 260, color: theme.colors.ivory, opacity: 0.04 },
  top: { marginTop: 40, alignItems: 'flex-start', gap: 12 },
  pausedLabel: { color: theme.colors.ivory, opacity: 0.6, letterSpacing: 1.5 },
  middle: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.lg },
  timer: { fontFamily: theme.fonts.bodySemibold, fontSize: 42, letterSpacing: 6, color: theme.colors.ivory, opacity: 0.9 },
  question: { color: theme.colors.ivory, fontSize: 32, lineHeight: 42, textAlign: 'center' },
  focus: { color: theme.colors.ivory, opacity: 0.65, fontStyle: 'italic' },
  bottom: { alignItems: 'center', gap: theme.spacing.lg, marginBottom: 30 },
  track: { alignSelf: 'stretch', height: 2, backgroundColor: 'rgba(247,245,240,0.15)', borderRadius: 1, overflow: 'hidden' },
  fill: { height: 2, backgroundColor: theme.colors.ivory, opacity: 0.85 },
  copy: { color: theme.colors.ivory, opacity: 0.5, textAlign: 'center', lineHeight: 22 },
  pill: { borderWidth: 1, borderColor: 'rgba(247,245,240,0.5)', paddingHorizontal: 44, paddingVertical: 14, borderRadius: 30 },
  pillText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
  early: { color: theme.colors.ivory, opacity: 0.6, textDecorationLine: 'underline' },
});
