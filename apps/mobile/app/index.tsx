import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import { isRevisitWorthy, type Discovery } from '@intentional/domain';

const ROWS: Array<[string, string]> = [
  ['Journal', '/journal'],
  ['Notice', '/notice'],
  ['Choose', '/choose'],
  ['Zoom Out', '/zoomout'],
  ['Library', '/library'],
];

export default function HomeScreen() {
  const [memory, setMemory] = useState<Discovery | null>(null);

  useEffect(() => {
    void (async () => {
      const all = await getDiscoveries(await getDb());
      const worthy = all.filter(d => isRevisitWorthy(d.createdAt, new Date()));
      setMemory(worthy[0] ?? null);
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>INTENTIONAL</Label>
      <Display style={styles.title}>A quiet place to begin.</Display>

      <Pressable style={styles.hero} onPress={() => router.push('/learn')}>
        <Subtle style={styles.heroLabel}>THE RITUAL</Subtle>
        <Display style={styles.heroTitle}>Learn</Display>
        <Body style={styles.heroSub}>A 10-minute search for what matters.</Body>
      </Pressable>

      {memory !== null && (
        <Pressable style={styles.memory} onPress={() => router.push('/revisit')}>
          <Subtle style={styles.memoryLabel}>A MEMORY SURFACES</Subtle>
          <Body style={styles.memoryText} numberOfLines={2}>"{memory.prompt}"</Body>
          <Subtle style={styles.memoryCta}>Revisit →</Subtle>
        </Pressable>
      )}

      <View style={styles.list}>
        {ROWS.map(([label, path]) => (
          <Pressable key={path} style={styles.row} onPress={() => router.push(path as never)}>
            <Body>{label}</Body>
            <Subtle>→</Subtle>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingTop: 60, paddingBottom: 80 },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 34, lineHeight: 42 },
  hero: { backgroundColor: theme.colors.surface, padding: 30, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.divider, gap: 12, marginTop: 10 },
  heroLabel: { letterSpacing: 1.5 },
  heroTitle: { fontSize: 28 },
  heroSub: { marginTop: 8 },
  memory: { padding: 24, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.bronze, gap: 10, backgroundColor: theme.colors.background },
  memoryLabel: { color: theme.colors.bronze, letterSpacing: 1.5 },
  memoryText: { fontFamily: theme.fonts.displayItalic, fontSize: 18, lineHeight: 26 },
  memoryCta: { color: theme.colors.bronze },
  list: { marginTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
});
