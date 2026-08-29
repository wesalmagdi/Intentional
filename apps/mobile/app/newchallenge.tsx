import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LEARN_PROMPTS } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';

export default function NewChallengeScreen() {
  const [question, setQuestion] = useState('');

  function surprise() {
    const all = Object.values(LEARN_PROMPTS).flat();
    setQuestion(all[Math.floor(Math.random() * all.length)]);
  }

  function begin() {
    const q = question.trim();
    if (q.length === 0) return;
    router.push({ pathname: '/challenge', params: { prompt: q, category: 'Curiosity' } });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="x" size={22} color={colors.ink} /></Pressable>

      <Text style={styles.headline}>What are you{"\n"}curious about?</Text>
      <Text style={styles.sub}>It can be anything.</Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          multiline
          placeholder={"Ask a question...\n(e.g. Why do we dream?)"}
          placeholderTextColor={colors.stone}
          value={question}
          onChangeText={setQuestion}
        />
      </View>

      <Text style={styles.or}>or</Text>

      <View style={styles.center}>
        <Pressable style={styles.surpriseBtn} onPress={surprise}>
          <Feather name="shuffle" size={14} color={colors.ink} />
          <Text style={styles.surpriseText}>Surprise me</Text>
        </Pressable>
      </View>

      {question.trim().length > 0 && (
        <Pressable style={styles.beginBtn} onPress={begin}>
          <Text style={styles.beginText}>Begin 10 minutes</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[8], gap: space[5] },
  headline: { fontFamily: typography.families.display, fontSize: 32, lineHeight: 40, color: colors.ink, marginTop: space[6] },
  sub: { fontFamily: typography.families.body, fontSize: 14, color: colors.copper, marginTop: -space[3] },
  inputCard: { backgroundColor: colors.creamCard, borderRadius: radius.md, padding: space[4], borderWidth: 1, borderColor: colors.hairline, minHeight: 120 },
  input: { fontFamily: typography.families.body, fontSize: 15, color: colors.ink, minHeight: 90, textAlignVertical: 'top', lineHeight: 24 },
  or: { textAlign: 'center', fontFamily: typography.families.body, fontSize: 13, color: colors.stone },
  center: { alignItems: 'center' },
  surpriseBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.creamSunken, paddingHorizontal: space[5], paddingVertical: space[3], borderRadius: radius.pill },
  surpriseText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.ink },
  beginBtn: { backgroundColor: colors.copperDeep, padding: 17, borderRadius: radius.sm, alignItems: 'center' },
  beginText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
});
