import { useState } from 'react';
import { StyleSheet, TextInput, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import {
  advance,
  discoveryText,
  emptyDraft,
  phaseOf,
  PHASE_PROMPTS,
  type LearnPhase,
} from '@intentional/domain';
import { saveDiscovery } from '@intentional/database';
import { getDb } from '../lib/db';
import { newId } from '../lib/id';
import { Title, Subtle, Body, Button, Surface, theme } from '@intentional/ui';

const STEP_NUMBER: Record<Exclude<LearnPhase, 'done'>, number> = {
  notice: 1,
  choose: 2,
  'zoom-out': 3,
};

export default function LearnScreen() {
  const [draft, setDraft] = useState(emptyDraft());
  const [input, setInput] = useState('');
  const [savedText, setSavedText] = useState<string | null>(null);

  const phase = phaseOf(draft);

  async function handleContinue() {
    const next = advance(draft, input);
    if (next === draft) return;
    setDraft(next);
    setInput('');
    if (phaseOf(next) === 'done') {
      const text = discoveryText(next);
      if (text) {
        const db = await getDb();
        await saveDiscovery(db, {
          id: newId(),
          text,
          source: 'learn',
          createdAt: new Date().toISOString(),
        });
        setSavedText(text);
      }
    }
  }

  if (savedText !== null) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Subtle style={styles.successTag}>CAPTURED</Subtle>
        <Title style={styles.successTitle}>Saved to your library.</Title>
        <Surface style={styles.card}>
          <Body style={{ fontStyle: 'italic' }}>"{savedText}"</Body>
        </Surface>
        <Button title="Return Home" onPress={() => router.push('/')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Cancel" variant="ghost" onPress={() => router.push('/')} />
      
      {phase !== 'done' && (
        <View style={styles.stepContainer}>
          <Subtle style={styles.stepIndicator}>STEP {STEP_NUMBER[phase]} OF 3</Subtle>
          <Title style={styles.prompt}>{PHASE_PROMPTS[phase]}</Title>
          
          {/* UX FIX: Show previous context during Zoom Out */}
          {phase === 'zoom-out' && (
            <Surface style={styles.contextCard}>
              <Subtle style={styles.contextLabel}>YOUR FOCUS</Subtle>
              <Body style={styles.contextText}>{draft.chosen}</Body>
              <Subtle style={[styles.contextLabel, { marginTop: theme.spacing.sm }]}>YOUR OBSERVATION</Subtle>
              <Body style={styles.contextText}>{draft.noticed}</Body>
            </Surface>
          )}

          <TextInput
            style={styles.input}
            multiline
            value={input}
            onChangeText={setInput}
            placeholder="Write freely…"
            placeholderTextColor={theme.colors.subtle}
          />
          <Button
            title={phase === 'zoom-out' ? 'Capture Discovery' : 'Continue'}
            onPress={() => void handleContinue()}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
  },
  stepContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  stepIndicator: {
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1.5,
    fontSize: 12,
  },
  prompt: {
    fontSize: 24,
    lineHeight: 32,
  },
  contextCard: {
    backgroundColor: theme.colors.highlight,
    borderColor: 'transparent',
    gap: theme.spacing.xs,
  },
  contextLabel: {
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 11,
  },
  contextText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  card: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.highlight,
    borderColor: 'transparent',
  },
  successTag: {
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1.5,
    fontSize: 12,
    marginTop: theme.spacing.xl,
  },
  successTitle: {
    fontSize: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 17,
    color: theme.colors.text,
    minHeight: 140,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.surface,
    lineHeight: 26,
  },
});
