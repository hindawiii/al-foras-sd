// تخزين تفضيلات الضيف محليًا (بدون خادم).
// TODO: عند رجوع تسجيل الدخول، يمكن مزامنة هذه البيانات إلى جدول profiles.

const gid = () => localStorage.getItem("guest_id") || "anon";
const k = (key: string) => `guest_${gid()}_${key}`;

export const guestStorage = {
  set<T>(key: string, value: T) {
    try { localStorage.setItem(k(key), JSON.stringify(value)); } catch (e) { console.error("guestStorage.set", e); }
  },
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const v = localStorage.getItem(k(key));
      return v ? (JSON.parse(v) as T) : defaultValue;
    } catch (e) { console.error("guestStorage.get", e); return defaultValue; }
  },
  remove(key: string) { localStorage.removeItem(k(key)); },
  clear() {
    const prefix = `guest_${gid()}_`;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) localStorage.removeItem(key);
    });
    localStorage.removeItem("guest_id");
    localStorage.removeItem("guest_created");
    localStorage.removeItem("user");
  },
};
