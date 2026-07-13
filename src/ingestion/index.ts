/** Ingestion contracts and connectors. */
export type { SourceConnector, SourceRecord } from "./SourceConnector.js";
export {
  createFilesystemSourceConnector,
  SourceConnectorError,
} from "./FilesystemSourceConnector.js";
export type { FilesystemSourceConnectorOptions } from "./FilesystemSourceConnector.js";
