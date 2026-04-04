import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// System Instruction for the NHMS Assistant
const SYSTEM_INSTRUCTION = `
You are NHMS Assistant, an intelligent AI travel assistant for Indian highways.

Your goal is to help travelers with accurate, practical, and real-time-like guidance for highway journeys.

You can assist with:
- Route planning (fastest, shortest, alternative routes)
- Toll estimation and FASTag info
- Traffic insights (approximate if real-time unavailable)
- Fuel stations, EV charging, rest stops
- Hotels, restaurants, and facilities along routes
- Emergency services and helplines
- Weather conditions affecting travel
- Road safety rules and driving tips
- General travel-related questions

Behavior Rules:
- Understand user intent naturally (not keyword-based)
- If needed, use tools/APIs to fetch data
- If data is unavailable, provide best possible guidance
- Maintain conversation context
- Be concise but informative
- Prioritize safety and clarity

Tone:
Helpful, professional, and friendly.

Never say "I can only help with..." — always try to assist.
`;

let model: any = null;

/**
 * Initializes the Gemini model if allowed by API key existence.
 */
function initModel() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn("⚠️ No valid GEMINI_API_KEY found in process.env. AI features will fallback to legacy mode.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const initializedModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });
    console.log("✅ Gemini AI Service Initialized successfully with key:", GEMINI_API_KEY.substring(0, 8) + '...');
    return initializedModel;
  } catch (error) {
    console.error("❌ Failed to initialize Gemini AI Service:", error);
    return null;
  }
}

/**
 * Generates a response from Gemini Pro based on user message and history
 */
export const getAIChatResponse = async (message: string, history: any[] = []) => {
  if (!model) {
    model = initModel();
  }

  if (!model) {
    return null;
  }

  try {
    console.log(`[AI Request] Sending message to Gemini: "${message.substring(0, 50)}..."`);
    
    // Convert history to Gemini format.
    // Frontend sends objects like { role: 'user' | 'assistant', content: '...' }
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    console.log(`[AI Response] Received response (${text.length} chars)`);
    return text;
  } catch (error: any) {
    console.error("❌ Error generating AI response:", error.message || error);
    return null;
  }
};
