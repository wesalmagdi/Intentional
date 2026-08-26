import type { SQLiteDatabase } from 'expo-sqlite';
import type { JournalEntry, Discovery, Folder } from '@intentional/domain';

export async function saveJournalEntry(db: SQLiteDatabase, entry: JournalEntry): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO journal_entries (id, userId, title, body, prompt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [entry.id, entry.userId, entry.title ?? null, entry.body, entry.prompt ?? null, entry.createdAt, entry.updatedAt]
  );
}

export async function getJournalEntries(db: SQLiteDatabase): Promise<JournalEntry[]> {
  return db.getAllAsync<JournalEntry>(`SELECT * FROM journal_entries ORDER BY createdAt DESC`);
}

export async function saveDiscovery(db: SQLiteDatabase, d: Discovery): Promise<void> {
  await db.runAsync(
    `INSERT INTO discoveries (id, userId, category, prompt, intention, findings, sources, folderId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.id, d.userId, d.category, d.prompt, d.intention ?? null, JSON.stringify(d.findings), JSON.stringify(d.sources ?? []), d.folderId ?? null, d.createdAt]
  );
}

export async function getDiscoveries(db: SQLiteDatabase): Promise<Discovery[]> {
  const rows = await db.getAllAsync<any>(`SELECT * FROM discoveries ORDER BY createdAt DESC`);
  return rows.map(r => ({ ...r, findings: JSON.parse(r.findings), sources: JSON.parse(r.sources || '[]') }));
}

export async function getFolders(db: SQLiteDatabase): Promise<Folder[]> {
  return db.getAllAsync<Folder>(`SELECT * FROM folders ORDER BY name ASC`);
}
