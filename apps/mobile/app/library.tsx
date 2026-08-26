import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
      {items.length === 0 && <Subtle style={{marginTop: 20}}>Your discoveries will appear here.</Subtle>}
      {items.map(d => (
        <View key={d.id} style={styles.card}>
          <Label>{d.folderName || d.category}</Label>
          <Body style={styles.prompt}>"{d.prompt}"</Body>
          {d.sources && <Subtle style={styles.sources}>Source: {d.sources}</Subtle>}
          {Object.values(d.findings).map((text, i) => (
            <Body key={i} style={styles.finding}>{text}</Body>
          ))}
          <Subtle style={styles.date}>{new Date(d.createdAt).toLocaleDateString()}</Subtle>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingTop: 60, paddingBottom: 60 },
  card: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.divider, gap: 12 },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 22, lineHeight: 30 },
  sources: { fontStyle: 'italic', marginTop: 4 },
  finding: { fontSize: 16, lineHeight: 24, marginTop: 8 },
  date: { marginTop: 12, fontSize: 12, letterSpacing: 1 }
});
