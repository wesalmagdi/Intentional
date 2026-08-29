import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { randomJournalPrompt, type JournalEntry } from '@intentional/domain';
import { saveJournalEntry, getJournalEntries } from '@intentional/database';
import { getDb } from '../../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';

export default function JournalScreen() {
  const [mode, setMode] = useState<'choice' | 'write'>('choice');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => { void (async () => setEntries(await getJournalEntries(await getDb())))(); }, [saved, mode]);

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
    <View style={styles.center}>
      <Text style={styles.savedOrnament}>❦</Text>
      <Text style={styles.savedTitle}>Kept.</Text>
      <Pressable style={styles.primaryBtn} onPress={() => { setSaved(false); setMode('choice'); setText(''); setPrompt(null); }}>
        <Text style={styles.primaryText}>Back to Journal</Text>
      </Pressable>
    </View>
  );

  if (mode === 'choice') return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      <Text style={styles.title}>A place for thoughts that{"\n"}don't need anywhere else to go.</Text>
      <Pressable style={styles.primaryBtn} onPress={() => setMode('write')}><Text style={styles.primaryText}>Write something</Text></Pressable>
      <Pressable style={styles.ghostBtn} onPress={() => { setPrompt(randomJournalPrompt()); setMode('write'); }}>
        <Text style={styles.ghostText}>Give me a question</Text>
      </Pressable>
      {entries.length > 0 && (
        <View style={styles.recent}>
          <Text style={styles.recentLabel}>RECENT</Text>
          {entries.slice(0, 3).map(e => (
            <Pressable key={e.id} style={styles.recentRow} onPress={() => router.push({ pathname: '/entry', params: { id: e.id } })}>
              <View style={styles.recentText}>
                <Text style={styles.recentDate}>{new Date(e.createdAt).toLocaleDateString()}</Text>
                <Text numberOfLines={1} style={styles.recentSnippet}>{e.body}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.stone} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      {prompt ? <Text style={styles.prompt}>{prompt}</Text> : <Text style={styles.promptMuted}>What's on your mind?</Text>}
      <TextInput
        style={styles.input} multiline autoFocus placeholder="Start writing..." placeholderTextColor={colors.stone}
        value={text} onChangeText={setText}
      />
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={() => void handleKeep()}><Text style={styles.primaryText}>Keep</Text></Pressable>
        <Pressable style={styles.ghostBtn} onPress={() => { setMode('choice'); setText(''); setPrompt(null); }}><Text style={styles.ghostText}>Discard</Text></Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[9], gap: space[5] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4], backgroundColor: colors.cream },
  savedOrnament: { fontFamily: typography.families.display, fontSize: 24, color: colors.copper },
  savedTitle: { fontFamily: typography.families.display, fontSize: 32, color: colors.ink },
  title: { fontFamily: typography.families.displayItalic, fontSize: 27, lineHeight: 36, color: colors.ink },
  prompt: { fontFamily: typography.families.displayItalic, fontSize: 24, lineHeight: 32, color: colors.ink },
  promptMuted: { fontFamily: typography.families.displayItalic, fontSize: 24, color: colors.stone },
  input: { minHeight: 240, fontSize: 17, fontFamily: typography.families.body, color: colors.ink, lineHeight: 28, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: space[3] },
  primaryBtn: { flex: 1, backgroundColor: colors.copperDeep, padding: 17, borderRadius: radius.sm, alignItems: 'center' },
  primaryText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  ghostBtn: { flex: 1, padding: 17, borderRadius: radius.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.hairline },
  ghostText: { color: colors.ink, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  recent: { marginTop: space[4], gap: 4 },
  recentLabel: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.stone, marginBottom: space[2] },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space[4], borderBottomWidth: 1, borderBottomColor: colors.hairline, gap: space[3] },
  recentText: { flex: 1, gap: 3 },
  recentDate: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
  recentSnippet: { fontFamily: typography.families.displayItalic, fontSize: 16, color: colors.ink },
});
