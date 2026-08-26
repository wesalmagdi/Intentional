import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { REVISIT_PROMPT, type Discovery } from '@intentional/domain';
import { getAllDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import { Title, Heading, Body, Subtle, Button, Surface, theme } from '@intentional/ui';

export default function RevisitScreen() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [current, setCurrent] = useState<Discovery | null>(null);
  const [memory, setMemory] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    void (async () => {
      const db = await getDb();
      const all = await getAllDiscoveries(db);
      setDiscoveries(all);
      if (all.length > 0) {
        setCurrent(all[Math.floor(Math.random() * all.length)]);
      }
    })();
  }, []);

  function pickAnother() {
    if (discoveries.length === 0) return;
    setCurrent(discoveries[Math.floor(Math.random() * discoveries.length)]);
    setMemory('');
    setRevealed(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Home" variant="ghost" onPress={() => router.push('/')} />
      <Title>Revisit</Title>

      {current === null ? (
        <Subtle>Nothing to revisit yet. Capture something first.</Subtle>
      ) : (
        <>
          <Subtle>{`Captured on ${new Date(current.createdAt).toLocaleDateString()}`}</Subtle>
          <Heading style={styles.prompt}>{REVISIT_PROMPT}</Heading>

          <TextInput
            style={styles.input}
            multiline
            value={memory}
            onChangeText={setMemory}
            placeholder="Write what you remember…"
            placeholderTextColor={theme.colors.subtle}
            editable={!revealed}
          />

          {!revealed ? (
            <Button title="Reveal" onPress={() => setRevealed(true)} />
          ) : (
            <>
              <Surface style={styles.card}>
                <Subtle>You remembered</Subtle>
                <Body>{memory.trim().length > 0 ? memory : '…'}</Body>
                <Subtle style={styles.meta}>Originally</Subtle>
                <Body>{current.text}</Body>
              </Surface>
              <Button title="Another" onPress={pickAnother} variant="ghost" />
            </>
          )}
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
    gap: theme.spacing.xs,
  },
  meta: {
    marginTop: theme.spacing.sm,
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
