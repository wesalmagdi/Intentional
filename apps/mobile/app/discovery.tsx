import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getDiscoveries, saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Discovery } from '@intentional/domain';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function DiscoveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Discovery | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftFindings, setDraftFindings] = useState<Record<string, string>>({});
  const [draftSources, setDraftSources] = useState('');
  const [draftFolder, setDraftFolder] = useState('');

  useEffect(() => {
    void (async () => {
      const all = await getDiscoveries(await getDb());
      const found = all.find(d => d.id === id);
      if (found) {
        setItem(found);
        setDraftFindings(found.findings);
        setDraftSources(found.sources ?? '');
        setDraftFolder(found.folderName ?? '');
      }
    })();
  }, [id]);

  async function handleSave() {
    if (!item) return;
    const updated = { ...item, findings: draftFindings, sources: draftSources || undefined, folderName: draftFolder || undefined };
    await saveDiscovery(await getDb(), updated);
    setItem(updated);
    setEditing(false);
  }

  if (!item) return <View style={styles.container} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Library" onPress={() => router.push('/library')} />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Label style={styles.date}>{new Date(item.createdAt).toLocaleDateString()} · {item.category}</Label>
          <Display style={styles.prompt}>"{item.prompt}"</Display>
        </View>
        {!editing && (
          <Pressable onPress={() => setEditing(true)} hitSlop={12}>
            <Feather name="edit-2" size={20} color={theme.colors.bronze} />
          </Pressable>
        )}
      </View>

      {editing ? (
        <>
          {Object.keys(draftFindings).map(key => (
            <View key={key} style={styles.editGroup}>
              <Label style={styles.editLabel}>{key}</Label>
              <TextInput style={styles.input} multiline value={draftFindings[key]} onChangeText={t => setDraftFindings({ ...draftFindings, [key]: t })} />
            </View>
          ))}
          <View style={styles.editGroup}>
             <Label style={styles.editLabel}>SOURCES</Label>
             <TextInput style={styles.metaInput} value={draftSources} onChangeText={setDraftSources} />
          </View>
          <View style={styles.editGroup}>
             <Label style={styles.editLabel}>FOLDER</Label>
             <TextInput style={styles.metaInput} value={draftFolder} onChangeText={setDraftFolder} />
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.saveBtn} onPress={() => void handleSave()}><Body style={styles.saveText}>Update</Body></Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => { setDraftFindings(item.findings); setDraftSources(item.sources ?? ''); setDraftFolder(item.folderName ?? ''); setEditing(false); }}>
              <Body>Cancel</Body>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {Object.entries(item.findings).map(([key, text]) => (
            text && text.trim().length > 0 ? (
              <View key={key} style={styles.card}>
                <Label style={styles.cardLabel}>{key}</Label>
                <Body style={styles.finding}>{text}</Body>
              </View>
            ) : null
          ))}
          {item.sources && <Subtle style={styles.sources}>Source: {item.sources}</Subtle>}
          {item.folderName && <Subtle style={styles.folder}>Folder: {item.folderName}</Subtle>}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  date: { letterSpacing: 1.5, color: theme.colors.bronze, marginBottom: 8 },
  prompt: { fontFamily: theme.fonts.displayItalic, fontSize: 24, lineHeight: 32 },
  card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.divider, gap: 8 },
  cardLabel: { color: theme.colors.bronze, letterSpacing: 1.2, fontSize: 10 },
  finding: { fontSize: 17, lineHeight: 26 },
  sources: { fontStyle: 'italic', marginTop: 8 },
  folder: { marginTop: 4 },
  editGroup: { gap: 6, marginTop: 8 },
  editLabel: { color: theme.colors.bronze, letterSpacing: 1.2, fontSize: 10 },
  input: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: 16, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 100, textAlignVertical: 'top', lineHeight: 24 },
  metaInput: { borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingVertical: 10, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  saveBtn: { flex: 1, backgroundColor: theme.colors.bronze, padding: 16, borderRadius: theme.radius.md, alignItems: 'center' },
  saveText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
  cancelBtn: { flex: 1, padding: 16, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.divider },
});
