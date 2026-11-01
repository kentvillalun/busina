// Run with: node --test src/utils/safeNext.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { safeNext } from "./safeNext.js";

test("a path on this site is kept, with its query", () => {
  assert.equal(safeNext("/bus/abc"), "/bus/abc");
  assert.equal(safeNext("/settings/alerts?x=1"), "/settings/alerts?x=1");
});

test("anything that could leave the site falls back to /home", () => {
  for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", "evil.com", "javascript:alert(1)", "/a\nb", "", undefined, null, 5, ["/x"]]) {
    assert.equal(safeNext(bad), "/home", String(bad));
  }
});

test("a very long path falls back to /home", () => {
  assert.equal(safeNext("/" + "a".repeat(300)), "/home");
});
