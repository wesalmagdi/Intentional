import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { randomJournalPrompt, type JournalEntry } from '@intentional/domain';
import { saveJournalEntry, getJournalEntries } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function JournalScreen() {
  const [mode, setMode] = useState<'choice' | 'write'>('choice');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  async function load() {
    setEntries(await getJournalEntries(await getDb()));
  }

  useEffect(() => {
    void load();
  }, [saved, mode]);

  async function handleKeep() {
    if (!text.trim()) return;
    const db = await getDb();
    await saveJournalEntry(db, {
      id: Date.now().toString(), userId: 'local', body: text, prompt: prompt ?? undefined,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  if (saved) return (
    <View style={styles.container}>
      <Display>Kept.</Display>
      <Pressable style={styles.btn} onPress={() => { setSaved(false); setMode('choice'); setText(''); setPrompt(null); }}>
        <Body style={styles.btnText}>Back to Journal</Body>
      </Pressable>
    </View>
  );

  if (mode === 'choice') return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>JOURNAL</Label>
      <Display style={styles.title}>A place for thoughts that don't need anywhere else to go.</Display>
      <Pressable style={styles.btn} onPress={() => setMode('write')}><Body style={styles.btnText}>Write something</Body></Pressable>
      <Pressable style={[styles.btn, styles.ghost]} onPress={() => { setPrompt(randomJournalPrompt()); setMode('write'); }}>
        <Body style={styles.ghostText}>Give me a question</Body>
      </Pressable>

      {entries.length > 0 && (
        <View style={styles.recent}>
          <Label style={styles.recentLabel}>RECENT</Label>
          {entries.slice(0, 3).map(e => (
            <Pressable key={e.id} style={styles.recentRow} onPress={() => router.push({ pathname: '/entry', params: { id: e.id } })}>
              <Subtle style={styles.recentDate}>{new Date(e.createdAt).toLocaleDateString()}</Subtle>
              <Body numberOfLines={1} style={styles.recentSnippet}>{e.body}</Body>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {prompt ? <Display style={styles.prompt}>{prompt}</Display> : <Subtle style={styles.prompt}>What's on your mind?</Subtle>}
      <TextInput style={styles.input} multiline autoFocus placeholder="Start writing..." placeholderTextColor={theme.colors.grey} value={text} onChangeText={setText} />
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => void handleKeep()}><Body style={styles.btnText}>Keep</Body></Pressable>
        <Pressable style={styles.discardBtn} onPress={() => { setMode('choice'); setText(''); setPrompt(null); }}>
          <Body style={styles.discardText}>Discard</Body>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingTop: 60, paddingBottom: 60 },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 28 },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 24, lineHeight: 32, marginTop: 20 },
  input: { minHeight: 220, fontSize: 18, fontFamily: theme.fonts.body, color: theme.colors.ink, lineHeight: 28, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 16, marginTop: 20 },
  btn: { flex: 1, backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center' },
  btnText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  discardBtn: { flex: 1, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.divider },
  discardText: { color: theme.colors.ink, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.divider },
  ghostText: { color: theme.colors.ink, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  recent: { marginTop: 30, gap: 4 },
  recentLabel: { letterSpacing: 1.5, marginBottom: 10 },
  recentRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.divider, gap: 4 },
  recentDate: { fontSize: 12, letterSpacing: 1 },
  recentSnippet: { fontFamily: theme.fonts.displayItalic, fontSize: 17 },
});
