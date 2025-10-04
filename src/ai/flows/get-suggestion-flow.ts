
'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing holistic suggestions based on symptom logs and journal entries for PCOS management.
 *
 * - getSuggestionFlow - A function that takes symptom logs and journal text as input and returns emotional analysis, symptom forecasts, and holistic advice.
 * - GetSuggestionInput - The input type for the getSuggestionFlow function.
 * - GetSuggestionOutput - The return type for the getSuggestionFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSuggestionInputSchema = z.object({
  mood: z.string().describe('Mood level recorded in daily logs.'),
  skin: z.string().describe('Skin condition recorded in daily logs.'),
  pain: z.string().describe('Pain level recorded in daily logs.'),
  period: z.string().describe('Period details recorded in daily logs.'),
  discharge: z.string().describe('Discharge details recorded in daily logs.'),
  hairGrowth: z.string().describe('Hair growth details recorded in daily logs.'),
  journalText: z.string().describe('The text content of the user’s journal entry.'),
});
export type GetSuggestionInput = z.infer<typeof GetSuggestionInputSchema>;

const RemedyDetailSchema = z.object({
  name: z.string().describe('Name of the remedy.'),
  description: z.string().describe('Brief description of what the remedy is and its benefits.'),
  instructions: z.string().optional().describe('Step-by-step instructions on how to prepare or use the remedy.'),
});

const FoodRecommendationSchema = z.object({
  name: z.string().describe('Name of the recommended food item.'),
  benefits: z.string().describe('How this food item helps with PCOS or general well-being.'),
  imageUrlHint: z.string().optional().describe('One or two keywords for a placeholder image (e.g., "broccoli florets", "salmon fillet"). Max two words.'),
});

const GetSuggestionOutputSchema = z.object({
  emotionalReflection: z.object({
    sentiment: z
      .string()
      .describe(
        'The overall sentiment of the journal entry (e.g., positive, negative, neutral).'
      ),
    twinColor: z
      .string()
      .describe(
        'A color that represents the emotional state of the user. Options: Blue -> Sad, Red -> Stressed, Green -> Calm.'
      ),
    moodBasedSuggestion: z
      .string()
      .describe(
        'A suggestion for the user based on their emotional state (e.g., Try 5-min mindful breathing, Write a gratitude note, Would you like to hear calming music?).'
      ),
  }),
  symptomAnalysis: z.object({
    nextExpectedPeriod: z.string().describe('Predicted date of next period.'),
    cycleIrregularityRisk: z.string().describe('Risk assessment for cycle irregularity.'),
    diabetesInfertilityAlerts: z
      .string()
      .describe('Alerts related to diabetes or infertility risks.'),
  }),
  detailedRemedies: z.array(RemedyDetailSchema).describe('A list of detailed natural remedies, including instructions if applicable.'),
  foodRecommendations: z.array(FoodRecommendationSchema).describe('A list of recommended food items with their benefits and image hints.'),
  actionableTips: z.array(z.string()).describe('A list of actionable lifestyle tips for the user to follow.'),
  holisticSummary: z
    .string()
    .describe(
      'A combined summary and actionable advice based on both emotional state and physical symptoms, integrating insights from all analyses.'
    ),
});
export type GetSuggestionOutput = z.infer<typeof GetSuggestionOutputSchema>;

export async function getSuggestion(input: GetSuggestionInput): Promise<GetSuggestionOutput> {
  return getSuggestionFlow(input);
}

const suggestionPrompt = ai.definePrompt({
  name: 'getSuggestionPrompt',
  input: {schema: GetSuggestionInputSchema},
  output: {schema: GetSuggestionOutputSchema},
  prompt: `You are an AI assistant specializing in PCOS management. Your goal is to provide holistic suggestions based on the user's daily symptom logs and their journal entry.

Analyze the following user data:

Symptom Log & Journal:
- Mood: {{{mood}}}
- Skin: {{{skin}}}
- Pain: {{{pain}}}
- Period: {{{period}}}
- Discharge: {{{discharge}}}
- Hair Growth: {{{hairGrowth}}}
- Journal Entry: {{{journalText}}}

Based on this combined information, provide the following:

1.  **Emotional Reflection**:
    *   Analyze the sentiment of the journal entry (positive, negative, or neutral).
    *   Determine a 'twinColor' that reflects this emotional state: "Blue" for sad/negative, "Red" for stressed/anxious, "Green" for calm/positive/neutral.
    *   Offer a 'moodBasedSuggestion' tailored to this sentiment (e.g., if sad: "Try 5-min mindful breathing"; if stressed: "Write a gratitude note"; if neutral/positive: "Acknowledge your positive state!").

2.  **Symptom Analysis**:
    *   Predict the 'nextExpectedPeriod' date based on the symptom log.
    *   Assess the 'cycleIrregularityRisk' (e.g., low, medium, high).
    *   Provide any 'diabetesInfertilityAlerts' if indicated by the symptoms.

3.  **Personalized Guidance**:
    *   **Detailed Remedies**: Provide a list of 'detailedRemedies'. Each remedy should have a 'name', 'description' of its benefits, and optional 'instructions'. Suggest at least two distinct remedies.
    *   **Food Recommendations**: Provide a list of 'foodRecommendations'. Each food should have a 'name', its 'benefits' for PCOS or well-being, and an 'imageUrlHint' (one or two keywords like "broccoli florets" or "salmon fillet" - max two words). Suggest at least three distinct food items.
    *   **Actionable Tips**: Provide a list of at least three distinct 'actionableTips' as strings. These should be practical lifestyle suggestions.

4.  **Holistic Summary**:
    *   Provide a 'holisticSummary' that combines insights from the emotional reflection, symptom analysis, and integrates the provided remedies, food recommendations, and tips. This summary should offer actionable advice that considers the interplay between their feelings, physical symptoms, and the suggested guidance.

Ensure your output is comprehensive, empathetic, and structured according to the output schema.
The output must be parsable by JSON.`,
});

const getSuggestionFlow = ai.defineFlow(
  {
    name: 'getSuggestionFlow',
    inputSchema: GetSuggestionInputSchema,
    outputSchema: GetSuggestionOutputSchema,
  },
  async input => {
    const {output} = await suggestionPrompt(input);
    return output!;
  }
);
