
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll log an error to the console.
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const projectIdeaSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, catchy title for the project.",
    },
    description: {
      type: Type.STRING,
      description: "A one or two sentence description of the project.",
    },
  },
  required: ["title", "description"],
};


export const generateProjectIdea = async () => {
  if (!process.env.API_KEY) {
    // Return a mock response if API key is not available
    return { 
      title: "Mock AI Idea: Pwnagotchi Clone", 
      description: "Build a small, portable device that passively listens for Wi-Fi networks and learns from its environment. (This is a mock response as API key is not configured)."
    };
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a single, concise project idea for a creative tech school club focused on multimedia, cybersecurity, and programming. The idea should be innovative and something students can realistically work on.",
      config: {
        responseMimeType: "application/json",
        responseSchema: projectIdeaSchema,
        temperature: 1,
        topP: 0.95,
      },
    });

    const jsonText = response.text.trim();
    // It's good practice to validate the parsed object against the expected schema
    const idea = JSON.parse(jsonText);
    if (idea.title && idea.description) {
      return idea;
    } else {
      throw new Error("Invalid JSON structure from AI.");
    }
  } catch (error) {
    console.error("Error generating project idea with Gemini:", error);
    throw new Error("Failed to generate project idea. Please check the console for details.");
  }
};
