'use server';

import {
  symptomTrackerForecast,
  type SymptomTrackerInput,
  type SymptomTrackerOutput,
} from '@/ai/flows/symptom-tracker-forecast';

export async function getSymptomForecastAction(
  data: SymptomTrackerInput
): Promise<{ success: boolean; data?: SymptomTrackerOutput; error?: string }> {
  try {
    // The AI flow now expects an object with a 'logs' property which is an array.
    const result = await symptomTrackerForecast(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting symptom forecast:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to get symptom forecast',
    };
  }
}
