import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { randomJournalPrompt } from '@intentional/domain';
import { saveJournalEntry } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function JournalScreen() {
  const [mode, setMode] = useState<'choice' | 'write'>('choice');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

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
    <View style={styles.container}><Display>Kept.</Display>
      <Pressable style={styles.btn} onPress={() => router.push('/')}><Body>Home</Body></Pressable>
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
    </ScrollView>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {prompt ? <Display style={styles.prompt}>{prompt}</Display> : <Subtle style={styles.prompt}>What's on your mind?</Subtle>}
      <TextInput style={styles.input} multiline autoFocus placeholder="Start writing..." placeholderTextColor={theme.colors.grey} value={text} onChangeText={setText} />
      <Pressable style={styles.btn} onPress={handleKeep}><Body style={styles.btnText}>Keep this thought?</Body></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.lg, paddingTop: 60 },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 28 },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 24, lineHeight: 32, marginTop: 20 },
  input: { flex: 1, fontSize: 18, fontFamily: theme.fonts.body, color: theme.colors.ink, lineHeight: 28, textAlignVertical: 'top' },
  btn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center' },
  btnText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.divider },
  ghostText: { color: theme.colors.ink, fontFamily: theme.fonts.bodySemibold, fontSize: 16 }
});
