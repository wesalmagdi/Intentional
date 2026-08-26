import { StyleSheet, ScrollView, View } from 'react-native';
import { Title, Body, Subtle, Surface, Button, theme } from '@intentional/ui';
import { router } from 'expo-router';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Subtle style={styles.greeting}>{getGreeting()}</Subtle>
        <Title>Intentional</Title>
      </View>

      {/* Hero Card: Learn */}
      <Surface style={[styles.card, styles.heroCard]}>
        <Subtle style={styles.heroTag}>THE RITUAL</Subtle>
        <Title style={styles.heroTitle}>Learn</Title>
        <Body style={styles.heroSubtext}>
          A quiet, three-step space to capture what matters today.
        </Body>
        <View style={styles.heroButton}>
          <Button title="Begin Session" onPress={() => router.push('/learn')} />
        </View>
      </Surface>

      {/* Secondary Actions */}
      <View style={styles.grid}>
        <Surface style={styles.gridCard}>
          <Body style={styles.cardTitle}>Journal</Body>
          <Subtle>A daily question.</Subtle>
          <Button title="Write" onPress={() => router.push('/journal')} variant="ghost" />
        </Surface>

        <Surface style={styles.gridCard}>
          <Body style={styles.cardTitle}>Revisit</Body>
          <Subtle>Test your memory.</Subtle>
          <Button title="Play" onPress={() => router.push('/revisit')} variant="ghost" />
        </Surface>
      </View>

      <Button title="View Library" onPress={() => router.push('/library')} variant="ghost" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  greeting: {
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1,
  },
  card: {
    gap: theme.spacing.sm,
  },
  heroCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  heroTag: {
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1.5,
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 28,
  },
  heroSubtext: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroButton: {
    marginTop: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  gridCard: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
});
