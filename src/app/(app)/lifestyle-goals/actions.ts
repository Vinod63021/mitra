
'use server';

import { lifestyleSimulator, type LifestyleSimulatorInput, type LifestyleSimulatorOutput } from '@/ai/flows/lifestyle-simulator';
import { generateTimePlan, type TimeManagementInput, type TimeManagementOutput } from '@/ai/flows/time-management-flow';


export async function simulateLifestyleChangesAction(
  data: LifestyleSimulatorInput
): Promise<{ success: boolean; data?: LifestyleSimulatorOutput; error?: string }> {
  try {
    const result = await lifestyleSimulator(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error simulating lifestyle changes:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to simulate lifestyle changes' };
  }
}


export async function generateTimePlanAction(
  data: TimeManagementInput
): Promise<{ success: boolean; data?: TimeManagementOutput; error?: string }> {
  try {
    const result = await generateTimePlan(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating time plan:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate time plan' };
  }
}
