// Public surface of the config platform capability. Explicit named re-exports,
// not a wildcard: the barrel names exactly what consumers may import (REX-302, F-037).
export type { AjConfig } from "./types.js";
export { ConfigService, ConfigError } from "./ConfigService.js";
