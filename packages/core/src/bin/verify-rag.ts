import "dotenv/config";
import { getContextFromKnowledgeBase } from "../lib/rag-logic";

async function verify() {
  const query = "¿Qué documentos necesito para una licencia de obra?";
  console.log(`🔍 Searching context for: "${query}"`);
  
  try {
    const context = await getContextFromKnowledgeBase(query);
    console.log("\n📄 Context found:");
    console.log(context || "❌ No relevant context found (threshold too high?)");
    
    if (context.includes("Plano de situación")) {
      console.log("\n✅ RAG Verification SUCCESSFUL!");
    } else {
      console.log("\n⚠️ RAG Verification inconclusive.");
    }
  } catch (error) {
    console.error("❌ RAG Verification FAILED:", error);
  }
}

verify();
