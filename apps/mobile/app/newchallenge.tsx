import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LEARN_PROMPTS } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

const TOPIC_POOLS: Record<string, string[]> = {
  General: ['Why do we keep souvenirs?', 'What makes a room feel calm?', 'Why do we hum?', 'What happened to the things we lost?', 'Why do queues form?', 'What is the oldest thing you own?'],
  Everyday: ['Why do we say "bless you"?', 'Who invented the sandwich?', 'Why is coffee the default morning ritual?', 'Where does the weekend go?', 'Why do we take the long way home?', 'What makes a meal "comfort food"?'],
  Nature: ['How do birds know when to leave?', 'Why is the sea salty?', 'How do trees talk underground?', 'Why do cats purr?', 'Where do butterflies winter?', 'How does moss choose its side?'],
  Objects: ['Who decided the shape of a fork?', 'Why are keys still metal?', 'What is the story of the umbrella?', 'Why do clocks go clockwise?', 'How did the mirror change us?', 'Why is paper still here?'],
  People: ['Why do we blush?', 'How did handshakes start?', 'Why do we keep old letters?', 'What makes someone good with names?', 'Why do strangers help strangers?', 'How do accents form?'],
};

const DEEP_POOLS = LEARN_PROMPTS as Record<string, string[]>;

type Mode = 'topics' | 'deep' | 'own';

export default function NewChallengeScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('topics');
  const topicKeys = Object.keys(TOPIC_POOLS);
  const deepKeys = Object.keys(DEEP_POOLS);
  const [topicCat, setTopicCat] = useState(topicKeys[0]);
  const [deepCat, setDeepCat] = useState(deepKeys[0]);
  const [card, setCard] = useState<string | null>(null);
  const [own, setOwn] = useState('');

  const keys = mode === 'deep' ? deepKeys : topicKeys;
  const activeCat = mode === 'deep' ? deepCat : topicCat;
  const pool = (mode === 'deep' ? DEEP_POOLS[deepCat] : TOPIC_POOLS[topicCat]) ?? [];

  function spin() {
    const options = pool.filter(p => p !== card);
    if (options.length === 0) return;
    setCard(options[Math.floor(Math.random() * options.length)]);
  }

  function begin(prompt: string, category: string) {
    if (prompt.trim().length === 0) return;
    router.push({ pathname: '/challenge', params: { prompt: prompt.trim(), category } });
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="x" size={22} color={colors.ink} /></Pressable>

      <Text style={styles.headline}>What pulls you?</Text>

      <View style={styles.tabs}>
        {([['topics', '✦ Topics'], ['deep', '🔍 Deep'], ['own', '✎ My own']] as [Mode, string][]).map(([m, label]) => (
          <Pressable key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => { setMode(m); setCard(null); }}>
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {mode !== 'own' ? (
        <>
          <Text style={styles.modeDesc}>
            {mode === 'topics' ? 'Light curiosities. Follow the one that pulls.' : 'Big questions. Ten minutes of honest search.'}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsInner}>
            {keys.map(k => (
              <Pressable key={k} style={[styles.chip, activeCat === k && styles.chipActive]}
                onPress={() => { if (mode === 'deep') setDeepCat(k); else setTopicCat(k); setCard(null); }}>
                <Text style={[styles.chipText, activeCat === k && styles.chipTextActive]}>{k}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>{activeCat.toUpperCase()}</Text>
            <Text style={styles.cardText}>{card ?? 'Ready.'}</Text>
          </View>

          <View style={styles.btnRow}>
            <Pressable style={styles.spinBtn} onPress={spin}>
              <Feather name="shuffle" size={15} color={colors.ink} />
              <Text style={styles.spinText}>Spin</Text>
            </Pressable>
            <Pressable style={[styles.beginBtn, !card && styles.beginDisabled]} disabled={!card}
              onPress={() => begin(card ?? '', activeCat)}>
              <Text style={styles.beginText}>Begin 10 minutes</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.modeDesc}>You bring the question.</Text>
          <View style={styles.inputCard}>
            <TextInput style={styles.input} multiline placeholder={"Ask a question...\n(e.g. Why do we dream?)"} placeholderTextColor={colors.stone} value={own} onChangeText={setOwn} />
          </View>
          <Pressable style={[styles.beginBtn, styles.beginSolo, !own.trim() && styles.beginDisabled]} disabled={!own.trim()}
            onPress={() => begin(own, 'Curiosity')}>
            <Text style={styles.beginText}>Begin 10 minutes</Text>
          </Pressable>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], gap: space[4] },
  headline: { fontFamily: typography.families.display, fontSize: 30, lineHeight: 38, color: colors.ink, marginTop: space[4] },
  tabs: { flexDirection: 'row', gap: space[2] },
  tab: { paddingHorizontal: space[4], paddingVertical: space[2] + 2, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.creamCard },
  tabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.ink },
  tabTextActive: { color: colors.cream },
  modeDesc: { fontFamily: typography.families.body, fontSize: 14, color: colors.copper, marginTop: -space[2] },
  chipsRow: { maxHeight: 40 },
  chipsInner: { flexDirection: 'row', gap: space[2], paddingRight: space[6] },
  chip: { paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.ink },
  chipTextActive: { color: colors.cream },
  card: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, padding: space[6], minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: space[3] },
  cardEyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 10, letterSpacing: 1.5, color: colors.copper },
  cardText: { fontFamily: typography.families.displayItalic, fontSize: 22, lineHeight: 30, color: colors.ink, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: space[3] },
  spinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], backgroundColor: colors.creamSunken, borderRadius: radius.sm, paddingHorizontal: space[5], paddingVertical: space[4] },
  spinText: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.ink },
  beginBtn: { flex: 1, backgroundColor: colors.copperDeep, borderRadius: radius.sm, paddingVertical: space[4], alignItems: 'center' },
  beginSolo: { marginTop: space[2] },
  beginDisabled: { opacity: 0.4 },
  beginText: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.cream },
  inputCard: { backgroundColor: colors.creamCard, borderRadius: radius.md, padding: space[4], borderWidth: 1, borderColor: colors.hairline, minHeight: 130 },
  input: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, minHeight: 100, textAlignVertical: 'top', lineHeight: 24 },
});
