
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAiResponse = async (userPrompt: string, history: { role: string, parts: { text: string }[] }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: "You are Acertax Assistant, an AI expert integrated into the Acertax internal chat app. You help employees with productivity, summaries, and professional advice. Keep responses concise and professional.",
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to the corporate AI brain right now.";
  }
};

export const summarizeChat = async (messages: string[]) => {
  try {
    const prompt = `Summarize the following internal chat conversation in 3 bullet points:\n\n${messages.join('\n')}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Summary unavailable.";
  }
};
