import fs from "fs";

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

function generateMockVector(text) {
  const vec = new Float32Array(768);
  for (let i = 0; i < 768; i++) {
    vec[i] = (text.charCodeAt(i % text.length) / 255) - 0.5;
  }
  return Array.from(vec);
}

const dbPath = "packages/core/prisma/vector.db.json";

function search(query) {
  console.log(`🔎 Searching for: "${query}"...`);
  const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  const queryVec = generateMockVector(query);

  const results = data.map(item => ({
    id: item.id,
    similarity: cosineSimilarity(queryVec, item.vector)
  })).sort((a, b) => b.similarity - a.similarity).slice(0, 3);

  console.log("TOP RESULTS:");
  results.forEach(r => console.log(`- ${r.id}: ${r.similarity.toFixed(4)}`));
}

search("¿indemnización despido 2026?");
search("vacaciones permiso nacimiento");
