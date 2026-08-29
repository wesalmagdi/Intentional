import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Animated, Text } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCountdown } from '../lib/timer';
import { NOTICE_PROMPTS, promptForDay } from '@intentional/domain';
import { saveDiscovery, setPreference, getPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical, HorizonGlow } from '../components/Scenery';
import { LinearGradient } from 'expo-linear-gradient';

function BreathCircle({ onDone }: { onDone: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [label, setLabel] = useState('Breathe in.');
  const fired = useRef(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let alive = true;
    let voice: string | undefined;
    
    void Speech.getAvailableVoicesAsync().then(vs => {
      const premium = vs.find(v => 
        (v.name.includes('Siri') || v.name.includes('Enhanced') || v.name.includes('Premium') || v.name.includes('Natural')) && 
        v.language.startsWith('en')
      );
      if (premium) {
        voice = premium.identifier;
      } else {
        const fallback = vs.find(v => 
          ['Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Alex'].some(n => v.name.includes(n)) && 
          v.language.startsWith('en')
        );
        if (fallback) voice = fallback.identifier;
      }
    }).catch(() => {});

    const speak = (segments: string[]) => {
      if (!alive) return;
      let delay = 0;
      segments.forEach((segment, i) => {
        const timeout = setTimeout(() => {
          if (alive) {
            void Speech.speak(segment, { 
              voice, rate: 0.75, pitch: 0.95, volume: 0.85
            });
          }
        }, delay);
        timeouts.current.push(timeout);
        delay += segment.length * 80 + (i === 0 ? 600 : 300);
      });
    };

    const run = (cycle: number) => {
      if (!alive) return;
      if (cycle >= 2) { 
        if (!fired.current) { 
          fired.current = true; 
          onDone(); 
        } 
        return; 
      }
      
      setLabel('Breathe in.');
      speak(['Breathe', 'in']);
      
      Animated.timing(scale, { toValue: 1.4, duration: 4000, useNativeDriver: true }).start(() => {
        if (!alive) return;
        setLabel('Hold.');
        speak(['Hold']);
        
        const timeout = setTimeout(() => {
          if (!alive) return;
          setLabel('Let it go.');
          speak(['And', 'let it', 'go']);
          Animated.timing(scale, { toValue: 1, duration: 6000, useNativeDriver: true }).start(() => run(cycle + 1));
        }, 4000);
        timeouts.current.push(timeout);
      });
    };
    
    run(0);
    
    // Cleanup: stop all speech and clear timeouts on unmount
    return () => { 
      alive = false; 
      timeouts.current.forEach(t => clearTimeout(t));
      timeouts.current = [];
      void Speech.stop(); 
    };
  }, []);

  return (
    <View style={styles.breathWrap}>
      <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]} />
      <Text style={styles.breathLabel}>{label}</Text>
    </View>
  );
}

export default function NoticeScreen() {
  const prompt = promptForDay(NOTICE_PROMPTS, new Date());
  const { remainingMs, isDone } = useCountdown(60_000);
  const [phase, setPhase] = useState<'arrive' | 'wait' | 'write' | 'kept'>('arrive');
  const [text, setText] = useState('');

  // Mark session as active
  useEffect(() => {
    void (async () => {
      await setPreference(await getDb(), 'activeSession', 'notice');
    })();
  }, []);

  // Clear session when leaving
  const clearSession = async () => {
    await setPreference(await getDb(), 'activeSession', '');
  };

  useEffect(() => { 
    if (isDone) setPhase(p => (p === 'wait' ? 'write' : p)); 
  }, [isDone]);

  async function handleKeep() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    await saveDiscovery(await getDb(), {
      id: Date.now().toString(), userId: 'local', category: 'Notice', prompt,
      findings: { noticed: trimmed }, createdAt: new Date().toISOString(),
    });
    setPhase('kept');
    await clearSession();
  }

  async function handleLeave() {
    await clearSession();
    router.push('/');
  }

  if (phase === 'kept') return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={styles.screen}>
      <HorizonGlow />
      <View style={styles.center}>
        <Text style={styles.ornament}>❦</Text>
        <Text style={styles.keptTitle}>Kept.</Text>
        <Pressable style={styles.homeBtnDark} onPress={() => router.push('/')}><Text style={styles.homeTextDark}>Home</Text></Pressable>
      </View>
    </LinearGradient>
  );

  if (phase === 'write') return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
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
    <View style={[styles.screen, { backgroundColor: colors.cream }]}>
      <Botanical />
      <View style={styles.top}><Pressable onPress={() => void handleLeave()}><Text style={styles.back}>← Home</Text></Pressable></View>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>NOTICE</Text>
        <Text style={styles.headline}>Arrive first.</Text>
        <BreathCircle onDone={() => setPhase('wait')} />
        <Pressable onPress={() => setPhase('wait')} hitSlop={12}><Text style={styles.early}>I'm here already</Text></Pressable>
      </View>
    </View>
  );

  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <View style={[styles.screen, { backgroundColor: colors.cream }]}>
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
  screen: { flex: 1, padding: space[6], paddingTop: space[8] },
  top: { alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  back: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 28, lineHeight: 36, color: colors.ink, textAlign: 'center' },
  centerSub: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, textAlign: 'center', lineHeight: 22 },
  timer: { fontFamily: typography.families.bodyMedium, fontSize: 30, color: colors.copper, letterSpacing: 3 },
  early: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone, textDecorationLine: 'underline' },
  ornament: { fontFamily: typography.families.display, fontSize: 24, color: colors.copperSoft },
  keptTitle: { fontFamily: typography.families.display, fontSize: 32, color: colors.cream },
  breathWrap: { alignItems: 'center', gap: space[4], marginVertical: space[6] },
  breathCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.creamSunken, borderWidth: 1.5, borderColor: colors.copper },
  breathLabel: { fontFamily: typography.families.displayItalic, fontSize: 15, color: colors.stone },
  container: { padding: space[6], paddingTop: space[8], gap: space[4] },
  area: { backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[3], minHeight: 110 },
  areaInput: { fontFamily: typography.families.body, fontSize: 16, color: colors.ink, minHeight: 90, textAlignVertical: 'top', lineHeight: 26 },
  keepBtn: { backgroundColor: colors.copperDeep, padding: 17, borderRadius: radius.sm, alignItems: 'center' },
  keepText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  homeBtnDark: { paddingHorizontal: space[8], paddingVertical: space[3], borderWidth: 1, borderColor: colors.hairlineDark, borderRadius: radius.sm },
  homeTextDark: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.cream },
});
