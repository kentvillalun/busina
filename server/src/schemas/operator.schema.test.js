// Run with: node --test src/schemas/operator.schema.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { createStaffSchema, updateBusSchema, updateStaffSchema } from "./operator.schema.js";

const bus = "2ff6666b-08f3-4125-ab98-b039561fa6c7";

test("a new staff member needs a first name, a last name and a role; the bus is optional", () => {
  const ok = createStaffSchema.parse({ firstName: "  Juan ", lastName: "Dela Cruz", role: "DRIVER" });
  assert.deepEqual(ok, { firstName: "Juan", lastName: "Dela Cruz", role: "DRIVER", busId: null });
  assert.equal(createStaffSchema.safeParse({ firstName: "Juan", lastName: "", role: "DRIVER" }).success, false);
  assert.equal(createStaffSchema.safeParse({ firstName: "Juan", lastName: "Cruz" }).success, false);
  assert.equal(createStaffSchema.safeParse({ firstName: "Juan", lastName: "Cruz", role: "DRIVER", busId: "not-a-uuid" }).success, false);
});

test("a roster entry can never be made an operator, and fields like companyId are dropped", () => {
  assert.equal(createStaffSchema.safeParse({ firstName: "A", lastName: "B", role: "OPERATOR" }).success, false);
  const parsed = createStaffSchema.parse({ firstName: "A", lastName: "B", role: "DRIVER", companyId: "other", active: false });
  assert.deepEqual(Object.keys(parsed).sort(), ["busId", "firstName", "lastName", "role"]);
});

test("an update changes only what it names, and must name something", () => {
  assert.deepEqual(updateStaffSchema.parse({ active: false }), { active: false });
  assert.deepEqual(updateStaffSchema.parse({ busId: null }), { busId: null });
  assert.deepEqual(updateStaffSchema.parse({ busId: bus, companyId: "other" }), { busId: bus });
  assert.equal(updateStaffSchema.safeParse({}).success, false);
  assert.equal(updateStaffSchema.safeParse({ role: "OPERATOR" }).success, false);
});

test("a bus update names what changes; the seat count is a whole number from 1 to 40", () => {
  assert.deepEqual(updateBusSchema.parse({ seatCount: 4, name: "  Demo bus " }), { seatCount: 4, name: "Demo bus" });
  assert.equal(updateBusSchema.safeParse({}).success, false);
  for (const seatCount of [0, 41, 2.5, "4"]) assert.equal(updateBusSchema.safeParse({ seatCount }).success, false, String(seatCount));
  assert.deepEqual(updateBusSchema.parse({ plateNumber: "ABC 123", deviceId: "hack", busNumber: "9999" }), { plateNumber: "ABC 123" });
});
