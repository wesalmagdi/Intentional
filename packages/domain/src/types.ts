import { z } from 'zod';

export const DiscoverySchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  source: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type Discovery = z.infer<typeof DiscoverySchema>;

export const JournalEntrySchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  text: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
