export interface Diagnosis {
  name: string;
  description: string;
  causes: string[];
  symptoms: string[];
  medications: string[];
}

export interface SymptomAnalysis {
  name: string; // The identified sound, e.g., "Tos"
  description: string; // A description of the symptom
  causes: string[]; // What provokes it
  symptoms: string[]; // Other associated symptoms
  prevention: string[]; // What can be taken to prevent/treat it
}

export interface UnifiedAnalysisResponse {
  symptomAnalysis?: SymptomAnalysis;
  conversationalResponse?: string;
}
