// Run with: node --test src/lib/fleet.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { routeText, seatsText } from "./fleet.js";

test("the direction the API sends (SOUTHBOUND / NORTHBOUND) becomes the two ends of the route", () => {
  assert.equal(routeText("SOUTHBOUND"), "Laoag to Vigan");
  assert.equal(routeText("NORTHBOUND"), "Vigan to Laoag");
  assert.equal(routeText(null), "—");
});

test("seats are free of total, or Unknown when the bus is silent", () => {
  assert.equal(seatsText({ seatsFree: 9, seatCount: 40 }), "9 / 40");
  assert.equal(seatsText({ seatsFree: 0, seatCount: 40 }), "0 / 40");
  assert.equal(seatsText({ seatsFree: null, seatCount: 40 }), "Unknown");
});
