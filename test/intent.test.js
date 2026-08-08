import test from "node:test";
import assert from "node:assert/strict";
import { resolveIntent } from "../src/intent.js";

test("routes urgent language to emergency flow", () => {
  assert.equal(resolveIntent("I fell and hurt my hip").type, "emergency");
});

test("recognizes medication completion", () => {
  assert.equal(resolveIntent("I took my morning pills").type, "medication-complete");
});

test("recognizes requests for the schedule", () => {
  assert.equal(resolveIntent("When is my next doctor appointment?").type, "schedule");
});

test("does not pretend to understand unsupported requests", () => {
  assert.equal(resolveIntent("Tell me something surprising").type, "unknown");
});
