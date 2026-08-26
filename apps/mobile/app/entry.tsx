import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getJournalEntry } from '@intentional/database';
import { getDb } from '../lib/db';
import type { JournalEntry } from '@intentional/domain';
import { Body, Subtle, Label, theme } from '@intentional/ui';

export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    void (async () => {
      if (typeof id === 'string') setEntry(await getJournalEntry(await getDb(), id));
    })();
  }, [id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.push('/journal')}><Subtle>← Journal</Subtle></Pressable>
      {entry !== null && (
        <>
          <Label style={styles.date}>{new Date(entry.createdAt).toLocaleDateString()}</Label>
          {entry.prompt ? <Subtle style={styles.prompt}>{entry.prompt}</Subtle> : null}
          <Body style={styles.body}>{entry.body}</Body>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 80 },
  date: { letterSpacing: 1.5, color: theme.colors.bronze },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 20, lineHeight: 28 },
  body: { fontSize: 18, lineHeight: 30, marginTop: 10 },
});
