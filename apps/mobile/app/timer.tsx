import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setPreference, getPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

const PRESETS = [15, 25, 50, 90];

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [duration, setDuration] = useState(25);
  const [custom, setCustom] = useState('');
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    void (async () => {
      const s = await getPreference(await getDb(), 'focus.sessions');
      try { setSessions(parseInt(s || '0', 10)); } catch { setSessions(0); }
    })();
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          setRunning(false);
          if (mode === 'focus') {
            setSessions(s => {
              const next = s + 1;
              getDb().then(db => setPreference(db, 'focus.sessions', String(next))).catch(() => {});
              return next;
            });
          }
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  function setPreset(min: number) {
    setDuration(min);
    setLeft(min * 60);
    setRunning(false);
  }

  function setCustomTime() {
    const min = parseInt(custom, 10);
    if (min > 0 && min < 600) {
      setDuration(min);
      setLeft(min * 60);
      setRunning(false);
      setCustom('');
    }
  }

  function reset() {
    setLeft(duration * 60);
    setRunning(false);
  }

  function skip() {
    if (mode === 'focus') {
      setMode('break');
      setLeft(5 * 60);
    } else {
      setMode('focus');
      setLeft(duration * 60);
    }
    setRunning(false);
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <View style={[styles.container, { paddingTop: insets.top + space[6] }]}>
      <Botanical />
      <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="chevron-left" size={22} color={colors.ink} /></Pressable>

      <View style={styles.modeRow}>
        <Pressable style={[styles.modeTab, mode === 'focus' && styles.modeTabActive]} onPress={() => { setMode('focus'); reset(); }}>
          <Text style={[styles.modeText, mode === 'focus' && styles.modeTextActive]}>Focus</Text>
        </Pressable>
        <Pressable style={[styles.modeTab, mode === 'break' && styles.modeTabActive]} onPress={() => { setMode('break'); reset(); }}>
          <Text style={[styles.modeText, mode === 'break' && styles.modeTextActive]}>Break</Text>
        </Pressable>
      </View>

      <Text style={styles.clock}>{mm}:{ss}</Text>

      <View style={styles.presets}>
        {PRESETS.map(p => (
          <Pressable key={p} style={[styles.preset, duration === p && mode === 'focus' && styles.presetActive]} onPress={() => setPreset(p)}>
            <Text style={[styles.presetText, duration === p && mode === 'focus' && styles.presetTextActive]}>{p} min</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'focus' && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="Custom minutes..."
            placeholderTextColor={colors.stone}
            value={custom}
            onChangeText={setCustom}
            keyboardType="numeric"
            onSubmitEditing={setCustomTime}
          />
          <Pressable style={styles.customBtn} onPress={setCustomTime}>
            <Text style={styles.customBtnText}>Set</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.primaryBtn} onPress={() => setRunning(!running)}>
          <Text style={styles.primaryText}>{running ? 'Pause' : 'Start'}</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={reset}>
          <Text style={styles.ghostText}>Reset</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={skip}>
          <Text style={styles.ghostText}>Skip</Text>
        </Pressable>
      </View>

      <Text style={styles.stats}>{sessions} sessions completed today</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space[6], gap: space[5], backgroundColor: colors.cream },
  modeRow: { flexDirection: 'row', gap: space[2], justifyContent: 'center' },
  modeTab: { paddingHorizontal: space[6], paddingVertical: space[3], borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline },
  modeTabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  modeText: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.ink },
  modeTextActive: { color: colors.cream },
  clock: { fontFamily: typography.families.display, fontSize: 72, textAlign: 'center', color: colors.ink, marginVertical: space[6] },
  presets: { flexDirection: 'row', justifyContent: 'center', gap: space[3], flexWrap: 'wrap' },
  preset: { paddingHorizontal: space[5], paddingVertical: space[3], borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline },
  presetActive: { backgroundColor: colors.copperDeep, borderColor: colors.copperDeep },
  presetText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.ink },
  presetTextActive: { color: colors.cream },
  customRow: { flexDirection: 'row', gap: space[2], marginTop: space[3] },
  customInput: { flex: 1, backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[3], fontSize: 14, fontFamily: typography.families.body, color: colors.ink },
  customBtn: { backgroundColor: colors.copperDeep, borderRadius: radius.sm, paddingHorizontal: space[5], justifyContent: 'center' },
  customBtnText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 14 },
  controls: { flexDirection: 'row', gap: space[3], marginTop: space[5] },
  primaryBtn: { flex: 2, backgroundColor: colors.copperDeep, borderRadius: radius.sm, padding: space[4], alignItems: 'center' },
  primaryText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 16 },
  ghostBtn: { flex: 1, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[4], alignItems: 'center' },
  ghostText: { fontFamily: typography.families.bodySemibold, fontSize: 14, color: colors.ink },
  stats: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone, textAlign: 'center', marginTop: space[4] },
});
