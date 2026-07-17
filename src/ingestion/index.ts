/** Ingestion contracts and connectors. */
export type { SourceConnector, SourceRecord } from "./SourceConnector.js";
export {
  createFilesystemSourceConnector,
  SourceConnectorError,
} from "./createFilesystemSourceConnector.js";
export type { FilesystemSourceConnectorOptions } from "./createFilesystemSourceConnector.js";
