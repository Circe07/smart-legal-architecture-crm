import { VectorStore } from "./vector-db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testPath = path.join(__dirname, "../../prisma/debug-vector.db.json");

async function debug() {
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  const store = new VectorStore(testPath);
  
  await store.add("1", "hola", [1, 0, 0]);
  const res = await store.search([1, 0, 0]);
  
  console.log("DEBUG_START");
  console.log(JSON.stringify(res));
  console.log("DEBUG_END");
}

debug();
