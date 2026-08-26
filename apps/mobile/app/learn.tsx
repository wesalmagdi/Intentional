import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { LEARN_CATEGORIES, LEARN_PROMPTS } from '@intentional/domain';
import { Display, Title, Body, Subtle, Label, theme } from '@intentional/ui';

export default function LearnScreen() {
  const [step, setStep] = useState<'home' | 'explore' | 'intention'>('home');
  const [category, setCategory] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [intention, setIntention] = useState('');

  if (step === 'home') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Display>A place to begin.</Display>
        <Subtle style={styles.intro}>Type your own curiosity, or explore a question below.</Subtle>
        <TextInput style={styles.input} placeholder="What are you wondering about?" placeholderTextColor={theme.colors.grey}
          onSubmitEditing={(e) => { setPrompt(e.nativeEvent.text); setStep('intention'); }} />
        <Label style={styles.label}>Or explore a category</Label>
        <View style={styles.categories}>
          {LEARN_CATEGORIES.map((cat) => (
            <Pressable key={cat} style={styles.catBtn} onPress={() => { setCategory(cat); setStep('explore'); }}>
              <Body style={styles.catText}>{cat}</Body>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (step === 'explore') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => setStep('home')}><Subtle>← Back</Subtle></Pressable>
        <Title>{category}</Title>
        {LEARN_PROMPTS[category].map((p, i) => (
          <Pressable key={i} style={styles.promptCard} onPress={() => { setPrompt(p); setStep('intention'); }}>
            <Body style={styles.promptText}>{p}</Body>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => setStep(category ? 'explore' : 'home')}><Subtle>← Back</Subtle></Pressable>
      <Label>YOUR QUESTION</Label>
      <Title style={styles.selectedPrompt}>{prompt}</Title>
      <Label style={{marginTop: 40}}>SET YOUR INTENTION</Label>
      <Subtle>What are you looking for?</Subtle>
      <TextInput style={styles.input} placeholder="I want to understand..." placeholderTextColor={theme.colors.grey} value={intention} onChangeText={setIntention} />
      <Pressable style={styles.startBtn} onPress={() => router.push({ pathname: '/challenge', params: { prompt, intention, category } })}>
        <Body style={styles.startText}>Begin 10-Minute Challenge</Body>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60 },
  intro: { marginTop: -10, marginBottom: 20 },
  input: { borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingVertical: 12, fontSize: 18, fontFamily: theme.fonts.body, color: theme.colors.ink },
  label: { marginTop: 20, marginBottom: 10 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.divider },
  catText: { fontFamily: theme.fonts.bodyMedium },
  promptCard: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  promptText: { fontFamily: theme.fonts.display, fontSize: 22, lineHeight: 30 },
  selectedPrompt: { fontFamily: theme.fonts.displayItalic, fontSize: 28, lineHeight: 36, marginTop: 10 },
  startBtn: { backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 40 },
  startText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 }
});
