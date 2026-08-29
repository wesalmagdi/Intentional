import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CHOOSE_PROMPTS } from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

export default function ChooseScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kept, setKept] = useState(false);

  async function handleKeep() {
    const attention = (answers.attention ?? '').trim();
    if (attention.length === 0) return;
    await saveDiscovery(await getDb(), {
      id: Date.now().toString(), userId: 'local', category: 'Choose',
      prompt: 'What deserves your attention today?',
      findings: { attention, setdown: (answers.setdown ?? '').trim() },
      createdAt: new Date().toISOString(),
    });
    setKept(true);
  }

  if (kept) return (
    <View style={styles.center}>
      <Text style={styles.ornament}>❦</Text>
      <Text style={styles.keptTitle}>Chosen.</Text>
      <Pressable style={styles.homeBtn} onPress={() => router.push('/')}><Text style={styles.homeText}>Home</Text></Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.push('/')}><Text style={styles.back}>← Home</Text></Pressable>
      <Text style={styles.eyebrow}>CHOOSE</Text>
      <Text style={styles.headline}>Attention is a choice.</Text>

      {CHOOSE_PROMPTS.map(p => {
        const open = expanded === p.id;
        return (
          <View key={p.id} style={[styles.card, open && styles.cardActive]}>
            <Pressable style={styles.header} onPress={() => setExpanded(open ? null : p.id)}>
              <View style={styles.headerText}>
                <Text style={styles.cardLabel}>{p.label}</Text>
                <Text style={styles.cardSub}>{p.sublabel}</Text>
              </View>
              <Feather name={open ? 'minus' : 'plus'} size={18} color={colors.copper} />
            </Pressable>
            {open && (
              <View style={styles.inputWrap}>
                <TextInput style={styles.input} multiline autoFocus placeholder="Write freely..." placeholderTextColor={colors.stone}
                  value={answers[p.id] ?? ''} onChangeText={t => setAnswers({ ...answers, [p.id]: t })} />
              </View>
            )}
          </View>
        );
      })}

      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}><Text style={styles.keepText}>Keep this.</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: 0, gap: space[4] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4], backgroundColor: colors.cream },
  ornament: { fontFamily: typography.families.display, fontSize: 24, color: colors.copper },
  keptTitle: { fontFamily: typography.families.display, fontSize: 32, color: colors.ink },
  back: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper, marginTop: space[4] },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 28, lineHeight: 36, color: colors.ink, marginBottom: space[3] },
  card: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, overflow: 'hidden' },
  cardActive: { borderColor: colors.copper },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space[5], gap: space[3] },
  headerText: { flex: 1, gap: 3 },
  cardLabel: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.ink },
  cardSub: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone },
  inputWrap: { paddingHorizontal: space[5], paddingBottom: space[5] },
  input: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, minHeight: 100, textAlignVertical: 'top', lineHeight: 24 },
  keepBtn: { backgroundColor: colors.copperDeep, padding: 17, borderRadius: radius.sm, alignItems: 'center', marginTop: space[3] },
  keepText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  homeBtn: { paddingHorizontal: space[8], paddingVertical: space[3], borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm },
  homeText: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.ink },
});
