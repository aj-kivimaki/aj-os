/**
 * Shared test support for the End-of-Session contract suites (EOS-007).
 *
 * Intentionally minimal — a single cross-cutting inspector, not a factory library.
 * Per the module's test convention, each suite keeps its own inline `valid*`
 * fixtures; only the deep-immutability check, which was duplicated as ad-hoc nested
 * `Object.isFrozen` assertions across every contract suite, is consolidated here.
 *
 * The helper is a **pure inspector** (it makes no assertions itself), so call sites
 * keep a visible `expect(firstUnfrozenPath(x)).toBeNull()` — the assertion stays in
 * the test where tooling and readers expect it, and a failure names the exact path
 * that was not frozen.
 */

/**
 * Return the dotted path of the first value that is **not** frozen when walking a
 * value and every nested plain object and array, or `null` when the value is deeply
 * immutable. Primitives and functions are skipped — they are never expected to be
 * frozen (and are not the contract data these suites pin).
 *
 * @example
 * expect(firstUnfrozenPath(parseSession(input))).toBeNull();
 */
export function firstUnfrozenPath(value: unknown, path = "value"): string | null {
  if (value === null || typeof value !== "object") return null;

  if (!Object.isFrozen(value)) return path;

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      const unfrozen = firstUnfrozenPath(value[index], `${path}[${index}]`);
      if (unfrozen !== null) return unfrozen;
    }
    return null;
  }

  for (const [key, nested] of Object.entries(value)) {
    const unfrozen = firstUnfrozenPath(nested, `${path}.${key}`);
    if (unfrozen !== null) return unfrozen;
  }
  return null;
}
