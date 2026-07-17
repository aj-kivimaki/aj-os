/** Wiki Store contract and stores. */
export type { WikiStore, WikiLocation } from "./WikiStore.js";
export {
  createFilesystemWikiStore,
  WikiStoreError,
} from "./createFilesystemWikiStore.js";
export type { FilesystemWikiStoreOptions } from "./createFilesystemWikiStore.js";
