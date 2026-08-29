import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getDiscoveries, getPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Discovery } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';

const LABELS: Record<string, string> = {
  learned: 'What I learned', surprised: 'What surprised me', changed: 'What changed',
  fresh: 'The Story', forget: 'The Core', surprise: 'The Shift', mind: 'The Lens',
  noticed: 'What I noticed', attention: 'What gets my attention', setdown: 'What I set down',
  part: 'What it is part of', connect: 'How it connects',
};

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Discovery | null>(null);
  const [nextAt, setNextAt] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const all = await getDiscoveries(await getDb());
      const found = all.find(d => d.id === id) ?? null;
      setItem(found);
      if (found) setNextAt(await getPreference(await getDb(), `revisitAt:${found.id}`));
    })();
  }, [id]);

  if (!item) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="chevron-left" size={22} color={colors.ink} /></Pressable>
        <Pressable onPress={() => router.push('/library')} hitSlop={12}><Feather name="more-horizontal" size={20} color={colors.ink} /></Pressable>
      </View>

      <Text style={styles.title}>{item.prompt}</Text>
      <Text style={styles.meta}>{item.category} · {new Date(item.createdAt).toLocaleDateString()}</Text>

      {Object.entries(item.findings).filter(([, t]) => t && t.trim().length > 0).map(([key, text]) => (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionLabel}>{LABELS[key] ?? key}</Text>
          <Text style={styles.sectionBody}>{text}</Text>
        </View>
      ))}

      {item.sources ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sources</Text>
          {item.sources.split('·').map((s, i) => <Text key={i} style={styles.bullet}>• {s.trim()}</Text>)}
        </View>
      ) : null}

      {nextAt ? (
        <View style={styles.nextCard}>
          <Text style={styles.nextText}>Next revisit: {new Date(nextAt).toLocaleDateString()}</Text>
          <Feather name="calendar" size={16} color={colors.copper} />
        </View>
      ) : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: typography.families.display, fontSize: 27, lineHeight: 35, color: colors.ink, marginTop: space[5] },
  meta: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone, marginTop: space[2] },
  section: { marginTop: space[6] },
  sectionLabel: { fontFamily: typography.families.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: space[2] },
  sectionBody: { fontFamily: typography.families.body, fontSize: 15, lineHeight: 24, color: colors.inkSoft },
  bullet: { fontFamily: typography.families.body, fontSize: 14, color: colors.inkSoft, marginTop: space[1] },
  nextCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.creamSunken, borderRadius: radius.sm, paddingHorizontal: space[4], paddingVertical: space[4], marginTop: space[7] },
  nextText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.ink },
});
