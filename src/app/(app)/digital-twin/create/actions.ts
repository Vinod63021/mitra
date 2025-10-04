'use server';

import { generateDigitalTwin, type DigitalTwinInput, type DigitalTwinOutput } from '@/ai/flows/digital-twin-generation';

export async function createDigitalTwinAction(
  data: DigitalTwinInput
): Promise<{ success: boolean; data?: DigitalTwinOutput; error?: string }> {
  try {
    const result = await generateDigitalTwin(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating digital twin:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate digital twin' };
  }
}
