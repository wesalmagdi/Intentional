import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getDiscoveries, getPreference } from '@intentional/database';
import { getDb } from '../../lib/db';
import { nextRevisit } from '../../lib/revisit';
import type { Discovery } from '@intentional/domain';
import { colors, typography, space, radius, elevation } from '@intentional/ui';
import { MountainDusk } from '../../components/Scenery';

const PRACTICES = [
  { label: 'Learn', sub: 'Explore something curious.', icon: 'book-open' as const, path: '/learn' },
  { label: 'Journal', sub: 'Give your thoughts some space.', icon: 'edit-3' as const, path: '/journal' },
  { label: 'Notice', sub: "Pay attention to what's around you.", icon: 'eye' as const, path: '/notice' },
  { label: 'Choose', sub: 'Think before deciding.', icon: 'compass' as const, path: '/choose' },
  { label: 'Zoom Out', sub: 'See the bigger picture.', icon: 'globe' as const, path: '/zoomout' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Be gentle with yourself.';
  if (h < 12) return 'Good morning.';
  if (h < 18) return 'Good afternoon.';
  return 'Good evening.';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [memory, setMemory] = useState<Discovery | null>(null);
  const [activeSession, setActiveSession] = useState<string>('');

  useEffect(() => {
    void (async () => {
      setMemory(await nextRevisit(await getDiscoveries(await getDb())));
      setActiveSession((await getPreference(await getDb(), 'activeSession')) || '');
    })();
  }, []);

  function returnToSession() {
    if (activeSession === 'notice') router.push('/notice');
    else if (activeSession === 'challenge') router.push('/challenge');
    else if (activeSession === 'journal') router.push('/journal');
  }

  return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={[styles.gradient, { paddingTop: insets.top }]}>
      <MountainDusk />
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={styles.above}>
        <View style={styles.topRow}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <View style={styles.avatar}><Feather name="user" size={16} color={colors.cream} /></View>
        </View>

        {activeSession && (
          <Pressable style={styles.sessionCard} onPress={returnToSession}>
            <Feather name="activity" size={16} color={colors.copper} />
            <Text style={styles.sessionText}>You have a session in progress</Text>
            <Feather name="chevron-right" size={16} color={colors.cream} />
          </Pressable>
        )}

        <Text style={styles.headline}>What deserves{"\n"}your attention{"\n"}now?</Text>

        <View style={styles.card}>
          {PRACTICES.map((p, i) => (
            <Pressable key={p.path} style={[styles.row, i < PRACTICES.length - 1 && styles.rowBorder]} onPress={() => router.push(p.path as never)}>
              <View style={styles.rowIcon}><Feather name={p.icon} size={17} color={colors.copperDeep} /></View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{p.label}</Text>
                <Text style={styles.rowSub}>{p.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.stone} />
            </Pressable>
          ))}
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      {memory !== null && (
        <Pressable style={[styles.memoryBar, { paddingBottom: insets.bottom + space[4] }]} onPress={() => router.push('/revisit')}>
          <Text style={styles.memoryText} numberOfLines={2}>You wanted to remember something.</Text>
          <View style={styles.memoryCta}>
            <Text style={styles.memoryCtaText}>Revisit</Text>
            <Feather name="chevron-right" size={14} color={colors.copperSoft} />
          </View>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  above: { zIndex: 1 },
  container: { padding: space[6], paddingTop: 0 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[5] },
  greeting: { fontFamily: typography.families.displayItalic, fontSize: 17, color: colors.cream, opacity: 0.75 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.hairlineDark, alignItems: 'center', justifyContent: 'center' },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.nightCard, borderRadius: radius.md, padding: space[4], marginBottom: space[5] },
  sessionText: { flex: 1, fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.cream },
  headline: { fontFamily: typography.families.display, fontSize: 32, lineHeight: 40, color: colors.cream, marginBottom: space[7] },
  card: { backgroundColor: colors.creamCard, borderRadius: radius.lg, paddingHorizontal: space[4], ...elevation.floating },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space[4], gap: space[3] },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.creamSunken, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
  memoryBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.night, borderTopWidth: 1, borderTopColor: colors.hairlineDark, paddingHorizontal: space[6], paddingTop: space[4], paddingBottom: space[8], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[4] },
  memoryText: { flex: 1, fontFamily: typography.families.body, fontSize: 13, color: colors.cream, opacity: 0.8 },
  memoryCta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memoryCtaText: { fontFamily: typography.families.bodySemibold, fontSize: 13, color: colors.copperSoft },
});
