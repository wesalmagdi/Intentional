import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LEARN_CATEGORIES, LEARN_PROMPTS } from '@intentional/domain';
import { Display, Body, Subtle, Label, BackBar, theme } from '@intentional/ui';

export default function LearnScreen() {
  const [step, setStep] = useState<'home' | 'explore' | 'intention'>('home');
  const [category, setCategory] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [intention, setIntention] = useState('');

  if (step === 'home') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <BackBar label="Home" onPress={() => router.push('/')} />
        <Label style={styles.eyebrow}>LEARN</Label>
        <Display style={styles.title}>A place to begin.</Display>
        <Subtle style={styles.intro}>Type your own curiosity, or explore a question below.</Subtle>

        <View style={styles.inputCard}>
          <Feather name="search" size={18} color={theme.colors.grey} />
          <TextInput
            style={styles.input}
            placeholder="What are you wondering about?"
            placeholderTextColor={theme.colors.grey}
            onSubmitEditing={(e) => {
              if (e.nativeEvent.text.trim().length > 0) {
                setPrompt(e.nativeEvent.text);
                setCategory('Your Curiosity');
                setStep('intention');
              }
            }}
          />
        </View>

        <View style={styles.rule} />
        <Label style={styles.sectionLabel}>OR EXPLORE A CATEGORY</Label>
        
        <View style={styles.categories}>
          {LEARN_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
              onPress={() => { setCategory(cat); setStep('explore'); }}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (step === 'explore') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <BackBar label="Categories" onPress={() => setStep('home')} />
        <Label style={styles.eyebrow}>EXPLORE</Label>
        <Display style={styles.categoryTitle}>{category}</Display>

        <View style={styles.prompts}>
          {LEARN_PROMPTS[category].map((p, i) => (
            <Pressable key={i} style={styles.promptCard} onPress={() => { setPrompt(p); setStep('intention'); }}>
              <Body style={styles.promptText}>{p}</Body>
              <Feather name="chevron-right" size={18} color={theme.colors.grey} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackBar label="Questions" onPress={() => setStep(category ? 'explore' : 'home')} />
      <Label style={styles.eyebrow}>SET YOUR INTENTION</Label>
      <Display style={styles.selectedPrompt}>{prompt}</Display>
      
      <Subtle style={styles.focusLabel}>What are you looking for?</Subtle>
      <TextInput
        style={styles.intentInput}
        placeholder="I want to understand..."
        placeholderTextColor={theme.colors.grey}
        value={intention}
        onChangeText={setIntention}
        onSubmitEditing={() => router.push({ pathname: '/challenge', params: { prompt, intention, category } })}
      />

      <Pressable
        style={styles.startBtn}
        onPress={() => router.push({ pathname: '/challenge', params: { prompt, intention, category } })}
      >
        <Body style={styles.startText}>Begin 10-Minute Challenge</Body>
        <Feather name="arrow-right" size={16} color={theme.colors.ivory} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingTop: 60, paddingBottom: 90 },
  eyebrow: { color: theme.colors.bronze, letterSpacing: 1.5, marginTop: theme.spacing.sm },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 34, lineHeight: 42, marginBottom: theme.spacing.xs },
  intro: { marginBottom: theme.spacing.sm },
  
  inputCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.divider,
    borderRadius: theme.radius.md, padding: theme.spacing.md,
  },
  input: { flex: 1, fontSize: 17, fontFamily: theme.fonts.body, color: theme.colors.ink, paddingVertical: 4 },
  
  rule: { height: 1, backgroundColor: theme.colors.divider, marginVertical: theme.spacing.sm },
  sectionLabel: { letterSpacing: 1.2, fontSize: 10, marginBottom: theme.spacing.xs },
  
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.divider },
  catBtnActive: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  catText: { fontFamily: theme.fonts.bodyMedium, color: theme.colors.ink },
  catTextActive: { color: theme.colors.ivory },
  
  categoryTitle: { fontFamily: theme.fonts.displayItalic, fontSize: 30, lineHeight: 38, marginBottom: theme.spacing.md },
  
  prompts: { gap: 12 },
  promptCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    padding: 20, backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.divider, borderRadius: theme.radius.md,
  },
  promptText: { fontFamily: theme.fonts.display, fontSize: 20, lineHeight: 28, flex: 1 },
  
  selectedPrompt: { fontFamily: theme.fonts.displayItalic, fontSize: 28, lineHeight: 36, marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg },
  focusLabel: { fontFamily: theme.fonts.bodySemibold, marginBottom: 4 },
  intentInput: {
    fontSize: 17, fontFamily: theme.fonts.body, color: theme.colors.ink,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingVertical: 12, marginBottom: theme.spacing.lg
  },
  
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: theme.colors.bronze, padding: 18, borderRadius: theme.radius.md, marginTop: 'auto'
  },
  startText: { color: theme.colors.ivory, fontFamily: theme.fonts.bodySemibold, fontSize: 16 },
});
