// تخزين تفضيلات الضيف محليًا (بدون خادم).
// القراءة/الكتابة تبقى متزامنة (localStorage) لكن كل شيء يُنسخ إلى IndexedDB
// عبر localForage مع نسخة احتياطية كاملة كل 24 ساعة.
import localforage from "localforage";

const mirror = localforage.createInstance({
  name: "al-foras",
  storeName: "guest_mirror",
  description: "IndexedDB mirror + daily backups for guest data",
});

const MIRROR_KEY = "mirror:v1";
const BACKUP_INDEX = "backups:index:v1";
const BACKUP_EVERY_MS = 24 * 60 * 60 * 1000;
const MAX_BACKUPS = 3;

const gid = () => localStorage.getItem("guest_id") || "anon";
const k = (key: string) => `guest_${gid()}_${key}`;

type Snapshot = Record<string, string>;

const snapshot = (): Snapshot => {
  const out: Snapshot = {};
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("guest_") || key.startsWith("foras-") || key === "guest_id" || key === "user") {
      const v = localStorage.getItem(key);
      if (v !== null) out[key] = v;
    }
  });
  return out;
};

let syncTimer: ReturnType<typeof setTimeout> | null = null;
const scheduleSync = () => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    mirror.setItem(MIRROR_KEY, snapshot()).catch((e) => console.error("guestStorage.mirror", e));
  }, 400);
};

export const guestStorage = {
  set<T>(key: string, value: T) {
    try { localStorage.setItem(k(key), JSON.stringify(value)); } catch (e) { console.error("guestStorage.set", e); }
    scheduleSync();
  },
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const v = localStorage.getItem(k(key));
      return v ? (JSON.parse(v) as T) : defaultValue;
    } catch (e) { console.error("guestStorage.get", e); return defaultValue; }
  },
  remove(key: string) { localStorage.removeItem(k(key)); scheduleSync(); },
  clear() {
    const prefix = `guest_${gid()}_`;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) localStorage.removeItem(key);
    });
    localStorage.removeItem("guest_id");
    localStorage.removeItem("guest_created");
    localStorage.removeItem("user");
    scheduleSync();
  },

  /** استرجاع أي مفاتيح مفقودة من IndexedDB (يُنفَّذ عند بدء التطبيق). */
  async hydrate(): Promise<void> {
    try {
      const saved = await mirror.getItem<Snapshot>(MIRROR_KEY);
      if (saved) {
        Object.entries(saved).forEach(([key, value]) => {
          if (localStorage.getItem(key) === null) {
            try { localStorage.setItem(key, value); } catch {}
          }
        });
      }
      // مزامنة أولية لتغطية البيانات القديمة الموجودة في localStorage فقط.
      await mirror.setItem(MIRROR_KEY, snapshot());
      await guestStorage.maybeBackup();
    } catch (e) {
      console.error("guestStorage.hydrate", e);
    }
  },

  /** نسخة احتياطية كاملة كل 24 ساعة (نُبقي آخر 3 نسخ). */
  async maybeBackup(): Promise<void> {
    try {
      const index = (await mirror.getItem<{ at: number; key: string }[]>(BACKUP_INDEX)) ?? [];
      const last = index[index.length - 1];
      if (last && Date.now() - last.at < BACKUP_EVERY_MS) return;
      const key = `backup:${new Date().toISOString()}`;
      await mirror.setItem(key, snapshot());
      const next = [...index, { at: Date.now(), key }];
      while (next.length > MAX_BACKUPS) {
        const old = next.shift();
        if (old) await mirror.removeItem(old.key);
      }
      await mirror.setItem(BACKUP_INDEX, next);
    } catch (e) {
      console.error("guestStorage.maybeBackup", e);
    }
  },

  /** استعادة أحدث نسخة احتياطية (للاستخدام اليدوي عند فقدان البيانات). */
  async restoreLatestBackup(): Promise<boolean> {
    try {
      const index = (await mirror.getItem<{ at: number; key: string }[]>(BACKUP_INDEX)) ?? [];
      const last = index[index.length - 1];
      if (!last) return false;
      const data = await mirror.getItem<Snapshot>(last.key);
      if (!data) return false;
      Object.entries(data).forEach(([key, value]) => {
        try { localStorage.setItem(key, value); } catch {}
      });
      return true;
    } catch (e) {
      console.error("guestStorage.restoreLatestBackup", e);
      return false;
    }
  },
};
