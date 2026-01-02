import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateReminder = async (
  subject: string,
  mode: 'enter' | 'exit'
): Promise<string> => {
  try {
    const prompt = mode === 'enter'
      ? `You are a helpful assistant for a ${subject} teacher. They just entered the classroom. Write a very short, witty, one-sentence reminder (max 15 words) telling them to silence their phone immediately so they don't disrupt the class.`
      : `You are a helpful assistant for a ${subject} teacher. They just left the classroom. Write a very short, cheerful one-sentence message (max 15 words) telling them it's safe to turn their ringer back on.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || (mode === 'enter' ? "Silence your phone!" : "Ringer on!");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return mode === 'enter' 
      ? "Class started! Silence your phone." 
      : "Class dismissed! Ringer back on.";
  }
};