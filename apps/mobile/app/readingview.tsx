import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { keyConcepts, questionSeeds, type ResonantMatch } from '@intentional/resonance';
import { getReading } from '@intentional/database';
import { getDb } from '../lib/db';
import { resonantWith } from '../lib/resonance';
import type { Reading } from '@intentional/domain';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

function snippet(t: string): string {
  return t.length > 140 ? `${t.slice(0, 140)}…` : t;
}

export default function ReadingViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reading, setReading] = useState<Reading | null>(null);
  const [echo, setEcho] = useState<ResonantMatch | null>(null);

  useEffect(() => {
    void (async () => {
      if (typeof id !== 'string') return;
      const r = await getReading(await getDb(), id);
      setReading(r);
      if (r) setEcho(await resonantWith(r.body, { threshold: 0.1 }));
    })();
  }, [id]);

  if (!reading) return <View style={styles.blank} />;

  const concepts = keyConcepts(reading.body, 5);
  const seeds = questionSeeds(reading.body, reading.title, 3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Reading Room" onPress={() => router.push('/reading')} />
      <Label style={styles.eyebrow}>READING ROOM</Label>
      <Display style={styles.title}>{reading.title}</Display>
      <Subtle>{new Date(reading.createdAt).toLocaleDateString()}</Subtle>

      <Body style={styles.body}>{reading.body}</Body>

      {concepts.length > 0 && (
        <View style={styles.chips}>
          {concepts.map(c => (
            <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
          ))}
        </View>
      )}

      {echo !== null && (
        <View style={styles.echoCard}>
          <Subtle style={styles.echoLabel}>FROM YOUR LIBRARY — IT ECHOES</Subtle>
          <Body style={styles.echoText} numberOfLines={3}>"{snippet(echo.note.text)}"</Body>
          <Subtle style={styles.echoDate}>{new Date(echo.note.createdAt).toLocaleDateString()}</Subtle>
        </View>
      )}

      <Label style={styles.seedsLabel}>THE ROOM ASKS</Label>
      {seeds.map(seed => (
        <Pressable
          key={seed}
          style={styles.seedCard}
          onPress={() => router.push({ pathname: '/challenge', params: { prompt: seed, intention: `From "${reading.title}"`, category: 'Reading Room' } })}
        >
          <Body style={styles.seedText}>{seed}</Body>
          <Subtle style={styles.seedCta}>Begin 10 minutes →</Subtle>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38 },
  body: { fontSize: 17, lineHeight: 28, marginTop: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.divider },
  chipText: { fontFamily: theme.fonts.bodyMedium, fontSize: 12, color: theme.colors.grey },
  echoCard: { borderWidth: 1, borderColor: theme.colors.bronze, borderRadius: theme.radius.md, padding: 18, gap: 8, backgroundColor: theme.colors.background },
  echoLabel: { color: theme.colors.bronze, letterSpacing: 1.5, fontSize: 10 },
  echoText: { fontFamily: theme.fonts.displayItalic, fontSize: 17, lineHeight: 25 },
  echoDate: { fontSize: 12, letterSpacing: 1 },
  seedsLabel: { letterSpacing: 1.2, fontSize: 10, marginTop: theme.spacing.sm },
  seedCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: 20, gap: 10 },
  seedText: { fontFamily: theme.fonts.display, fontSize: 19, lineHeight: 27 },
  seedCta: { color: theme.colors.bronze },
});
