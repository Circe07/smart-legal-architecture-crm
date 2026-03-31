import fs from "fs";
import path from "path";

// Pure JavaScript Vector Database for FAQ RAG (Zero-Native-Dependencies)
// Persistent JSON store for robust local deployment
const DEFAULT_DB_FILE = path.join(process.cwd(), "../../packages/core/prisma/vector.db.json");

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

export class VectorStore {
  private data: any[] = [];
  private dbPath: string;

  constructor(dbPath: string = DEFAULT_DB_FILE) {
    this.dbPath = dbPath;
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, "utf-8");
        this.data = JSON.parse(raw);
        console.log(`[VectorStore] Loaded ${this.data.length} embeddings from ${this.dbPath}`);
      }
    } catch (e) {
      console.error("[VectorStore] Failed to load:", e);
      this.data = [];
    }
  }

  private save() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error("[VectorStore] Failed to save:", e);
    }
  }

  async add(id: string, content: string, vector: number[], metadata: any = {}) {
    // Upsert logic
    const index = this.data.findIndex(row => row.id === id);
    const newRow = { id, content, vector, metadata };
    
    if (index !== -1) {
      this.data[index] = newRow;
    } else {
      this.data.push(newRow);
    }
    
    this.save();
  }

  async search(queryVector: number[], limit: number = 3) {
    const results = this.data.map(row => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      score: cosineSimilarity(queryVector, row.vector)
    }));

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

export const vectorStore = new VectorStore();
