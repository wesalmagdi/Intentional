import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { REFLECTION_PROMPTS } from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function ReflectionScreen() {
  const { prompt, intention, category } = useLocalSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [findings, setFindings] = useState<Record<string, string>>({});
  const [sources, setSources] = useState('');
  const [folderName, setFolderName] = useState('');

  async function handleKeep() {
    const answered = Object.values(findings).some(t => t.trim().length > 0);
    if (!answered) return;
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(), userId: 'local', category: (category as string) || 'General',
      prompt: prompt as string, intention: (intention as string) || undefined, findings,
      sources: sources || undefined, folderName: folderName || undefined,
      createdAt: new Date().toISOString(),
    });
    router.replace('/library');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Home" onPress={() => router.push('/')} />
      <Label style={styles.eyebrow}>REFLECTION</Label>
      <Display style={styles.title}>What did you find?</Display>
      <Subtle style={styles.sub}>Tell yourself the story while it's still fresh.</Subtle>

      <View style={styles.prompts}>
        {REFLECTION_PROMPTS.map(p => {
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
                  value={findings[p.id] ?? ''}
                  onChangeText={t => setFindings({ ...findings, [p.id]: t })}
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.metaSection}>
        <Label style={styles.metaLabel}>SOURCES · OPTIONAL</Label>
        <TextInput style={styles.metaInput} placeholder="Book, article, conversation..." value={sources} onChangeText={setSources} />
      </View>
      <View style={styles.metaSection}>
        <Label style={styles.metaLabel}>FOLDER · OPTIONAL</Label>
        <TextInput style={styles.metaInput} placeholder="Where should this live?" value={folderName} onChangeText={setFolderName} />
      </View>

      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}>
        <Body style={styles.keepText}>Keep this.</Body>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 80 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 32, lineHeight: 40 },
  sub: { marginBottom: theme.spacing.sm },
  prompts: { gap: 14 },
  card: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, overflow: 'hidden', backgroundColor: theme.colors.surface },
  cardActive: { borderColor: theme.colors.bronze },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, gap: 14 },
  headerText: { flex: 1, gap: 3 },
  cardLabel: { fontFamily: theme.fonts.bodySemibold },
  input: { padding: 20, paddingTop: 0, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 110, textAlignVertical: 'top', backgroundColor: theme.colors.surface, lineHeight: 26 },
  metaSection: { marginTop: theme.spacing.sm, gap: 8 },
  metaLabel: { letterSpacing: 1.2, fontSize: 10 },
  metaInput: { borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingVertical: 12, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink },
  keepBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.md },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
});
