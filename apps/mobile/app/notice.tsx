import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Animated, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCountdown } from '../lib/timer';
import { NOTICE_PROMPTS, promptForDay } from '@intentional/domain';
import { saveDiscovery, setPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical, HorizonGlow } from '../components/Scenery';
import { LinearGradient } from 'expo-linear-gradient';
import guideSound from '../assets/breathguide.wav';

function GuideSession({ onDone }: { onDone: () => void }) {
  const player = useAudioPlayer(guideSound);
  const scale = useRef(new Animated.Value(1)).current;
  const [label, setLabel] = useState('Settle in.');
  const [remaining, setRemaining] = useState(600);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true });
    let alive = true;
    player.play();
    const t = setInterval(() => {
      if (!alive) return;
      const cur = (player as any).currentTime ?? 0;
      const dur = (player as any).duration ?? 600;
      setRemaining(Math.max(0, Math.ceil(dur - cur)));
      if (cur < 8) { setLabel('Settle in.'); scale.setValue(1); }
      else if (cur >= 589) { setLabel('Well done.'); scale.setValue(1); }
      else {
        const m = (cur - 8) % 14;
        if (m < 4) { setLabel('Breathe in.'); scale.setValue(1 + 0.4 * (m / 4)); }
        else if (m < 8) { setLabel('Hold.'); scale.setValue(1.4); }
        else { setLabel('Let it go.'); scale.setValue(1.4 - 0.4 * ((m - 8) / 6)); }
      }
      if (dur > 1 && cur >= dur - 0.5) { clearInterval(t); onDone(); }
    }, 100);
    return () => { alive = false; clearInterval(t); try { player.pause(); } catch {} };
  }, []);

  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, '0');

  return (
    <View style={styles.guideWrap}>
      <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]} />
      <Text style={styles.breathLabel}>{label}</Text>
      <Text style={styles.guideTimer}>{mm}:{ss}</Text>
    </View>
  );
}

export default function NoticeScreen() {
  const insets = useSafeAreaInsets();
  const prompt = promptForDay(NOTICE_PROMPTS, new Date());
  const { remainingMs, isDone } = useCountdown(60_000);
  const [phase, setPhase] = useState<'arrive' | 'wait' | 'write' | 'kept'>('arrive');
  const [text, setText] = useState('');

  useEffect(() => { void (async () => { await setPreference(await getDb(), 'activeSession', 'notice'); })(); }, []);
  const clearSession = async () => { await setPreference(await getDb(), 'activeSession', ''); };
  useEffect(() => { if (isDone) setPhase(p => (p === 'wait' ? 'write' : p)); }, [isDone]);

  async function handleKeep() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    await saveDiscovery(await getDb(), {
      id: Date.now().toString(), userId: 'local', category: 'Notice', prompt,
      findings: { noticed: trimmed }, createdAt: new Date().toISOString(),
    });
    await clearSession();
    setPhase('kept');
  }
  async function handleLeave() { await clearSession(); router.push('/'); }

  if (phase === 'kept') return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={[styles.screen, { paddingTop: insets.top }]}>
      <HorizonGlow />
      <View style={styles.center}>
        <Text style={styles.ornament}>❦</Text>
        <Text style={styles.keptTitle}>Kept.</Text>
        <Pressable style={styles.homeBtnDark} onPress={() => router.push('/')}><Text style={styles.homeTextDark}>Home</Text></Pressable>
      </View>
    </LinearGradient>
  );

  if (phase === 'write') return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => void handleLeave()}><Text style={styles.back}>← Home</Text></Pressable>
      <Text style={styles.eyebrow}>NOTICE</Text>
      <Text style={styles.headline}>{prompt}</Text>
      <View style={styles.area}>
        <TextInput style={styles.areaInput} multiline autoFocus placeholder="One line is enough." placeholderTextColor={colors.stone} value={text} onChangeText={setText} />
      </View>
      <Pressable style={styles.keepBtn} onPress={() => void handleKeep()}><Text style={styles.keepText}>Keep this.</Text></Pressable>
    </ScrollView>
  );

  if (phase === 'arrive') return (
    <View style={[styles.screen, { backgroundColor: colors.cream, paddingTop: insets.top + space[6] }]}>
      <Botanical />
      <View style={styles.top}><Pressable onPress={() => void handleLeave()}><Text style={styles.back}>← Home</Text></Pressable></View>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>NOTICE</Text>
        <Text style={styles.headline}>Arrive first.</Text>
        <GuideSession onDone={() => setPhase('wait')} />
        <Pressable onPress={() => setPhase('wait')} hitSlop={12}><Text style={styles.early}>I'm here already</Text></Pressable>
      </View>
    </View>
  );

  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <View style={[styles.screen, { backgroundColor: colors.cream, paddingTop: insets.top + space[6] }]}>
      <Botanical />
      <View style={styles.top}><Pressable onPress={() => void handleLeave()}><Text style={styles.back}>← Home</Text></Pressable></View>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>NOTICE</Text>
        <Text style={styles.headline}>Look up.</Text>
        <Text style={styles.centerSub}>{prompt}{"\n"}For one minute, just notice.</Text>
        <Text style={styles.timer}>{seconds}</Text>
        <Pressable onPress={() => setPhase('write')} hitSlop={12}><Text style={styles.early}>I'm ready</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: space[6] },
  top: { alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  back: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 28, lineHeight: 36, color: colors.ink, textAlign: 'center' },
  centerSub: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, textAlign: 'center', lineHeight: 22 },
  timer: { fontFamily: typography.families.bodyMedium, fontSize: 30, color: colors.copper, letterSpacing: 3 },
  early: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone, textDecorationLine: 'underline' },
  ornament: { fontFamily: typography.families.display, fontSize: 24, color: colors.copperSoft },
  keptTitle: { fontFamily: typography.families.display, fontSize: 32, color: colors.cream },
  guideWrap: { alignItems: 'center', gap: space[3], marginVertical: space[6] },
  breathCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.creamSunken, borderWidth: 1.5, borderColor: colors.copper },
  breathLabel: { fontFamily: typography.families.displayItalic, fontSize: 15, color: colors.stone },
  guideTimer: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone, letterSpacing: 2 },
  container: { padding: space[6], gap: space[4] },
  area: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[3], minHeight: 110 },
  areaInput: { fontFamily: typography.families.body, fontSize: 16, color: colors.ink, minHeight: 90, textAlignVertical: 'top', lineHeight: 26 },
  keepBtn: { backgroundColor: colors.copperDeep, padding: 17, borderRadius: radius.sm, alignItems: 'center' },
  keepText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  homeBtnDark: { paddingHorizontal: space[8], paddingVertical: space[3], borderWidth: 1, borderColor: colors.hairlineDark, borderRadius: radius.sm },
  homeTextDark: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.cream },
});
