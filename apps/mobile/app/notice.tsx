import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Animated } from 'react-native';
import { router } from 'expo-router';
import { useCountdown } from '../lib/timer';
import { NOTICE_PROMPTS, promptForDay } from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

function BreathCircle({ onDone }: { onDone: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [label, setLabel] = useState('Breathe in.');
  const fired = useRef(false);

  useEffect(() => {
    let alive = true;
    const run = (cycle: number) => {
      if (!alive) return;
      if (cycle >= 2) {
        if (!fired.current) { fired.current = true; onDone(); }
        return;
      }
      setLabel('Breathe in.');
      Animated.timing(scale, { toValue: 1.4, duration: 4000, useNativeDriver: true }).start(() => {
        if (!alive) return;
        setLabel('Hold.');
        setTimeout(() => {
          if (!alive) return;
          setLabel('Let it go.');
          Animated.timing(scale, { toValue: 1, duration: 6000, useNativeDriver: true }).start(() => run(cycle + 1));
        }, 4000);
      });
    };
    run(0);
    return () => { alive = false; };
  }, []);

  return (
    <View style={styles.breathWrap}>
      <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]} />
      <Subtle style={styles.breathLabel}>{label}</Subtle>
    </View>
  );
}

export default function NoticeScreen() {
  const prompt = promptForDay(NOTICE_PROMPTS, new Date());
  const { remainingMs, isDone } = useCountdown(60_000);
  const [phase, setPhase] = useState<'arrive' | 'wait' | 'write' | 'kept'>('arrive');
  const [text, setText] = useState('');

  useEffect(() => {
    if (isDone) setPhase(p => (p === 'wait' ? 'write' : p));
  }, [isDone]);

  async function handleKeep() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(), userId: 'local', category: 'Notice', prompt,
      findings: { noticed: trimmed }, createdAt: new Date().toISOString(),
    });
    setPhase('kept');
  }

  if (phase === 'kept') {
    return (
      <View style={styles.screen}>
        <View style={styles.center}>
          <Body style={styles.ornament}>❦</Body>
          <Display>Kept.</Display>
          <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'write') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <BackBar label="Home" onPress={() => router.push('/')} />
        <Label style={styles.eyebrow}>NOTICE</Label>
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

  if (phase === 'arrive') {
    return (
      <View style={styles.screen}>
        <View style={styles.top}><BackBar label="Home" onPress={() => router.push('/')} /></View>
        <View style={styles.center}>
          <Label style={styles.eyebrow}>NOTICE</Label>
          <Display style={styles.headline}>Arrive first.</Display>
          <BreathCircle onDone={() => setPhase('wait')} />
          <Pressable onPress={() => setPhase('wait')} hitSlop={12}>
            <Subtle style={styles.early}>I'm here already</Subtle>
          </Pressable>
        </View>
      </View>
    );
  }

  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <View style={styles.screen}>
      <View style={styles.top}><BackBar label="Home" onPress={() => router.push('/')} /></View>
      <View style={styles.center}>
        <Label style={styles.eyebrow}>NOTICE</Label>
        <Display style={styles.headline}>Look up.</Display>
        <Subtle style={styles.centerSub}>{prompt}{"\n"}For one minute, just notice.</Subtle>
        <Subtle style={styles.timer}>{seconds}</Subtle>
        <Pressable onPress={() => setPhase('write')} hitSlop={12}>
          <Subtle style={styles.early}>I'm ready</Subtle>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: theme.spacing.lg, paddingTop: 60 },
  top: { alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5 },
  headline: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38 },
  centerSub: { textAlign: 'center', lineHeight: 24 },
  timer: { fontSize: 30, fontFamily: theme.fonts.bodySemibold, color: theme.colors.bronze, letterSpacing: 3 },
  early: { textDecorationLine: 'underline' },
  ornament: { color: theme.colors.bronze, fontSize: 22 },
  breathWrap: { alignItems: 'center', gap: theme.spacing.md, marginVertical: theme.spacing.lg },
  breathCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(122,102,82,0.15)', borderWidth: 1, borderColor: theme.colors.bronze },
  breathLabel: { fontStyle: 'italic' },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 80 },
  input: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: theme.spacing.md, fontSize: 17, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 110, textAlignVertical: 'top', backgroundColor: theme.colors.surface, lineHeight: 26 },
  keepBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.sm },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  homeBtn: { paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.sm },
  homeText: { fontFamily: theme.fonts.bodySemibold },
});
