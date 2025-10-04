
'use server';

/**
 * @fileOverview Generates a personalized daily time management plan using AI.
 *
 * - generateTimePlan - A function that handles the time plan generation process.
 * - TimeManagementInput - The input type for the generateTimePlan function.
 * - TimeManagementOutput - The return type for the generateTimePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimeManagementInputSchema = z.object({
  wakeUpTime: z.string().describe("The user's desired wake-up time (e.g., '7:00 AM')."),
  bedTime: z.string().describe("The user's desired bedtime (e.g., '10:30 PM')."),
  mainGoals: z.array(z.string()).describe("A list of the user's main goals or tasks for the day."),
  workOrStudyHours: z.string().optional().describe("The user's fixed work or study hours (e.g., '9 AM - 5 PM')."),
  currentEnergyLevel: z.enum(['Low', 'Medium', 'High']).describe("The user's self-reported energy level for the day."),
});
export type TimeManagementInput = z.infer<typeof TimeManagementInputSchema>;


const TimeSlotSchema = z.object({
    timeRange: z.string().describe("The time range for the activity (e.g., '7:00 AM - 7:30 AM')."),
    activity: z.string().describe("The main activity for this time slot."),
    category: z.enum(['Morning Routine', 'Work/Study', 'Nutrition', 'Exercise', 'Relaxation', 'Evening Routine', 'Personal Time']).describe("The category of the activity."),
    details: z.string().optional().describe("A brief, encouraging tip or detail about the activity."),
});

const TimeManagementOutputSchema = z.object({
  schedule: z.array(TimeSlotSchema).describe("A list of time slots that form the daily schedule."),
  summary: z.string().describe("A brief, encouraging summary of the generated plan, highlighting how it balances the user's goals."),
});
export type TimeManagementOutput = z.infer<typeof TimeManagementOutputSchema>;

export async function generateTimePlan(input: TimeManagementInput): Promise<TimeManagementOutput> {
  return generateTimePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'timeManagementPrompt',
  input: {schema: TimeManagementInputSchema},
  output: {schema: TimeManagementOutputSchema},
  prompt: `You are an expert life coach specializing in time management for individuals with PCOS. Your goal is to create a balanced, realistic, and supportive daily schedule.

  PCOS management requires a holistic approach. The schedule should balance productivity with wellness. Key principles to follow:
  - **Stable Energy**: Avoid long, uninterrupted blocks of intense work. Suggest short breaks.
  - **Meal Timing**: Incorporate regular meal times (breakfast, lunch, dinner) to help regulate blood sugar. Breakfast should be within an hour or two of waking.
  - **Mindful Movement**: Integrate some form of physical activity. It doesn't have to be intense.
  - **Stress Management**: Allocate time for relaxation and winding down, especially before bed.
  - **Flexibility**: The plan should feel like a guide, not a rigid set of rules.

  Here is the user's information for today:
  - Wake-up Time: {{{wakeUpTime}}}
  - Bedtime: {{{bedTime}}}
  - Main Goals: {{#each mainGoals}} - {{{this}}} {{/each}}
  - Work/Study Hours: {{{workOrStudyHours}}}
  - Current Energy Level: {{{currentEnergyLevel}}}

  **Your Task:**
  1.  Create a structured 'schedule' as an array of time slots from wake-up to bedtime.
  2.  Each time slot must have a 'timeRange', 'activity', 'category', and optional 'details'.
  3.  Intelligently place the user's 'mainGoals' into the schedule.
  4.  If the user's energy is 'Low', suggest lighter activities and more breaks. If 'High', you can schedule more demanding tasks.
  5.  Ensure standard meals (Breakfast, Lunch, Dinner) are included in the 'Nutrition' category.
  6.  Include a "Wind-down" or "Relaxation" period before bedtime.
  7.  Write a brief, encouraging 'summary' of the plan.

  Example time slot:
  {
    "timeRange": "8:00 AM - 8:30 AM",
    "activity": "Morning Yoga",
    "category": "Exercise",
    "details": "A gentle yoga session to start your day with mindfulness."
  }
  
  Generate the full schedule now. The output must be parsable by JSON.`,
});

const generateTimePlanFlow = ai.defineFlow(
  {
    name: 'generateTimePlanFlow',
    inputSchema: TimeManagementInputSchema,
    outputSchema: TimeManagementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
