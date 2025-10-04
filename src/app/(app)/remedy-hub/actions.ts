
'use server';

import { getRemedyInstructions, type RemedyInstructionInput, type RemedyInstructionOutput } from '@/ai/flows/get-remedy-instructions-flow';

export async function getRemedyInstructionsAction(
  data: RemedyInstructionInput
): Promise<{ success: boolean; data?: RemedyInstructionOutput; error?: string }> {
  try {
    const result = await getRemedyInstructions(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting remedy instructions:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get remedy instructions' };
  }
}
