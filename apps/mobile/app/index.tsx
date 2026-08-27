import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import { isRevisitWorthy, type Discovery } from '@intentional/domain';
import { pickResonant } from '../lib/resonance';

type IconName = 'feather' | 'eye' | 'crosshair' | 'zoom-out' | 'book' | 'book-open' | 'download';

const PRACTICES: Array<{ label: string; path: string; icon: IconName; hint: string }> = [
  { label: 'Journal', path: '/journal', icon: 'feather', hint: 'Think without performing.' },
  { label: 'Notice', path: '/notice', icon: 'eye', hint: 'One quiet minute.' },
  { label: 'Choose', path: '/choose', icon: 'crosshair', hint: 'Attention is a choice.' },
  { label: 'Zoom Out', path: '/zoomout', icon: 'zoom-out', hint: 'See it from further away.' },
  { label: 'Reading Room', path: '/reading', icon: 'book', hint: 'Sit with a text.' },
  { label: 'Library', path: '/library', icon: 'book-open', hint: 'What you have kept.' },
  { label: 'Your Data', path: '/data', icon: 'download', hint: 'Take it anywhere.' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Be gentle with yourself.';
  if (h < 12) return 'Good morning.';
  if (h < 18) return 'Good afternoon.';
  return 'Good evening.';
}

export default function HomeScreen() {
  const [memory, setMemory] = useState<Discovery | null>(null);
  const [byEcho, setByEcho] = useState(false);

  useEffect(() => {
    void (async () => {
      const all = await getDiscoveries(await getDb());
      const worthy = all.filter(d => isRevisitWorthy(d.createdAt, new Date()));
      const picked = await pickResonant(worthy);
      setMemory(picked.discovery);
      setByEcho(picked.byEcho);
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>{greeting()}</Label>
      <Display style={styles.title}>A quiet place to begin.</Display>

      <Pressable style={styles.hero} onPress={() => router.push('/learn')}>
        <View style={styles.heroTop}>
          <Subtle style={styles.heroLabel}>THE RITUAL</Subtle>
          <Feather name="compass" size={22} color={theme.colors.bronze} />
        </View>
        <Display style={styles.heroTitle}>Learn</Display>
        <Body style={styles.heroSub}>A 10-minute search for what matters.</Body>
        <View style={styles.heroFooter}>
          <Subtle>10 minutes • no dashboard</Subtle>
          <Body style={styles.heroCta}>Begin →</Body>
        </View>
      </Pressable>

      {memory !== null && (
        <Pressable style={styles.memory} onPress={() => router.push('/revisit')}>
          <Body style={styles.ornament}>❦</Body>
          <Subtle style={styles.memoryLabel}>A MEMORY SURFACES</Subtle>
          <Body style={styles.memoryText} numberOfLines={2}>"{memory.prompt}"</Body>
          {byEcho && <Subtle style={styles.memoryEcho}>It echoes your recent writing.</Subtle>}
          <Body style={styles.heroCta}>Revisit →</Body>
        </Pressable>
      )}

      <View style={styles.list}>
        {PRACTICES.map(p => (
          <Pressable key={p.path} style={styles.row} onPress={() => router.push(p.path as never)}>
            <Feather name={p.icon} size={18} color={theme.colors.grey} style={styles.rowIcon} />
            <View style={styles.rowText}>
              <Body style={styles.rowLabel}>{p.label}</Body>
              <Subtle style={styles.rowHint}>{p.hint}</Subtle>
            </View>
            <Subtle>→</Subtle>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 70, paddingBottom: 90 },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 34, lineHeight: 42, marginBottom: theme.spacing.sm },
  hero: { backgroundColor: theme.colors.surface, padding: 28, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.divider, gap: 12 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { letterSpacing: 1.5 },
  heroTitle: { fontSize: 30 },
  heroSub: {},
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: 16, marginTop: 4 },
  heroCta: { fontFamily: theme.fonts.bodySemibold, color: theme.colors.bronze },
  memory: { padding: 26, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.bronze, gap: 10, backgroundColor: theme.colors.background },
  ornament: { color: theme.colors.bronze, fontSize: 20 },
  memoryLabel: { color: theme.colors.bronze, letterSpacing: 1.5 },
  memoryText: { fontFamily: theme.fonts.displayItalic, fontSize: 19, lineHeight: 27 },
  memoryEcho: { fontStyle: 'italic', color: theme.colors.bronze },
  list: { marginTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  rowIcon: { width: 30 },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: theme.fonts.bodySemibold },
  rowHint: { fontSize: 13 },
});
