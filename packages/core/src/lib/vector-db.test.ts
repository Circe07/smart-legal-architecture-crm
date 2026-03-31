import test from 'node:test';
import assert from 'node:assert';
import { VectorStore } from "./vector-db.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("VectorStore Similarity Search (Debug Version)", async (t) => {
  const uniqueId = "debug-" + Date.now();
  const testDbPath = path.join(__dirname, `../../prisma/test-${uniqueId}.db.json`);
  
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  const store = new VectorStore(testDbPath);

  await t.test("Add and retrieve first item", async () => {
    const id = "unit-test-1";
    await store.add(id, "Archi-Legal FAQ", [1, 0, 0]);
    const results = await store.search([1, 0, 0]);

    console.log(`[Test Debug] Results Length: ${results.length}, Type: ${typeof results.length}`);
    console.log(`[Test Debug] First ID: ${results[0]?.id}, Type: ${typeof results[0]?.id}`);
    
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, id);
  });

  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
