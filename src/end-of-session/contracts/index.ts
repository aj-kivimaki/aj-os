/**
 * End-of-Session Workflow — contracts barrel.
 *
 * The immutable contracts the workflow exchanges between stages, and the
 * published boundary contract that crosses the SPEC-003 → SPEC-004 boundary
 * (`CandidateKnowledge`, owned here per EOS-D1). Keeping the contracts behind
 * their own barrel lets a consumer (e.g. SPEC-004 Knowledge Review) import a
 * contract without pulling in the module's services or analyzers.
 *
 * It currently exports nothing: EOS-001 establishes the barrel; the contracts
 * are defined and exported by EOS-002..EOS-005 and re-exported from the module
 * entry point (`../index.ts`) as they arrive.
 */
export {};
