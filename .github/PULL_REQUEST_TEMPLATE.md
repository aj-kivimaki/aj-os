<!--
Deliberately short. CONTRIBUTING.md is the authority — this template LINKS to
the rules rather than restating them, because a copy drifts from its source.
That defect cost REX M1 a whole task to correct.
-->

## What and why

<!-- What changed, and what problem it solves. Link the SPEC / task / finding. -->

## Checks

<!-- CI runs these. Ticking them means you ran them, not that CI will. -->

- [ ] `npm run ci` passes locally (format · lint · typecheck · build · test)
- [ ] Follows [CONTRIBUTING.md](../CONTRIBUTING.md)

## Behaviour

- [ ] Behaviour is unchanged **or** the change is intentional and described above
- [ ] No test removed, skipped, or weakened to make a gate pass

## If this touches frozen work

<!-- Frozen: VISION, ARCH-001/002, ADR-001..006, AJS standards, accepted
     decision records, and any frozen milestone. AJS-007 §7.2 requires a
     Frozen Plan Change Proposal, REVIEWED BEFORE the dependent work. -->

- [ ] Not applicable
- [ ] FPCP raised and ruled **before** this work — link it here
