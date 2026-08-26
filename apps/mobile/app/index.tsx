import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Display, Body, Subtle, Label, theme } from '@intentional/ui';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Label>INTENTIONAL</Label>
      <Display style={styles.title}>A quiet place to begin.</Display>

      <Pressable style={styles.hero} onPress={() => router.push('/learn')}>
        <Subtle style={styles.heroLabel}>THE RITUAL</Subtle>
        <Display style={styles.heroTitle}>Learn</Display>
        <Body style={styles.heroSub}>A 10-minute search for what matters.</Body>
      </Pressable>

      <View style={styles.list}>
        <Pressable style={styles.row} onPress={() => router.push('/journal')}>
          <Body>Journal</Body><Subtle>→</Subtle>
        </Pressable>
        <Pressable style={styles.row} onPress={() => router.push('/library')}>
          <Body>Library</Body><Subtle>→</Subtle>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingTop: 60 },
  title: { fontFamily: theme.fonts.displayItalic, fontSize: 34, lineHeight: 42 },
  hero: { backgroundColor: theme.colors.surface, padding: 30, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.divider, gap: 12, marginTop: 20 },
  heroLabel: { letterSpacing: 1.5 }, heroTitle: { fontSize: 28 }, heroSub: { marginTop: 8 },
  list: { marginTop: 20, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }
});
