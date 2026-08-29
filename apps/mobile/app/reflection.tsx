import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { saveDiscovery, getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import { BottomSheet, colors, typography, space, radius } from '@intentional/ui';

export default function ReflectionScreen() {
  const { prompt, intention, category } = useLocalSearchParams();
  const [learned, setLearned] = useState('');
  const [surprised, setSurprised] = useState('');
  const [changed, setChanged] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [sourceDraft, setSourceDraft] = useState('');
  const [addingSource, setAddingSource] = useState(false);
  const [folder, setFolder] = useState('');
  const [folderSheet, setFolderSheet] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [newFolder, setNewFolder] = useState('');

  async function openFolders() {
    const all = await getDiscoveries(await getDb());
    setFolders([...new Set(all.map(d => d.folderName || d.category))]);
    setFolderSheet(true);
  }

  async function handleSave() {
    if (learned.trim().length === 0) return;
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(), userId: 'local', category: (category as string) || 'Curiosity',
      prompt: (prompt as string) || '', intention: (intention as string) || undefined,
      findings: { learned, surprised, changed },
      sources: sources.join(' · ') || undefined,
      folderName: folder || undefined,
      createdAt: new Date().toISOString(),
    });
    router.replace('/saved');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="chevron-left" size={22} color={colors.ink} /></Pressable>
        <Pressable onPress={() => void handleSave()}><Text style={styles.save}>Save</Text></Pressable>
      </View>

      <Text style={styles.headline}>Capture what{"\n"}you discovered.</Text>
      <View style={styles.rule} />

      <Text style={styles.label}>What did you learn?</Text>
      <View style={styles.area}><TextInput style={styles.areaInput} multiline placeholder="Start writing..." placeholderTextColor={colors.stone} value={learned} onChangeText={setLearned} /></View>

      <Text style={styles.label}>What surprised you?</Text>
      <View style={styles.line}><TextInput style={styles.lineInput} placeholder="Optional" placeholderTextColor={colors.stone} value={surprised} onChangeText={setSurprised} /></View>

      <Text style={styles.label}>Did anything change your thinking?</Text>
      <View style={styles.line}><TextInput style={styles.lineInput} placeholder="Optional" placeholderTextColor={colors.stone} value={changed} onChangeText={setChanged} /></View>

      <Text style={styles.label}>Sources</Text>
      {sources.map((s, i) => <Text key={i} style={styles.sourceItem}>• {s}</Text>)}
      {addingSource && (
        <View style={styles.line}>
          <TextInput style={styles.lineInput} placeholder="Book, article, conversation..." placeholderTextColor={colors.stone} value={sourceDraft} onChangeText={setSourceDraft}
            onSubmitEditing={() => { if (sourceDraft.trim()) setSources([...sources, sourceDraft.trim()]); setSourceDraft(''); setAddingSource(false); }} />
        </View>
      )}
      <Pressable style={styles.addSource} onPress={() => setAddingSource(true)}>
        <Feather name="plus" size={13} color={colors.copper} />
        <Text style={styles.addSourceText}>Add source</Text>
      </Pressable>

      <Text style={styles.label}>Folder</Text>
      <Pressable style={styles.folderRow} onPress={() => void openFolders()}>
        <Feather name="folder" size={15} color={colors.copper} />
        <Text style={styles.folderName} numberOfLines={1}>{folder || 'Choose a folder'}</Text>
        <Feather name="chevron-right" size={15} color={colors.stone} />
      </Pressable>
      <View style={{ height: 40 }} />

      <BottomSheet visible={folderSheet} onClose={() => setFolderSheet(false)} title="Where should this live?">
        {folders.map(f => (
          <Pressable key={f} style={styles.sheetRow} onPress={() => { setFolder(f); setFolderSheet(false); }}>
            <Feather name="folder" size={15} color={colors.copper} />
            <Text style={styles.sheetRowText}>{f}</Text>
          </Pressable>
        ))}
        <View style={styles.sheetNew}>
          <TextInput style={styles.sheetNewInput} placeholder="New folder name..." placeholderTextColor={colors.stone} value={newFolder} onChangeText={setNewFolder} />
          <Pressable style={styles.sheetNewBtn} onPress={() => { if (newFolder.trim()) setFolder(newFolder.trim()); setNewFolder(''); setFolderSheet(false); }}>
            <Text style={styles.sheetNewBtnText}>Create</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[8] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  save: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.copper },
  headline: { fontFamily: typography.families.display, fontSize: 30, lineHeight: 38, color: colors.ink, marginTop: space[5] },
  rule: { height: 1, backgroundColor: colors.hairline, marginVertical: space[5] },
  label: { fontFamily: typography.families.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: space[2], marginTop: space[4] },
  area: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[3], minHeight: 110 },
  areaInput: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, minHeight: 90, textAlignVertical: 'top', lineHeight: 24 },
  line: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, paddingHorizontal: space[3], paddingVertical: space[3] },
  lineInput: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  sourceItem: { fontFamily: typography.families.body, fontSize: 14, color: colors.inkSoft, marginTop: space[1] },
  addSource: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: space[2] },
  addSourceText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.copper },
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, paddingHorizontal: space[4], paddingVertical: space[4] },
  folderName: { flex: 1, fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.ink },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[4], borderBottomWidth: 1, borderBottomColor: colors.hairline },
  sheetRowText: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink },
  sheetNew: { flexDirection: 'row', gap: space[3], marginTop: space[4], alignItems: 'center' },
  sheetNewInput: { flex: 1, fontFamily: typography.families.body, fontSize: 15, color: colors.ink, borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingVertical: space[2] },
  sheetNewBtn: { backgroundColor: colors.copperDeep, paddingHorizontal: space[4], paddingVertical: space[3], borderRadius: radius.sm },
  sheetNewBtnText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 13 },
});
