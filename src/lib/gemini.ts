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

export interface MealSuggestionContext {
  budget: number;
  items: string[];
  preferences: string[];
  currency: string;
  category: string;
  meal_type: string;
  people: number;
  extra_notes: string;
}

export async function getMealSuggestions(ctx: MealSuggestionContext): Promise<GeminiMealSuggestion[]> {
  const { budget, items, preferences, currency, category, meal_type, people, extra_notes } = ctx;
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Budget: ${budget} ${currency}.
                   Category: ${category}.
                   Meal type: ${meal_type}.
                   Number of people: ${people}.
                   Available pantry/fridge items: ${items.join(", ") || "None"}.
                   Dietary preferences: ${preferences.join(", ") || "None"}.
                   Additional notes: ${extra_notes || "None"}.`
          }]
        }
      ],
      config: {
        systemInstruction: `You are Jisort Dishi AI, a meal and drink suggestion expert for budget-conscious users in Kenya.
        RULES:
        1. Suggest AS MANY different ${category}s as possible — aim for 6–10 options.
        2. EVERY suggestion's estimated_total_cost MUST be less than or equal to ${budget} ${currency} for ${people} person(s).
        3. Prioritise using available pantry/fridge items to reduce cost.
        4. Focus on the meal type: ${meal_type}.
        5. Use locally available, affordable Kenyan ingredients.
        6. If category is 'drink', suggest juices, teas, smoothies, or local drinks.
        7. If category is 'snack', suggest quick bites like mandazi, samosa, boiled eggs.
        8. If category is 'dessert', suggest affordable sweet options.
        9. Simple preparation steps suitable for home cooking.
        10. Scale ingredient quantities and costs for ${people} person(s).
        
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

    const results: GeminiMealSuggestion[] = JSON.parse(response.text.trim());
    // Enforce budget constraint — filter out anything exceeding the budget
    return results.filter(r => r.estimated_total_cost <= budget);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
