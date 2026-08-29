import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getReadings } from '@intentional/database';
import { getDb } from '../lib/db';
import type { Reading } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

export default function ReadingScreen() {
  const [items, setItems] = useState<Reading[]>([]);

  useEffect(() => { void (async () => setItems(await getReadings(await getDb())))(); }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.push('/')}><Text style={styles.back}>← Home</Text></Pressable>
      <Text style={styles.eyebrow}>READING ROOM</Text>
      <Text style={styles.headline}>Sit with a text.</Text>
      <Text style={styles.sub}>Keep an excerpt. The room will ask you questions about it.</Text>

      <Pressable style={styles.addBtn} onPress={() => router.push('/addreading')}>
        <Text style={styles.addText}>Add a reading</Text>
      </Pressable>

      {items.length === 0 && <Text style={styles.empty}>Nothing on the desk yet.</Text>}
      {items.map(r => (
        <Pressable key={r.id} style={styles.card} onPress={() => router.push({ pathname: '/readingview', params: { id: r.id } })}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{r.title}</Text>
            <Text style={styles.cardSub}>{new Date(r.createdAt).toLocaleDateString()}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.stone} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: space[8], gap: space[4] },
  back: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.stone },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper, marginTop: space[4] },
  headline: { fontFamily: typography.families.displayItalic, fontSize: 28, color: colors.ink },
  sub: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone },
  addBtn: { backgroundColor: colors.copperDeep, padding: 16, borderRadius: radius.sm, alignItems: 'center', marginTop: space[2] },
  addText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 15 },
  empty: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, marginTop: space[3] },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3], backgroundColor: colors.creamCard, padding: space[5], borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline },
  cardText: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: typography.families.display, fontSize: 17, color: colors.ink },
  cardSub: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
});
