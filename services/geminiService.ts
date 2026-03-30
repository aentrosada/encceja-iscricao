import { GoogleGenAI, Type } from "@google/genai";
import { RegistrationData } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeRegistration = async (base64Image: string, mimeType: string): Promise<RegistrationData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise este documento de inscrição do Encceja.
    
    Extraia as seguintes informações:
    1. O ANO ENCCEJA (Ex: 2024)
    2. NUMERO DE CPF (Ex: 000.000.000-00)
    3. NUMERO INSCRIÇÃO (Ex: 241130936206)
    4. SITUAÇÃO (Ex: Confirmada)
    5. Necessita de atendimento especializado para realização das provas (Sim/Não)
    6. Nível de ensino escolhido para o qual quero a certificação (Ex: Ensino Médio)
    7. Provas que farei no Encceja (Lista de provas, ex: ["Ciências da Natureza e suas Tecnologias", "Ciências Humanas e suas Tecnologias", "Linguagens e Códigos e suas Tecnologias e Redação", "Matemática e suas Tecnologias"])
    8. UF e cidade onde farei as provas (Ex: "São Paulo, Araraquara")
    9. UF da instituição certificadora (Ex: "São Paulo")
    10. Instituição certificadora (Ex: "SECRETARIA DE ESTADO DA EDUCAÇÃO SÃO PAULO")
    
    Retorne NULL se a informação não estiver visível ou legível.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING, description: "Ano do Encceja" },
            cpf: { type: Type.STRING, description: "Número do CPF" },
            registrationNumber: { type: Type.STRING, description: "Número de inscrição" },
            status: { type: Type.STRING, description: "Situação da inscrição" },
            specializedAssistance: { type: Type.STRING, description: "Necessita de atendimento especializado" },
            certificationLevel: { type: Type.STRING, description: "Nível de ensino" },
            exams: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Provas que fará no Encceja" 
            },
            location: { type: Type.STRING, description: "UF e cidade onde fará as provas" },
            certifyingInstitutionState: { type: Type.STRING, description: "UF da instituição certificadora" },
            institution: { type: Type.STRING, description: "Instituição certificadora" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text);

  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};
