# Specification Freeze Review

> Purpose:
>
> Verify that an implementation is complete, internally consistent, and ready
> to become the stable foundation for future platform work.
>
> A freeze review is an engineering review—not a feature development session.

---

# Review Principles

During a freeze review:

- Do not redesign the architecture.
- Do not introduce new features.
- Do not expand public contracts.
- Do not perform speculative refactoring.

Allowed changes:

- Documentation corrections
- Minor implementation fixes
- Naming consistency
- Small quality improvements
- Recording technical debt
- Recording lessons learned

If larger changes appear necessary, defer them to a future milestone.

---

# Review Checklist

## Step 1 — Architecture Review

Question:

Does the implementation still follow the approved architecture?

Verify:

- ARCH documents
- module boundaries
- dependency directions
- platform layering

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 2 — Standards Review

Verify implementation against:

- AJS documents

Question:

Did implementation violate any platform standard?

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 3 — Specification Review

Verify:

Every requirement in the specification has been implemented.

Question:

Is the implementation complete?

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 4 — Public API Review

Review:

- exported types
- factories
- contracts
- public module structure

Question:

Would we change any public API before freezing?

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 5 — Module Review

Review:

- responsibilities
- cohesion
- unnecessary modules
- missing modules

Question:

Does every module have one clear responsibility?

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 6 — Documentation Review

Review:

- README
- ROADMAP
- implementation README
- task status
- milestone status

Question:

Does documentation accurately describe the implementation?

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 7 — Technical Debt Review

Identify:

- postponed refactors
- duplicated utilities
- implementation shortcuts

Question:

Should this be fixed now?

If not:

Record it.

Result:

- [ ] Technical debt recorded

---

## Step 8 — Retrospective

Create:

RETROSPECTIVE.md

Capture:

- What worked well?
- What surprised us?
- Engineering discoveries
- Process improvements
- Deferred improvements

Result:

- [ ] Completed

---

# Freeze Decision

The specification may be frozen when:

- [ ] Architecture verified
- [ ] Standards verified
- [ ] Specification complete
- [ ] Public API approved
- [ ] Documentation current
- [ ] Technical debt reviewed
- [ ] Retrospective completed

---

# Outputs

Freeze review produces:

- documentation corrections
- retrospective
- technical debt list

It does not produce:

- new architecture
- new standards
- new features

---

> A specification freeze confirms that the current milestone is complete.
>
> Future improvements belong to future milestones—not to the freeze review.
