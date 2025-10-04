
'use server';

import { getMitraChatbotResponse, type MitraChatbotInput, type MitraChatbotOutput } from '@/ai/flows/mitra-chatbot-flow';

export async function sendMessageToMitraAction(
  userInput: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const input: MitraChatbotInput = { userInput };
    const result: MitraChatbotOutput = await getMitraChatbotResponse(input);
    return { success: true, response: result.botResponse };
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get response from Mitra' };
  }
}
