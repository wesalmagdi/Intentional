import { z } from 'zod';

export const JournalEntrySchema = z.object({
  id: z.string(),
  userId: z.string().default('local'),
  title: z.string().nullish(),
  body: z.string(),
  prompt: z.string().nullish(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const DiscoverySchema = z.object({
  id: z.string(),
  userId: z.string().default('local'),
  category: z.string(),
  prompt: z.string(),
  intention: z.string().nullish(),
  findings: z.record(z.string(), z.string()),
  sources: z.string().nullish(),
  folderName: z.string().nullish(),
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

export const ExportBundleSchema = z.object({
  app: z.literal('intentional'),
  version: z.number(),
  exportedAt: z.string().datetime(),
  journal: z.array(JournalEntrySchema),
  discoveries: z.array(DiscoverySchema),
  readings: z.array(ReadingSchema),
});
export type ExportBundle = z.infer<typeof ExportBundleSchema>;
