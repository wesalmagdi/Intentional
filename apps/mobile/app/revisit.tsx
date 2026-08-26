import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { isRevisitWorthy, type Discovery } from '@intentional/domain';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function RevisitScreen() {
  const [pool, setPool] = useState<Discovery[]>([]);
  const [current, setCurrent] = useState<Discovery | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [memory, setMemory] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    void (async () => {
      const all = await getDiscoveries(await getDb());
      const worthy = all.filter(d => isRevisitWorthy(d.createdAt, new Date()));
      setPool(worthy);
      setCurrent(worthy[0] ?? null);
      setLoaded(true);
    })();
  }, []);

  function another() {
    if (pool.length === 0) return;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(next);
    setMemory('');
    setRevealed(false);
  }

  if (!loaded) return <View style={styles.center} />;

  if (current === null) {
    return (
      <View style={styles.center}>
        <Label>REVISIT</Label>
        <Display style={styles.headline}>Nothing is ready yet.</Display>
        <Subtle style={styles.centerSub}>Discoveries ripen for a few days{"\n"}before they're worth revisiting.</Subtle>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
      </View>
    );
  }

  const original = Object.values(current.findings).filter(t => t && t.trim().length > 0).join('\n\n');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label style={styles.revisitLabel}>REVISIT</Label>
      <Subtle>{new Date(current.createdAt).toLocaleDateString()} • {current.category}</Subtle>
      <Display style={styles.headline}>"{current.prompt}"</Display>

      {!revealed ? (
        <>
          <Body style={styles.ask}>What do you remember?</Body>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Write what stayed with you..."
            placeholderTextColor={theme.colors.grey}
            value={memory}
            onChangeText={setMemory}
          />
          <Pressable style={styles.keepBtn} onPress={() => setRevealed(true)}>
            <Body style={styles.keepText}>Reveal</Body>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.compare}>
            <Subtle style={styles.compareLabel}>YOU REMEMBERED</Subtle>
            <Body style={styles.compareText}>{memory.trim().length > 0 ? memory : '…'}</Body>
            <Subtle style={[styles.compareLabel, styles.compareGap]}>ORIGINALLY</Subtle>
            <Body style={styles.compareText}>{original || '…'}</Body>
          </View>
          <Subtle style={styles.closing}>Memory is a practice.</Subtle>
          <View style={styles.actions}>
            <Pressable style={styles.keepBtn} onPress={another}><Body style={styles.keepText}>Another</Body></Pressable>
            <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.lg },
  centerSub: { textAlign: 'center', lineHeight: 24 },
  revisitLabel: { color: theme.colors.bronze, letterSpacing: 1.5 },
  headline: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38 },
  ask: { fontFamily: theme.fonts.bodySemibold, marginTop: 10 },
  input: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: theme.spacing.md, fontSize: 17, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 130, textAlignVertical: 'top', backgroundColor: theme.colors.surface, lineHeight: 26 },
  keepBtn: { flex: 1, backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 20 },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  compare: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: 24, gap: 10, marginTop: 10 },
  compareLabel: { letterSpacing: 1.5, color: theme.colors.bronze },
  compareGap: { marginTop: 14 },
  compareText: { lineHeight: 26 },
  closing: { fontFamily: theme.fonts.displayItalic, fontSize: 18, textAlign: 'center', marginTop: 20 },
  actions: { flexDirection: 'row', gap: 16 },
  homeBtn: { flex: 1, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.divider, marginTop: 20 },
  homeText: { fontFamily: theme.fonts.bodySemibold },
});
