
'use server';

import { analyzePeriodCycles, type PeriodAnalysisInput, type PeriodAnalysisOutput } from '@/ai/flows/period-analysis-flow';

export async function analyzePeriodDataAction(
  data: PeriodAnalysisInput
): Promise<{ success: boolean; data?: PeriodAnalysisOutput; error?: string }> {
  try {
    // Add any specific server-side validation or processing if needed
    if (!data.periodCycleData || data.periodCycleData.length === 0) {
      return { success: false, error: 'No period cycle data provided.' };
    }
    const result = await analyzePeriodCycles(data);
    return { success: true, data: result };
  } catch (error)
 {
    console.error('Error analyzing period data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to analyze period data' };
  }
}
