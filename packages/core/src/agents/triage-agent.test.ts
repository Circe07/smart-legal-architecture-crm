import test from 'node:test';
import assert from 'node:assert';
import { runTriageAgent } from "./triage-agent.js"; // This extension is correct for ESM but let's verify if triage-agent.ts exists

test("TriageAgent Structural Verification", (t) => {
  assert.strictEqual(typeof runTriageAgent, "function", "runTriageAgent should be exported as a function");
});
