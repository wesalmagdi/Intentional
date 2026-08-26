import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { promptForEntry, type JournalEntry } from '@intentional/domain';
import { getAllJournalEntries, saveJournalEntry } from '@intentional/database';
import { getDb } from '../lib/db';
import { newId } from '../lib/id';
import { Title, Heading, Subtle, Button, Surface, theme } from '@intentional/ui';

export default function JournalScreen() {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const prompt = promptForEntry(new Date());

  async function load() {
    const db = await getDb();
    setEntries(await getAllJournalEntries(db));
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSave() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    const db = await getDb();
    await saveJournalEntry(db, {
      id: newId(),
      prompt,
      text: trimmed,
      createdAt: new Date().toISOString(),
    });
    setText('');
    setSaved(true);
    await load();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Home" variant="ghost" onPress={() => router.push('/')} />
      <Title>Journal</Title>

      <Surface style={styles.card}>
        <Heading>{prompt}</Heading>
        <TextInput
          style={styles.input}
          multiline
          value={text}
          onChangeText={(v) => {
            setText(v);
            setSaved(false);
          }}
          placeholder="Write freely…"
          placeholderTextColor={theme.colors.subtle}
        />
        <Button title="Save Entry" onPress={() => void handleSave()} />
        {saved && <Subtle>Saved.</Subtle>}
      </Surface>

      {entries.map((entry) => (
        <Surface key={entry.id} style={styles.card}>
          <Subtle>{new Date(entry.createdAt).toLocaleDateString()}</Subtle>
          <Heading style={styles.entryPrompt}>{entry.prompt}</Heading>
          <Subtle>{entry.text}</Subtle>
        </Surface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    gap: theme.spacing.sm,
  },
  entryPrompt: {
    marginTop: theme.spacing.xs,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.surface,
  },
});
