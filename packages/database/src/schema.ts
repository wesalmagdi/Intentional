export const TABLES = {
  discoveries: 'discoveries',
  journal: 'journal_entries',
} as const;

export const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS ${TABLES.discoveries} (
    id TEXT PRIMARY KEY NOT NULL,
    text TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.journal} (
    id TEXT PRIMARY KEY NOT NULL,
    prompt TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`
];
