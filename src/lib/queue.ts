import type { Report } from "./report";

const DB_NAME = "hlp";
const STORE = "outbox";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "ref" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const outbox = {
  add: (r: Report) => tx("readwrite", (s) => s.put(r)).then(() => undefined),
  remove: (ref: string) => tx("readwrite", (s) => s.delete(ref)).then(() => undefined),
  all: () => tx<Report[]>("readonly", (s) => s.getAll()),
  /** Leaves nothing behind for anyone who picks the phone up afterwards. */
  wipe: () => tx("readwrite", (s) => s.clear()).then(() => undefined),
};
