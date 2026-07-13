/** Wiki Store contract and stores. */
export type { WikiStore, WikiLocation } from "./WikiStore.js";
export {
  createFilesystemWikiStore,
  WikiStoreError,
} from "./FilesystemWikiStore.js";
export type { FilesystemWikiStoreOptions } from "./FilesystemWikiStore.js";
