import { View, StyleSheet } from 'react-native';
import { Title, Body, Surface, Button, theme } from '@intentional/ui';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Intentional</Title>
        <Body style={styles.subtitle}>A quiet place to begin.</Body>
      </View>

      <Surface style={styles.card}>
        <Body>Learn</Body>
        <Body style={styles.cardSubtext}>
          A three-step ritual to capture what matters.
        </Body>
        <Button title="Start Session" onPress={() => router.push('/(learn)/notice')} />
      </Surface>

      <Surface style={styles.card}>
        <Body>Journal</Body>
        <Body style={styles.cardSubtext}>
          A daily question to reflect on.
        </Body>
        <Button title="Open Journal" onPress={() => {}} variant="ghost" />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  subtitle: {
    marginTop: 4,
  },
  card: {
    gap: theme.spacing.sm,
  },
  cardSubtext: {
    color: theme.colors.subtle,
    fontSize: 14,
  },
});
