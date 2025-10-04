import { z } from 'zod';

export const digitalTwinSchema = z.object({
  age: z.coerce.number().min(12, "Age must be at least 12").max(100, "Age must be at most 100"),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(200, "Weight must be at most 200 kg"),
  // BMI will be calculated, not a direct input in this schema
  menstrualCyclePattern: z.string().min(1, "Menstrual cycle pattern is required"),
  acne: z.enum(['none', 'mild', 'moderate', 'severe']).default('none'),
  hairGrowth: z.enum(['normal', 'mild_excess', 'moderate_excess', 'severe_excess']).default('normal'),
  skinType: z.enum(['normal', 'oily', 'dry', 'combination']).default('normal'),
  moodLog: z.string().min(1, "Mood log is required (e.g., emoji or short description)"),
  stressLevel: z.coerce.number().min(1).max(10),
  sleepQuality: z.string().min(1, "Sleep quality is required (e.g., emoji or description)"),
  dietPattern: z.string().min(1, "Diet pattern is required"),
  activityLevel: z.string().min(1, "Activity level is required"),
  currentRemedies: z.string().optional(),
  wearableDataSync: z.boolean().optional(),
  labResultsSync: z.boolean().optional(),
});

export type DigitalTwinFormData = z.infer<typeof digitalTwinSchema>;
