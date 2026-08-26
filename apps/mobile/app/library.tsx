import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { Discovery } from '@intentional/domain';
import { getAllDiscoveries } from '@intentional/database';
import { getDb } from '../lib/db';
import { Title, Body, Subtle, Button, Surface, theme } from '@intentional/ui';

export default function LibraryScreen() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);

  useEffect(() => {
    void (async () => {
      const db = await getDb();
      setDiscoveries(await getAllDiscoveries(db));
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Home" variant="ghost" onPress={() => router.push('/')} />
      <Title>Library</Title>
      {discoveries.length === 0 ? (
        <Subtle>Nothing captured yet. Start a Learn session.</Subtle>
      ) : (
        discoveries.map((d) => (
          <Surface key={d.id} style={styles.card}>
            <Body>{d.text}</Body>
            <Subtle style={styles.meta}>
              {new Date(d.createdAt).toLocaleDateString()}
            </Subtle>
          </Surface>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    gap: theme.spacing.xs,
  },
  meta: {
    marginTop: theme.spacing.xs,
  },
});
