import { GoogleGenAI, Type } from "@google/genai";

export interface GeminiMealSuggestion {
  title: string;
  description: string;
  suggested_ingredients: {
    name: string;
    approx_cost: number;
    is_in_pantry: boolean;
  }[];
  steps: string[];
  estimated_total_cost: number;
  prep_time_mins: number;
  nutritional_info: string;
}

export async function getMealSuggestions(
  budget: number, 
  items: string[], 
  preferences: string[],
  currency: string = 'KES'
): Promise<GeminiMealSuggestion[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Budget: ${budget} ${currency}. 
                   Available pantry items: ${items.join(", ") || "None"}. 
                   Dietary preferences: ${preferences.join(", ") || "None"}.`
          }]
        }
      ],
      config: {
        systemInstruction: `You are Jisort Dishi AI, a meal suggestion expert for budget-conscious users (primarily students and bachelors in Kenya).
        Suggest 3 affordable meals that fit the budget.
        Optimize for:
        1. Using available pantry items to minimize cost.
        2. Nutritious but cheap ingredients (e.g., Sukuma Wiki, Ugali, Beans, Eggs, Omena, Rice).
        3. Simple one-pot or quick meals.
        
        Provide the output as a JSON array of objects.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              suggested_ingredients: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    approx_cost: { type: Type.NUMBER },
                    is_in_pantry: { type: Type.BOOLEAN }
                  },
                  required: ["name", "approx_cost", "is_in_pantry"]
                }
              },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimated_total_cost: { type: Type.NUMBER },
              prep_time_mins: { type: Type.NUMBER },
              nutritional_info: { type: Type.STRING }
            },
            required: ["title", "description", "suggested_ingredients", "steps", "estimated_total_cost", "prep_time_mins", "nutritional_info"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
