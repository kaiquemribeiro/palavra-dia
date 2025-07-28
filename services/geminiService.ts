
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getWordHint = async (word: string): Promise<string> => {
  if (!API_KEY) {
    return "A funcionalidade de dica está desativada. Nenhuma chave de API foi encontrada.";
  }

  try {
    const prompt = `Forneça uma dica curta e inteligente para a palavra em português de 5 letras: '${word}'. A dica não deve conter nenhuma das letras da palavra. Seja criativo e responda apenas com a dica.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.8,
            topP: 0.9,
            // Disable thinking for faster, more direct hint generation
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const hint = response.text.trim();
    // A fallback in case Gemini provides an empty response
    return hint || "Não foi possível gerar uma dica. Tente novamente.";
  } catch (error) {
    console.error("Error fetching hint from Gemini API:", error);
    return "Ocorreu um erro ao buscar a dica. Verifique o console para mais detalhes.";
  }
};
