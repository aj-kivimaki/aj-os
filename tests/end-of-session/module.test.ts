/**
 * Public-surface test for the End-of-Session Workflow module.
 *
 * Asserts that the module's contracts are reachable through its public entry point
 * (`src/end-of-session/index.js`) and through the dedicated contracts barrel — the
 * narrow import path SPEC-004 uses (EOS-D1). Contract *behaviour* (valid/invalid/
 * immutable) is exercised in the per-contract suites; this test only pins the
 * public surface. Started as the EOS-001 scaffold test; EOS-002 repurposed it once
 * the module began exporting contracts.
 */
import { describe, expect, it } from "vitest";

import * as endOfSession from "../../src/end-of-session/index.js";
import * as contracts from "../../src/end-of-session/contracts/index.js";

describe("end-of-session public surface", () => {
  it("re-exports the session contracts from the module entry point", () => {
    expect(typeof endOfSession.parseSessionContext).toBe("function");
    expect(typeof endOfSession.parseSession).toBe("function");
    expect(endOfSession.TRIGGER_KINDS).toContain("manual");
  });

  it("re-exports the CandidateKnowledge boundary contract from the module entry point", () => {
    expect(typeof endOfSession.parseCandidateKnowledge).toBe("function");
    expect(endOfSession.CANDIDATE_KINDS).toContain("handbook-entry");
  });

  it("re-exports the workflow output contracts from the module entry point", () => {
    expect(typeof endOfSession.parseReviewPackage).toBe("function");
    expect(typeof endOfSession.parseSessionReport).toBe("function");
    expect(endOfSession.SESSION_RESULTS).toContain("completed");
  });

  it("re-exports the change contracts and the analyzer registry from the module entry point", () => {
    expect(typeof endOfSession.parseSessionChange).toBe("function");
    expect(typeof endOfSession.parseChangeSet).toBe("function");
    expect(typeof endOfSession.createAnalyzerRegistry).toBe("function");
    expect(endOfSession.CHANGE_KINDS).toContain("other");
    expect(endOfSession.CHANGE_TYPES).toContain("modified");
  });

  it("exposes the contracts through the contracts barrel — the SPEC-004 import surface", () => {
    expect(typeof contracts.parseSessionContext).toBe("function");
    expect(typeof contracts.parseSession).toBe("function");
    expect(typeof contracts.parseCandidateKnowledge).toBe("function");
    expect(typeof contracts.parseReviewPackage).toBe("function");
    expect(typeof contracts.parseSessionReport).toBe("function");
    expect(typeof contracts.parseChangeSet).toBe("function");
    expect(contracts.sessionContextSchema).toBeDefined();
    expect(contracts.sessionSchema).toBeDefined();
    expect(contracts.candidateKnowledgeSchema).toBeDefined();
    expect(contracts.reviewPackageSchema).toBeDefined();
    expect(contracts.sessionReportSchema).toBeDefined();
    expect(contracts.changeSetSchema).toBeDefined();
  });
});
