import { useState } from 'react';
import { StyleSheet, TextInput, ScrollView } from 'react-native';
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
import { Title, Subtle, Button, Surface, theme } from '@intentional/ui';

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
        <Title>Captured.</Title>
        <Surface style={styles.card}>
          <Subtle>{savedText}</Subtle>
        </Surface>
        <Button title="Back to Home" onPress={() => router.push('/')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Home" variant="ghost" onPress={() => router.push('/')} />
      {phase !== 'done' && (
        <>
          <Subtle>{`Step ${STEP_NUMBER[phase]} of 3`}</Subtle>
          <Title style={styles.prompt}>{PHASE_PROMPTS[phase]}</Title>
          <TextInput
            style={styles.input}
            multiline
            value={input}
            onChangeText={setInput}
            placeholder="Write freely…"
            placeholderTextColor={theme.colors.subtle}
          />
          <Button
            title={phase === 'zoom-out' ? 'Finish' : 'Continue'}
            onPress={() => void handleContinue()}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  prompt: {
    marginTop: theme.spacing.xs,
  },
  card: {
    gap: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.surface,
  },
});
