import { GoogleGenerativeAI } from "@google/generative-ai";

// In Vite, use import.meta.env instead of process.env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export const getAiResponse = async (userPrompt: string, history: any[]) => {
  try {
    // Correct model name and initialization for the web SDK
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // gemini-3-flash-preview isn't a public ID; using current flash
      systemInstruction: "You are Acertax Assistant, an AI expert integrated into the Acertax internal chat app. You help employees with productivity, summaries, and professional advice. Keep responses concise and professional.",
    });

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to the corporate AI brain right now.";
  }
};

export const summarizeChat = async (messages: string[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Summarize the following internal chat conversation in 3 bullet points:\n\n${messages.join('\n')}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Summary Error:", error);
    return "Summary unavailable.";
  }
};