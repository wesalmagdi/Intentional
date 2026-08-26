import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Discovery } from '@intentional/domain';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function LibraryScreen() {
  const [items, setItems] = useState<Discovery[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => { void (async () => setItems(await getDiscoveries(await getDb())))(); }, []);

  const shelves = ['All', ...Array.from(new Set(items.map(i => i.folderName || i.category)))];
  const visible = filter === 'All' ? items : items.filter(i => (i.folderName || i.category) === filter);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>LIBRARY</Label>
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
          <Label>{d.folderName || d.category}</Label>
          <Body style={styles.prompt}>"{d.prompt}"</Body>
          {d.sources ? <Subtle style={styles.sources}>Source: {d.sources}</Subtle> : null}
          {Object.values(d.findings).filter(t => t && t.trim().length > 0).map((text, i) => (
            <Body key={i} style={styles.finding}>{text}</Body>
          ))}
          <Subtle style={styles.date}>{new Date(d.createdAt).toLocaleDateString()}</Subtle>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingTop: 60, paddingBottom: 80 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.divider },
  chipActive: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  chipText: { fontFamily: theme.fonts.bodyMedium, fontSize: 13, color: theme.colors.grey },
  chipTextActive: { color: theme.colors.ivory },
  card: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.divider, gap: 12 },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 22, lineHeight: 30 },
  sources: { fontStyle: 'italic', marginTop: 4 },
  finding: { fontSize: 16, lineHeight: 24, marginTop: 8 },
  date: { marginTop: 12, fontSize: 12, letterSpacing: 1 },
});
