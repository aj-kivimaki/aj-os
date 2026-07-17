/**
 * Shared error base tests (REX-502, F-060/F-063).
 *
 * Before M5, every domain error extended `Error` directly, so a friendly-message
 * path had to enumerate concrete classes — and F-060 proved that enumeration goes
 * stale. These pin the `AjError` base: `instanceof AjError` matches every domain
 * error, each concrete `instanceof` still holds (behaviour preserved), the `name`
 * is the concrete class, and `cause` is forwarded (F-063).
 */
import { describe, it, expect } from "vitest";

import { AjError } from "../../src/platform/AjError.js";
import { ConfigError } from "../../src/platform/config/index.js";
import { HandbookError } from "../../src/platform/handbook/index.js";

describe("AjError — the shared domain-error base", () => {
  it("matches concrete errors via instanceof AjError, without breaking their own instanceof", () => {
    const err = new ConfigError("bad config");
    expect(err).toBeInstanceOf(AjError); // the new capability (F-060)
    expect(err).toBeInstanceOf(ConfigError); // still holds — behaviour preserved
    expect(err).toBeInstanceOf(Error); // still an Error
  });

  it("does not match a plain Error (the base is not a catch-all for everything)", () => {
    expect(new Error("plain")).not.toBeInstanceOf(AjError);
  });

  it("reports the concrete subclass name", () => {
    expect(new ConfigError("x").name).toBe("ConfigError");
    expect(new HandbookError("x").name).toBe("HandbookError");
  });

  it("forwards `cause` so a wrapped underlying error is preserved (F-063)", () => {
    const underlying = new Error("disk full");
    const err = new ConfigError("could not load", { cause: underlying });
    expect(err.cause).toBe(underlying);
  });
});
