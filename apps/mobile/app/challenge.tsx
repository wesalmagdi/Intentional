import { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCountdown } from '../lib/timer';
import { Display, Body, Subtle, theme } from '@intentional/ui';

export default function ChallengeScreen() {
  const { prompt, intention, category } = useLocalSearchParams();
  const { remainingMs, isPaused, pause, resume, isDone } = useCountdown(10 * 60 * 1000);

  useEffect(() => { if (isDone) router.replace({ pathname: '/reflection', params: { prompt, intention, category } }); }, [isDone]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <Subtle style={styles.timer}>{minutes}:{seconds}</Subtle>
      <Display style={styles.prompt}>{prompt}</Display>
      {intention ? <Body style={styles.intention}>Focus: {intention}</Body> : null}
      <View style={styles.bottom}>
        <Subtle style={styles.copy}>Search. Read. Follow the question.{"\n"}You can leave the app.</Subtle>
        <Pressable style={styles.btn} onPress={() => isPaused ? resume() : pause()}>
          <Body style={styles.btnText}>{isPaused ? 'Resume' : 'Pause'}</Body>
        </Pressable>
        <Pressable onPress={() => router.replace({ pathname: '/reflection', params: { prompt, intention, category } })}>
          <Subtle style={styles.early}>Finish Early</Subtle>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.forestDeep, padding: theme.spacing.lg, justifyContent: 'space-between' },
  timer: { color: theme.colors.ivory, opacity: 0.6, fontSize: 16, fontFamily: theme.fonts.bodySemibold, letterSpacing: 2, textAlign: 'center', marginTop: 40 },
  prompt: { color: theme.colors.ivory, fontSize: 32, lineHeight: 42, textAlign: 'center', paddingHorizontal: 20 },
  intention: { color: theme.colors.ivory, opacity: 0.7, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  bottom: { alignItems: 'center', gap: 30, marginBottom: 40 },
  copy: { color: theme.colors.ivory, opacity: 0.5, textAlign: 'center', lineHeight: 24 },
  btn: { borderWidth: 1, borderColor: theme.colors.ivory, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  btnText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
  early: { color: theme.colors.ivory, opacity: 0.6, textDecorationLine: 'underline' }
});
