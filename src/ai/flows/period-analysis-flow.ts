
'use server';
/**
 * @fileOverview Analyzes period data for regularity, predicts next cycle, and offers insights.
 *
 * - analyzePeriodCycles - A function that handles the period cycle analysis.
 * - PeriodAnalysisInput - The input type for the analyzePeriodCycles function.
 * - PeriodAnalysisOutput - The return type for the analyzePeriodCycles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PeriodAnalysisInputSchema = z.object({
  periodCycleData: z.array(z.object({
    startDate: z.string().describe('The start date of a menstrual period (YYYY-MM-DD).'),
    cycleLength: z.number().describe('The length of the menstrual cycle in days (from start of one period to start of next).'),
  })).min(1).describe('An array of recent period cycle data, should have at least 1 entry, ideally 3 or more for better analysis.'),
  additionalSymptoms: z.string().optional().describe('Optional additional symptoms described by the user if prompted due to irregularity.'),
});
export type PeriodAnalysisInput = z.infer<typeof PeriodAnalysisInputSchema>;

const PeriodAnalysisOutputSchema = z.object({
  isRegular: z.boolean().describe('Whether the menstrual cycle appears to be regular based on the provided data.'),
  regularitySummary: z.string().describe('A brief summary of the cycle regularity (e.g., "Your cycles appear regular, varying by X-Y days.", "Your cycles show significant irregularity.").'),
  nextExpectedPeriodDate: z.string().describe('Predicted start date (YYYY-MM-DD) or range for the next menstrual period. State if prediction is difficult with limited data.'),
  promptForMoreInfo: z.boolean().describe('True if the AI suggests the user provide more information or symptoms due to detected irregularities or limited data.'),
  potentialIssues: z.array(z.string()).optional().describe('If irregularities and/or additional symptoms are noted, list potential (non-diagnostic) issues or factors to consider (e.g., "Stress affecting cycle", "Possible hormonal imbalance - consult doctor"). Always include advice to see a doctor for diagnosis.'),
  preventativeTips: z.array(z.string()).optional().describe('Actionable lifestyle tips for maintaining or improving menstrual health, or managing PCOS-related symptoms if indicated.'),
  pcosRiskIndicator: z.string().optional().describe('A general statement about whether the patterns (if significantly irregular and combined with common PCOS symptoms if provided) might suggest a higher likelihood of PCOS, always urging medical consultation. E.g., "Highly irregular cycles combined with [symptom] can be associated with PCOS. Please consult a doctor." or "Current data does not strongly indicate PCOS, but maintain healthy habits."'),
});
export type PeriodAnalysisOutput = z.infer<typeof PeriodAnalysisOutputSchema>;

export async function analyzePeriodCycles(input: PeriodAnalysisInput): Promise<PeriodAnalysisOutput> {
  return periodAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'periodAnalysisPrompt',
  input: {schema: PeriodAnalysisInputSchema},
  output: {schema: PeriodAnalysisOutputSchema},
  prompt: `You are an AI assistant specializing in women's menstrual health and PCOS.
Analyze the provided menstrual cycle data. If additional symptoms are provided, consider them in your analysis.

Cycle Data:
{{#each periodCycleData}}
- Period started: {{{startDate}}}, Cycle Length: {{{cycleLength}}} days
{{/each}}

{{#if additionalSymptoms}}
Additional User-Described Symptoms: {{{additionalSymptoms}}}
{{/if}}

Based ONLY on the data provided:
1.  Determine if the cycle is 'isRegular'. A regular cycle typically varies by +/- 7 days, with lengths between 21-35 days. If fewer than 3 cycles are provided, state that regularity is harder to assess.
2.  Provide a 'regularitySummary' explaining your assessment.
3.  Predict the 'nextExpectedPeriodDate' (as YYYY-MM-DD or a short date range like "YYYY-MM-DD to YYYY-MM-DD"). If difficult to predict, explain why.
4.  Set 'promptForMoreInfo' to true if:
    *   Cycles are significantly irregular AND no 'additionalSymptoms' were provided.
    *   There are fewer than 3 cycles of data and it's difficult to make a strong assessment.
    Otherwise, set it to false.
5.  If cycles are irregular AND 'additionalSymptoms' are provided, OR if the pattern is highly irregular even without additional symptoms:
    *   List 1-3 'potentialIssues'. These are NOT diagnoses. Examples: "Stress-induced irregularity", "Significant cycle length variation warrants medical review", "Symptoms like [X, Y] with irregular cycles can be linked to hormonal imbalances; consult a doctor".
    *   Provide a 'pcosRiskIndicator' statement. Be very careful: if symptoms strongly align with PCOS (e.g., very long/infrequent cycles + hirsutism if mentioned in symptoms), you can say "Patterns like these *can be associated with* conditions like PCOS. It is crucial to consult a doctor for diagnosis." If not, state "Current data doesn't strongly indicate PCOS, but continue monitoring and consult a doctor for any concerns."
6.  Provide 2-4 'preventativeTips' for general menstrual health or relevant to observed patterns/symptoms. Examples: "Maintain a balanced diet", "Manage stress through mindfulness", "Regular exercise can help regulate cycles".

IMPORTANT:
*   Never give a medical diagnosis. Always advise consulting a doctor for diagnosis or serious concerns.
*   Be empathetic and supportive in your language.
*   If data is insufficient (e.g., only one cycle), clearly state limitations in your analysis.

Output must be parsable by JSON.`,
});

const periodAnalysisFlow = ai.defineFlow(
  {
    name: 'periodAnalysisFlow',
    inputSchema: PeriodAnalysisInputSchema,
    outputSchema: PeriodAnalysisOutputSchema,
  },
  async input => {
    // Basic validation: ensure cycle lengths are positive
    if (input.periodCycleData.some(c => c.cycleLength <= 0)) {
        throw new Error("Invalid cycle data: Cycle lengths must be positive.");
    }
    // Sort by start date just in case they are not already
    input.periodCycleData.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const {output} = await prompt(input);
    return output!;
  }
);
