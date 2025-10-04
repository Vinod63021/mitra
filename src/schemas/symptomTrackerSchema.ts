import { z } from 'zod';

// This schema is for a single log entry in the form
export const symptomLogSchema = z.object({
  mood: z.string().min(1, "Mood is required"),
  skin: z.string().min(1, "Skin condition is required"),
  pain: z.string().min(1, "Pain level/description is required"),
  period: z.string().min(1, "Period details are required (e.g., 'Day 3, light flow', 'No period')"),
  discharge: z.string().min(1, "Discharge details are required"),
  hairGrowth: z.string().min(1, "Hair growth observation is required"),
  logDate: z.date().default(() => new Date()),
});

export type SymptomLogFormData = z.infer<typeof symptomLogSchema>;

// The schema for the entire tracker functionality, which deals with multiple logs, is now implicitly handled in the page and AI flow.
