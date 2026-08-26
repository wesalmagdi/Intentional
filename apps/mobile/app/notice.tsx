import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useCountdown } from '../lib/timer';
import { NOTICE_PROMPTS, promptForDay } from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function NoticeScreen() {
  const prompt = promptForDay(NOTICE_PROMPTS, new Date());
  const { remainingMs, isDone } = useCountdown(60_000);
  const [phase, setPhase] = useState<'wait' | 'write' | 'kept'>('wait');
  const [text, setText] = useState('');

  useEffect(() => {
    if (isDone) setPhase(p => (p === 'wait' ? 'write' : p));
  }, [isDone]);

  async function handleKeep() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(),
      userId: 'local',
      category: 'Notice',
      prompt,
      findings: { noticed: trimmed },
      createdAt: new Date().toISOString(),
    });
    setPhase('kept');
  }

  if (phase === 'kept') {
    return (
      <View style={styles.center}>
        <Display>Kept.</Display>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
      </View>
    );
  }

  if (phase === 'write') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Label>NOTICE</Label>
        <Display style={styles.headline}>{prompt}</Display>
        <TextInput
          style={styles.input}
          multiline
          autoFocus
          placeholder="One line is enough."
          placeholderTextColor={theme.colors.grey}
          value={text}
          onChangeText={setText}
        />
        <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}>
          <Body style={styles.keepText}>Keep this.</Body>
        </Pressable>
      </ScrollView>
    );
  }

  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <View style={styles.center}>
      <Label>NOTICE</Label>
      <Display style={styles.headline}>Look up.</Display>
      <Subtle style={styles.centerSub}>{prompt}{"\n"}For one minute, just notice.</Subtle>
      <Subtle style={styles.timer}>{seconds}</Subtle>
      <Pressable onPress={() => setPhase('write')}>
        <Subtle style={styles.early}>I'm ready</Subtle>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 60 },
  center: { flex: 1, padding: theme.spacing.lg, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  centerSub: { textAlign: 'center', lineHeight: 24 },
  headline: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38 },
  timer: { fontSize: 28, fontFamily: theme.fonts.bodySemibold, color: theme.colors.bronze, letterSpacing: 2 },
  early: { textDecorationLine: 'underline' },
  input: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: theme.spacing.md, fontSize: 17, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 110, textAlignVertical: 'top', backgroundColor: theme.colors.surface, lineHeight: 26 },
  keepBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 20 },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  homeBtn: { paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.sm },
  homeText: { fontFamily: theme.fonts.bodySemibold },
});
