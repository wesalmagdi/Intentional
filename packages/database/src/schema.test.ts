import { describe, expect, it } from 'vitest';
import { MIGRATIONS, TABLES } from './schema';

describe('database schema', () => {
  it('contains a migration for every table', () => {
    const sql = MIGRATIONS.join(' ');
    expect(sql).toContain(TABLES.discoveries);
    expect(sql).toContain(TABLES.journal);
  });
});
