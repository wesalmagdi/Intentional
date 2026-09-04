import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPreference, setPreference } from '@intentional/database';
import { getDb } from '../lib/db';
import { colors, typography, space, radius } from '@intentional/ui';
import { Botanical } from '../components/Scenery';

type Project = { id: string; name: string; color: string };
type Task = { id: string; projectId: string; text: string; done: boolean };

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    void (async () => {
      const db = await getDb();
      const pRaw = await getPreference(db, 'focus.projects');
      const tRaw = await getPreference(db, 'focus.tasks');
      let projects: Project[] = [];
      let allTasks: Task[] = [];
      try { projects = JSON.parse(pRaw || '[]'); } catch {}
      try { allTasks = JSON.parse(tRaw || '[]'); } catch {}
      const found = projects.find(p => p.id === id);
      setProject(found ?? null);
      setTasks(allTasks.filter(t => t.projectId === id));
    })();
  }, [id]);

  const saveTasks = async (list: Task[]) => {
    setTasks(list);
    const db = await getDb();
    const tRaw = await getPreference(db, 'focus.tasks');
    let all: Task[] = [];
    try { all = JSON.parse(tRaw || '[]'); } catch {}
    const others = all.filter(t => t.projectId !== id);
    await setPreference(db, 'focus.tasks', JSON.stringify([...others, ...list]));
  };

  async function addTask() {
    if (!newText.trim() || !project) return;
    const t: Task = { id: String(Date.now()), projectId: project.id, text: newText.trim(), done: false };
    await saveTasks([...tasks, t]);
    setNewText('');
  }

  async function toggleTask(tid: string) {
    await saveTasks(tasks.map(t => t.id === tid ? { ...t, done: !t.done } : t));
  }

  function deleteTask(tid: string) {
    Alert.alert('Delete task?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await saveTasks(tasks.filter(t => t.id !== tid));
      }},
    ]);
  }

  if (!project) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  const open = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + space[6] }]} style={{ backgroundColor: colors.cream }}>
      <Botanical />
      <Pressable onPress={() => router.back()} hitSlop={12}><Feather name="chevron-left" size={22} color={colors.ink} /></Pressable>

      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: project.color }]} />
        <Text style={styles.headline}>{project.name}</Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add a task..."
          placeholderTextColor={colors.stone}
          value={newText}
          onChangeText={setNewText}
          onSubmitEditing={() => void addTask()}
        />
        <Pressable style={styles.addBtn} onPress={() => void addTask()}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {open.length === 0 && done.length === 0 && (
        <Text style={styles.empty}>No tasks yet. Add your first one.</Text>
      )}

      {open.map(t => (
        <Pressable key={t.id} style={styles.taskRow} onPress={() => void toggleTask(t.id)} onLongPress={() => deleteTask(t.id)}>
          <View style={styles.checkbox} />
          <Text style={styles.taskText}>{t.text}</Text>
        </Pressable>
      ))}

      {done.length > 0 && (
        <Text style={styles.doneLabel}>DONE</Text>
      )}
      {done.map(t => (
        <Pressable key={t.id} style={styles.taskRow} onPress={() => void toggleTask(t.id)} onLongPress={() => deleteTask(t.id)}>
          <View style={[styles.checkbox, styles.checkboxDone]} />
          <Text style={[styles.taskText, styles.taskTextDone]}>{t.text}</Text>
        </Pressable>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space[6], gap: space[4] },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  dot: { width: 20, height: 20, borderRadius: 10 },
  headline: { fontFamily: typography.families.display, fontSize: 28, lineHeight: 36, color: colors.ink, flex: 1 },
  addRow: { flexDirection: 'row', gap: space[2] },
  addInput: { flex: 1, backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[3], fontSize: 14, fontFamily: typography.families.body, color: colors.ink },
  addBtn: { backgroundColor: colors.copperDeep, borderRadius: radius.sm, paddingHorizontal: space[5], justifyContent: 'center' },
  addBtnText: { color: colors.cream, fontFamily: typography.families.bodySemibold, fontSize: 14 },
  empty: { fontFamily: typography.families.body, fontSize: 14, color: colors.stone },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.creamCard, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.sm, padding: space[4] },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.copper },
  checkboxDone: { backgroundColor: colors.copper },
  taskText: { flex: 1, fontFamily: typography.families.body, fontSize: 15, color: colors.ink },
  taskTextDone: { textDecorationLine: 'line-through', color: colors.stone },
  doneLabel: { fontFamily: typography.families.bodySemibold, fontSize: 11, letterSpacing: 1.5, color: colors.stone, marginTop: space[4] },
});
