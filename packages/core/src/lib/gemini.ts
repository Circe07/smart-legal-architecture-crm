import { createGoogleGenerativeAI } from "@ai-sdk/google";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not defined");
}

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Defining the models (Gemini 3 Flash for speed/cost, Pro for depth)
export const triageModel = google("gemini-1.5-flash"); // Flash for initial analysis
export const analysisModel = google("gemini-1.5-pro");   // Pro for document heavy lifting
