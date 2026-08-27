import { useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FS from 'expo-file-system/legacy';
const FileSystem = FS as any;
import * as Sharing from 'expo-sharing';
import { ExportBundleSchema } from '@intentional/domain';
import {
  getDiscoveries, getJournalEntries, getReadings,
  saveDiscovery, saveJournalEntry, saveReading,
} from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function DataScreen() {
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const db = await getDb();
      const [journal, discoveries, readings] = await Promise.all([
        getJournalEntries(db), getDiscoveries(db), getReadings(db),
      ]);
      const bundle = ExportBundleSchema.parse({
        app: 'intentional', version: 1,
        exportedAt: new Date().toISOString(),
        journal, discoveries, readings,
      });
      const date = new Date().toISOString().slice(0, 10);
      const path = `${FileSystem.cacheDirectory}intentional-${date}.json`;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(bundle, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Your Intentional data' });
        setNote('Packed. Send it to yourself — AirDrop, Files, Mail. On the new phone, choose Import.');
      } else {
        setNote(`Saved at ${path}`);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('EXPORT ERROR:', msg);
      setNote(`Error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled || result.assets.length === 0) return;
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
      let parsed;
      try {
        parsed = ExportBundleSchema.safeParse(JSON.parse(raw));
      } catch {
        setNote("That file couldn't be read.");
        return;
      }
      if (!parsed.success) {
        setNote("That file doesn't look like Intentional data.");
        return;
      }
      const db = await getDb();
      for (const e of parsed.data.journal) await saveJournalEntry(db, e);
      for (const d of parsed.data.discoveries) await saveDiscovery(db, d);
      for (const r of parsed.data.readings) await saveReading(db, r);
      setNote(`Brought in: ${parsed.data.journal.length} entries, ${parsed.data.discoveries.length} discoveries, ${parsed.data.readings.length} readings. Nothing was duplicated.`);
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('IMPORT ERROR:', msg);
      setNote(`Error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Home" onPress={() => router.push('/')} />
      <Label style={styles.eyebrow}>YOUR DATA</Label>
      <Display style={styles.title}>It's yours. Take it anywhere.</Display>
      <Subtle>
        Everything lives on this phone only. When you change phones,
        pack it up and bring it with you — no account, no cloud.
      </Subtle>

      <Pressable style={styles.primaryBtn} onPress={() => void handleExport()} disabled={busy}>
        <Body style={styles.primaryText}>Export everything</Body>
      </Pressable>
      <Pressable style={styles.ghostBtn} onPress={() => void handleImport()} disabled={busy}>
        <Body style={styles.ghostText}>Import from another phone</Body>
      </Pressable>

      {note !== null && (
        <View style={styles.noteCard}>
          <Body style={styles.ornament}>❦</Body>
          <Subtle>{note}</Subtle>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 32, lineHeight: 40 },
  primaryBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.md },
  primaryText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  ghostBtn: { padding: 18, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.divider },
  ghostText: { color: theme.colors.ink, fontFamily: theme.fonts.bodySemibold },
  noteCard: { borderWidth: 1, borderColor: theme.colors.bronze, borderRadius: theme.radius.md, padding: 20, gap: 10, backgroundColor: theme.colors.background, marginTop: theme.spacing.sm },
  ornament: { color: theme.colors.bronze, fontSize: 18, textAlign: 'center' },
});
