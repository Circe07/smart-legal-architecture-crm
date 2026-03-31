import { embed } from "ai";
import { google } from "./gemini";

// Helper for generating embeddings with Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.embedding("text-embedding-004") as any,
    value: text,
  });
  return embedding;
}

// Full RAG search logic
import { vectorStore } from "./vector-db";

export async function getContextFromKnowledgeBase(query: string, limit = 3) {
  const queryVector = await generateEmbedding(query);
  const results = await vectorStore.search(queryVector, limit);
  
  // Return context as a single formatted string
  return results
    .filter(r => r.score > 0.75) // Safety threshold to prevent hallucinations
    .map(r => r.content)
    .join("\n\n");
}
