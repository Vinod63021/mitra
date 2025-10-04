
'use server';
/**
 * @fileOverview Generates a comprehensive health report based on historical user data.
 *
 * - generateHealthReport - A function that handles the health report generation.
 * - HealthReportInput - The input type for the generateHealthReport function.
 * - HealthReportOutput - The return type for the generateHealthReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomLogEntrySchema = z.object({
  date: z.string().describe('The date of the log entry (YYYY-MM-DD).'),
  mood: z.string().optional().describe('Description of mood.'),
  skin: z.string().optional().describe('Description of skin condition.'),
  pain: z.string().optional().describe('Description of pain level or type.'),
  period: z.string().optional().describe('Details about the menstrual period.'),
  journalText: z.string().optional().describe('Text from a journal entry.'),
});

const CycleDataEntrySchema = z.object({
    startDate: z.string().describe('The start date of a menstrual period (YYYY-MM-DD).'),
    cycleLength: z.number().describe('The length of the menstrual cycle in days.'),
});

const HealthReportInputSchema = z.object({
  userName: z.string().describe("The user's name."),
  reportDurationDays: z.number().describe('The duration of the report in days (e.g., 30).'),
  symptomLogs: z.array(SymptomLogEntrySchema).describe('An array of daily symptom logs for the period.'),
  cycleData: z.array(CycleDataEntrySchema).describe('An array of calculated cycle data for the period.'),
});
export type HealthReportInput = z.infer<typeof HealthReportInputSchema>;

const FoodRecommendationSchema = z.object({
  name: z.string().describe('Name of the recommended food item.'),
  benefits: z.string().describe('How this food item helps with PCOS or general well-being based on the user\'s logged symptoms.'),
  imageUrlHint: z.string().optional().describe('One or two keywords for a placeholder image (e.g., "broccoli florets", "salmon fillet"). Max two words.'),
});


const HealthReportOutputSchema = z.object({
  reportTitle: z.string().describe("The title of the report, e.g., 'Health Report for Alex - Last 30 Days'."),
  cycleAnalysis: z.object({
    averageCycleLength: z.string().describe('The average cycle length in days. Can be a range if variable.'),
    cycleRegularity: z.string().describe('A summary of cycle regularity (e.g., "Appears regular", "Shows significant irregularity").'),
    periodSummary: z.string().describe('A brief summary of period flow or symptoms if available.'),
  }),
  symptomTrends: z.array(z.object({
      symptom: z.string().describe('The name of the symptom category (e.g., "Acne", "Mood Swings", "Pelvic Pain").'),
      trend: z.string().describe('A summary of the trend for this symptom over the period (e.g., "Logged frequently, especially in the week before menstruation.").'),
  })).describe('An analysis of recurring symptoms and their patterns.'),
  moodAndWellness: z.object({
    moodSummary: z.string().describe('A summary of the overall mood trends from journal entries and logs.'),
    stressIndicators: z.string().describe('Any indicators of stress or anxiety noted in the logs.'),
  }),
  foodRecommendations: z.array(FoodRecommendationSchema).describe('A list of 2-3 recommended food items based on recurring symptoms in the logs, with their benefits and image hints.'),
  actionableTips: z.array(z.string()).describe('A list of 3-4 actionable lifestyle tips for prevention and management, based on the overall health patterns observed.'),
  holisticSummary: z.string().describe("A high-level AI-driven summary of the user's health profile over the period. This should highlight key patterns, analyze potential PCOS/PCOD connections based on the data, and provide preventative advice. It must be phrased carefully and always recommend consulting a doctor for a diagnosis."),
});
export type HealthReportOutput = z.infer<typeof HealthReportOutputSchema>;

export async function generateHealthReport(input: HealthReportInput): Promise<HealthReportOutput> {
  return healthReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'healthReportPrompt',
  input: {schema: HealthReportInputSchema},
  output: {schema: HealthReportOutputSchema},
  prompt: `You are a health assistant AI that generates a clear, concise, and empathetic health report for a user with PCOS, based on their logged data.
This report is intended to be a helpful summary for the user and to be shared with their healthcare provider.
**Crucially, this is NOT a diagnosis.** Frame all analysis as observations from the data provided.

Generate a health report for {{{userName}}} covering the last {{{reportDurationDays}}} days.

**Cycle Data:**
{{#if cycleData}}
{{#each cycleData}}
- Cycle started: {{{startDate}}}, Length: {{{cycleLength}}} days
{{/each}}
{{else}}
No complete cycle data available for this period.
{{/if}}

**Symptom & Journal Logs:**
{{#each symptomLogs}}
- **{{date}}**: Mood: {{mood}}, Skin: {{skin}}, Pain: {{pain}}, Period: {{period}}{{#if journalText}}, Journal: "{{journalText}}"{{/if}}
{{/each}}

**Instructions:**
1.  **Report Title**: Create a title like "Health Report for [UserName] - Last [X] Days".
2.  **Cycle Analysis**:
    *   Calculate the 'averageCycleLength'. If variable, provide a range (e.g., "35-45 days").
    *   Summarize 'cycleRegularity' based on the variation in length.
    *   Provide a 'periodSummary' describing typical flow if mentioned in logs.
3.  **Symptom Trends**:
    *   Identify 2-4 key recurring 'symptoms' from the logs (e.g., Acne, Pelvic Pain, Mood Swings, Hair Fall).
    *   For each, describe the 'trend', noting any patterns (e.g., "Acne flare-ups were noted on 8 days, often clustered around the mid-cycle.").
4.  **Mood and Wellness**:
    *   Summarize the overall 'moodSummary' based on mood logs and journal entries.
    *   Note any recurring 'stressIndicators' if journal entries mention stress, anxiety, or feeling overwhelmed.
5.  **Food Recommendations**:
    *   Based on the most prominent symptoms and general PCOS guidelines, suggest 2-3 specific 'foodRecommendations'.
    *   For each food, explain its 'benefits' and provide a simple 'imageUrlHint' (max two words).
6.  **Actionable Tips**:
    *   Provide a list of 3-4 'actionableTips' for prevention and management. These should be practical lifestyle suggestions based on the overall data.
7.  **Holistic Summary**:
    *   Write a high-level paragraph. Integrate findings from the cycle, symptom, and mood analyses.
    *   Analyze the data for patterns that *could be associated with* PCOS/PCOD (e.g., "The combination of irregular cycles and frequent acne logs can be indicative of hormonal imbalances often seen in PCOS.").
    *   Include preventative advice.
    *   End with an encouraging note and a clear statement: "This report is a summary of logged data and not a medical diagnosis. Please discuss these findings with a qualified healthcare professional."

The output must be parsable by JSON.`,
});

const healthReportFlow = ai.defineFlow(
  {
    name: 'healthReportFlow',
    inputSchema: HealthReportInputSchema,
    outputSchema: HealthReportOutputSchema,
  },
  async input => {
    // Add basic validation or data processing here if needed
    if (input.symptomLogs.length === 0) {
      throw new Error("Cannot generate a report with no symptom data.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
