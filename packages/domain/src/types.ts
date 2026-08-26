import { z } from 'zod';

export const JournalEntrySchema = z.object({
  id: z.string(),
  userId: z.string().default('local'),
  title: z.string().optional(),
  body: z.string(),
  prompt: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const FolderSchema = z.object({ id: z.string(), name: z.string() });
export type Folder = z.infer<typeof FolderSchema>;

export const DiscoverySchema = z.object({
  id: z.string(),
  userId: z.string().default('local'),
  category: z.string(),
  prompt: z.string(),
  intention: z.string().optional(),
  findings: z.record(z.string(), z.string()),
  sources: z.array(z.string()).optional(),
  folderId: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type Discovery = z.infer<typeof DiscoverySchema>;
