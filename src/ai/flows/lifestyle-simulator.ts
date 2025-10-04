'use server';

/**
 * @fileOverview Simulates the effects of lifestyle changes on a user's digital twin.
 *
 * - lifestyleSimulator - Simulates lifestyle changes and predicts their impact on health.
 * - LifestyleSimulatorInput - The input type for the lifestyleSimulator function.
 * - LifestyleSimulatorOutput - The return type for the lifestyleSimulator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LifestyleSimulatorInputSchema = z.object({
  age: z.number().describe('User age.'),
  height: z.number().describe('User height in cm.'),
  weight: z.number().describe('User weight in kg.'),
  bmi: z.number().describe('User BMI.'),
  menstrualCyclePattern: z.string().describe('Menstrual cycle pattern description.'),
  acne: z.string().describe('Description of acne condition.'),
  hairGrowth: z.string().describe('Description of hair growth patterns.'),
  skinType: z.string().describe('User skin type.'),
  moodLog: z.string().describe('Emoji representation of mood.'),
  stressLevel: z.number().describe('Stress level on a scale of 1-10.'),
  sleepQuality: z.string().describe('Emoji sleep meter representation.'),
  dietPattern: z.string().describe('Description of diet pattern.'),
  activityLevel: z.string().describe('Description of activity level (daily steps, yoga, exercise).'),
  currentRemediesOrMedicines: z.string().describe('Current remedies or medicines being taken.'),
  lifestyleChanges: z
    .array(z.string())
    .describe(
      'Array of lifestyle changes to simulate, e.g., Add spearmint tea, Avoid white rice/bread, Walk or do yoga daily, Improve sleep, Use natural herbs like fenugreek, turmeric.'
    ),
});

export type LifestyleSimulatorInput = z.infer<typeof LifestyleSimulatorInputSchema>;

const LifestyleSimulatorOutputSchema = z.object({
  predictedWeightChange: z
    .string()
    .describe('Predicted weight change based on lifestyle changes.'),
  cycleImprovement: z.string().describe('Predicted improvement in menstrual cycle.'),
  acneFading: z.string().describe('Predicted changes in acne condition.'),
  moodColorStabilizing: z.string().describe('Predicted mood color stabilization.'),
  energyMeterRising: z.string().describe('Predicted rise in energy levels.'),
});

export type LifestyleSimulatorOutput = z.infer<typeof LifestyleSimulatorOutputSchema>;

export async function lifestyleSimulator(input: LifestyleSimulatorInput): Promise<LifestyleSimulatorOutput> {
  return lifestyleSimulatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lifestyleSimulatorPrompt',
  input: {schema: LifestyleSimulatorInputSchema},
  output: {schema: LifestyleSimulatorOutputSchema},
  prompt: `You are a helpful and empathetic digital health assistant specializing in PCOS management.

  Based on the user's current health data and the lifestyle changes they want to simulate, predict the impact on their health.

  Current Health Data:
  - Age: {{{age}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg
  - BMI: {{{bmi}}}
  - Menstrual Cycle Pattern: {{{menstrualCyclePattern}}}
  - Acne: {{{acne}}}
  - Hair Growth: {{{hairGrowth}}}
  - Skin Type: {{{skinType}}}
  - Mood Log: {{{moodLog}}}
  - Stress Level: {{{stressLevel}}} (1-10)
  - Sleep Quality: {{{sleepQuality}}}
  - Diet Pattern: {{{dietPattern}}}
  - Activity Level: {{{activityLevel}}}
  - Current Remedies/Medicines: {{{currentRemediesOrMedicines}}}

  Lifestyle Changes to Simulate:
  {{#each lifestyleChanges}}
  - {{{this}}}
  {{/each}}

  Provide a prediction for each of the following health aspects, considering all provided data and lifestyle changes:
  - Predicted Weight Change: Describe the expected change in weight.
  - Cycle Improvement: Describe the expected improvement in the menstrual cycle.
  - Acne Fading: Describe the expected changes in acne condition.
  - Mood Color Stabilizing: Describe the expected mood stabilization.
  - Energy Meter Rising: Describe the expected rise in energy levels.

  Ensure the predictions are realistic and based on scientific understanding of PCOS and lifestyle interventions.
`,
});

const lifestyleSimulatorFlow = ai.defineFlow(
  {
    name: 'lifestyleSimulatorFlow',
    inputSchema: LifestyleSimulatorInputSchema,
    outputSchema: LifestyleSimulatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
