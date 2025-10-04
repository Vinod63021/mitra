
import { z } from 'zod';

export const periodEntrySchema = z.object({
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"], // Field that gets the error
});

export type PeriodEntryFormData = z.infer<typeof periodEntrySchema>;

export const additionalSymptomsSchema = z.object({
  symptomsText: z.string().min(10, "Please describe your symptoms in at least 10 characters.").max(500, "Symptoms description is too long."),
});

export type AdditionalSymptomsFormData = z.infer<typeof additionalSymptomsSchema>;
