/**
 * Architecture taxonomy coverage (REX-305, F-023; REX-D1).
 *
 * CONTRIBUTING's module map must name **every** top-level `src/` module, with
 * its expected lifetime. Before M3-B, the architecture rule described 3 of 11
 * modules; this test keeps the map complete — add a module without documenting
 * it and CI turns red. This is the M1 assertion-inventory lesson (a documented
 * claim should be mechanically checkable) applied to the taxonomy.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, it, expect } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..");

describe("architecture taxonomy — CONTRIBUTING covers every src/ module", () => {
  it("names every top-level src/ module in the module map", () => {
    const modules = readdirSync(join(ROOT, "src"))
      .filter((entry) => statSync(join(ROOT, "src", entry)).isDirectory())
      .sort();

    const contributing = readFileSync(join(ROOT, "CONTRIBUTING.md"), "utf8");
    const undocumented = modules.filter(
      (mod) => !contributing.includes(`\`src/${mod}/\``),
    );

    expect(undocumented).toEqual([]);
  });
});
