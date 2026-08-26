import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { REFLECTION_PROMPTS } from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function ReflectionScreen() {
  const { prompt, intention, category } = useLocalSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [findings, setFindings] = useState<Record<string, string>>({});
  const [sources, setSources] = useState('');
  const [folderName, setFolderName] = useState('');

  async function handleKeep() {
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(), userId: 'local', category: category as string || 'General',
      prompt: prompt as string, intention: intention as string, findings,
      sources: sources || undefined,
      folderName: folderName || undefined,
      createdAt: new Date().toISOString(),
    });
    router.replace('/library');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>WHAT DID YOU FIND?</Label>
      <Display style={styles.title}>Tell yourself the story.</Display>
      <View style={styles.prompts}>
        {REFLECTION_PROMPTS.map((p) => (
          <View key={p.id} style={styles.card}>
            <Pressable style={styles.header} onPress={() => setExpanded(expanded === p.id ? null : p.id)}>
              <View><Body style={styles.cardLabel}>{p.label}</Body><Subtle>{p.sublabel}</Subtle></View>
              <Body>{expanded === p.id ? '−' : '+'}</Body>
            </Pressable>
            {expanded === p.id && (
              <TextInput style={styles.input} multiline autoFocus placeholder="Write freely..." placeholderTextColor={theme.colors.grey}
                value={findings[p.id] || ''} onChangeText={(text) => setFindings({ ...findings, [p.id]: text })} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.metaSection}>
        <Label>SOURCES (OPTIONAL)</Label>
        <TextInput style={styles.metaInput} placeholder="Book, article, conversation..." value={sources} onChangeText={setSources} />
      </View>

      <View style={styles.metaSection}>
        <Label>FOLDER (OPTIONAL)</Label>
        <TextInput style={styles.metaInput} placeholder="Where should this live?" value={folderName} onChangeText={setFolderName} />
      </View>

      <Pressable style={styles.keepBtn} onPress={handleKeep}><Body style={styles.keepText}>Keep this.</Body></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 60 },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 28, marginBottom: 30 },
  prompts: { gap: 16 },
  card: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: theme.colors.surface },
  cardLabel: { fontFamily: theme.fonts.bodySemibold, marginBottom: 4 },
  input: { padding: 20, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 120, textAlignVertical: 'top', backgroundColor: theme.colors.background },
  metaSection: { marginTop: 30, gap: 8 },
  metaInput: { borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingVertical: 12, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink },
  keepBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 40 },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 }
});
