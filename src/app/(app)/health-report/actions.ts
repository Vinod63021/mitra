
'use server';

import { generateHealthReport, type HealthReportInput, type HealthReportOutput } from '@/ai/flows/health-report-flow';

/**
 * This is the main server action that the frontend calls.
 * It takes the prepared input and passes it to the Genkit flow.
 */
export async function generateHealthReportAction(
  data: HealthReportInput
): Promise<{ success: boolean; data?: HealthReportOutput; error?: string }> {
  try {
    const result = await generateHealthReport(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating health report:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate health report' };
  }
}
