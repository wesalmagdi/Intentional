import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { CHOOSE_PROMPTS } from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function ChooseScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kept, setKept] = useState(false);

  async function handleKeep() {
    const attention = (answers.attention ?? '').trim();
    if (attention.length === 0) return;
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(),
      userId: 'local',
      category: 'Choose',
      prompt: 'What deserves your attention today?',
      findings: {
        attention,
        setdown: (answers.setdown ?? '').trim(),
      },
      createdAt: new Date().toISOString(),
    });
    setKept(true);
  }

  if (kept) {
    return (
      <View style={styles.center}>
        <Display>Chosen.</Display>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>CHOOSE</Label>
      <Display style={styles.headline}>Attention is a choice.</Display>

      <View style={styles.prompts}>
        {CHOOSE_PROMPTS.map(p => (
          <View key={p.id} style={styles.card}>
            <Pressable style={styles.header} onPress={() => setExpanded(expanded === p.id ? null : p.id)}>
              <View><Body style={styles.cardLabel}>{p.label}</Body><Subtle>{p.sublabel}</Subtle></View>
              <Body>{expanded === p.id ? '−' : '+'}</Body>
            </Pressable>
            {expanded === p.id && (
              <TextInput
                style={styles.input}
                multiline
                autoFocus
                placeholder="Write freely..."
                placeholderTextColor={theme.colors.grey}
                value={answers[p.id] ?? ''}
                onChangeText={t => setAnswers({ ...answers, [p.id]: t })}
              />
            )}
          </View>
        ))}
      </View>

      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}>
        <Body style={styles.keepText}>Keep this.</Body>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  headline: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38, marginBottom: 20 },
  prompts: { gap: 16 },
  card: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: theme.colors.surface },
  cardLabel: { fontFamily: theme.fonts.bodySemibold, marginBottom: 4 },
  input: { padding: 20, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 110, textAlignVertical: 'top', backgroundColor: theme.colors.background },
  keepBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 30 },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  homeBtn: { paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.sm },
  homeText: { fontFamily: theme.fonts.bodySemibold },
});
