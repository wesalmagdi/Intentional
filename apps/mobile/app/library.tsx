import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Discovery } from '@intentional/domain';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function LibraryScreen() {
  const [items, setItems] = useState<Discovery[]>([]);
  useEffect(() => { void (async () => setItems(await getDiscoveries(await getDb())))(); }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>LIBRARY</Label>
      <Display>What you've kept.</Display>
      {items.map(d => (
        <ScrollView key={d.id} style={styles.card}>
          <Subtle>{d.category} • {new Date(d.createdAt).toLocaleDateString()}</Subtle>
          <Body style={styles.prompt}>"{d.prompt}"</Body>
          {Object.values(d.findings).map((text, i) => (
            <Body key={i} style={styles.finding}>{text}</Body>
          ))}
        </ScrollView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingTop: 60 },
  card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.divider, gap: 12, maxHeight: 300 },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 20 },
  finding: { fontSize: 16, lineHeight: 24 }
});
