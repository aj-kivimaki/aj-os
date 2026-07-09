# AJS-007 — Engineering Lifecycle Standard

**Status:** Draft v1.0

---

## 1. Purpose

Define why AJ-OS treats the delivery of a specification as a disciplined, repeatable engineering practice with a single canonical home.

Through the first three frozen milestones of SPEC-002, a consistent engineering delivery practice emerged and proved repeatable across planning, implementation, review, and milestone closure. The same discipline held across all three milestones and produced small, deterministic, freeze-ready increments each time.

That practice was proven, but it had no canonical home. It lived scattered across implementation working documents and was re-derived from milestone to milestone through retrospective lessons. Knowledge that is repeated but never centralized drifts, and AJ-OS already requires every reusable body of knowledge to have one canonical source. The engineering process was the one part of AJ-OS that did not yet meet that requirement.

This standard closes that gap. It does not invent a methodology. It consolidates engineering practice already demonstrated through implementation experience into a single authoritative reference, so that future specifications inherit the method instead of rediscovering it.

As a Draft standard, it records engineering practice validated through SPEC-002. Any process not yet demonstrated through implementation experience is explicitly identified as provisional until validated by future specifications.

---

## 2. Scope

This standard governs the engineering lifecycle for milestone delivery: the disciplined progression of a single specification milestone from an approved plan to a frozen, validated result.

### In Scope

Within the boundary of milestone delivery, this standard owns:

- The lifecycle phases, review gates, and freeze states that structure milestone delivery. *(See Section 4.)*
- The governance mechanisms that keep frozen work stable and safe to build upon. *(See Section 7.)*
- The engineering principles validated through implementation experience. *(See Section 6.)*
- The deliverables every milestone must produce, and their ownership. *(See Section 8.)*
- The order of authority among AJ-OS engineering documents, and the requirement to halt and report a conflict rather than invent a resolution. *(See Section 3.)*
- The proportionality of engineering ceremony to milestone size. *(Provisional; see Section 7.)*
- The handoff of validated lessons from a completed milestone into knowledge governance. *(See Section 11.)*

### Out of Scope

The following are deliberately excluded. Each is owned elsewhere in AJ-OS, and the boundary is stated so responsibilities do not blur.

- **Specification decomposition.** Creating a specification's roadmap and milestone structure is a lightweight prerequisite performed *before* milestone delivery begins. It is a precondition to the lifecycle, not a phase within it.
- **Architecture.** The definition and revision of platform architecture is referenced as a fixed input. Architecture changes through its own architectural-decision process, never through this standard.
- **Operational workflows.** How the running platform composes and executes its agents at run time is a separate, run-time concern. This standard governs build-time delivery only.
- **Knowledge governance.** How captured knowledge is classified, promoted, maintained, and retired as canonical is governed elsewhere. This standard delivers lessons *to* that process but does not own it.
- **Daily operating cadence.** The day-to-day rhythm of working with AI tools across sessions is a separate operating concern.
- **Authoring and convention rules.** How specifications are written, and language- or tool-specific coding conventions, sit below this standard and are not governed by it.

In summary, this standard governs milestone delivery and its engineering discipline. The prerequisite that precedes it, the architectural inputs above it, the operational workflows beside it, and the knowledge governance that follows it are governed elsewhere.

---

## 3. Relationship to the AJ-OS Engineering Hierarchy

Define the order of authority among AJ-OS engineering artifacts, so that every document has a known place and conflicts resolve predictably.

Authority flows downward:

```text
Architecture / ADR
        ↓
AJ-OS Standards (AJS)
        ↓
Specifications (SPEC)
        ↓
Package Documentation
        ↓
Tasks
```

Each layer implements and refines the layers above it, but may never override or contradict them. This standard is an AJ-OS Standard and therefore occupies the second layer.

### Layer Responsibilities

- **Architecture / ADR.** Defines what the platform is. It is the fixed baseline for all engineering work and changes only through its own architectural-decision records. Highest authority.
- **AJ-OS Standards (AJS).** Define the rules by which AJ-OS is built and operated, within the architecture. This standard lives here.
- **Specifications (SPEC).** Define what an individual component must do. They implement the standards and are subordinate to them.
- **Package Documentation.** Carries a single specification into an ordered, trackable body of work — its roadmap, milestones, and status of record. Subordinate to the specification it delivers.
- **Tasks.** The atomic unit of work: what is implemented now. Subordinate to the package that contains them.

### Resolving Conflict

When artifacts disagree, the higher layer prevails. An unresolved conflict is halted and reported, never settled by invention at a lower layer.

### Upward Feedback

Retrospectives (a lifecycle phase; see Section 4) are the approved path for engineering experience to travel upward. A retrospective may surface evidence recommending a change to a higher layer — a standard, or the architecture itself — but it does not itself change any layer. It produces a recommendation, which the receiving layer accepts or rejects through that layer's own change process. Authority continues to flow downward; feedback flows upward only as a proposal.

---

## 4. The Milestone Lifecycle

### 4.1 Overview

The milestone lifecycle is the ordered path a single specification milestone follows from an approved plan to a frozen, validated result. It is composed of **seven ordered lifecycle stages**. Each stage is classified as either a **phase** (a work stage), a **review gate** (a reviewed transition), or a **freeze state** (a durable frozen outcome). The lifecycle repeats as an **iterative loop** across the milestones of a specification. The two review gates are owned as defined in Section 5, and each review gate and freeze state also operates as an engineering mechanism defined in Section 7.

### 4.2 Prerequisite — Specification Decomposition

Specification decomposition produces the Specification Roadmap and milestone structure of a specification. It is performed **before** the lifecycle begins and is **not** a lifecycle stage.

```text
SPECIFICATION DECOMPOSITION        (prerequisite — precedes the lifecycle; not a stage)
        │
        │  produces the Specification Roadmap
        ▼
   MILESTONE LIFECYCLE begins
```

### 4.3 The Seven Lifecycle Stages

The lifecycle consists of the following seven ordered lifecycle stages:

```text
1. Planning
2. Planning Review
3. Planning Freeze
4. Implementation
5. Freeze Review
6. Milestone Freeze
7. Retrospective
```

Each stage is one of three kinds — a **phase**, a **review gate**, or a **freeze state**:

```text
Stage                 Stage Kind
--------------------  --------------
1. Planning           phase
2. Planning Review    review gate
3. Planning Freeze    freeze state
4. Implementation     phase
5. Freeze Review      review gate
6. Milestone Freeze   freeze state
7. Retrospective      phase
```

### 4.4 The Two Review Gates

```text
- Planning Review   (between Planning and Planning Freeze)
- Freeze Review     (between Implementation and Milestone Freeze)
```

### 4.5 The Two Freeze States

```text
- Planning Freeze   (produced by passing the Planning Review)
- Milestone Freeze  (produced by passing the Freeze Review)
```

### 4.6 The Iterative Milestone Loop

The lifecycle runs once per milestone and repeats until the Specification Roadmap is complete.

```text
   Specification Decomposition            (prerequisite — outside the loop)
              │  Specification Roadmap
              ▼
   ┌──────────────── MILESTONE LIFECYCLE ────────────────┐
   │                                                      │
   │   Planning                                           │
   │      ↓                                               │
   │   Planning Review        «gate»                      │
   │      ↓                                               │
   │   Planning Freeze        «freeze state»              │
   │      ↓                                               │
   │   Implementation                                     │
   │      ↓                                               │
   │   Freeze Review          «gate»                      │
   │      ↓                                               │
   │   Milestone Freeze       «freeze state»              │
   │      ↓                                               │
   │   Retrospective                                      │
   │                                                      │
   └───────────────────────┬──────────────────────────────┘
                           │  next milestone
                           └────────►  Planning (next milestone)
```

*(In the diagram, «gate» is shorthand for review gate.)* The loop terminates when no milestones remain in the Specification Roadmap.

### 4.7 Lifecycle Stages in Detail

Each of the seven lifecycle stages is expanded below by purpose, expected outcome, and transition to the next stage. The stage kind — phase, review gate, or freeze state — is noted for reference only and is not redefined here.

#### 1. Planning — *phase*

- **Purpose.** Define how the milestone will be delivered: its objective, scope, explicit exclusions, tasks, and the contracts each task depends on — before any implementation begins.
- **Expected outcome.** A complete, coherent Milestone Plan, proposed for review.
- **Transition.** The proposed plan enters the Planning Review gate.

#### 2. Planning Review — *review gate*

- **Purpose.** Verify that the milestone plan is sound, coherent, and implementable before it is frozen.
- **Expected outcome.** The plan is approved, or returned to Planning for revision. The review may iterate until the plan is sound.
- **Transition.** On approval, the plan advances to the Planning Freeze.

#### 3. Planning Freeze — *freeze state*

- **Purpose.** Establish the approved plan as the stable baseline against which the milestone is implemented.
- **Expected outcome.** A frozen Milestone Plan that becomes the authoritative implementation baseline for the remainder of the milestone.
- **Transition.** With the plan frozen, Implementation begins.

#### 4. Implementation — *phase*

- **Purpose.** Build the milestone task by task against the frozen Milestone Plan, keeping the platform buildable and testable throughout.
- **Expected outcome.** A complete, validated implementation of the frozen Milestone Plan.
- **Transition.** The completed implementation enters the Freeze Review gate.

#### 5. Freeze Review — *review gate*

- **Purpose.** Verify that the milestone is complete, internally consistent, and ready to become a stable foundation for future work.
- **Expected outcome.** The milestone is approved for freezing, or returned for correction.
- **Transition.** On approval, the milestone advances to the Milestone Freeze.

#### 6. Milestone Freeze — *freeze state*

- **Purpose.** Establish the completed milestone as a stable, immutable foundation that subsequent milestones build upon rather than modify.
- **Expected outcome.** A Frozen Milestone that becomes the authoritative foundation for subsequent milestones.
- **Transition.** With the milestone frozen, the Retrospective begins.

#### 7. Retrospective — *phase*

- **Purpose.** Capture what was learned during the milestone so the knowledge is preserved and reusable.
- **Expected outcome.** A recorded Retrospective. Validated lessons may become recommendations directed upward, as permitted by the engineering hierarchy.
- **Transition.** The lifecycle returns to Planning for the next milestone, or ends when the Specification Roadmap is complete.

---

## 5. Review & Approval Model

Define how engineering decisions are reviewed, approved, and frozen during the milestone lifecycle. This section establishes responsibilities and decision ownership; it does not describe how reviews are conducted.

### 5.1 Roles

- **Author.** The party that performs the work of a phase — producing the milestone plan during Planning and the implementation during Implementation. The author owns creation.
- **Reviewer.** The party that evaluates work at a review gate and owns the decision to advance or to freeze. The reviewer is a **role, not necessarily a second person**: a single practitioner may hold both roles, exercising the reviewer role as a distinct and deliberate act.

### 5.2 Review and Approval

- **Review.** The evaluation of a completed work product at a review gate to determine whether it is ready to advance. Review occurs at the two gates of the lifecycle — the **Planning Review** and the **Freeze Review**. Task-level review performed during Implementation is a separate, recommended practice, distinct from these two gate reviews (see Section 7).
- **Approval.** The reviewer's deliberate acceptance that a work product meets its requirements and may advance to the next lifecycle stage. Approval is never automatic and is not implied by the completion of work; it is an explicit decision. Absent approval, a work product returns to its phase for revision rather than advancing.

### 5.3 Separation of Responsibilities

The author creates; the reviewer evaluates and decides. These responsibilities remain separate even when one person holds both roles. The author does not self-certify a freeze: advancing past a gate is a reviewer decision, exercised deliberately and independently of the act of creation. This separation is what gives a freeze its authority.

### 5.4 Reviewer-Owned Freeze Decisions

The two freeze states of the lifecycle are **reviewer-owned decisions**. Each freeze state is also defined as an engineering mechanism in Section 7.

- **Planning Freeze.** Declared by the reviewer upon approval at the Planning Review. It establishes the Milestone Plan as the authoritative baseline.
- **Milestone Freeze.** Declared by the reviewer upon approval at the Freeze Review. It establishes the completed milestone as the authoritative foundation.

Only the reviewer, acting in the reviewer role, may declare a freeze. A freeze is a decision, not a consequence of work being finished.

---

## 6. Engineering Principles

Record the engineering principles established through implementation experience, and distinguish those validated by repeated demonstration from those that remain provisional. A principle is promoted only after repeated validation through implementation experience. Within this Draft standard, that evidence is provided by SPEC-002.

The validated principle names defined in this section are the canonical names for these principles and may be referenced consistently throughout AJ-OS engineering documentation.

### 6.1 Validated Principles

The following principles were demonstrated across multiple SPEC-002 milestones and form the normative engineering model of this standard.

- **Contract-First.**
  *Define and freeze a contract before implementing the behaviour that fulfils it.*
  A behaviour built against a pre-existing, stable contract populates that contract rather than redesigning one mid-implementation. This keeps each increment small and prevents interface churn. *(Demonstrated in M1, M2, and M3.)*

- **Compose Contracts.**
  *Build new contracts by composing existing ones rather than redefining them.*
  Reusing established contracts prevents divergence between related structures and stops a single concept from being modelled two incompatible ways. *(Demonstrated in M1, M2, and M3.)*

- **Construct-Through-Contract.**
  *Produce outputs by constructing them through their own contract, not by assembling them ad hoc.*
  Building an output through the contract that defines it makes drift between the contract and its instances impossible. *(Demonstrated in M1 and M2.)*

- **Determinism by Construction.**
  *Design behaviour so that the same inputs always yield the same result, by construction rather than by convention.*
  Determinism built into the design — rather than asserted after the fact — removes an entire class of order- and timing-dependent defects and makes results reproducible. *(Demonstrated in M2 and M3.)*

- **Public-Surface Validation.**
  *Validate behaviour only through the public surface, never by reaching into internals.*
  Validating through the public surface keeps the implementation free to change and ensures every guarantee is one a consumer can actually observe. *(Demonstrated in M1 and M3.)*

- **Scope Discipline.**
  *Implement only the current milestone's declared scope, and state explicitly what it excludes.*
  Explicit exclusions prevent speculative work and scope creep, keeping each milestone small, reviewable, and freeze-ready. *(Demonstrated in M1, M2, and M3.)*

- **Working Increment.**
  *Every completed increment leaves the platform buildable, testable, and working.*
  Keeping the platform continuously in a working state prevents the accumulation of broken intermediate work and makes progress verifiable at every step. *(Demonstrated across M1–M3.)*

- **Build on Frozen Foundations.**
  *Treat validated, frozen work as immutable and build upon it rather than editing it.*
  Building on frozen foundations prevents regression of already-verified work and uncontrolled drift in established structures. *(Demonstrated across M1–M3.)*

### 6.2 Candidate Principles

The following are **provisional**. Each was observed during SPEC-002 but not yet demonstrated widely or generally enough to be normative. They are **not part of the engineering model** of this standard and are recorded here only to preserve the observation pending further validation.

- **Single Public Entry Point.** *(Provisional.)* Observed that exposing a single public entry point which always runs the highest-level implemented pipeline let the system grow without churning its public surface. Additional validation is required because it was demonstrated in a single milestone and is specific to a pipeline-shaped design; it must recur in a structurally different context before it can be promoted.

- **Orchestration Proven by Equality.** *(Provisional.)* Observed that a composed operation could be shown to re-decide nothing by asserting it equals the manual composition of its stages. Additional validation is required because this is a narrow, pipeline-shaped technique whose generality beyond composition pipelines is unproven.

- **Ordering as the Contract.** *(Provisional.)* Observed that exposing a canonical deterministic ordering as the guarantee — instead of an explicit priority or score field — kept a contract minimal and free to evolve. Additional validation is required because it was demonstrated for a single behaviour, and whether it generalises to other domains is not yet established.

---

## 7. Engineering Mechanisms

Define the engineering mechanisms that operate within the milestone lifecycle. Engineering mechanisms operate within the lifecycle defined in Section 4. They are not lifecycle stages themselves. Each mechanism carries a required status — **Mandatory**, **Recommended**, or **Provisional**. This section describes what each mechanism is for and when it applies; it does not restate the lifecycle, the roles, or the engineering principles. Two mechanisms — Planning Freeze and Freeze Review — correspond to lifecycle elements defined in Section 4 and are owned as described in Section 5.

### 7.1 Planning Freeze — *Mandatory*

- **Purpose.** Establish the approved milestone plan as an authoritative baseline and hold it immutable for the remainder of the milestone.
- **When used.** Immediately upon approval at the Planning Review, and thereafter throughout Implementation.
- **Required status.** Mandatory.

### 7.2 Frozen Plan Change Proposal — *Mandatory*

- **Purpose.** Provide the single sanctioned path to change something already frozen — a frozen plan or a frozen contract — through a recorded proposal that is reviewed and approved before any implementation dependent upon the change begins.
- **When used.** Whenever implementation experience reveals that a frozen plan or contract must change. The proposal and its approval precede any work that depends on the change.
- **Required status.** Mandatory.

### 7.3 Freeze Review — *Mandatory*

- **Purpose.** Verify that a completed milestone is complete and internally consistent before it is frozen as a foundation.
- **When used.** At the end of Implementation, immediately before the Milestone Freeze.
- **Required status.** Mandatory.

### 7.4 Documentation Synchronization — *Mandatory*

- **Purpose.** Ensure that all documentation affected by the milestone accurately reflects the frozen result, so recorded status does not drift from reality.
- **When used.** During the Freeze Review, before the Milestone Freeze.
- **Required status.** Mandatory. Automated enforcement is recommended but not required.

### 7.5 Regression Re-homing — *Mandatory*

- **Purpose.** Ensure that no validated coverage is lost when a covered element is retired, replaced, or relocated; coverage is deliberately re-homed and recorded rather than silently dropped.
- **When used.** During Implementation, whenever a publicly covered element or its tests are retired or moved.
- **Required status.** Mandatory.

### 7.6 Task Review — *Recommended*

- **Purpose.** Confirm, at the task level, that a completed task meets its objective before the next task proceeds.
- **When used.** During Implementation, upon completing each task. It is a practice within the Implementation phase, not a lifecycle gate, and is distinct from the Planning Review and Freeze Review defined in Section 5.
- **Required status.** Recommended.

### 7.7 Tailoring / Proportionality — *Provisional*

- **Purpose.** Allow the amount of engineering ceremony to scale with the size and risk of a milestone, subject to reviewer approval.
- **When used.** At Planning, when a milestone may not warrant the full ceremony of the lifecycle.
- **Required status.** **Provisional.** This mechanism has **not been validated beyond SPEC-002**, which applied uniform ceremony to every milestone. It is **not yet normative**; future specifications must validate it before it can be promoted to a normative mechanism.

---

## 8. Deliverables

Define the engineering artifacts produced by, consumed by, or required by the milestone lifecycle. Each engineering artifact governed by this standard is classified as exactly one of three kinds: a **Lifecycle Deliverable**, a **Lifecycle Prerequisite**, or an **Optional Deliverable**. This section identifies these artifacts and their ownership; it does not restate the lifecycle, the roles, or the mechanisms that produce them.

This standard introduces **no new engineering artifact types** beyond those already established by AJ-OS. It names existing artifacts and fixes their place in the lifecycle.

### 8.1 Lifecycle Deliverables

- **Milestone Plan.**
  - *Purpose.* Record how a milestone will be delivered — its objective, scope, exclusions, and tasks.
  - *When it exists.* Produced during Planning; becomes authoritative at the Planning Freeze; retained thereafter as the milestone's baseline of record.
  - *Ownership.* Authored by the author; frozen by the reviewer.

- **Frozen Milestone.**
  - *Purpose.* Represent the completed, validated milestone as the authoritative foundation for subsequent milestones.
  - *When it exists.* Comes into being at the Milestone Freeze and persists as a stable foundation.
  - *Ownership.* Produced by the author through Implementation; frozen by the reviewer.

- **Retrospective.**
  - *Purpose.* Preserve what was learned during the milestone so the knowledge remains reusable.
  - *When it exists.* Produced during the Retrospective phase, after the Milestone Freeze; retained as a durable record.
  - *Ownership.* Authored by the author; accepted by the reviewer.

### 8.2 Lifecycle Prerequisites

- **Specification Roadmap.**
  - *Purpose.* Establish the milestone structure of a specification that the lifecycle then delivers.
  - *When it exists.* Created during specification decomposition, before the lifecycle begins, and available throughout the specification's delivery.
  - *Ownership.* Owned at the specification level, upstream of the lifecycle; it is a prerequisite, not a product of any lifecycle stage.

### 8.3 Optional Deliverables

- **Worklog.**
  - *Purpose.* Provide an optional engineering record of work in progress, kept at the author's discretion.
  - *When it exists.* May exist during Implementation when the author chooses to keep one; it is never required.
  - *Ownership.* Owned by the author.

---

## 9. Future Validation

Explain why this standard remains Draft and how it progresses toward a stable engineering standard through additional implementation evidence. The maturity of this standard is evidence-based: it advances only as implementation evidence accumulates, never merely through the passage of time.

### 9.1 Draft Status

This standard is **Draft** because the engineering practice it records has, to date, been validated only through SPEC-002. It documents practice proven within a single specification and does not yet claim general validity. It remains Draft until further implementation evidence confirms that the recorded practice holds beyond the context in which it was first observed.

### 9.2 Validation Through Future Specifications

Additional validation is provided by future specifications delivered under this standard, beginning with **SPEC-003**. Each such specification either strengthens confidence in the recorded practice or provides evidence that the standard should be revised. A specification whose shape differs from SPEC-002 carries particular evidentiary weight, because it tests whether the practice generalises rather than reflecting the characteristics of one specification. This validation is evidence-based, not time-based.

### 9.3 Promotion of Candidate Principles

A candidate principle remains provisional and outside the normative engineering model until it has been **demonstrated repeatedly through implementation experience across more than one specification context**. Promotion follows repeated demonstration; it is never granted on the strength of a single observation or the passage of time.

### 9.4 Promotion of Provisional Mechanisms

A provisional mechanism does not carry normative force until it has been **repeatedly validated through implementation experience**. Until validated, such a mechanism may be applied but remains non-normative. As with candidate principles, promotion is evidence-based rather than time-based.

---

## 10. Governance

Define how this standard itself is maintained, revised, and promoted. This section governs the standard as a document; it does not restate the lifecycle, principles, mechanisms, or deliverables it defines.

### 10.1 Ownership

This standard is owned at the **AJ-OS Standard (AJS) layer**. It is maintained at that layer, and authority to revise it rests with the reviewer role acting there. This is the reviewer role defined in Section 5, exercised at the AJS layer rather than within a single milestone. Ownership at the AJS layer means the standard governs engineering practice within the architecture and is answerable to the architecture above it.

### 10.2 Revising the Standard

Any revision to this standard requires **implementation evidence** and **reviewer approval**. Recommendations to revise the standard originate from retrospectives, the approved upward feedback path; a recommendation is evidence for consideration and does not itself change the standard. A revision is enacted only when supported by implementation evidence and approved by the reviewer. No revision may contradict a higher-authority layer; where a proposed change conflicts with the Architecture or an ADR, the higher layer prevails.

### 10.3 Promotion of Principles and Mechanisms

A candidate principle or a provisional mechanism is promoted only after sufficient implementation evidence, and only through an **approved revision of this standard**. The evidence threshold for promotion is defined in Section 9; promotion is enacted here, as a reviewed and approved revision. Promotion is never automatic and never occurs outside a revision of the standard.

### 10.4 Maintaining Internal Consistency

Every approved revision preserves the internal consistency of the standard. A change to one section is reconciled with each section it affects, so the standard never contradicts itself, and it remains consistent with the higher-authority layers above it. A revision that cannot be reconciled is not adopted until consistency is restored.

---

## 11. Relationship to Other Standards

Define the boundaries between this standard and other AJ-OS standards so that responsibilities remain distinct and non-overlapping.

### 11.1 Purpose of this Boundary

This standard governs the **engineering lifecycle for milestone delivery**. It may reference other standards but does not redefine or override them. Where the responsibilities of two standards meet, each standard hands work to the next rather than sharing ownership, so that every responsibility has a single owner.

Because the term *lifecycle* is used by several AJ-OS standards, the meaning of the term depends on the governing standard. This standard's **Engineering Lifecycle** is therefore distinguished explicitly from the **Daily Workflow** (AJS-001), the **Workflow Lifecycle** (AJS-005), and the **Knowledge Lifecycle** (AJS-006). These are separate concepts with separate owners and must not be conflated.

### 11.2 Relationship to AJS-001 Daily Workflow

AJS-001 governs the **day-to-day operating workflow** of engineering work — its operating cadence — not milestone delivery. This standard governs milestone delivery. The Engineering Lifecycle is the delivery path of a specification milestone; the Daily Workflow is the operating rhythm within which such work is carried out. They meet where daily work is performed inside a milestone, and each retains its own ownership.

### 11.3 Relationship to AJS-005 Workflow Lifecycle

AJS-005 governs **operational workflows executed by the platform at run time**, not engineering delivery. The Engineering Lifecycle is a build-time concern; the Workflow Lifecycle is a run-time concern. This standard does not govern run-time workflows, and AJS-005 does not govern milestone delivery.

### 11.4 Relationship to AJS-006 Knowledge Lifecycle

AJS-006 governs the **lifecycle of knowledge after it has been produced**, not the engineering work that produced it. The Engineering Lifecycle is distinct from the Knowledge Lifecycle. Where they meet — a completed milestone yields knowledge worth preserving — this standard hands that knowledge to AJS-006 rather than sharing ownership of its subsequent lifecycle.

### 11.5 Relationship to Future Standards

This standard may reference other and future standards but does not redefine or override them. As new standards are introduced, their boundaries with this one are maintained by the same principle: where responsibilities meet, each standard hands work to the next rather than sharing ownership.

---

## 12. References

This section identifies the authoritative documents on which this standard depends or which informed its development. It states only why each document is referenced; it neither restates their contents nor repeats the boundaries established in Section 11.

### 12.1 Normative References

Documents required to correctly interpret or apply this standard.

- **Architecture / ADRs.** Referenced as the higher-authority layer with which every application and revision of this standard must remain consistent.
- **AJS-001 — Daily Workflow.** Referenced because correctly applying this standard requires distinguishing milestone delivery from the day-to-day operating workflow.
- **AJS-005 — Workflow Lifecycle.** Referenced because correct application requires distinguishing build-time milestone delivery from run-time operational workflows.
- **AJS-006 — Knowledge Lifecycle.** Referenced because a completed milestone hands the knowledge it produces to the lifecycle that AJS-006 governs.

### 12.2 Informative References

Supporting documents that informed this Draft standard but are not required to apply it.

- **SPEC-002 — Context Builder.** The specification whose delivery provided the implementation evidence this Draft standard consolidates.
- **SPEC-002 Retrospectives.** The milestone retrospectives from which the validated principles and mechanisms were drawn.
- **SPEC-002 Implementation Evidence.** The broader engineering record produced during SPEC-002 delivery that informed this Draft standard.

---

## 13. Success Criteria

### 13.1 Purpose

Define how successful application of this standard is recognized. Success is recognized through the consistent application of the engineering discipline this standard defines, rather than through measurement.

### 13.2 Applying the Standard Successfully

This standard is applied successfully when the milestone lifecycle is followed consistently, engineering decisions remain evidence-based, frozen work remains stable, and documentation remains synchronized with implementation. These conditions are not scored; they are recognized in the steady, disciplined conduct of delivery, where each milestone advances the platform without disturbing the foundations already frozen beneath it.

### 13.3 Continuous Improvement

Successful application is sustained over time. Retrospectives continue to supply implementation evidence, and future revisions of the standard remain grounded in that experience rather than in speculation. The standard succeeds not when it is declared complete, but when it continues to reflect engineering practice proven in implementation — keeping engineering delivery disciplined, engineering decisions evidence-based, and every frozen milestone a dependable foundation for the next.
