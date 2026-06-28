// تخزين تفضيلات الضيف بشكل دائم (IndexedDB كمصدر أساسي + localStorage كنسخة احتياطية).
// يبقى محفوظًا على الجهاز حتى بعد إغلاق التطبيق أو إعادة فتح المتصفح.

import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys, createStore } from "idb-keyval";

const store = createStore("foras-guest-db", "guestStorage");
const gid = () => localStorage.getItem("guest_id") || "anon";
const k = (key: string) => `guest_${gid()}_${key}`;

// طلب تخزين دائم (يقلل احتمالية تنظيف المتصفح للبيانات تلقائيًا)
if (typeof navigator !== "undefined" && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

// Cache في الذاكرة لقراءة فورية متزامنة
const memCache = new Map<string, unknown>();

// تهيئة: نقرأ كل المفاتيح من IndexedDB إلى الذاكرة عند الإقلاع
const ready: Promise<void> = (async () => {
  try {
    const allKeys = await idbKeys(store);
    await Promise.all(
      allKeys.map(async (kk) => {
        const v = await idbGet(kk as string, store);
        if (v !== undefined) memCache.set(kk as string, v);
      }),
    );
  } catch (e) {
    console.warn("guestStorage: IndexedDB unavailable, falling back to localStorage", e);
  }
})();

export const guestStorageReady = ready;

export const guestStorage = {
  set<T>(key: string, value: T) {
    const full = k(key);
    memCache.set(full, value);
    try { localStorage.setItem(full, JSON.stringify(value)); } catch (e) { console.error("guestStorage.set/local", e); }
    idbSet(full, value, store).catch((e) => console.warn("guestStorage.set/idb", e));
  },
  get<T>(key: string, defaultValue: T | null = null): T | null {
    const full = k(key);
    if (memCache.has(full)) return memCache.get(full) as T;
    try {
      const v = localStorage.getItem(full);
      if (v) {
        const parsed = JSON.parse(v) as T;
        memCache.set(full, parsed);
        return parsed;
      }
    } catch (e) { console.error("guestStorage.get", e); }
    return defaultValue;
  },
  remove(key: string) {
    const full = k(key);
    memCache.delete(full);
    localStorage.removeItem(full);
    idbDel(full, store).catch(() => {});
  },
  clear() {
    const prefix = `guest_${gid()}_`;
    Array.from(memCache.keys()).forEach((kk) => { if (kk.startsWith(prefix)) memCache.delete(kk); });
    Object.keys(localStorage).forEach((key) => { if (key.startsWith(prefix)) localStorage.removeItem(key); });
    idbKeys(store).then((allKeys) =>
      Promise.all(allKeys.filter((kk) => String(kk).startsWith(prefix)).map((kk) => idbDel(kk as string, store))),
    ).catch(() => {});
    localStorage.removeItem("guest_id");
    localStorage.removeItem("guest_created");
    localStorage.removeItem("user");
  },
};
