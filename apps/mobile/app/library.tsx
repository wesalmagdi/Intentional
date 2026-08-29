import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Discovery } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Discovery[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => { void (async () => setItems(await getDiscoveries(await getDb())))(); }, []);

  const shelves = ['All', ...Array.from(new Set(items.map(i => i.folderName || i.category)))];
  const visible = filter === 'All' ? items : items.filter(i => (i.folderName || i.category) === filter);

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.push('/')}><Text style={styles.back}>← Home</Text></Pressable>
      <Text style={styles.eyebrow}>LIBRARY</Text>
      <Text style={styles.headline}>What you've kept.</Text>

      {items.length > 0 && (
        <View style={styles.chips}>
          {shelves.map(s => (
            <Pressable key={s} style={[styles.chip, filter === s && styles.chipActive]} onPress={() => setFilter(s)}>
              <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {visible.length === 0 && <Text style={styles.empty}>Nothing here yet.</Text>}
      {visible.map(d => (
        <Pressable key={d.id} onPress={() => router.push({ pathname: '/discovery', params: { id: d.id } })}>
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>{d.folderName || d.category}</Text>
            <Text style={styles.prompt}>"{d.prompt}"</Text>
            {Object.values(d.findings).filter(t => t && t.trim().length > 0).slice(0, 2).map((text, i) => (
              <Text key={i} style={styles.finding} numberOfLines={2}>{text}</Text>
            ))}
            <View style={styles.rule} />
            <View style={styles.footer}>
              <Text style={styles.date}>{new Date(d.createdAt).toLocaleDateString()}</Text>
              {d.sources ? <Text style={styles.sources} numberOfLines={1}>{d.sources}</Text> : null}
            </View>
          </View>
        </Pressable>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: 0, gap: space[4] },
  back: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper, marginTop: space[4] },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 28, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: { paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.ink },
  chipTextActive: { color: colors.cream },
  empty: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, marginTop: space[3] },
  card: { backgroundColor: colors.creamCard, padding: space[5], borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline, gap: space[3], marginBottom: space[3] },
  cardEyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 10, letterSpacing: 1.2, color: colors.copper },
  prompt: { fontFamily: typography.families.displayItalic, fontSize: 20, lineHeight: 28, color: colors.ink },
  finding: { fontFamily: typography.families.body, fontSize: 14, lineHeight: 22, color: colors.inkSoft },
  rule: { height: 1, backgroundColor: colors.hairline, marginTop: space[1] },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
  sources: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone, fontStyle: 'italic', flex: 1, textAlign: 'right' },
});
