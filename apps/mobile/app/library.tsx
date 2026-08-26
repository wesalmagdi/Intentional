import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Discovery } from '@intentional/domain';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function LibraryScreen() {
  const [items, setItems] = useState<Discovery[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => { void (async () => setItems(await getDiscoveries(await getDb())))(); }, []);

  const shelves = ['All', ...Array.from(new Set(items.map(i => i.folderName || i.category)))];
  const visible = filter === 'All' ? items : items.filter(i => (i.folderName || i.category) === filter);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Home" onPress={() => router.push('/')} />
      <Label style={styles.eyebrow}>LIBRARY</Label>
      <Display>What you've kept.</Display>

      {items.length > 0 && (
        <View style={styles.chips}>
          {shelves.map(s => (
            <Pressable key={s} style={[styles.chip, filter === s && styles.chipActive]} onPress={() => setFilter(s)}>
              <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {visible.length === 0 && <Subtle style={{ marginTop: 20 }}>Nothing here yet.</Subtle>}
      {visible.map(d => (
        <View key={d.id} style={styles.card}>
          <Label style={styles.cardEyebrow}>{d.folderName || d.category}</Label>
          <Body style={styles.prompt}>"{d.prompt}"</Body>
          {Object.values(d.findings).filter(t => t && t.trim().length > 0).map((text, i) => (
            <Body key={i} style={styles.finding}>{text}</Body>
          ))}
          <View style={styles.rule} />
          <View style={styles.footer}>
            <Subtle style={styles.date}>{new Date(d.createdAt).toLocaleDateString()}</Subtle>
            {d.sources ? <Subtle style={styles.sources}>{d.sources}</Subtle> : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

import { router } from 'expo-router';

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.divider },
  chipActive: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  chipText: { fontFamily: theme.fonts.bodyMedium, fontSize: 13, color: theme.colors.grey },
  chipTextActive: { color: theme.colors.ivory },
  card: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.divider, gap: 12 },
  cardEyebrow: { letterSpacing: 1.2, color: theme.colors.bronze, fontSize: 10 },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 22, lineHeight: 30 },
  finding: { fontSize: 16, lineHeight: 24 },
  rule: { height: 1, backgroundColor: theme.colors.divider, marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, letterSpacing: 1 },
  sources: { fontStyle: 'italic', fontSize: 12 },
});
