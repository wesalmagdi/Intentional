import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getDiscoveries } from '@intentional/database';
import { getDb } from '../../lib/db';
import type { Discovery } from '@intentional/domain';
import { colors, typography, space, radius } from '@intentional/ui';

export default function LearnLibraryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Discovery[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { void (async () => setItems(await getDiscoveries(await getDb())))(); }, []);

  const folders = (() => {
    const map = new Map<string, number>();
    for (const d of items) {
      const key = d.folderName || d.category;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()];
  })();

  const recent = items
    .filter(d => d.prompt.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>
        <Pressable style={styles.exploreBtn} onPress={() => router.push('/newchallenge')}>
          <Feather name="plus" size={14} color={colors.cream} />
          <Text style={styles.exploreText}>Explore</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Feather name="search" size={15} color={colors.stone} />
        <TextInput style={styles.searchInput} placeholder="Search your discoveries..." placeholderTextColor={colors.stone} value={query} onChangeText={setQuery} />
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>Folders</Text>
        <Text style={styles.sectionAction}>Edit</Text>
      </View>
      {folders.map(([name, count]) => (
        <Pressable key={name} style={styles.folderRow} onPress={() => router.push('/library')}>
          <Feather name="folder" size={16} color={colors.copper} />
          <Text style={styles.folderName} numberOfLines={1}>{name}</Text>
          <Text style={styles.folderCount}>{count}</Text>
          <Feather name="chevron-right" size={15} color={colors.stone} />
        </Pressable>
      ))}

      <Text style={[styles.sectionLabel, styles.recentLabel]}>Recent</Text>
      {recent.length === 0 && <Text style={styles.empty}>Nothing yet. Explore a question.</Text>}
      {recent.map(d => (
        <Pressable key={d.id} style={styles.recentRow} onPress={() => router.push({ pathname: '/discovery', params: { id: d.id } })}>
          <View style={styles.recentIcon}><Feather name="edit-3" size={14} color={colors.copper} /></View>
          <View style={styles.recentText}>
            <Text style={styles.recentTitle} numberOfLines={1}>{d.prompt}</Text>
            <Text style={styles.recentSub}>{d.category} · {new Date(d.createdAt).toLocaleDateString()}</Text>
          </View>
          <Feather name="chevron-right" size={15} color={colors.stone} />
        </Pressable>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], paddingTop: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[5] },
  title: { fontFamily: typography.families.display, fontSize: 30, color: colors.ink },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.copperDeep, paddingHorizontal: space[4], paddingVertical: space[2] + 2, borderRadius: radius.pill },
  exploreText: { fontFamily: typography.families.bodySemibold, fontSize: 13, color: colors.cream },
  search: { flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: colors.creamSunken, borderRadius: radius.sm, paddingHorizontal: space[3], paddingVertical: space[3], marginBottom: space[6] },
  searchInput: { flex: 1, fontFamily: typography.families.body, fontSize: 14, color: colors.ink, paddingVertical: 0 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[2] },
  sectionLabel: { fontFamily: typography.families.bodySemibold, fontSize: 13, color: colors.ink },
  sectionAction: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.stone },
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[4], borderBottomWidth: 1, borderBottomColor: colors.hairline },
  folderName: { flex: 1, fontFamily: typography.families.body, fontSize: 15, color: colors.ink },
  folderCount: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone },
  recentLabel: { marginTop: space[6], marginBottom: space[2] },
  empty: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, marginTop: space[2] },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[4], borderBottomWidth: 1, borderBottomColor: colors.hairline },
  recentIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.creamSunken, alignItems: 'center', justifyContent: 'center' },
  recentText: { flex: 1, gap: 2 },
  recentTitle: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.ink },
  recentSub: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
});
