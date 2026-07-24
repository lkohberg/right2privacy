// Browser-only IndexedDB storage for the user's RSA private key.
// Keyed by user id so multiple accounts on one browser don't clash.

import {
  importPrivateKeyRaw,
  exportPrivateKeyRaw,
} from "./crypto";

const DB_NAME = "r2p_keystore";
const STORE = "keys";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePrivateKey(userId: string, key: CryptoKey): Promise<void> {
  const pkcs8 = await exportPrivateKeyRaw(key);
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(pkcs8, userId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPrivateKey(userId: string): Promise<CryptoKey | null> {
  const db = await open();
  const pkcs8 = await new Promise<ArrayBuffer | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(userId);
    req.onsuccess = () => resolve(req.result as ArrayBuffer | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!pkcs8) return null;
  return importPrivateKeyRaw(pkcs8);
}

export async function clearPrivateKey(userId: string): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(userId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}