import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCountdown } from '../lib/timer';
import { getPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import type { SoundId } from './settings';

import focusSound from '../assets/soundscape.wav';
import rainSound from '../assets/rain.wav';
import forestSound from '../assets/forest.wav';

const SOUNDS = { focus: focusSound, rain: rainSound, forest: forestSound };
const TOTAL = 10 * 60 * 1000;
const R = 108;
const CIRC = 2 * Math.PI * R;

export default function ChallengeScreen() {
  const { prompt, intention, category } = useLocalSearchParams();
  const { remainingMs, isPaused, pause, resume, isDone } = useCountdown(TOTAL);
  const [soundId, setSoundId] = useState<SoundId>('focus');
  const [soundOn, setSoundOn] = useState(true);
  const player = useAudioPlayer(SOUNDS[soundId]);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true });
    void (async () => {
      const val = await getPreference(await getDb(), 'soundscape');
      if (val && SOUNDS[val as SoundId]) setSoundId(val as SoundId);
    })();
  }, []);

  useEffect(() => {
    if (soundOn) {
      (player as any).loop = true;
      player.volume = 0.35;
      player.play();
    } else {
      player.pause();
    }
  }, [soundOn, soundId]);

  useEffect(() => {
    if (isDone) router.replace({ pathname: '/reflection', params: { prompt, intention, category } });
  }, [isDone]);

  const minutes = Math.floor(remainingMs / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');
  const progress = (TOTAL - remainingMs) / TOTAL;

  function finish() {
    router.replace({ pathname: '/reflection', params: { prompt, intention, category } });
  }

  return (
    <LinearGradient colors={[colors.night, colors.nightSoft]} style={styles.gradient}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.push('/')} hitSlop={12}><Feather name="x" size={22} color={colors.cream} /></Pressable>
        <Pressable onPress={() => setSoundOn(s => !s)} hitSlop={12}>
          <Feather name={soundOn ? 'volume-2' : 'volume-x'} size={18} color={colors.cream} style={{ opacity: 0.7 }} />
        </Pressable>
      </View>

      <Text style={styles.eyebrow}>LEARN</Text>
      <Text style={styles.question}>{prompt}</Text>

      <View style={styles.ringWrap}>
        <Svg width={250} height={250} viewBox="0 0 250 250">
          <Circle cx={125} cy={125} r={R} stroke={colors.nightCard} strokeWidth={5} fill="none" />
          <Circle
            cx={125} cy={125} r={R} stroke={colors.copperSoft} strokeWidth={5} fill="none"
            strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC * (1 - progress)}
            strokeLinecap="round" rotation="-90" origin="125,125"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.timer}>{minutes}:{seconds}</Text>
          <Text style={styles.remaining}>{isPaused ? 'paused' : 'remaining'}</Text>
        </View>
      </View>

      <Text style={styles.copy}>Search. Read. Think.{"\n"}Go find out for yourself.{"\n"}You don't need to stay here.</Text>

      <Pressable style={styles.finishBtn} onPress={finish}>
        <Text style={styles.finishText}>Finish early</Text>
      </Pressable>
      <Pressable style={styles.pauseBtn} onPress={() => (isPaused ? resume() : pause())}>
        <Text style={styles.pauseText}>{isPaused ? 'Resume' : 'Pause'}</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, padding: space[6] },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[8] },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 2, color: colors.copperSoft, textAlign: 'center', marginTop: space[6] },
  question: { fontFamily: typography.families.display, fontSize: 27, lineHeight: 36, color: colors.cream, textAlign: 'center', marginTop: space[3], paddingHorizontal: space[4] },
  ringWrap: { alignSelf: 'center', marginTop: space[7], marginBottom: space[7] },
  ringCenter: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  timer: { fontFamily: typography.families.bodyMedium, fontSize: 40, color: colors.cream, letterSpacing: 2 },
  remaining: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone, marginTop: 2 },
  copy: { fontFamily: typography.families.body, fontSize: 13, lineHeight: 21, color: colors.cream, opacity: 0.6, textAlign: 'center', marginBottom: space[7] },
  finishBtn: { borderWidth: 1, borderColor: colors.hairlineDark, borderRadius: radius.pill, paddingVertical: space[4], alignItems: 'center' },
  finishText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.cream },
  pauseBtn: { alignItems: 'center', marginTop: space[4] },
  pauseText: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone, textDecorationLine: 'underline' },
});
