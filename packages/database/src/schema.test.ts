import { describe, expect, it } from 'vitest';
import { MIGRATIONS } from './schema';

describe('database schema', () => {
  it('contains migrations for the core tables', () => {
    const sql = MIGRATIONS.join(' ');
    expect(sql).toContain('folders');
    expect(sql).toContain('journal_entries');
    expect(sql).toContain('discoveries');
  });
});
