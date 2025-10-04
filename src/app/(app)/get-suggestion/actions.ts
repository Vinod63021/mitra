
'use server';

import { getSuggestion, type GetSuggestionInput, type GetSuggestionOutput } from '@/ai/flows/get-suggestion-flow';

export async function getSuggestionAction(
  data: GetSuggestionInput
): Promise<{ success: boolean; data?: GetSuggestionOutput; error?: string }> {
  try {
    const result = await getSuggestion(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting suggestion:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get suggestion' };
  }
}
