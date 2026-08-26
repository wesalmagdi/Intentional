import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ZOOMOUT_PROMPTS, type Discovery } from '@intentional/domain';
import { getDiscoveries, saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

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
      id: Date.now().toString(), userId: 'local', category: 'Zoom Out',
      prompt: subject.prompt, findings: { part, connect }, createdAt: new Date().toISOString(),
    });
    setKept(true);
  }

  if (kept) {
    return (
      <LinearGradient colors={[theme.colors.forest, theme.colors.forestDeep]} style={styles.center}>
        <Display style={styles.ivory}>Seen from further away.</Display>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Body style={styles.homeText}>Home</Body></Pressable>
      </LinearGradient>
    );
  }

  if (subject === undefined) return <View style={styles.blank} />;

  if (subject === null) {
    return (
      <LinearGradient colors={[theme.colors.forest, theme.colors.forestDeep]} style={styles.center}>
        <Display style={styles.ivory}>Zoom out.</Display>
        <Subtle style={styles.centerSub}>This practice needs something to look at.{"\n"}Finish a Learn challenge first.</Subtle>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/learn')}><Body style={styles.homeText}>Begin Learn</Body></Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.forest, theme.colors.forestDeep]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BackBar label="Home" onPress={() => router.push('/')} onDark />
        <Label style={styles.eyebrow}>ZOOM OUT</Label>
        <Subtle style={styles.subjectLabel}>RECENTLY KEPT</Subtle>
        <Display style={styles.subject} numberOfLines={3}>"{subject.prompt}"</Display>

        <View style={styles.prompts}>
          {ZOOMOUT_PROMPTS.map(p => {
            const open = expanded === p.id;
            return (
              <View key={p.id} style={[styles.card, open && styles.cardActive]}>
                <Pressable style={styles.header} onPress={() => setExpanded(open ? null : p.id)}>
                  <View style={styles.headerText}>
                    <Body style={styles.cardLabel}>{p.label}</Body>
                    <Subtle style={styles.cardSub}>{p.sublabel}</Subtle>
                  </View>
                  <Feather name={open ? 'minus' : 'plus'} size={18} color={theme.colors.ivory} />
                </Pressable>
                {open && (
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
            );
          })}
        </View>

        <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}>
          <Body style={styles.keepText}>Keep this.</Body>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg, padding: theme.spacing.lg },
  blank: { flex: 1, backgroundColor: theme.colors.forest },
  centerSub: { color: theme.colors.ivory, opacity: 0.7, textAlign: 'center', lineHeight: 24 },
  ivory: { color: theme.colors.ivory },
  eyebrow: { color: theme.colors.ivory, opacity: 0.6, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  subjectLabel: { color: theme.colors.ivory, opacity: 0.5, letterSpacing: 1.5 },
  subject: { color: theme.colors.ivory, fontSize: 28, lineHeight: 36 },
  prompts: { gap: 14, marginTop: theme.spacing.sm },
  card: { borderWidth: 1, borderColor: 'rgba(247,245,240,0.22)', borderRadius: theme.radius.md, overflow: 'hidden' },
  cardActive: { borderColor: theme.colors.ivory },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, gap: 14 },
  headerText: { flex: 1, gap: 3 },
  cardLabel: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
  cardSub: { color: theme.colors.ivory, opacity: 0.6 },
  input: { padding: 20, paddingTop: 0, fontSize: 16, fontFamily: theme.fonts.body, color: theme.colors.ivory, minHeight: 110, textAlignVertical: 'top', backgroundColor: 'rgba(247,245,240,0.08)', lineHeight: 26 },
  keepBtn: { backgroundColor: theme.colors.ivory, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.sm },
  keepText: { color: theme.colors.forest, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
  homeBtn: { paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(247,245,240,0.4)', borderRadius: theme.radius.sm },
  homeText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold },
});
