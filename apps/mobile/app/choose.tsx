import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CHOOSE_PROMPTS } from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function ChooseScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kept, setKept] = useState(false);

  async function handleKeep() {
    const attention = (answers.attention ?? '').trim();
    if (attention.length === 0) return;
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(), userId: 'local', category: 'Choose',
      prompt: 'What deserves your attention today?',
      findings: { attention, setdown: (answers.setdown ?? '').trim() },
      createdAt: new Date().toISOString(),
    });
    setKept(true);
  }

  if (kept) {
    return (
      <View style={styles.center}>
        <Body style={styles.ornament}>❦</Body>
        <Display>Chosen.</Display>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Home" onPress={() => router.push('/')} />
      <Label style={styles.eyebrow}>CHOOSE</Label>
      <Display style={styles.headline}>Attention is a choice.</Display>

      <View style={styles.prompts}>
        {CHOOSE_PROMPTS.map(p => {
          const open = expanded === p.id;
          return (
            <View key={p.id} style={[styles.card, open && styles.cardActive]}>
              <Pressable style={styles.header} onPress={() => setExpanded(open ? null : p.id)}>
                <View style={styles.headerText}>
                  <Body style={styles.cardLabel}>{p.label}</Body>
                  <Subtle>{p.sublabel}</Subtle>
                </View>
                <Feather name={open ? 'minus' : 'plus'} size={18} color={theme.colors.bronze} />
              </Pressable>
              {open && (
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
          );
        })}
      </View>

      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}>
        <Body style={styles.keepText}>Keep this.</Body>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  ornament: { color: theme.colors.bronze, fontSize: 22 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  headline: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38, marginBottom: theme.spacing.sm },
  prompts: { gap: 14 },
  card: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, overflow: 'hidden', backgroundColor: theme.colors.surface },
  cardActive: { borderColor: theme.colors.bronze },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, gap: 14 },
  headerText: { flex: 1, gap: 3 },
  cardLabel: { fontFamily: theme.fonts.bodySemibold },
  input: { padding: 20, paddingTop: 0, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 110, textAlignVertical: 'top', backgroundColor: theme.colors.surface, lineHeight: 26 },
  keepBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.sm },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  homeBtn: { paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.sm },
  homeText: { fontFamily: theme.fonts.bodySemibold },
});
