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

export const DiscoverySchema = z.object({
  id: z.string(),
  userId: z.string().default('local'),
  category: z.string(),
  prompt: z.string(),
  intention: z.string().optional(),
  findings: z.record(z.string(), z.string()),
  sources: z.string().optional(),
  folderName: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type Discovery = z.infer<typeof DiscoverySchema>;

export const ReadingSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  body: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type Reading = z.infer<typeof ReadingSchema>;
