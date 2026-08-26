import type { SQLiteDatabase } from 'expo-sqlite';
import type { JournalEntry, Discovery } from '@intentional/domain';

export async function saveJournalEntry(db: SQLiteDatabase, entry: JournalEntry): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO journal_entries (id, userId, title, body, prompt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [entry.id, entry.userId, entry.title ?? null, entry.body, entry.prompt ?? null, entry.createdAt, entry.updatedAt]
  );
}

export async function getJournalEntries(db: SQLiteDatabase): Promise<JournalEntry[]> {
  return db.getAllAsync<JournalEntry>(`SELECT * FROM journal_entries ORDER BY createdAt DESC`);
}

export async function getJournalEntry(db: SQLiteDatabase, id: string): Promise<JournalEntry | null> {
  const row = await db.getFirstAsync<JournalEntry>(`SELECT * FROM journal_entries WHERE id = ?`, [id]);
  return row ?? null;
}

export async function saveDiscovery(db: SQLiteDatabase, d: Discovery): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO discoveries (id, userId, category, prompt, intention, findings, sources, folderName, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.id, d.userId, d.category, d.prompt, d.intention ?? null, JSON.stringify(d.findings), d.sources ?? null, d.folderName ?? null, d.createdAt]
  );
}

export async function getDiscoveries(db: SQLiteDatabase): Promise<Discovery[]> {
  const rows = await db.getAllAsync<any>(`SELECT * FROM discoveries ORDER BY createdAt DESC`);
  return rows.map(r => ({ ...r, findings: JSON.parse(r.findings) }));
}
