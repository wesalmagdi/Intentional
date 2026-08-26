import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getJournalEntry, saveJournalEntry } from '@intentional/database';
import { getDb } from '../lib/db';
import type { JournalEntry } from '@intentional/domain';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    void (async () => {
      if (typeof id === 'string') {
        const e = await getJournalEntry(await getDb(), id);
        setEntry(e);
        setDraft(e?.body ?? '');
      }
    })();
  }, [id]);

  async function handleSave() {
    if (!entry) return;
    const updated = { ...entry, body: draft, updatedAt: new Date().toISOString() };
    await saveJournalEntry(await getDb(), updated);
    setEntry(updated);
    setEditing(false);
  }

  if (!entry) return <View style={styles.container} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Journal" onPress={() => router.push('/journal')} />
      
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Label style={styles.date}>{new Date(entry.createdAt).toLocaleDateString()}</Label>
          {entry.prompt ? <Subtle style={styles.prompt}>{entry.prompt}</Subtle> : null}
        </View>
        {!editing && (
          <Pressable onPress={() => setEditing(true)} hitSlop={12}>
            <Feather name="edit-2" size={20} color={theme.colors.bronze} />
          </Pressable>
        )}
      </View>

      {editing ? (
        <>
          <TextInput style={styles.input} multiline autoFocus value={draft} onChangeText={setDraft} />
          <View style={styles.actions}>
            <Pressable style={styles.saveBtn} onPress={() => void handleSave()}>
              <Body style={styles.saveText}>Update</Body>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => { setDraft(entry.body); setEditing(false); }}>
              <Body>Cancel</Body>
            </Pressable>
          </View>
        </>
      ) : (
        <Body style={styles.body}>{entry.body}</Body>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  date: { letterSpacing: 1.5, color: theme.colors.bronze },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 20, lineHeight: 28, marginTop: 8 },
  body: { fontSize: 18, lineHeight: 30, marginTop: 10 },
  input: { fontSize: 18, fontFamily: theme.fonts.body, color: theme.colors.ink, lineHeight: 30, textAlignVertical: 'top', minHeight: 300, marginTop: 10, borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  saveBtn: { flex: 1, backgroundColor: theme.colors.bronze, padding: 16, borderRadius: theme.radius.md, alignItems: 'center' },
  saveText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
  cancelBtn: { flex: 1, padding: 16, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.divider },
});
