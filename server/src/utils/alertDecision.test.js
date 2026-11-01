// Run with: node --test src/utils/alertDecision.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { decideAlert } from "./alertDecision.js";

const near = { passed: false, minMin: 4, maxMin: 6 }; // 5 minutes away
const far = { passed: false, minMin: 18, maxMin: 22 }; // 20 minutes away
const gone = { passed: true, spotM: 1000 };
const base = { notified: [], busId: "b1", eta: near, alertMinutes: 10, isTarget: false, signalReturned: false };

test("a bus within the alert time alerts once", () => {
  const first = decideAlert(base);
  assert.equal(first.send, "near");
  assert.equal(first.minutes, 5);
  assert.deepEqual(first.notified, ["b1"]);

  const again = decideAlert({ ...base, notified: first.notified }); // the next ping, still near
  assert.equal(again.send, null);
  assert.deepEqual(again.notified, ["b1"]);
});

test("a bus farther than the alert time does not alert, and is forgotten", () => {
  const result = decideAlert({ ...base, eta: far, notified: ["b1"] });
  assert.equal(result.send, null);
  assert.deepEqual(result.notified, []); // it can alert again on the next approach
});

test("no honest ETA never alerts and resets the bus", () => {
  const result = decideAlert({ ...base, eta: null, notified: ["b1"] });
  assert.equal(result.send, null);
  assert.deepEqual(result.notified, []);
});

test("a bus that came back from a signal loss can alert again", () => {
  const result = decideAlert({ ...base, notified: ["b1"], signalReturned: true });
  assert.equal(result.send, "near");
});

test("the chosen bus passing the spot sends the passed alert once and ends the choice", () => {
  const first = decideAlert({ ...base, eta: gone, isTarget: true, notified: ["b1"] });
  assert.equal(first.send, "passed");
  assert.equal(first.clearTarget, true);
  assert.deepEqual(first.notified, ["passed:b1"]);

  const again = decideAlert({ ...base, eta: gone, isTarget: true, notified: first.notified });
  assert.equal(again.send, null);
  assert.equal(again.clearTarget, false);
});

test("a bus that is not the chosen one never sends the passed alert", () => {
  const result = decideAlert({ ...base, eta: gone, isTarget: false });
  assert.equal(result.send, null);
  assert.equal(result.clearTarget, false);
});

test("the passed alert can be sent again on the next trip", () => {
  const result = decideAlert({ ...base, eta: far, isTarget: true, notified: ["passed:b1"] });
  assert.equal(result.send, null);
  assert.deepEqual(result.notified, []);
});

test("other buses in the list are left alone", () => {
  const result = decideAlert({ ...base, notified: ["b2", "passed:b3"] });
  assert.deepEqual(result.notified.sort(), ["b1", "b2", "passed:b3"]);
});
