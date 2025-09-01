import { GoogleGenAI, Type } from "@google/genai";
import { Diagnosis, SymptomAnalysis, UnifiedAnalysisResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "El nombre oficial de la enfermedad.",
    },
    description: {
      type: Type.STRING,
      description: "Un resumen conciso de una párrafo sobre qué es la enfermedad.",
    },
    causes: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Una lista de causas comunes o factores de riesgo para la enfermedad.",
    },
    symptoms: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Una lista de los síntomas primarios asociados con la enfermedad.",
    },
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Una lista de medicamentos o tratamientos comúnmente recetados. IMPORTANTE: Esta información es solo para fines informativos y no constituye consejo médico.",
    },
  },
  required: ["name", "description", "causes", "symptoms", "medications"],
};

const symptomAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "El nombre del síntoma identificado (ej. 'Tos', 'Estornudo')." },
    description: { type: Type.STRING, description: "Descripción concisa del síntoma." },
    causes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Causas comunes o enfermedades que provocan el síntoma." },
    symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Otros síntomas comúnmente asociados." },
    prevention: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Medidas de prevención o tratamiento. Incluir descargo de responsabilidad." },
  },
  required: ["name", "description", "causes", "symptoms", "prevention"],
};

const unifiedResponseSchema = {
    type: Type.OBJECT,
    properties: {
        symptomAnalysis: { ...symptomAnalysisSchema, nullable: true, description: "Completa este objeto si se detecta un sonido de síntoma." },
        conversationalResponse: { type: Type.STRING, nullable: true, description: "Completa esta cadena si se detecta una conversación de voz." },
    },
    description: "Si el audio contiene un síntoma (tos, estornudo), rellena 'symptomAnalysis'. Si contiene voz, rellena 'conversationalResponse'. Solo uno de los dos debe ser rellenado."
}


export const getDiseaseInfo = async (diseaseName: string): Promise<Diagnosis> => {
  try {
    const prompt = `Proporciona una explicación detallada para la enfermedad: "${diseaseName}", incluyendo medicamentos comunes para tratarla. Responde completamente en español. Estructura la salida de acuerdo con el esquema JSON proporcionado. Si la entrada no es una enfermedad reconocible, indica que no se encontró información. Deja claro que las sugerencias de medicamentos no son consejos médicos y que se debe consultar a un profesional de la salud.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData: Diagnosis = JSON.parse(jsonText);
    
    if (!parsedData.name || !parsedData.description || !parsedData.symptoms || !parsedData.causes || !parsedData.medications) {
      throw new Error("Se recibieron datos malformados de la API.");
    }
    
    return parsedData;
  } catch (error) {
    console.error("Error al obtener información de la enfermedad desde la API de Gemini:", error);
    throw new Error(`No se pudo obtener información para "${diseaseName}". El modelo de IA puede no reconocerlo como una enfermedad o hubo un problema de red.`);
  }
};

export const analyzeAudio = async (audioBase64: string, mimeType: string): Promise<UnifiedAnalysisResponse> => {
  const audioPart = {
    inlineData: { data: audioBase64, mimeType },
  };
  const textPart = {
    text: `Analiza este audio y responde en español.
- Si detectas un sonido de síntoma claro (tos, estornudo, congestión), rellena el objeto 'symptomAnalysis'.
- Si detectas una conversación de voz, actúa como 'Gema', una asistente de salud de IA amable, y responde a la pregunta en 'conversationalResponse'. Sé breve y clara.
- Si no está claro, responde en 'conversationalResponse' pidiendo al usuario que lo intente de nuevo.
Solo uno de los dos campos debe ser rellenado.`
  };
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [audioPart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: unifiedResponseSchema,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const parsedJson: UnifiedAnalysisResponse = JSON.parse(response.text.trim());
    if (parsedJson.symptomAnalysis || parsedJson.conversationalResponse) {
        return parsedJson;
    }
    throw new Error("La respuesta de la API no contenía ni análisis de síntoma ni respuesta conversacional.");

  } catch (error) {
    console.error("Error al analizar el audio con la API de Gemini:", error);
    throw new Error("No se pudo analizar el audio. Por favor, inténtalo de nuevo.");
  }
};
