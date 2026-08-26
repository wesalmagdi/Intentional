import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ZOOMOUT_PROMPTS, type Discovery } from '@intentional/domain';
import { getDiscoveries, saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function ZoomOutScreen() {
  const [subject, setSubject] = useState<Discovery | null | undefined>(undefined);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kept, setKept] = useState(false);

  useEffect(() => {
    void (async () => {
      const all = await getDiscoveries(await getDb());
      setSubject(all[0] ?? null);
    })();
  }, []);

  async function handleKeep() {
    if (!subject) return;
    const part = (answers.part ?? '').trim();
    const connect = (answers.connect ?? '').trim();
    if (part.length === 0 && connect.length === 0) return;
    const db = await getDb();
    await saveDiscovery(db, {
      id: Date.now().toString(),
      userId: 'local',
      category: 'Zoom Out',
      prompt: subject.prompt,
      findings: { part, connect },
      createdAt: new Date().toISOString(),
    });
    setKept(true);
  }

  if (kept) {
    return (
      <View style={styles.center}>
        <Display style={styles.ivoryText}>Seen from further away.</Display>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
      </View>
    );
  }

  if (subject === undefined) return <View style={styles.center} />;

  if (subject === null) {
    return (
      <View style={styles.center}>
        <Display style={styles.ivoryText}>Zoom out.</Display>
        <Subtle style={styles.centerSub}>This practice needs something to look at.{"\n"}Finish a Learn challenge first.</Subtle>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/learn')}><Body style={styles.homeText}>Begin Learn</Body></Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label style={styles.label}>ZOOM OUT</Label>
      <Subtle style={styles.subjectLabel}>RECENTLY KEPT</Subtle>
      <Display style={styles.subject} numberOfLines={3}>"{subject.prompt}"</Display>

      <View style={styles.prompts}>
        {ZOOMOUT_PROMPTS.map(p => (
          <View key={p.id} style={styles.card}>
            <Pressable style={styles.header} onPress={() => setExpanded(expanded === p.id ? null : p.id)}>
              <View><Body style={styles.cardLabel}>{p.label}</Body><Subtle style={styles.cardSub}>{p.sublabel}</Subtle></View>
              <Body style={styles.cardLabel}>{expanded === p.id ? '−' : '+'}</Body>
            </Pressable>
            {expanded === p.id && (
              <TextInput
                style={styles.input}
                multiline
                autoFocus
                placeholder="Write freely..."
                placeholderTextColor="rgba(247,245,240,0.5)"
                value={answers[p.id] ?? ''}
                onChangeText={t => setAnswers({ ...answers, [p.id]: t })}
              />
            )}
          </View>
        ))}
      </View>

      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}>
        <Body style={styles.keepText}>Keep this.</Body>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 60, backgroundColor: theme.colors.forest },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.forest, padding: theme.spacing.lg },
  centerSub: { color: theme.colors.ivory, opacity: 0.7, textAlign: 'center', lineHeight: 24 },
  ivoryText: { color: theme.colors.ivory },
  label: { color: theme.colors.ivory, opacity: 0.6 },
  subjectLabel: { color: theme.colors.ivory, opacity: 0.5, letterSpacing: 1.5 },
  subject: { color: theme.colors.ivory, fontFamily: theme.fonts.displayItalic, fontSize: 28, lineHeight: 36 },
  prompts: { gap: 16, marginTop: 20 },
  card: { borderWidth: 1, borderColor: 'rgba(247,245,240,0.25)', borderRadius: theme.radius.md, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  cardLabel: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, marginBottom: 4 },
  cardSub: { color: theme.colors.ivory, opacity: 0.6 },
  input: { padding: 20, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ivory, minHeight: 110, textAlignVertical: 'top', backgroundColor: 'rgba(247,245,240,0.08)' },
  keepBtn: { backgroundColor: theme.colors.ivory, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 30 },
  keepText: { color: theme.colors.forest, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  homeBtn: { paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(247,245,240,0.4)', borderRadius: theme.radius.sm },
  homeText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
});
