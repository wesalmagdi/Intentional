import { useState } from 'react';
import { ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { saveReading } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function AddReadingScreen() {
  const [title, setTitle] = useState('');
  const [bodyText, setBodyText] = useState('');

  async function importFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/plain', 'text/markdown'], copyToCacheDirectory: true });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    const text = await FileSystem.readAsStringAsync(asset.uri);
    if (title.trim().length === 0) setTitle(asset.name.replace(/\.(txt|md)$/i, ''));
    setBodyText(text);
  }

  async function handleKeep() {
    if (title.trim().length === 0 || bodyText.trim().length === 0) return;
    const db = await getDb();
    await saveReading(db, {
      id: Date.now().toString(),
      title: title.trim(),
      body: bodyText.trim(),
      createdAt: new Date().toISOString(),
    });
    router.replace('/reading');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Reading Room" onPress={() => router.push('/reading')} />
      <Label style={styles.eyebrow}>ADD A READING</Label>
      <Display style={styles.title}>Put it on the desk.</Display>

      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        placeholderTextColor={theme.colors.grey}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.bodyInput}
        multiline
        placeholder="Paste an excerpt — a paragraph is enough."
        placeholderTextColor={theme.colors.grey}
        value={bodyText}
        onChangeText={setBodyText}
      />

      <Pressable style={styles.ghostBtn} onPress={() => void importFile()}>
        <Body style={styles.ghostText}>Import .txt / .md</Body>
      </Pressable>
      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}>
        <Body style={styles.keepText}>Keep this reading.</Body>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38 },
  titleInput: { borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingVertical: 12, fontSize: 20, fontFamily: theme.fonts.display, color: theme.colors.ink },
  bodyInput: { borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md, padding: theme.spacing.md, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ink, minHeight: 220, textAlignVertical: 'top', lineHeight: 26, backgroundColor: theme.colors.surface },
  ghostBtn: { padding: 14, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.divider },
  ghostText: { color: theme.colors.ink, fontFamily: theme.fonts.bodySemibold },
  keepBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center' },
  keepText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
});
