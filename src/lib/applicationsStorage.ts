import { guestStorage } from "./guestStorage";
import type { Scholarship } from "./mockData";

export type AppStatus = "saved" | "applied" | "accepted" | "rejected";

export interface AppRecord {
  id: string;                // scholarship id
  title: string;
  org?: string;
  country?: string;
  deadline?: string;
  url?: string;
  status: AppStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  data?: Partial<Scholarship>;
}

const KEY = "applications";

export const applicationsStore = {
  all(): AppRecord[] {
    return guestStorage.get<AppRecord[]>(KEY, []) ?? [];
  },
  save(rec: Omit<AppRecord, "createdAt" | "updatedAt"> & Partial<Pick<AppRecord, "createdAt" | "updatedAt">>) {
    const list = applicationsStore.all();
    const now = new Date().toISOString();
    const existing = list.find((x) => x.id === rec.id);
    if (existing) {
      Object.assign(existing, rec, { updatedAt: now });
    } else {
      list.unshift({ ...rec, createdAt: now, updatedAt: now });
    }
    guestStorage.set(KEY, list);
    return list;
  },
  upsertFromScholarship(s: Scholarship, status: AppStatus = "saved", extra?: Partial<AppRecord>) {
    return applicationsStore.save({
      id: s.id,
      title: s.title,
      org: (s as any).org,
      country: (s as any).country,
      deadline: (s as any).deadline,
      url: (s as any).url ?? (s as any).sourceUrl,
      status,
      data: s,
      ...extra,
    });
  },
  setStatus(id: string, status: AppStatus) {
    const list = applicationsStore.all();
    const r = list.find((x) => x.id === id);
    if (r) { r.status = status; r.updatedAt = new Date().toISOString(); guestStorage.set(KEY, list); }
    return list;
  },
  setNotes(id: string, notes: string) {
    const list = applicationsStore.all();
    const r = list.find((x) => x.id === id);
    if (r) { r.notes = notes; r.updatedAt = new Date().toISOString(); guestStorage.set(KEY, list); }
    return list;
  },
  remove(id: string) {
    const list = applicationsStore.all().filter((x) => x.id !== id);
    guestStorage.set(KEY, list);
    return list;
  },
  clear() {
    guestStorage.set(KEY, []);
  },
};
