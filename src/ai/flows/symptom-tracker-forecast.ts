
'use server';
/**
 * @fileOverview Analyzes a history of symptom logs to forecast cycle events, assess PCOS/PCOD risk, and provide personalized advice.
 *
 * - symptomTrackerForecast - The main function to analyze logs.
 * - SymptomTrackerInput - The input type, expecting an array of logs.
 * - SymptomTrackerOutput - The return type with forecasts and suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomLogSchema = z.object({
    logDate: z.string().describe("The date of the log entry in 'YYYY-MM-DD' format."),
    mood: z.string().describe('Mood level recorded in daily logs.'),
    skin: z.string().describe('Skin condition recorded in daily logs.'),
    pain: z.string().describe('Pain level recorded in daily logs.'),
    period: z.string().describe('Period details recorded in daily logs.'),
    discharge: z.string().describe('Discharge details recorded in daily logs.'),
    hairGrowth: z.string().describe('Hair growth details recorded in daily logs.'),
});

const SymptomTrackerInputSchema = z.object({
  logs: z.array(SymptomLogSchema).describe("An array of daily symptom logs sorted by date, with the most recent log first."),
});
export type SymptomTrackerInput = z.infer<typeof SymptomTrackerInputSchema>;


const SymptomTrackerOutputSchema = z.object({
  nextExpectedPeriod: z.string().describe('Predicted date or range for the next period based on patterns in the logs.'),
  cycleIrregularityRisk: z.string().describe('Risk assessment for cycle irregularity (e.g., Low, Medium, High).'),
  pcosRiskAssessment: z
    .string()
    .describe('A direct assessment of PCOS/PCOD risk based on logged symptoms, categorized as "Low", "Medium", or "High". This should be followed by a brief justification and a clear disclaimer that it is not a medical diagnosis.'),
  naturalRemedySuggestions: z.array(z.string()).describe('A list of 2-3 natural remedies suggested based on recurring symptoms (e.g., "Spearmint tea for hair growth concerns", "Ginger tea for pain/cramps").'),
  preventativeTips: z.array(z.string()).describe('A list of 2-3 actionable lifestyle tips for prevention and management based on the logs.'),
  personalizedInsights: z
    .string()
    .describe(
      'A summary of the key findings from the logs, highlighting the most prominent symptoms and patterns observed.'
    ),
});
export type SymptomTrackerOutput = z.infer<typeof SymptomTrackerOutputSchema>;

export async function symptomTrackerForecast(input: SymptomTrackerInput): Promise<SymptomTrackerOutput> {
  return symptomTrackerForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomTrackerForecastPrompt',
  input: {schema: SymptomTrackerInputSchema},
  output: {schema: SymptomTrackerOutputSchema},
  prompt: `You are an AI assistant specializing in PCOS management. Analyze the following history of symptom logs to identify patterns and provide a forecast.

Here are the user's logs (most recent first):
{{#each logs}}
- **{{logDate}}**: Mood: {{mood}}, Skin: {{skin}}, Pain: {{pain}}, Period: {{period}}, Discharge: {{discharge}}, Hair Growth: {{hairGrowth}}
{{/each}}

Based on this historical data, provide the following:

1.  **Cycle Forecast**:
    *   'nextExpectedPeriod': Predict the next period date.
    *   'cycleIrregularityRisk': Assess the risk of cycle irregularity (Low, Medium, High).

2.  **PCOS/PCOD Risk Assessment**:
    *   'pcosRiskAssessment': Provide a direct risk level ("Low", "Medium", or "High") based on how the combination of symptoms (e.g., irregular period mentions, skin issues, hair growth) aligns with common PCOS/PCOD patterns.
    *   Follow the risk level with a brief, one-sentence justification.
    *   **Crucially, you MUST end this assessment with the sentence**: "This is an observation, not a medical diagnosis. Please consult a healthcare professional."

    *   **Example for High risk**: "High: The combination of irregular cycle data, persistent acne, and hair growth concerns shows patterns common in PCOS. This is an observation, not a medical diagnosis. Please consult a healthcare professional."
    *   **Example for Low risk**: "Low: The logged symptoms do not currently show strong patterns typically associated with PCOS. This is an observation, not a medical diagnosis. Please consult a healthcare professional."


3.  **Personalized Guidance**:
    *   'naturalRemedySuggestions': Based on recurring symptoms in the logs, suggest 2-3 specific natural remedies (e.g., "Spearmint tea for hair growth concerns").
    *   'preventativeTips': Provide 2-3 actionable lifestyle tips based on the observed patterns.
    *   'personalizedInsights': Write a short summary of the most important patterns you've identified from the user's log history.

The output must be parsable by JSON.`,
});

const symptomTrackerForecastFlow = ai.defineFlow(
  {
    name: 'symptomTrackerForecastFlow',
    inputSchema: SymptomTrackerInputSchema,
    outputSchema: SymptomTrackerOutputSchema,
  },
  async input => {
    // Ensure logs are sorted by date, descending, just in case
    input.logs.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
    
    if (input.logs.length === 0) {
        throw new Error("At least one symptom log is required for analysis.");
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
