import type { SQLiteDatabase } from 'expo-sqlite';
import type { JournalEntry, Discovery, Reading } from '@intentional/domain';

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
  return db.getFirstAsync<JournalEntry>(`SELECT * FROM journal_entries WHERE id = ?`, [id]) ?? null;
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

export async function saveReading(db: SQLiteDatabase, r: Reading): Promise<void> {
  await db.runAsync(`INSERT OR REPLACE INTO readings (id, title, body, createdAt) VALUES (?, ?, ?, ?)`, [r.id, r.title, r.body, r.createdAt]);
}

export async function getReadings(db: SQLiteDatabase): Promise<Reading[]> {
  return db.getAllAsync<Reading>(`SELECT * FROM readings ORDER BY createdAt DESC`);
}

export async function getReading(db: SQLiteDatabase, id: string): Promise<Reading | null> {
  return db.getFirstAsync<Reading>(`SELECT * FROM readings WHERE id = ?`, [id]) ?? null;
}

export async function setPreference(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(`INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)`, [key, value]);
}

export async function getPreference(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(`SELECT value FROM preferences WHERE key = ?`, [key]);
  return row?.value ?? null;
}
