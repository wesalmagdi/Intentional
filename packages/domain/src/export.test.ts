import { describe, expect, it } from 'vitest';
import { ExportBundleSchema } from './types';

const ENTRY = { id: '1', userId: 'local', body: 'hello', createdAt: '2026-08-27T10:00:00Z', updatedAt: '2026-08-27T10:00:00Z' };
const DISCOVERY = { id: '2', userId: 'local', category: 'Notice', prompt: 'p', findings: { noticed: 'n' }, createdAt: '2026-08-27T10:00:00Z' };
const READING = { id: '3', title: 't', body: 'b', createdAt: '2026-08-27T10:00:00Z' };

function bundle(journal: unknown[] = [ENTRY], discoveries: unknown[] = [DISCOVERY], readings: unknown[] = [READING]) {
  return { app: 'intentional', version: 1, exportedAt: '2026-08-27T10:00:00Z', journal, discoveries, readings };
}

describe('export bundle', () => {
  it('accepts a valid bundle', () => {
    expect(ExportBundleSchema.safeParse(bundle()).success).toBe(true);
  });

  it('accepts SQLite NULLs exactly as the repository returns them', () => {
    const entryWithNulls = { ...ENTRY, title: null, prompt: null };
    const discoveryWithNulls = { ...DISCOVERY, intention: null, sources: null, folderName: null };
    expect(ExportBundleSchema.safeParse(bundle([entryWithNulls], [discoveryWithNulls])).success).toBe(true);
  });

  it('rejects foreign files', () => {
    expect(ExportBundleSchema.safeParse({ app: 'other', version: 1 }).success).toBe(false);
  });
});
