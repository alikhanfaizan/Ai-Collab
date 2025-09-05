import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });

export async function generateText(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",  // you can switch to "gemini-1.5-pro" etc.
      contents: prompt,
    });

    return response.text; // This is the generated text
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
