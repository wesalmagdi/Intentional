import { StyleSheet, ScrollView, View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, typography, space } from '@intentional/ui';

const ROWS = [
  { label: 'Library', sub: 'What you have kept.', icon: 'book-open' as const, path: '/library' },
  { label: 'Reading Room', sub: 'Sit with a text.', icon: 'book' as const, path: '/reading' },
  { label: 'Your Data', sub: 'Take it anywhere.', icon: 'download' as const, path: '/data' },
  { label: 'Settings', sub: 'Choose your soundscape.', icon: 'settings' as const, path: '/settings' },
];

export default function MoreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      <Text style={styles.title}>More</Text>
      <View style={styles.list}>
        {ROWS.map((r, i) => (
          <Pressable key={r.path} style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]} onPress={() => router.push(r.path as never)}>
            <View style={styles.rowIcon}><Feather name={r.icon} size={16} color={colors.copperDeep} /></View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{r.label}</Text>
              <Text style={styles.rowSub}>{r.sub}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.stone} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[9] },
  title: { fontFamily: typography.families.display, fontSize: 30, color: colors.ink, marginBottom: space[6] },
  list: { backgroundColor: colors.creamCard, borderRadius: 16, paddingHorizontal: space[4] },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space[4], gap: space[3] },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.creamSunken, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
});
