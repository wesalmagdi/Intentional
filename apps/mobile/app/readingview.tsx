import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { keyConcepts, questionSeeds, type ResonantMatch } from '@intentional/resonance';
import { getReading } from '@intentional/database';
import { getDb } from '../lib/db';
import { resonantWith } from '../lib/resonance';
import type { Reading } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

function snippet(t: string): string { return t.length > 140 ? `${t.slice(0, 140)}…` : t; }

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

  if (!reading) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  const concepts = keyConcepts(reading.body, 5);
  const seeds = questionSeeds(reading.body, reading.title, 3);

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.push('/reading')}><Text style={styles.back}>← Reading Room</Text></Pressable>
      <Text style={styles.eyebrow}>READING ROOM</Text>
      <Text style={styles.headline}>{reading.title}</Text>
      <Text style={styles.meta}>{new Date(reading.createdAt).toLocaleDateString()}</Text>

      <Text style={styles.body}>{reading.body}</Text>

      {concepts.length > 0 && (
        <View style={styles.chips}>
          {concepts.map(c => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}
        </View>
      )}

      {echo !== null && (
        <View style={styles.echoCard}>
          <Text style={styles.echoLabel}>FROM YOUR LIBRARY — IT ECHOES</Text>
          <Text style={styles.echoText} numberOfLines={3}>"{snippet(echo.note.text)}"</Text>
          <Text style={styles.echoDate}>{new Date(echo.note.createdAt).toLocaleDateString()}</Text>
        </View>
      )}

      <Text style={styles.seedsLabel}>THE ROOM ASKS</Text>
      {seeds.map(seed => (
        <Pressable key={seed} style={styles.seedCard}
          onPress={() => router.push({ pathname: '/challenge', params: { prompt: seed, intention: `From "${reading.title}"`, category: 'Reading Room' } })}>
          <Text style={styles.seedText}>{seed}</Text>
          <Text style={styles.seedCta}>Begin 10 minutes →</Text>
        </Pressable>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[8], gap: space[4] },
  back: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper, marginTop: space[4] },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 27, lineHeight: 35, color: colors.ink },
  meta: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
  body: { fontFamily: typography.families.body, fontSize: 16, lineHeight: 27, color: colors.inkSoft, marginTop: space[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: { paddingHorizontal: space[3], paddingVertical: space[1] + 2, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline },
  chipText: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: colors.stone },
  echoCard: { borderWidth: 1, borderColor: colors.copper, borderRadius: radius.md, padding: space[4], gap: space[2], backgroundColor: colors.creamCard },
  echoLabel: { fontFamily: typography.families.body, fontSize: 10, letterSpacing: 1.5, color: colors.copper },
  echoText: { fontFamily: typography.families.displayItalic, fontSize: 16, lineHeight: 24, color: colors.inkSoft },
  echoDate: { fontFamily: typography.families.body, fontSize: 11, color: colors.stone },
  seedsLabel: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.stone, marginTop: space[3] },
  seedCard: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, padding: space[5], gap: space[2] },
  seedText: { fontFamily: typography.families.display, fontSize: 18, lineHeight: 26, color: colors.ink },
  seedCta: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.copper },
});
