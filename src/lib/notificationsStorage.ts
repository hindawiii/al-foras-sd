import { guestStorage } from "./guestStorage";
import { applicationsStore } from "./applicationsStorage";
import { SCHOLARSHIPS } from "./mockData";

export type NotifKind = "deadline" | "match" | "status" | "news";

export interface AppNotification {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  ts: number;
  actionTab?: "scholarships" | "jobs" | "news" | "applications" | "profile";
  url?: string;
}

const READ_KEY = "notifRead";

const daysLeft = (deadline?: string): number | null => {
  if (!deadline) return null;
  const d = new Date(deadline).getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86_400_000);
};

/** Builds the live notification feed from real local data (deadlines, statuses, matches). */
export const buildNotifications = (): AppNotification[] => {
  const out: AppNotification[] = [];
  const apps = applicationsStore.all();

  // 1) Deadline reminders for saved / applied items
  apps.forEach((a) => {
    const dl = daysLeft(a.deadline);
    if (dl === null) return;
    if (dl < 0) {
      out.push({
        id: `dl-past-${a.id}`,
        kind: "deadline",
        title: "انتهى الموعد النهائي",
        body: `${a.title} — أُغلق التقديم. راجع طلباتك واحذفها أو ابحث عن بديل.`,
        ts: new Date(a.deadline!).getTime(),
        actionTab: "applications",
        url: a.url,
      });
    } else if (dl <= 14) {
      out.push({
        id: `dl-${a.id}-${dl <= 3 ? "urgent" : "soon"}`,
        kind: "deadline",
        title: dl <= 3 ? "⏰ الموعد النهائي خلال أيام!" : "الموعد النهائي يقترب",
        body: `${a.title} — باقي ${dl} ${dl === 1 ? "يوم" : "يوم"} فقط${a.status === "saved" ? " ولم تُقدّم بعد." : "."}`,
        ts: Date.now() - dl * 1000,
        actionTab: "applications",
        url: a.url,
      });
    }
  });

  // 2) Status follow-ups
  apps
    .filter((a) => a.status === "applied")
    .slice(0, 3)
    .forEach((a) => {
      out.push({
        id: `st-${a.id}`,
        kind: "status",
        title: "متابعة طلب مُقدَّم",
        body: `${a.title} — حدّث حالة الطلب إن وصلك رد، وجهّز نفسك للمقابلة عبر محاكاة المقابلة في المستشار الذكي.`,
        ts: new Date(a.updatedAt).getTime(),
        actionTab: "applications",
      });
    });

  // 3) Matching scholarships not saved yet
  const savedIds = new Set(apps.map((a) => a.id));
  SCHOLARSHIPS.filter((s) => !savedIds.has(s.id))
    .slice(0, 3)
    .forEach((s, i) => {
      out.push({
        id: `mt-${s.id}`,
        kind: "match",
        title: "منحة تطابق ملفك",
        body: `${s.title} — ${(s as any).country ?? ""} ${(s as any).org ? `• ${(s as any).org}` : ""}`.trim(),
        ts: Date.now() - (i + 1) * 3_600_000,
        actionTab: "scholarships",
      });
    });

  return out.sort((a, b) => b.ts - a.ts).slice(0, 20);
};

const readIds = (): string[] => guestStorage.get<string[]>(READ_KEY, []) ?? [];

export const notificationsStore = {
  list(): (AppNotification & { read: boolean })[] {
    const read = new Set(readIds());
    return buildNotifications().map((n) => ({ ...n, read: read.has(n.id) }));
  },
  unreadCount(): number {
    return notificationsStore.list().filter((n) => !n.read).length;
  },
  markRead(id: string) {
    const cur = readIds();
    if (!cur.includes(id)) guestStorage.set(READ_KEY, [...cur, id]);
  },
  markAllRead() {
    guestStorage.set(READ_KEY, buildNotifications().map((n) => n.id));
  },
};

export const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.round(h / 24);
  return `قبل ${d} يوم`;
};