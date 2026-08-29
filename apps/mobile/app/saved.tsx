import { StyleSheet, View, Pressable, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { setPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { HorizonGlow } from '../components/Scenery';

const OPTIONS = [
  { label: '1 week', days: 7 }, { label: '1 month', days: 30 },
  { label: '6 months', days: 180 }, { label: '1 year', days: 365 }, { label: 'Choose date', days: 90 },
];

export default function SavedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  async function schedule(days: number) {
    if (id) {
      const at = new Date(Date.now() + days * 86_400_000).toISOString();
      await setPreference(await getDb(), `revisitAt:${id}`, at);
    }
    router.replace('/');
  }

  return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={styles.gradient}>
      <HorizonGlow />
      <View style={styles.checkWrap}>
        <View style={styles.checkRing}><Feather name="check" size={30} color={colors.copperSoft} /></View>
      </View>
      <Text style={styles.saved}>Saved.</Text>
      <Text style={styles.ask}>Want to remember this later?</Text>

      <View style={styles.options}>
        {OPTIONS.map(o => (
          <Pressable key={o.label} style={styles.optionRow} onPress={() => void schedule(o.days)}>
            <Feather name="calendar" size={15} color={colors.copperSoft} />
            <Text style={styles.optionLabel}>{o.label}</Text>
            <Feather name="chevron-right" size={15} color={colors.stone} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.skip} onPress={() => router.replace('/')}><Text style={styles.skipText}>Skip for now</Text></Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, padding: space[6] },
  checkWrap: { alignItems: 'center', marginTop: space[10] },
  checkRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 1.5, borderColor: colors.copperSoft, alignItems: 'center', justifyContent: 'center' },
  saved: { fontFamily: typography.families.display, fontSize: 30, color: colors.cream, textAlign: 'center', marginTop: space[5] },
  ask: { fontFamily: typography.families.displayItalic, fontSize: 16, color: colors.cream, opacity: 0.7, textAlign: 'center', marginTop: space[2], marginBottom: space[7] },
  options: { gap: space[3] },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.nightCard, borderRadius: radius.sm, paddingHorizontal: space[4], paddingVertical: space[4] },
  optionLabel: { flex: 1, fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.cream },
  skip: { alignItems: 'center', marginTop: 'auto', paddingBottom: space[6] },
  skipText: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone },
});
