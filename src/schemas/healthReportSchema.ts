
import { z } from 'zod';

// This file is primarily for ensuring data consistency if you were to
// build a form for custom report generation, but for now, it mirrors
// the types used in the AI flow.

const symptomLogEntrySchema = z.object({
  date: z.string(),
  mood: z.string().optional(),
  skin: z.string().optional(),
  pain: z.string().optional(),
  period: z.string().optional(),
  journalText: z.string().optional(),
});

const cycleDataEntrySchema = z.object({
    startDate: z.string(),
    cycleLength: z.number(),
});

export const healthReportInputSchema = z.object({
  userName: z.string(),
  reportDurationDays: z.number(),
  symptomLogs: z.array(symptomLogEntrySchema),
  cycleData: z.array(cycleDataEntrySchema),
});

export type HealthReportFormInput = z.infer<typeof healthReportInputSchema>;
