import { useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FS from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ExportBundleSchema } from '@intentional/domain';
import {
  getDiscoveries, getJournalEntries, getReadings,
  saveDiscovery, saveJournalEntry, saveReading,
} from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

const FileSystem = FS as any;

export default function DataScreen() {
  const insets = useSafeAreaInsets();
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
        app: 'intentional', version: 1, exportedAt: new Date().toISOString(),
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
      setNote(`Error: ${err?.message || String(err)}`);
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
      try { parsed = ExportBundleSchema.safeParse(JSON.parse(raw)); }
      catch { setNote("That file couldn't be read."); return; }
      if (!parsed.success) { setNote("That file doesn't look like Intentional data."); return; }
      const db = await getDb();
      for (const e of parsed.data.journal) await saveJournalEntry(db, e);
      for (const d of parsed.data.discoveries) await saveDiscovery(db, d);
      for (const r of parsed.data.readings) await saveReading(db, r);
      setNote(`Brought in: ${parsed.data.journal.length} entries, ${parsed.data.discoveries.length} discoveries, ${parsed.data.readings.length} readings.`);
    } catch (err: any) {
      setNote(`Error: ${err?.message || String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.push('/')}><Text style={styles.back}>← Home</Text></Pressable>
      <Text style={styles.eyebrow}>YOUR DATA</Text>
      <Text style={styles.headline}>It's yours.{"\n"}Take it anywhere.</Text>
      <Text style={styles.sub}>Everything lives on this phone only. When you change phones, pack it up and bring it with you — no account, no cloud.</Text>

      <Pressable style={styles.primaryBtn} onPress={() => void handleExport()} disabled={busy}>
        <Text style={styles.primaryText}>Export everything</Text>
      </Pressable>
      <Pressable style={styles.ghostBtn} onPress={() => void handleImport()} disabled={busy}>
        <Text style={styles.ghostText}>Import from another phone</Text>
      </Pressable>

      {note !== null && (
        <View style={styles.noteCard}>
          <Text style={styles.ornament}>❦</Text>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: 0, gap: space[4] },
  back: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper, marginTop: space[4] },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 30, lineHeight: 38, color: colors.ink },
  sub: { fontFamily: typography.families.body, fontSize: 14, lineHeight: 22, color: colors.stone, marginBottom: space[3] },
  primaryBtn: { backgroundColor: colors.copperDeep, padding: 17, borderRadius: radius.sm, alignItems: 'center' },
  primaryText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  ghostBtn: { padding: 17, borderRadius: radius.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.hairline },
  ghostText: { color: colors.ink, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  noteCard: { borderWidth: 1, borderColor: colors.copper, borderRadius: radius.md, padding: space[5], gap: space[2], backgroundColor: colors.creamCard, marginTop: space[3] },
  ornament: { fontFamily: typography.families.display, fontSize: 18, color: colors.copper, textAlign: 'center' },
  noteText: { fontFamily: typography.families.body, fontSize: 13, lineHeight: 20, color: colors.inkSoft, textAlign: 'center' },
});
