export const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS folders (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY NOT NULL, userId TEXT NOT NULL, title TEXT, body TEXT NOT NULL,
    prompt TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS discoveries (
    id TEXT PRIMARY KEY NOT NULL, userId TEXT NOT NULL, category TEXT NOT NULL, prompt TEXT NOT NULL,
    intention TEXT, findings TEXT NOT NULL, sources TEXT, folderId TEXT, createdAt TEXT NOT NULL
  );`
];
