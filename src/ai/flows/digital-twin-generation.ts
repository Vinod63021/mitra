'use server';

/**
 * @fileOverview Generates a personalized 3D avatar (digital twin) based on user health data to visualize PCOS condition.
 *
 * - generateDigitalTwin - A function that handles the digital twin generation process.
 * - DigitalTwinInput - The input type for the generateDigitalTwin function.
 * - DigitalTwinOutput - The return type for the generateDigitalTwin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DigitalTwinInputSchema = z.object({
  age: z.number().describe('Age of the user'),
  height: z.number().describe('Height of the user in cm'),
  weight: z.number().describe('Weight of the user in kg'),
  menstrualCyclePattern: z.string().describe('Pattern of the menstrual cycle (regular, irregular, etc.)'),
  acne: z.boolean().describe('Whether the user has acne or not'),
  hairGrowth: z.string().describe('Description of hair growth pattern (normal, excessive, etc.)'),
  skinType: z.string().describe('Skin type of the user (oily, dry, normal, combination)'),
  moodLog: z.string().describe('Mood log of the user (happy, sad, stressed, etc.)'),
  stressLevel: z.number().describe('Stress level of the user on a scale of 1-10'),
  sleepQuality: z.string().describe('Sleep quality of the user (good, bad, average)'),
  dietPattern: z.string().describe('Diet pattern of the user (vegetarian, non-vegetarian, vegan, etc.)'),
  activityLevel: z.string().describe('Activity level of the user (sedentary, light, moderate, active)'),
  currentRemedies: z.string().describe('Current remedies or medicines the user is taking'),
  wearableDataSync: z.boolean().optional().describe('Whether wearable data is synced or not'),
  labResultsSync: z.boolean().optional().describe('Whether lab results are synced or not'),
});
export type DigitalTwinInput = z.infer<typeof DigitalTwinInputSchema>;

const DigitalTwinOutputSchema = z.object({
  avatarDescription: z.string().describe('A detailed description of the generated 3D avatar, including visual cues representing the user’s PCOS condition.'),
  skinAppearance: z.string().describe('Description of skin appearance including dullness, stress glow, etc.'),
  bloatingVisual: z.boolean().describe('Whether the avatar shows visual bloating or not'),
  cycleAnimation: z.string().describe('Description of the menstrual cycle animation (regular, irregular)'),
  stressIndicators: z.string().describe('Visual indicators of stress level on the avatar'),
});
export type DigitalTwinOutput = z.infer<typeof DigitalTwinOutputSchema>;

export async function generateDigitalTwin(input: DigitalTwinInput): Promise<DigitalTwinOutput> {
  return generateDigitalTwinFlow(input);
}

const prompt = ai.definePrompt({
  name: 'digitalTwinPrompt',
  input: {schema: DigitalTwinInputSchema},
  output: {schema: DigitalTwinOutputSchema},
  prompt: `You are an AI that generates a description of a 3D avatar, a digital twin, representing a person with PCOS.

  The avatar should visually represent the user's condition based on their health data. 
  Incorporate visual cues related to PCOS symptoms like skin appearance (dullness, acne, stress glow), bloating, and menstrual cycle irregularities. 
  Also, reflect the user's mood, stress level, sleep quality, and other relevant factors in the avatar's appearance.

  Here is the user's data:
  Age: {{{age}}}
  Height: {{{height}}} cm
  Weight: {{{weight}}} kg
  Menstrual Cycle Pattern: {{{menstrualCyclePattern}}}
  Acne: {{{acne}}}
  Hair Growth: {{{hairGrowth}}}
  Skin Type: {{{skinType}}}
  Mood Log: {{{moodLog}}}
  Stress Level: {{{stressLevel}}} (1-10)
  Sleep Quality: {{{sleepQuality}}}
  Diet Pattern: {{{dietPattern}}}
  Activity Level: {{{activityLevel}}}
  Current Remedies: {{{currentRemedies}}}

  Describe the avatar with these considerations, and describe visual elements.
  Set bloatingVisual to true or false depending on the user's data.
  Describe how the avatar's skin appears based on the skinType, acne, and stressLevel.
  Describe how the avatar animates its cycle, based on menstrualCyclePattern.
  Describe the indicators on the avatar which represent the user's stress level.
  The output must be parsable by JSON.`, 
});

const generateDigitalTwinFlow = ai.defineFlow(
  {
    name: 'generateDigitalTwinFlow',
    inputSchema: DigitalTwinInputSchema,
    outputSchema: DigitalTwinOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
