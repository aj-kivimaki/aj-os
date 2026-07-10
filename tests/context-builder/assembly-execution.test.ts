/**
 * Assembly execution behaviour tests (CB-022 execution + CB-020 section strategy +
 * CB-021 metadata composition, deferred to CB-024).
 *
 * These tests validate the deterministic Assembly stage **through the public API**
 * — `createAssemblyEngine().assemble(selectionResult, generatedAt)` — and never
 * import an internal mapping, policy, title table or private helper. The CB-020
 * section-composition strategy and the CB-021 metadata composition are internal
 * platform behaviour; their guarantees are asserted only as the observable output
 * of `assemble`:
 *
 *   SelectionResult + generatedAt → engine.assemble → ContextPackage
 *
 * Fixtures build `SelectionResult`s **directly** through the public
 * `parseSelectionResult()` contract, isolating Assembly from Collection and
 * Selection. This lets these tests drive the full `source.type → section-kind`
 * mapping and deliberately out-of-canonical-order inputs that the upstream pipeline
 * could not produce on its own — the pipeline's thin-orchestration equality is a
 * separate concern owned by `context-builder-pipeline.test.ts`.
 *
 * Covered (CB-024 §2): canonical section ordering, the four always-present empty
 * Decision A sections, the complete `source.type → section-kind` mapping and the
 * merging of types into shared kinds, reference de-duplication and ordering,
 * referential integrity, metadata composition, the `contextVersion` vs
 * `contextBuilderVersion` distinction, the omission of `issue`, minimal
 * explainability/summary, determinism, immutability of the returned package,
 * immutability of the input SelectionResult (order preserved by divergence), public
 * conformance, and the scope-negative guarantees (no rendering, no computed
 * explainability, no phantom sections).
 *
 * The ContextPackage *contract* itself (runtime validation, strictness, rejection
 * of duplicate ids/kinds and dangling references) is owned by `package.test.ts`
 * (CB-003) and is not re-authored here — conformance is asserted positively.
 */

import { describe, it, expect } from "vitest";

import {
  createAssemblyEngine,
  parseSelectionResult,
  parseContextPackage,
  contextPackageSchema,
  CONTEXT_BUILDER,
  REFERENCE_TYPES,
  SECTION_KINDS,
  type ContextPackage,
  type KnowledgeItem,
  type ReferenceType,
  type SelectionResult,
} from "../../src/context-builder/index.js";

const engine = createAssemblyEngine();

const GENERATED_AT = "2026-07-10T00:00:00.000Z";

/** The frozen CB-003 contract version a package conforms to (AJS-002 Appendix B
 *  v1.0). Asserted as a literal through the public surface — the internal
 *  `CONTEXT_VERSION` constant is deliberately not imported. */
const EXPECTED_CONTEXT_VERSION = "1.0";

/** The four Reviewer Decision A section kinds: always present, always empty. */
const ALWAYS_PRESENT_EMPTY_KINDS = [
  "objective",
  "success-criteria",
  "constraints",
  "open-questions",
] as const;

/**
 * The public, frozen `source.type → section-kind` expectation used to assert the
 * complete CB-020 mapping. It is declared **in the test** — never imported from the
 * implementation — so the test pins the observable contract independently of the
 * private mapping. It is total over every public `REFERENCE_TYPES` value; several
 * types intentionally share a target kind (merging).
 */
const EXPECTED_SECTION_KIND: Readonly<Record<ReferenceType, string>> = {
  architecture: "relevant-architecture",
  adr: "relevant-architecture",
  standard: "coding-standards",
  specification: "related-documentation",
  "project-documentation": "related-documentation",
  handbook: "handbook-references",
  wiki: "wiki-references",
  "source-code": "existing-implementation-patterns",
  "git-history": "existing-implementation-patterns",
};

/**
 * Build a KnowledgeItem whose `source` carries the given reference `type`. Each
 * item gets a distinct source `id`/`title` and distinct `content` unless overridden,
 * so items are non-duplicate and their sources are distinct references.
 */
function item(
  id: string,
  type: ReferenceType,
  overrides: { sourceId?: string; title?: string; content?: string; locator?: string } = {},
): KnowledgeItem {
  const sourceId = overrides.sourceId ?? `src-${id}`;
  return {
    id,
    source: {
      id: sourceId,
      type,
      title: overrides.title ?? `Source ${sourceId}`,
      ...(overrides.locator !== undefined ? { locator: overrides.locator } : {}),
    },
    content: overrides.content ?? `content of ${id}`,
  };
}

/** Build a frozen SelectionResult carrying `selectedItems` (excluded empty unless given). */
function selectionOf(
  selectedItems: readonly KnowledgeItem[],
  overrides: {
    metadata?: Record<string, unknown>;
    excludedItems?: readonly KnowledgeItem[];
  } = {},
): SelectionResult {
  return parseSelectionResult({
    metadata: overrides.metadata ?? { project: "aj-os", task: "CB-024" },
    selectedItems,
    excludedItems: overrides.excludedItems ?? [],
  });
}

/** Map a package's sections to their kinds, in emitted order. */
function kinds(pkg: ContextPackage): string[] {
  return pkg.sections.map((s) => s.kind);
}

/** The single section of a given kind, or undefined if absent. */
function section(pkg: ContextPackage, kind: string) {
  return pkg.sections.find((s) => s.kind === kind);
}

describe("assemble — canonical section ordering", () => {
  it("emits sections in canonical Appendix B / SECTION_KINDS order, regardless of input order", async () => {
    // Items given out of canonical order and spanning several kinds; the emitted
    // sections must still follow the canonical SECTION_KINDS order.
    const pkg = await engine.assemble(
      selectionOf([
        item("k1", "wiki"),
        item("k2", "architecture"),
        item("k3", "handbook"),
        item("k4", "standard"),
      ]),
      GENERATED_AT,
    );

    const present = kinds(pkg);
    // The emitted order is a subsequence of the canonical order.
    const canonicalOfPresent = SECTION_KINDS.filter((k) => present.includes(k));
    expect(present).toEqual(canonicalOfPresent);
  });

  it("places the four always-present sections at their canonical positions", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture")]),
      GENERATED_AT,
    );
    // objective & success-criteria & constraints precede relevant-architecture;
    // open-questions is last — exactly the canonical SECTION_KINDS ordering.
    expect(kinds(pkg)).toEqual([
      "objective",
      "success-criteria",
      "constraints",
      "relevant-architecture",
      "open-questions",
    ]);
  });
});

describe("assemble — the four always-present empty Decision A sections", () => {
  it("emits exactly the four empty sections for an empty selection", async () => {
    const pkg = await engine.assemble(selectionOf([]), GENERATED_AT);
    expect(kinds(pkg)).toEqual([...ALWAYS_PRESENT_EMPTY_KINDS]);
  });

  it("keeps the four Decision A sections empty even when knowledge is present", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture"), item("k2", "handbook")]),
      GENERATED_AT,
    );
    for (const kind of ALWAYS_PRESENT_EMPTY_KINDS) {
      const s = section(pkg, kind);
      expect(s).toBeDefined();
      expect(s?.content).toBe("");
      expect(s?.referenceIds).toEqual([]);
    }
  });
});

describe("assemble — the complete source.type → section-kind mapping", () => {
  it("maps every public reference type to its knowledge-derived section kind", async () => {
    // One item per reference type, each with a distinct source. Assert each type's
    // expected section exists and carries that item's source id.
    const items = REFERENCE_TYPES.map((type, i) => item(`k${i}`, type));
    const pkg = await engine.assemble(selectionOf(items), GENERATED_AT);

    for (const type of REFERENCE_TYPES) {
      const expectedKind = EXPECTED_SECTION_KIND[type];
      const s = section(pkg, expectedKind);
      expect(s, `type ${type} → kind ${expectedKind}`).toBeDefined();
      const contributed = items.find((it) => it.source.type === type)!;
      expect(s?.referenceIds).toContain(contributed.source.id);
    }
  });

  it("never emits the two structurally-unreachable knowledge kinds", async () => {
    // files-likely-to-change and risks-and-edge-cases are not reachable from any
    // source.type under a purely structural rule (CB-020 §2) and never appear.
    const items = REFERENCE_TYPES.map((type, i) => item(`k${i}`, type));
    const pkg = await engine.assemble(selectionOf(items), GENERATED_AT);
    expect(kinds(pkg)).not.toContain("files-likely-to-change");
    expect(kinds(pkg)).not.toContain("risks-and-edge-cases");
  });

  it("emits every knowledge-derived kind exactly once (unique section kinds)", async () => {
    const items = REFERENCE_TYPES.map((type, i) => item(`k${i}`, type));
    const pkg = await engine.assemble(selectionOf(items), GENERATED_AT);
    const emitted = kinds(pkg);
    expect(new Set(emitted).size).toBe(emitted.length);
  });
});

describe("assemble — merging multiple source types into shared section kinds", () => {
  it("merges architecture and adr into one relevant-architecture section", async () => {
    const arch = item("k1", "architecture");
    const adr = item("k2", "adr");
    const pkg = await engine.assemble(selectionOf([arch, adr]), GENERATED_AT);

    const merged = pkg.sections.filter((s) => s.kind === "relevant-architecture");
    expect(merged).toHaveLength(1);
    expect(merged[0].referenceIds).toEqual([arch.source.id, adr.source.id]);
  });

  it("merges specification and project-documentation into one related-documentation section", async () => {
    const spec = item("k1", "specification");
    const doc = item("k2", "project-documentation");
    const pkg = await engine.assemble(selectionOf([spec, doc]), GENERATED_AT);

    const merged = pkg.sections.filter((s) => s.kind === "related-documentation");
    expect(merged).toHaveLength(1);
    expect(merged[0].referenceIds).toEqual([spec.source.id, doc.source.id]);
  });

  it("merges source-code and git-history into one existing-implementation-patterns section", async () => {
    const code = item("k1", "source-code");
    const history = item("k2", "git-history");
    const pkg = await engine.assemble(selectionOf([code, history]), GENERATED_AT);

    const merged = pkg.sections.filter(
      (s) => s.kind === "existing-implementation-patterns",
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].referenceIds).toEqual([code.source.id, history.source.id]);
  });
});

describe("assemble — reference de-duplication and ordering", () => {
  it("emits references in the first-appearance order of selectedItems", async () => {
    // Distinct sources, deliberately out of any sorted order: references mirror the
    // selectedItems order exactly (RC-6). Assembly never re-orders.
    const items = [
      item("k1", "wiki", { sourceId: "s3" }),
      item("k2", "handbook", { sourceId: "s1" }),
      item("k3", "standard", { sourceId: "s2" }),
    ];
    const pkg = await engine.assemble(selectionOf(items), GENERATED_AT);
    expect(pkg.references.map((r) => r.id)).toEqual(["s3", "s1", "s2"]);
  });

  it("de-duplicates references by source id, first occurrence wins", async () => {
    // Two items share one source (identical source id) under distinct item ids and
    // distinct content — one reference survives, at the first-appearance position.
    const shared = { sourceId: "shared", title: "Shared Source" };
    const items = [
      item("k1", "handbook", { ...shared, content: "a" }),
      item("k2", "standard", { sourceId: "other" }),
      item("k3", "handbook", { ...shared, content: "b" }),
    ];
    const pkg = await engine.assemble(selectionOf(items), GENERATED_AT);
    expect(pkg.references.map((r) => r.id)).toEqual(["shared", "other"]);
  });

  it("de-duplicates referenceIds within a section, preserving order", async () => {
    // Two handbook items share a source id: the handbook-references section lists
    // that id once, in first-appearance order alongside a second distinct source.
    const shared = { sourceId: "hb", title: "Handbook" };
    const items = [
      item("k1", "handbook", { ...shared, content: "a" }),
      item("k2", "handbook", { sourceId: "hb2", content: "b" }),
      item("k3", "handbook", { ...shared, content: "c" }),
    ];
    const pkg = await engine.assemble(selectionOf(items), GENERATED_AT);
    const s = section(pkg, "handbook-references");
    expect(s?.referenceIds).toEqual(["hb", "hb2"]);
  });

  it("carries an optional source locator through to the reference when present", async () => {
    const items = [
      item("k1", "standard", { sourceId: "s1", locator: "AJS-002 §6" }),
      item("k2", "wiki", { sourceId: "s2" }),
    ];
    const pkg = await engine.assemble(selectionOf(items), GENERATED_AT);
    const withLocator = pkg.references.find((r) => r.id === "s1");
    const withoutLocator = pkg.references.find((r) => r.id === "s2");
    expect(withLocator?.locator).toBe("AJS-002 §6");
    expect(withoutLocator && "locator" in withoutLocator).toBe(false);
  });
});

describe("assemble — referential integrity", () => {
  it("references every section referenceId from the references list", async () => {
    const pkg = await engine.assemble(
      selectionOf([
        item("k1", "architecture"),
        item("k2", "adr"),
        item("k3", "handbook"),
        item("k4", "source-code"),
      ]),
      GENERATED_AT,
    );

    const referenceIds = new Set(pkg.references.map((r) => r.id));
    for (const s of pkg.sections) {
      for (const refId of s.referenceIds) {
        expect(referenceIds.has(refId)).toBe(true);
      }
    }
  });
});

describe("assemble — metadata composition", () => {
  it("reuses the request provenance (project, task) unchanged", async () => {
    const pkg = await engine.assemble(
      selectionOf([], { metadata: { project: "aj-os", task: "CB-024" } }),
      GENERATED_AT,
    );
    expect(pkg.metadata.project).toBe("aj-os");
    expect(pkg.metadata.task).toBe("CB-024");
  });

  it("carries optional branch and commit through when present", async () => {
    const pkg = await engine.assemble(
      selectionOf([], {
        metadata: {
          project: "aj-os",
          task: "CB-024",
          branch: "main",
          commit: "abc1234",
        },
      }),
      GENERATED_AT,
    );
    expect(pkg.metadata.branch).toBe("main");
    expect(pkg.metadata.commit).toBe("abc1234");
  });

  it("omits branch and commit when absent from the provenance", async () => {
    const pkg = await engine.assemble(
      selectionOf([], { metadata: { project: "aj-os", task: "CB-024" } }),
      GENERATED_AT,
    );
    expect("branch" in pkg.metadata).toBe(false);
    expect("commit" in pkg.metadata).toBe(false);
  });

  it("stamps the injected generatedAt verbatim — no clock is read", async () => {
    const pkg = await engine.assemble(selectionOf([]), GENERATED_AT);
    expect(pkg.metadata.generatedAt).toBe(GENERATED_AT);
  });
});

describe("assemble — contextVersion vs contextBuilderVersion", () => {
  it("single-sources contextVersion to the CB-003 contract version", async () => {
    const pkg = await engine.assemble(selectionOf([]), GENERATED_AT);
    expect(pkg.metadata.contextVersion).toBe(EXPECTED_CONTEXT_VERSION);
  });

  it("single-sources contextBuilderVersion to the producing agent version", async () => {
    const pkg = await engine.assemble(selectionOf([]), GENERATED_AT);
    expect(pkg.metadata.contextBuilderVersion).toBe(CONTEXT_BUILDER.version);
  });

  it("keeps the two version fields distinct — they answer different questions", async () => {
    const pkg = await engine.assemble(selectionOf([]), GENERATED_AT);
    expect(pkg.metadata.contextVersion).not.toBe(pkg.metadata.contextBuilderVersion);
  });
});

describe("assemble — omission of issue from ContextPackage metadata", () => {
  it("drops the request issue locator — it has no home in the strict package contract", async () => {
    const pkg = await engine.assemble(
      selectionOf([], {
        metadata: { project: "aj-os", task: "CB-024", issue: "JIRA-123" },
      }),
      GENERATED_AT,
    );
    expect("issue" in pkg.metadata).toBe(false);
  });
});

describe("assemble — minimal explainability & summary (present, not computed)", () => {
  it("emits a minimal, structurally-valid explainability with no entries", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture")]),
      GENERATED_AT,
    );
    expect(pkg.explainability).toEqual({ summary: "", entries: [] });
  });

  it("emits an empty summary — Assembly does not render", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture")]),
      GENERATED_AT,
    );
    expect(pkg.summary).toBe("");
  });
});

describe("assemble — determinism", () => {
  it("produces deep-equal packages for identical inputs", async () => {
    const build = () =>
      selectionOf([
        item("k1", "architecture", { sourceId: "s1" }),
        item("k2", "handbook", { sourceId: "s2" }),
        item("k3", "wiki", { sourceId: "s3" }),
      ]);

    const first = await engine.assemble(build(), GENERATED_AT);
    const second = await engine.assemble(build(), GENERATED_AT);
    expect(second).toEqual(first);
  });

  it("is stable across repeated runs on the same input", async () => {
    const selection = selectionOf([item("k2", "standard"), item("k1", "wiki")]);
    const first = await engine.assemble(selection, GENERATED_AT);
    const second = await engine.assemble(selection, GENERATED_AT);
    expect(second).toEqual(first);
  });
});

describe("assemble — immutability of the returned ContextPackage", () => {
  it("returns a deeply frozen ContextPackage", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture"), item("k2", "handbook")]),
      GENERATED_AT,
    );

    expect(Object.isFrozen(pkg)).toBe(true);
    expect(Object.isFrozen(pkg.sections)).toBe(true);
    expect(Object.isFrozen(pkg.references)).toBe(true);
    expect(Object.isFrozen(pkg.metadata)).toBe(true);
    expect(Object.isFrozen(pkg.sections[0])).toBe(true);
  });

  it("rejects mutation of the returned collections at runtime", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture")]),
      GENERATED_AT,
    );
    expect(() => {
      (pkg.references as unknown[]).push(pkg.references[0]);
    }).toThrow();
  });
});

describe("assemble — immutability of the input SelectionResult (by divergence)", () => {
  it("never mutates the input — reads order as given, diverges only in the output", async () => {
    // selectedItems are given in a non-sorted order; Assembly preserves that order
    // in references/referenceIds (RC-6) and leaves the frozen input untouched.
    const items = [
      item("k1", "handbook", { sourceId: "s3" }),
      item("k2", "handbook", { sourceId: "s1" }),
      item("k3", "handbook", { sourceId: "s2" }),
    ];
    const selection = selectionOf(items);

    const pkg = await engine.assemble(selection, GENERATED_AT);

    // Input order untouched; output mirrors that exact given order.
    expect(selection.selectedItems.map((i) => i.id)).toEqual(["k1", "k2", "k3"]);
    expect(Object.isFrozen(selection.selectedItems)).toBe(true);
    expect(section(pkg, "handbook-references")?.referenceIds).toEqual([
      "s3",
      "s1",
      "s2",
    ]);
  });

  it("consumes only selectedItems — excludedItems never enter assembly", async () => {
    // An excluded item whose source would otherwise create a reference must not
    // appear anywhere in the package.
    const excluded = item("x1", "wiki", { sourceId: "excluded-source" });
    const pkg = await engine.assemble(
      selectionOf([item("k1", "handbook", { sourceId: "included-source" })], {
        excludedItems: [excluded],
      }),
      GENERATED_AT,
    );

    expect(pkg.references.map((r) => r.id)).toEqual(["included-source"]);
    expect(pkg.references.some((r) => r.id === "excluded-source")).toBe(false);
  });
});

describe("assemble — conforms to the public ContextPackage contract", () => {
  it("produces a package that validates against the public schema", async () => {
    const pkg = await engine.assemble(
      selectionOf([
        item("k1", "architecture"),
        item("k2", "handbook"),
        item("k3", "source-code"),
      ]),
      GENERATED_AT,
    );
    expect(contextPackageSchema.safeParse(pkg).success).toBe(true);
  });

  it("round-trips through parseContextPackage unchanged", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture")]),
      GENERATED_AT,
    );
    expect(parseContextPackage(pkg)).toEqual(pkg);
  });

  it("exposes exactly the contract's top-level keys — no rendered or profile field", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture")]),
      GENERATED_AT,
    );
    expect(Object.keys(pkg).sort()).toEqual([
      "explainability",
      "metadata",
      "references",
      "sections",
      "summary",
    ]);
  });
});

describe("assemble — section content is the verbatim item bodies", () => {
  it("populates each knowledge-derived section with its item's body, verbatim", async () => {
    const pkg = await engine.assemble(
      selectionOf([
        item("k1", "architecture", { content: "arch body" }),
        item("k2", "handbook", { content: "handbook body" }),
        item("k3", "wiki", { content: "wiki body" }),
      ]),
      GENERATED_AT,
    );
    expect(section(pkg, "relevant-architecture")?.content).toBe("arch body");
    expect(section(pkg, "handbook-references")?.content).toBe("handbook body");
    expect(section(pkg, "wiki-references")?.content).toBe("wiki body");
  });

  it("concatenates multiple items routed to one section in canonical order, blank-line separated", async () => {
    const pkg = await engine.assemble(
      selectionOf([
        item("k1", "wiki", { sourceId: "w1", content: "first" }),
        item("k2", "wiki", { sourceId: "w2", content: "second" }),
      ]),
      GENERATED_AT,
    );
    const wiki = section(pkg, "wiki-references");
    expect(wiki?.content).toBe("first\n\nsecond");
    // Both distinct sources are still cited by the section.
    expect(wiki?.referenceIds).toEqual(["w1", "w2"]);
  });

  it("keeps the four Decision A sections empty even when knowledge carries bodies", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "wiki", { content: "wiki body" })]),
      GENERATED_AT,
    );
    for (const kind of ALWAYS_PRESENT_EMPTY_KINDS) {
      expect(section(pkg, kind)?.content).toBe("");
    }
  });

  it("computes no explainability — entries stay empty", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture"), item("k2", "handbook")]),
      GENERATED_AT,
    );
    expect(pkg.explainability.entries).toEqual([]);
    expect(pkg.explainability.summary).toBe("");
  });

  it("never surfaces collection errors — no errors field on the package", async () => {
    const pkg = await engine.assemble(
      selectionOf([item("k1", "architecture")]),
      GENERATED_AT,
    );
    expect("errors" in pkg).toBe(false);
  });
});
