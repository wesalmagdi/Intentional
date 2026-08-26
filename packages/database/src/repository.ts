import type { SQLiteDatabase } from 'expo-sqlite';
import type { Discovery, JournalEntry } from '@intentional/domain';
import { TABLES } from './schema';

export async function saveDiscovery(db: SQLiteDatabase, discovery: Discovery): Promise<void> {
  await db.runAsync(
    `INSERT INTO ${TABLES.discoveries} (id, text, source, created_at) VALUES (?, ?, ?, ?)`,
    [discovery.id, discovery.text, discovery.source ?? null, discovery.createdAt]
  );
}

export async function getAllDiscoveries(db: SQLiteDatabase): Promise<Discovery[]> {
  const rows = await db.getAllAsync<{ id: string; text: string; source: string | null; created_at: string }>(
    `SELECT * FROM ${TABLES.discoveries} ORDER BY created_at DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    source: r.source ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function saveJournalEntry(db: SQLiteDatabase, entry: JournalEntry): Promise<void> {
  await db.runAsync(
    `INSERT INTO ${TABLES.journal} (id, prompt, text, created_at) VALUES (?, ?, ?, ?)`,
    [entry.id, entry.prompt, entry.text, entry.createdAt]
  );
}

export async function getAllJournalEntries(db: SQLiteDatabase): Promise<JournalEntry[]> {
  const rows = await db.getAllAsync<{ id: string; prompt: string; text: string; created_at: string }>(
    `SELECT * FROM ${TABLES.journal} ORDER BY created_at DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    prompt: r.prompt,
    text: r.text,
    createdAt: r.created_at,
  }));
}
