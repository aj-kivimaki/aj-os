/**
 * TriggerSource seam tests (EOS-006).
 *
 * Covers the manual trigger — that it advertises `trigger: "manual"`, produces a
 * valid immutable `SessionContext` from explicit inputs, rejects invalid inputs, and
 * is a small frozen handle — plus a structural-conformance check that an alternate
 * `TriggerSource` implementation satisfies the same port, so future triggers are
 * *added behind the seam* rather than woven into orchestration. Asserted through the
 * module's public surface.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  createManualTriggerSource,
  type SessionContext,
  type TriggerSource,
} from "../../src/end-of-session/index.js";

const validInput = {
  project: "aj-os",
  repository: "systems/aj-os",
  branch: "feat/spec-003-m1-foundation",
  taskId: "EOS-006",
} as const;

describe("ManualTriggerSource", () => {
  it("advertises the manual trigger kind", () => {
    expect(createManualTriggerSource(validInput).trigger).toBe("manual");
  });

  it("produces a valid, immutable SessionContext from explicit inputs", async () => {
    const source = createManualTriggerSource(validInput);
    const context = await source.createContext();
    expect(context).toEqual(validInput);
    expect(Object.isFrozen(context)).toBe(true);
  });

  it("validates inputs at production — invalid inputs are rejected", async () => {
    const source = createManualTriggerSource({ project: "aj-os" });
    await expect(source.createContext()).rejects.toBeInstanceOf(ZodError);
  });

  it("returns a frozen handle", () => {
    const source = createManualTriggerSource(validInput);
    expect(Object.isFrozen(source)).toBe(true);
  });

  it("is a stable seam — an alternate TriggerSource satisfies the same port", async () => {
    // A hand-rolled source conforming to the port, proving a new trigger is added
    // behind the seam without changing anything that consumes a TriggerSource.
    const prebuilt: SessionContext = { project: "aj-os", repository: "r", branch: "b" };
    const alternate: TriggerSource = {
      trigger: "manual",
      createContext: () => Promise.resolve(prebuilt),
    };

    // A consumer that depends only on the port works for both implementations.
    const runTrigger = (source: TriggerSource) => source.createContext();
    expect(await runTrigger(createManualTriggerSource(validInput))).toEqual(
      validInput,
    );
    expect(await runTrigger(alternate)).toBe(prebuilt);
  });
});
