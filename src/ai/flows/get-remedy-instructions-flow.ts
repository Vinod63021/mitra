
'use server';
/**
 * @fileOverview Generates detailed instructions for preparing or using a natural remedy.
 *
 * - getRemedyInstructions - A function that takes remedy details and generates instructions.
 * - RemedyInstructionInput - The input type for the getRemedyInstructions function.
 * - RemedyInstructionOutput - The return type for the getRemedyInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemedyInstructionInputSchema = z.object({
  remedyName: z.string().describe('The name of the remedy.'),
  remedyDescription: z.string().describe('A brief description of the remedy and its benefits.'),
  remedyCategory: z.string().describe('The category of the remedy (e.g., Home Remedies, Foods).'),
  existingPreparationNotes: z.string().optional().describe('Any existing brief preparation notes for the remedy.'),
});
export type RemedyInstructionInput = z.infer<typeof RemedyInstructionInputSchema>;

const RemedyInstructionOutputSchema = z.object({
  detailedInstructions: z.array(z.string()).describe('Step-by-step detailed instructions on how to prepare or use the remedy. Each step should be concise and actionable.'),
  usageTips: z.array(z.string()).optional().describe('Additional tips for using the remedy effectively or safely. Each tip should be concise.'),
});
export type RemedyInstructionOutput = z.infer<typeof RemedyInstructionOutputSchema>;

export async function getRemedyInstructions(input: RemedyInstructionInput): Promise<RemedyInstructionOutput> {
  return getRemedyInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getRemedyInstructionsPrompt',
  input: {schema: RemedyInstructionInputSchema},
  output: {schema: RemedyInstructionOutputSchema},
  prompt: `You are an AI assistant specializing in natural remedies for PCOS.
  Given the following details about a remedy, provide clear, step-by-step detailed instructions on how to prepare or use it.
  If applicable, also provide some usage tips (maximum 3 tips). Keep each instruction step and each tip concise and actionable.

  Remedy Name: {{{remedyName}}}
  Description: {{{remedyDescription}}}
  Category: {{{remedyCategory}}}
  {{#if existingPreparationNotes}}
  Existing Preparation Notes: {{{existingPreparationNotes}}}
  (Use these existing notes as a base or to inform your detailed instructions, but expand on them significantly to provide a full step-by-step guide.)
  {{/if}}

  Generate:
  1. 'detailedInstructions': An array of strings, where each string is a clear step. Be comprehensive but ensure each step is distinct and easy to follow.
  2. 'usageTips' (optional): An array of strings for any extra advice on usage or safety. Provide a maximum of 3 tips.

  Example for 'Methi (Fenugreek) Water' with existing notes 'Soak 1 tsp of fenugreek seeds in a glass of water overnight. Strain and drink...':
  Output for detailedInstructions could be:
  [
    "Measure 1 teaspoon of fenugreek (methi) seeds.",
    "Rinse the seeds thoroughly under cool running water using a fine sieve.",
    "Place the rinsed fenugreek seeds into a clean glass.",
    "Pour 1 cup (approximately 250ml) of fresh, filtered water over the seeds.",
    "Cover the glass and allow the seeds to soak overnight, or for at least 6-8 hours, at room temperature.",
    "The next morning, stir the water well.",
    "Strain the fenugreek-infused water into another clean glass, separating the seeds.",
    "Drink the fenugreek water on an empty stomach for optimal absorption.",
    "Optionally, the soaked seeds can be lightly chewed and consumed, or discarded."
  ]
  Output for usageTips could be:
  [
    "If new to fenugreek, start with a smaller quantity to assess digestive tolerance.",
    "For best results, consume this water consistently as part of your daily routine.",
    "Consult a healthcare professional if you are on medication, especially for diabetes, as fenugreek can affect blood sugar."
  ]

  Focus on clarity, actionable steps, and conciseness for each instruction and tip. The output must be parsable by JSON.`,
});

const getRemedyInstructionsFlow = ai.defineFlow(
  {
    name: 'getRemedyInstructionsFlow',
    inputSchema: RemedyInstructionInputSchema,
    outputSchema: RemedyInstructionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
