import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import { nextRevisit, timeAgo } from '../lib/revisit';
import type { Discovery } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';

export default function RevisitScreen() {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<Discovery | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [memory, setMemory] = useState('');
  const [nowThought, setNowThought] = useState('');
  const [since, setSince] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    void (async () => {
      setCurrent(await nextRevisit(await getDiscoveries(await getDb())));
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  if (current === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.ornament}>❦</Text>
        <Text style={styles.headline}>Nothing is ready yet.</Text>
        <Text style={styles.centerSub}>Discoveries ripen for a few days{"\n"}before they're worth revisiting.</Text>
        <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Text style={styles.homeText}>Home</Text></Pressable>
      </View>
    );
  }

  const original = Object.values(current.findings).filter(t => t && t.trim().length > 0).join('\n\n');

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="chevron-left" size={22} color={colors.ink} /></Pressable>
        {!revealed && <Pressable onPress={() => router.push('/')}><Text style={styles.skip}>Skip</Text></Pressable>}
        {revealed && <Pressable onPress={() => router.push('/')}><Text style={styles.skip}>Done</Text></Pressable>}
      </View>

      {!revealed ? (
        <>
          <View style={styles.plantWrap}><View style={styles.plantCircle}><Feather name="feather" size={18} color={colors.copper} /></View></View>
          <Text style={styles.caption}>You explored this {timeAgo(current.createdAt)}.</Text>
          <Text style={styles.headline}>{current.prompt}</Text>
          <View style={styles.rule} />
          <Text style={styles.caption}>Before reading your old notes:</Text>
          <Text style={styles.label}>What do you remember?</Text>
          <View style={styles.area}>
            <TextInput style={styles.areaInput} multiline placeholder="Write what you recall..." placeholderTextColor={colors.stone} value={memory} onChangeText={setMemory} />
          </View>
          <Pressable style={styles.revealBtn} onPress={() => setRevealed(true)}>
            <Text style={styles.revealText}>Reveal my old notes</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.caption}>Your notes from {new Date(current.createdAt).toLocaleDateString()}</Text>
          <View style={styles.oldCard}><Text style={styles.oldText}>{original || '…'}</Text></View>
          <Text style={styles.label}>What do you think now?</Text>
          <View style={styles.area}><TextInput style={styles.areaInput} multiline placeholder="Write your new thoughts..." placeholderTextColor={colors.stone} value={nowThought} onChangeText={setNowThought} /></View>
          <Text style={styles.label}>What did you learn since then?</Text>
          <View style={styles.area}><TextInput style={styles.areaInput} multiline placeholder="Optional" placeholderTextColor={colors.stone} value={since} onChangeText={setSince} /></View>
          <Pressable style={styles.revealBtn} onPress={() => router.push('/')}><Text style={styles.revealText}>Done</Text></Pressable>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4], backgroundColor: colors.cream, padding: space[6] },
  centerSub: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, textAlign: 'center', lineHeight: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skip: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.stone },
  plantWrap: { alignItems: 'center', marginTop: space[7] },
  plantCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.creamSunken, alignItems: 'center', justifyContent: 'center' },
  caption: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone, marginTop: space[5] },
  headline: { fontFamily: typography.families.display, fontSize: 27, lineHeight: 35, color: colors.ink, marginTop: space[2] },
  rule: { height: 1, backgroundColor: colors.hairline, marginVertical: space[5] },
  label: { fontFamily: typography.families.bodySemibold, fontSize: 13, color: colors.ink, marginBottom: space[2], marginTop: space[4] },
  area: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[3], minHeight: 100 },
  areaInput: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, minHeight: 80, textAlignVertical: 'top', lineHeight: 24 },
  revealBtn: { backgroundColor: colors.night, borderRadius: radius.sm, paddingVertical: space[4], alignItems: 'center', marginTop: space[6] },
  revealText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  oldCard: { backgroundColor: colors.creamSunken, borderRadius: radius.sm, padding: space[4], marginTop: space[3] },
  oldText: { fontFamily: typography.families.body, fontSize: 14, lineHeight: 23, color: colors.inkSoft },
  ornament: { fontFamily: typography.families.display, fontSize: 24, color: colors.copper },
  homeBtn: { paddingHorizontal: space[8], paddingVertical: space[4], borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm },
  homeText: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.ink },
});
