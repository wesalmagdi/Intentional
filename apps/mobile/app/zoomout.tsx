import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ZOOMOUT_PROMPTS, type Discovery } from '@intentional/domain';
import type { ResonantMatch } from '@intentional/resonance';
import { getDiscoveries, saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { resonantWith, discoveryText } from '../lib/resonance';
import { colors, typography, space, radius } from '@intentional/ui';
import { HorizonGlow } from '../components/Scenery';

function snippet(t: string): string { return t.length > 140 ? `${t.slice(0, 140)}…` : t; }

export default function ZoomOutScreen() {
  const [subject, setSubject] = useState<Discovery | null | undefined>(undefined);
  const [echo, setEcho] = useState<ResonantMatch | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kept, setKept] = useState(false);

  useEffect(() => {
    void (async () => {
      const all = await getDiscoveries(await getDb());
      setSubject(all[0] ?? null);
    })();
  }, []);

  useEffect(() => {
    if (!subject) return;
    void (async () => setEcho(await resonantWith(discoveryText(subject), { excludeRawId: subject.id, threshold: 0.1 })))();
  }, [subject]);

  async function handleKeep() {
    if (!subject) return;
    const part = (answers.part ?? '').trim();
    const connect = (answers.connect ?? '').trim();
    if (part.length === 0 && connect.length === 0) return;
    await saveDiscovery(await getDb(), {
      id: Date.now().toString(), userId: 'local', category: 'Zoom Out',
      prompt: subject.prompt, findings: { part, connect }, createdAt: new Date().toISOString(),
    });
    setKept(true);
  }

  if (kept) return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={styles.center}>
      <HorizonGlow />
      <Text style={styles.keptTitle}>Seen from further away.</Text>
      <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Text style={styles.homeText}>Home</Text></Pressable>
    </LinearGradient>
  );

  if (subject === undefined) return <View style={{ flex: 1, backgroundColor: colors.night }} />;

  if (subject === null) return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={styles.center}>
      <HorizonGlow />
      <Text style={styles.keptTitle}>Zoom out.</Text>
      <Text style={styles.centerSub}>This practice needs something to look at.{"\n"}Finish a Learn challenge first.</Text>
      <Pressable style={styles.homeBtn} onPress={() => router.push('/learn')}><Text style={styles.homeText}>Begin Learn</Text></Pressable>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={styles.gradient}>
      <HorizonGlow />
      <ScrollView contentContainerStyle={styles.scroll} style={{ zIndex: 1 }}>
        <Pressable onPress={() => router.push('/')}><Text style={styles.back}>← Home</Text></Pressable>
        <Text style={styles.eyebrow}>ZOOM OUT</Text>
        <Text style={styles.subjectLabel}>RECENTLY KEPT</Text>
        <Text style={styles.subject} numberOfLines={3}>"{subject.prompt}"</Text>

        {echo !== null && (
          <View style={styles.echoCard}>
            <Text style={styles.echoLabel}>FROM YOUR LIBRARY — IT ECHOES</Text>
            <Text style={styles.echoText} numberOfLines={3}>"{snippet(echo.note.text)}"</Text>
            <Text style={styles.echoDate}>{new Date(echo.note.createdAt).toLocaleDateString()}</Text>
          </View>
        )}

        {ZOOMOUT_PROMPTS.map(p => {
          const open = expanded === p.id;
          return (
            <View key={p.id} style={[styles.card, open && styles.cardActive]}>
              <Pressable style={styles.header} onPress={() => setExpanded(open ? null : p.id)}>
                <View style={styles.headerText}>
                  <Text style={styles.cardLabel}>{p.label}</Text>
                  <Text style={styles.cardSub}>{p.sublabel}</Text>
                </View>
                <Feather name={open ? 'minus' : 'plus'} size={18} color={colors.copperSoft} />
              </Pressable>
              {open && (
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} multiline autoFocus placeholder="Write freely..." placeholderTextColor="rgba(244,238,227,0.4)"
                    value={answers[p.id] ?? ''} onChangeText={t => setAnswers({ ...answers, [p.id]: t })} />
                </View>
              )}
            </View>
          );
        })}

        <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}><Text style={styles.keepText}>Keep this.</Text></Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: space[6], paddingTop: space[8], gap: space[4] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4], padding: space[6] },
  centerSub: { fontFamily: typography.families.body, fontSize: 14, color: colors.cream, opacity: 0.6, textAlign: 'center', lineHeight: 22 },
  keptTitle: { fontFamily: typography.families.display, fontSize: 30, color: colors.cream, textAlign: 'center' },
  back: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.cream, opacity: 0.6 },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copperSoft, marginTop: space[4] },
  subjectLabel: { fontFamily: typography.families.body, fontSize: 11, letterSpacing: 1.5, color: colors.stone },
  subject: { fontFamily: typography.families.displayItalic, fontSize: 26, lineHeight: 34, color: colors.cream },
  echoCard: { borderWidth: 1, borderColor: colors.hairlineDark, borderRadius: radius.md, padding: space[4], gap: space[2], backgroundColor: 'rgba(244,238,227,0.05)' },
  echoLabel: { fontFamily: typography.families.body, fontSize: 10, letterSpacing: 1.5, color: colors.stone },
  echoText: { fontFamily: typography.families.displayItalic, fontSize: 16, lineHeight: 24, color: colors.cream, opacity: 0.9 },
  echoDate: { fontFamily: typography.families.body, fontSize: 11, color: colors.stone },
  card: { borderWidth: 1, borderColor: colors.hairlineDark, borderRadius: radius.md, overflow: 'hidden' },
  cardActive: { borderColor: colors.copperSoft },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space[5], gap: space[3] },
  headerText: { flex: 1, gap: 3 },
  cardLabel: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.cream },
  cardSub: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone },
  inputWrap: { paddingHorizontal: space[5], paddingBottom: space[5] },
  input: { fontFamily: typography.families.body, fontSize: 15, color: colors.cream, minHeight: 100, textAlignVertical: 'top', lineHeight: 24, backgroundColor: 'rgba(244,238,227,0.06)', borderRadius: radius.sm, padding: space[3] },
  keepBtn: { backgroundColor: colors.cream, padding: 17, borderRadius: radius.sm, alignItems: 'center', marginTop: space[3] },
  keepText: { color: colors.night, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  homeBtn: { paddingHorizontal: space[8], paddingVertical: space[3], borderWidth: 1, borderColor: colors.hairlineDark, borderRadius: radius.sm },
  homeText: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.cream },
});
