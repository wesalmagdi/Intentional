import { StyleSheet, ScrollView } from 'react-native';
import { Title, Body, Subtle, Surface, Button, theme } from '@intentional/ui';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Intentional</Title>
      <Subtle style={styles.tagline}>A quiet place to begin.</Subtle>

      <Surface style={styles.card}>
        <Body style={styles.cardTitle}>Learn</Body>
        <Subtle>A three-step ritual to capture what matters.</Subtle>
        <Button title="Start Session" onPress={() => router.push('/learn')} />
      </Surface>

      <Surface style={styles.card}>
        <Body style={styles.cardTitle}>Journal</Body>
        <Subtle>A daily question to reflect on.</Subtle>
        <Button title="Open Journal" onPress={() => router.push('/journal')} variant="ghost" />
      </Surface>

      <Surface style={styles.card}>
        <Body style={styles.cardTitle}>Revisit</Body>
        <Subtle>What do you remember?</Subtle>
        <Button title="Revisit" onPress={() => router.push('/revisit')} variant="ghost" />
      </Surface>

      <Surface style={styles.card}>
        <Body style={styles.cardTitle}>Library</Body>
        <Subtle>Everything you have captured.</Subtle>
        <Button title="Open Library" onPress={() => router.push('/library')} variant="ghost" />
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  tagline: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  card: {
    gap: theme.spacing.sm,
  },
  cardTitle: {
    fontWeight: '600',
  },
});
