import test from 'node:test';
import assert from 'node:assert';
import { VectorStore } from "./vector-db.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, "../../prisma/test-unit-vector.db.json");

test("VectorStore Similarity Engine", async (t) => {
  // Ensure we start from a clean slate
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  const store = new VectorStore(testDbPath);

  await t.test("Basic Add and Search", async () => {
    const id = "unit-test-id";
    await store.add(id, "content", [1, 0, 0]);
    const results = await store.search([1, 0, 0]);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, id);
  });

  await t.test("Ranking Reliability", async () => {
    // Add more items (store persists between subtests as it's the same instance)
    await store.add("exact", "exact", [1, 0, 0]);
    await store.add("opposed", "opposed", [-1, 0, 0]);
    await store.add("mid", "mid", [0.5, 0.5, 0]);

    const results = await store.search([1, 0, 0], 4);
    
    assert.strictEqual(results[0].id, "exact");
    assert.strictEqual(results[results.length - 1].id, "opposed");
  });

  // Cleanup after all tests in this block
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
