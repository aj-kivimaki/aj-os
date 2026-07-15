/**
 * End-of-Session Workflow module — public entry point.
 *
 * The End-of-Session Workflow is a **capture pipeline**: it transforms a finished
 * coding session into candidate knowledge for human review. Trigger → Session →
 * analyzers → knowledge extraction → canonical `CandidateKnowledge[]` → review
 * store → review-package projection → session report. It writes only to the
 * non-canonical review store; git commits and wiki generation are deferred
 * orchestration side effects, out of the v1 capture slice (ADR-002, AJS-005 §7).
 *
 * This module's single public entry point will be `run(context)` — the composed
 * workflow's `run(context: SessionContext): Promise<SessionReport>`, wired at the
 * composition root in Milestone M5. Internal stages stay private and are exposed
 * only through this barrel as they are implemented. Consumers import from this
 * entry point, never from internal files.
 *
 * This file is the module's public surface. It currently exports nothing: the
 * scaffold (EOS-001) establishes the module structure with no behavior. Contracts
 * (EOS-002..EOS-005) and services land in later M1+ tasks and are re-exported here
 * as they arrive — the barrel exports nothing that does not yet exist.
 */
export {};
