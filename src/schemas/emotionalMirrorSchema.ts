import { z } from 'zod';

export const emotionalMirrorSchema = z.object({
  voiceJournalText: z.string().min(10, "Journal entry must be at least 10 characters long."),
});

export type EmotionalMirrorFormData = z.infer<typeof emotionalMirrorSchema>;
