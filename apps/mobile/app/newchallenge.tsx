import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text, TextInput, Animated } from 'react-native';
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
  const [spinning, setSpinning] = useState(false);
  const [cycleDisplay, setCycleDisplay] = useState<string | null>(null);
  const cardScale = useState(() => new Animated.Value(1))[0];

  const keys = mode === 'deep' ? deepKeys : topicKeys;
  const activeCat = mode === 'deep' ? deepCat : topicCat;
  const pool = (mode === 'deep' ? DEEP_POOLS[deepCat] : TOPIC_POOLS[topicCat]) ?? [];

  function spin() {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    const options = pool.filter(p => p !== card);
    const totalCycles = 28;
    let cycle = 0;

    const doCycle = () => {
      const pick = options[Math.floor(Math.random() * options.length)];
      setCycleDisplay(pick);
      cycle++;
      if (cycle >= totalCycles) {
        const final = options[Math.floor(Math.random() * options.length)];
        setCycleDisplay(null);
        setCard(final);
        setSpinning(false);
        // Landing bounce
        Animated.sequence([
          Animated.timing(cardScale, { toValue: 1.04, duration: 120, useNativeDriver: true }),
          Animated.timing(cardScale, { toValue: 1.0, duration: 180, useNativeDriver: true }),
        ]).start();
        return;
      }
      // Slow down: exponential deceleration
      const delay = 50 + Math.pow(cycle, 1.6) * 6;
      setTimeout(doCycle, delay);
    };
    doCycle();
  }

  function begin(prompt: string, category: string) {
    if (prompt.trim().length === 0) return;
    router.push({ pathname: '/challenge', params: { prompt: prompt.trim(), category } });
  }

  const displayed = spinning ? cycleDisplay : (card ?? 'Ready.');

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="x" size={22} color={colors.ink} /></Pressable>

      <Text style={styles.headline}>What pulls you?</Text>

      <View style={styles.tabs}>
        {([['topics', 'Topics'], ['deep', 'Deep'], ['own', 'My own']] as [Mode, string][]).map(([m, label]) => (
          <Pressable key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => { setMode(m); setCard(null); setSpinning(false); }}>
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

          <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
            <Text style={styles.cardEyebrow}>{activeCat.toUpperCase()}</Text>
            <Text style={[styles.cardText, spinning && styles.cardTextSpin]} numberOfLines={4}>{displayed}</Text>
          </Animated.View>

          <View style={styles.btnRow}>
            <Pressable style={[styles.spinBtn, spinning && styles.spinBtnDisabled]} disabled={spinning || pool.length === 0} onPress={spin}>
              <Feather name="refresh-cw" size={15} color={colors.ink} />
              <Text style={styles.spinText}>{spinning ? 'Spinning' : 'Spin'}</Text>
            </Pressable>
            <Pressable style={[styles.beginBtn, (!card || spinning) && styles.beginDisabled]} disabled={!card || spinning}
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
  card: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, padding: space[6], minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: space[3] },
  cardEyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 10, letterSpacing: 1.5, color: colors.copper },
  cardText: { fontFamily: typography.families.displayItalic, fontSize: 22, lineHeight: 30, color: colors.ink, textAlign: 'center' },
  cardTextSpin: { opacity: 0.75 },
  btnRow: { flexDirection: 'row', gap: space[3] },
  spinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], backgroundColor: colors.creamSunken, borderRadius: radius.sm, paddingHorizontal: space[5], paddingVertical: space[4] },
  spinBtnDisabled: { opacity: 0.5 },
  spinText: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.ink },
  beginBtn: { flex: 1, backgroundColor: colors.copperDeep, borderRadius: radius.sm, paddingVertical: space[4], alignItems: 'center' },
  beginSolo: { marginTop: space[2] },
  beginDisabled: { opacity: 0.4 },
  beginText: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.cream },
  inputCard: { backgroundColor: colors.creamCard, borderRadius: radius.md, padding: space[4], borderWidth: 1, borderColor: colors.hairline, minHeight: 130 },
  input: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, minHeight: 100, textAlignVertical: 'top', lineHeight: 24 },
});
