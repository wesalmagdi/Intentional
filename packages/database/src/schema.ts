export const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS folders (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY NOT NULL, userId TEXT NOT NULL, title TEXT, body TEXT NOT NULL,
    prompt TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS discoveries (
    id TEXT PRIMARY KEY NOT NULL, userId TEXT NOT NULL, category TEXT NOT NULL, prompt TEXT NOT NULL,
    intention TEXT, findings TEXT NOT NULL, sources TEXT, folderName TEXT, createdAt TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, createdAt TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS preferences (
    key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL
  );`
];
