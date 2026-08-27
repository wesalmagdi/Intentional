import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getPreference, setPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

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
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Home" onPress={() => router.push('/')} />
      <Label style={styles.eyebrow}>SETTINGS</Label>
      <Display style={styles.title}>Your soundscape.</Display>
      <Subtle>Choose the background noise for your 10-minute challenges.</Subtle>

      <View style={styles.list}>
        {SOUND_OPTIONS.map(opt => (
          <Pressable
            key={opt.id}
            style={[styles.card, selected === opt.id && styles.cardActive]}
            onPress={() => void handleSelect(opt.id)}
          >
            <View style={styles.cardText}>
              <Body style={styles.cardTitle}>{opt.label}</Body>
              <Subtle>{opt.desc}</Subtle>
            </View>
            {selected === opt.id && <Feather name="check" size={20} color={theme.colors.bronze} />}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 32, lineHeight: 40 },
  list: { gap: 12, marginTop: theme.spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, backgroundColor: theme.colors.surface, padding: 20, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.divider },
  cardActive: { borderColor: theme.colors.bronze, backgroundColor: theme.colors.background },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: theme.fonts.display, fontSize: 19 },
});
