/**
 * Immutability primitives shared by the End-of-Session contracts.
 *
 * Every contract in this module is validated then made deeply immutable, so the
 * runtime value can never drift from its `DeepReadonly` type. This helper is the
 * module-internal home for that mechanism (the End-of-Session analogue of the
 * Context Builder's `deepFreeze`/`DeepReadonly`), shared by the contract schemas
 * rather than copied into each. It is not part of the public contract surface.
 */

/** Recursively marks every property, array, and nested value as `readonly`. */
export type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

/**
 * Recursively freeze a value, returning it typed as deeply immutable, so a parsed
 * contract is immutable at runtime as well as in the types.
 */
export function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value as DeepReadonly<T>;
}
