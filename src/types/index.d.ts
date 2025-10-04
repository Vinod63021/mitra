
// This file can be used for global TypeScript type declarations.

// Example: Augmenting the Window interface for a global flag
// declare global {
//   interface Window {
//     hasLeafletIconFixApplied?: boolean;
//   }
// }


// Ensure this file is treated as a module.
export {};

// If you have types that are used across multiple files but aren't tied to a specific component or schema,
// you can declare them here. For instance:

// export interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   // ... other profile fields
// }

// export type AppFeature = 'DigitalTwin' | 'SymptomTracker' | 'PeriodTracker' | 'RemedyHub';

// It's often better to keep types co-located with the code that uses them (e.g., in schemas/ or directly in component files),
// but this file is an option for truly global, miscellaneous types.

// For react-day-picker specifically, ensure you have @types/react-day-picker if needed,
// but usually, the library exports its own types sufficiently.

// For Leaflet, you'd typically install @types/leaflet.

// Global type for PeriodCycleData if used in multiple non-AI flow files (though it's also exported from the flow itself)
// It's generally good practice to import types from their source of truth.
// However, if you had a very generic version for UI state unrelated to the AI flow's specific descriptions, it could go here.
// For example:
// export interface UIPeriodCycle {
//   startDate: string; // YYYY-MM-DD
//   cycleLength: number; // in days
// }

// It's important that this file is included in your tsconfig.json's "include" array or is automatically picked up.
// By default, Next.js and TypeScript setups usually include `**/*.ts` and `**/*.tsx`, which would cover this.
