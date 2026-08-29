import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getPreference, setPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

export const SOUND_OPTIONS = [
  { id: 'focus', label: 'Deep Focus', desc: 'Warm brown noise for concentration.' },
  { id: 'rain', label: 'Rain', desc: 'Steady pink noise, like rain on a roof.' },
  { id: 'forest', label: 'Forest', desc: 'Wind and occasional bird calls.' },
] as const;

export type SoundId = typeof SOUND_OPTIONS[number]['id'];

export default function SettingsScreen() {
  const [selected, setSelected] = useState<SoundId>('focus');

  useEffect(() => {
    void (async () => {
      const val = await getPreference(await getDb(), 'soundscape');
      if (val && SOUND_OPTIONS.some(o => o.id === val)) setSelected(val as SoundId);
    })();
  }, []);

  async function handleSelect(id: SoundId) {
    setSelected(id);
    await setPreference(await getDb(), 'soundscape', id);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.push('/')}><Text style={styles.back}>← Home</Text></Pressable>
      <Text style={styles.eyebrow}>SETTINGS</Text>
      <Text style={styles.headline}>Your soundscape.</Text>
      <Text style={styles.sub}>Choose the background noise for your 10-minute challenges.</Text>

      {SOUND_OPTIONS.map(opt => (
        <Pressable key={opt.id} style={[styles.card, selected === opt.id && styles.cardActive]} onPress={() => void handleSelect(opt.id)}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{opt.label}</Text>
            <Text style={styles.cardSub}>{opt.desc}</Text>
          </View>
          {selected === opt.id && <Feather name="check" size={20} color={colors.copper} />}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[8], gap: space[4] },
  back: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper, marginTop: space[4] },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 28, color: colors.ink },
  sub: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, marginBottom: space[3] },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[4], backgroundColor: colors.creamCard, padding: space[5], borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  cardActive: { borderColor: colors.copper },
  cardText: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.ink },
  cardSub: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone },
});
