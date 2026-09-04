import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPreference, setPreference } from '@intentional/database';
import { getDb } from '../../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../../components/Scenery';

type Project = { id: string; name: string; color: string };
type Task = { id: string; projectId: string; text: string; done: boolean };

const COLORS = ['#B0793F', '#5A7A5A', '#8A4A3E', '#7A6652', '#A08B73', '#59422C'];

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    void (async () => {
      const db = await getDb();
      const pRaw = await getPreference(db, 'focus.projects');
      const tRaw = await getPreference(db, 'focus.tasks');
      try { setProjects(JSON.parse(pRaw || '[]')); } catch { setProjects([]); }
      try { setTasks(JSON.parse(tRaw || '[]')); } catch { setTasks([]); }
    })();
  }, []);

  const saveProjects = async (list: Project[]) => {
    setProjects(list);
    await setPreference(await getDb(), 'focus.projects', JSON.stringify(list));
  };
  const saveTasks = async (list: Task[]) => {
    setTasks(list);
    await setPreference(await getDb(), 'focus.tasks', JSON.stringify(list));
  };

  async function addProject() {
    if (!newName.trim()) return;
    const color = COLORS[projects.length % COLORS.length];
    const p: Project = { id: String(Date.now()), name: newName.trim(), color };
    await saveProjects([...projects, p]);
    setNewName('');
    setShowAdd(false);
  }

  function deleteProject(id: string) {
    Alert.alert('Delete project?', 'Tasks in this project will also be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await saveProjects(projects.filter(p => p.id !== id));
        await saveTasks(tasks.filter(t => t.projectId !== id));
      }},
    ]);
  }

  const stats = tasks.reduce((acc, t) => {
    acc.total++;
    if (t.done) acc.done++;
    return acc;
  }, { total: 0, done: 0 });

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FOCUS</Text>
        <Text style={styles.headline}>Your work, your pace.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.done}</Text>
          <Text style={styles.statLabel}>Done today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.total - stats.done}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      <Pressable style={styles.timerCard} onPress={() => router.push('/timer')}>
        <Feather name="play" size={24} color={colors.copper} />
        <View style={styles.timerText}>
          <Text style={styles.timerTitle}>Start a session</Text>
          <Text style={styles.timerSub}>Focus for any duration</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.stone} />
      </Pressable>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>Projects</Text>
        <Pressable onPress={() => setShowAdd(!showAdd)}>
          <Feather name={showAdd ? 'x' : 'plus'} size={18} color={colors.copper} />
        </Pressable>
      </View>

      {showAdd && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Project name..."
            placeholderTextColor={colors.stone}
            value={newName}
            onChangeText={setNewName}
            autoFocus
            onSubmitEditing={() => void addProject()}
          />
          <Pressable style={styles.addBtn} onPress={() => void addProject()}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      )}

      {projects.length === 0 && !showAdd && (
        <Text style={styles.empty}>No projects yet. Tap + to add your first one.</Text>
      )}

      {projects.map(p => {
        const pTasks = tasks.filter(t => t.projectId === p.id);
        const done = pTasks.filter(t => t.done).length;
        return (
          <Pressable key={p.id} style={styles.projectCard} onPress={() => router.push({ pathname: '/project', params: { id: p.id } })} onLongPress={() => deleteProject(p.id)}>
            <View style={[styles.projectDot, { backgroundColor: p.color }]} />
            <View style={styles.projectText}>
              <Text style={styles.projectName}>{p.name}</Text>
              <Text style={styles.projectCount}>{done}/{pTasks.length} tasks done</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.stone} />
          </Pressable>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], gap: space[4] },
  header: { gap: space[2] },
  eyebrow: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.copper },
  headline: { fontFamily: typography.families.display, fontSize: 30, lineHeight: 38, color: colors.ink },
  statsRow: { flexDirection: 'row', gap: space[3] },
  statBox: { flex: 1, backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, padding: space[4], alignItems: 'center' },
  statNum: { fontFamily: typography.families.display, fontSize: 28, color: colors.ink },
  statLabel: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone, marginTop: 4 },
  timerCard: { flexDirection: 'row', alignItems: 'center', gap: space[4], backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, padding: space[5] },
  timerText: { flex: 1, gap: 2 },
  timerTitle: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.ink },
  timerSub: { fontFamily: typography.families.body, fontSize: 13, color: colors.stone },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[4] },
  sectionLabel: { fontFamily: typography.families.bodySemibold, fontSize: 13, color: colors.ink },
  addRow: { flexDirection: 'row', gap: space[2] },
  addInput: { flex: 1, backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[3], fontSize: 14, fontFamily: typography.families.body, color: colors.ink },
  addBtn: { backgroundColor: colors.copperDeep, borderRadius: radius.sm, paddingHorizontal: space[5], justifyContent: 'center' },
  addBtnText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 14 },
  empty: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone, marginTop: space[2] },
  projectCard: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.md, padding: space[4] },
  projectDot: { width: 16, height: 16, borderRadius: 8 },
  projectText: { flex: 1, gap: 2 },
  projectName: { fontFamily: typography.families.bodySemibold, fontSize: 15, color: colors.ink },
  projectCount: { fontFamily: typography.families.body, fontSize: 12, color: colors.stone },
});
