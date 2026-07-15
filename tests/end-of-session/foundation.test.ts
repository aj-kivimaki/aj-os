/**
 * End-of-Session module foundation tests (EOS-007).
 *
 * These are not per-contract field tests (each contract's suite owns those) — they
 * pin *module-wide, architectural* guarantees that no single contract suite can:
 *
 *  1. the public operations surface is exactly the intended, minimal set;
 *  2. the module entry point re-exports every contract the contracts barrel exposes
 *     (so SPEC-004 can import from either and never miss one);
 *  3. every test reaches the module only through its public barrels — never an
 *     internal file (AJS-007 Public-Surface Validation, permanently enforced).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, it, expect } from "vitest";

import * as endOfSession from "../../src/end-of-session/index.js";
import * as contracts from "../../src/end-of-session/contracts/index.js";

/** The intended public *operations* — every `parse*`/`create*` the module exposes. */
const EXPECTED_OPERATIONS = [
  "collectChanges",
  "createAnalyzerRegistry",
  "createManualTriggerSource",
  "createNoopNotificationPort",
  "parseAnalyzerError",
  "parseCandidateKnowledge",
  "parseChangeSet",
  "parseReviewPackage",
  "parseSession",
  "parseSessionChange",
  "parseSessionContext",
  "parseSessionReport",
].sort();

describe("module foundation — public surface", () => {
  it("exposes exactly the intended public operations", () => {
    const operations = Object.keys(endOfSession)
      .filter(
        (key) =>
          typeof (endOfSession as Record<string, unknown>)[key] === "function",
      )
      .sort();
    // A drift guard: adding or removing a public operation must be a deliberate edit
    // to this manifest — keeping the public API minimal and intentional.
    expect(operations).toEqual(EXPECTED_OPERATIONS);
  });

  it("re-exports every contract from the module entry point", () => {
    // Everything the narrow contracts barrel exposes must also be reachable from the
    // module entry point, so a consumer never has to guess which barrel to import.
    const notReExported = Object.keys(contracts).filter(
      (key) => !(key in endOfSession),
    );
    expect(notReExported).toEqual([]);
  });
});

describe("module foundation — public-surface-only imports", () => {
  const testDir = import.meta.dirname;
  const allowedSpecifiers = new Set([
    "../../src/end-of-session/index.js",
    "../../src/end-of-session/contracts/index.js",
  ]);

  const sourceFiles = readdirSync(testDir).filter(
    (name) => name.endsWith(".test.ts") || name === "support.ts",
  );

  it("verifies every suite imports the module only through its public barrels", () => {
    const violations: string[] = [];

    for (const file of sourceFiles) {
      const source = readFileSync(join(testDir, file), "utf8");
      for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
        const specifier = match[1];
        if (
          specifier !== undefined &&
          specifier.includes("end-of-session") &&
          !allowedSpecifiers.has(specifier)
        ) {
          violations.push(`${file} → ${specifier}`);
        }
      }
    }

    // Any internal (non-barrel) import of the module is an architectural violation.
    expect(violations).toEqual([]);
  });
});
