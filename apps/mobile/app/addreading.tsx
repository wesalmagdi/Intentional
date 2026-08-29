import { useState } from 'react';
import { ScrollView, StyleSheet, Pressable, TextInput, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FS from 'expo-file-system/legacy';
import { saveReading } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

const FileSystem = FS as any;

export default function AddReadingScreen() {
  const insets = useSafeAreaInsets();
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
    await saveReading(await getDb(), {
      id: Date.now().toString(), title: title.trim(), body: bodyText.trim(), createdAt: new Date().toISOString(),
    });
    router.replace('/reading');
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.push('/reading')}><Text style={styles.back}>← Reading Room</Text></Pressable>
      <Text style={styles.eyebrow}>ADD A READING</Text>
      <Text style={styles.headline}>Put it on the desk.</Text>

      <TextInput style={styles.titleInput} placeholder="Title" placeholderTextColor={colors.stone} value={title} onChangeText={setTitle} />
      <View style={styles.area}>
        <TextInput style={styles.areaInput} multiline placeholder="Paste an excerpt — a paragraph is enough." placeholderTextColor={colors.stone} value={bodyText} onChangeText={setBodyText} />
      </View>

      <Pressable style={styles.ghostBtn} onPress={() => void importFile()}><Text style={styles.ghostText}>Import .txt / .md</Text></Pressable>
      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}><Text style={styles.keepText}>Keep this reading.</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: 0, gap: space[4] },
  back: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper, marginTop: space[4] },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 28, color: colors.ink },
  titleInput: { borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingVertical: space[3], fontSize: 19, fontFamily: typography.families.display, color: colors.ink },
  area: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, padding: space[4] },
  areaInput: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, minHeight: 200, textAlignVertical: 'top', lineHeight: 25 },
  ghostBtn: { padding: 15, borderRadius: radius.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.hairline },
  ghostText: { color: colors.ink, fontFamily: typography.families.bodySemibold, fontSize: 14 },
  keepBtn: { backgroundColor: colors.copperDeep, padding: 17, borderRadius: radius.sm, alignItems: 'center' },
  keepText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
});
