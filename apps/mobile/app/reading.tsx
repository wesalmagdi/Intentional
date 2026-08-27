import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getReadings } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Reading } from '@intentional/domain';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function ReadingScreen() {
  const [items, setItems] = useState<Reading[]>([]);

  useEffect(() => { void (async () => setItems(await getReadings(await getDb())))(); }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Home" onPress={() => router.push('/')} />
      <Label style={styles.eyebrow}>READING ROOM</Label>
      <Display style={styles.title}>Sit with a text.</Display>
      <Subtle>Keep an excerpt. The room will ask you questions about it.</Subtle>

      <Pressable style={styles.addBtn} onPress={() => router.push('/addreading')}>
        <Body style={styles.addText}>Add a reading</Body>
      </Pressable>

      {items.length === 0 && <Subtle style={styles.empty}>Nothing on the desk yet.</Subtle>}
      {items.map(r => (
        <Pressable key={r.id} style={styles.card} onPress={() => router.push({ pathname: '/readingview', params: { id: r.id } })}>
          <View style={styles.cardText}>
            <Body style={styles.cardTitle}>{r.title}</Body>
            <Subtle>{new Date(r.createdAt).toLocaleDateString()}</Subtle>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.grey} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 32, lineHeight: 40 },
  addBtn: { backgroundColor: theme.colors.bronze, padding: 16, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.sm },
  addText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
  empty: { marginTop: theme.spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, backgroundColor: theme.colors.surface, padding: 20, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.divider },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: theme.fonts.display, fontSize: 19 },
});
