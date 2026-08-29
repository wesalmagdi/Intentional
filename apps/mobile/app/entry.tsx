import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, TextInput, View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getJournalEntry, saveJournalEntry } from '@intentional/database';
import { getDb } from '../lib/db';
import type { JournalEntry } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

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

  if (!entry) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/journal')}><Text style={styles.back}>← Journal</Text></Pressable>
        {!editing && <Pressable onPress={() => setEditing(true)} hitSlop={12}><Feather name="edit-2" size={18} color={colors.copper} /></Pressable>}
      </View>

      <Text style={styles.date}>{new Date(entry.createdAt).toLocaleDateString()}</Text>
      {entry.prompt ? <Text style={styles.prompt}>{entry.prompt}</Text> : null}

      {editing ? (
        <>
          <View style={styles.area}>
            <TextInput style={styles.areaInput} multiline autoFocus value={draft} onChangeText={setDraft} />
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.keepBtn} onPress={() => void handleSave()}><Text style={styles.keepText}>Update</Text></Pressable>
            <Pressable style={styles.ghostBtn} onPress={() => { setDraft(entry.body); setEditing(false); }}><Text style={styles.ghostText}>Cancel</Text></Pressable>
          </View>
        </>
      ) : (
        <Text style={styles.body}>{entry.body}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[8], gap: space[4] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.stone },
  date: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper },
  prompt: { fontFamily: typography.families.displayItalic, fontSize: 20, lineHeight: 28, color: colors.ink },
  body: { fontFamily: typography.families.body, fontSize: 17, lineHeight: 29, color: colors.inkSoft, marginTop: space[2] },
  area: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[4], minHeight: 240 },
  areaInput: { fontFamily: typography.families.body, fontSize: 17, color: colors.ink, minHeight: 220, textAlignVertical: 'top', lineHeight: 29 },
  actions: { flexDirection: 'row', gap: space[3] },
  keepBtn: { flex: 1, backgroundColor: colors.copperDeep, padding: 16, borderRadius: radius.sm, alignItems: 'center' },
  keepText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  ghostBtn: { flex: 1, padding: 16, borderRadius: radius.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.hairline },
  ghostText: { color: colors.ink, fontFamily: typography.families.bodySemibold, fontSize: 15 },
});
