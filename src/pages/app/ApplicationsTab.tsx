import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, CheckCircle2, Trash2, FileText, ExternalLink, Trophy, XCircle,
  ClipboardList, StickyNote, Filter, Calendar, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsStore, type AppRecord, type AppStatus } from "@/lib/applicationsStorage";

const STATUS_META: Record<AppStatus, { label: { ar: string; en: string }; classes: string; icon: any }> = {
  saved:    { label: { ar: "محفوظة",   en: "Saved"    }, classes: "bg-primary/10 text-primary border-primary/30",              icon: Bookmark      },
  applied:  { label: { ar: "مُقدَّم",    en: "Applied"  }, classes: "bg-sky-500/15 text-sky-300 border-sky-500/30",              icon: CheckCircle2  },
  accepted: { label: { ar: "مقبول",    en: "Accepted" }, classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",  icon: Trophy        },
  rejected: { label: { ar: "مرفوض",    en: "Rejected" }, classes: "bg-rose-500/15 text-rose-400 border-rose-500/30",           icon: XCircle       },
};

const STATUS_ORDER: AppStatus[] = ["saved", "applied", "accepted", "rejected"];

export const ApplicationsTab = () => {
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [items, setItems] = useState<AppRecord[]>([]);
  const [filter, setFilter] = useState<AppStatus | "all">("all");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = () => setItems(applicationsStore.all());
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<AppStatus | "all", number> = { all: items.length, saved: 0, applied: 0, accepted: 0, rejected: 0 };
    items.forEach((i) => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  const setStatus = (id: string, status: AppStatus) => {
    applicationsStore.setStatus(id, status);
    load();
    toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated");
  };

  const remove = (id: string) => {
    applicationsStore.remove(id);
    load();
    toast.success(lang === "ar" ? "تم الحذف" : "Removed");
  };

  const openNote = (r: AppRecord) => {
    setEditingNote(r.id);
    setNoteDraft(r.notes ?? "");
  };
  const saveNote = (id: string) => {
    applicationsStore.setNotes(id, noteDraft.trim());
    setEditingNote(null);
    load();
    toast.success(lang === "ar" ? "تم حفظ الملاحظات" : "Notes saved");
  };

  const daysLeft = (deadline?: string): number | null => {
    if (!deadline) return null;
    const d = new Date(deadline).getTime();
    if (Number.isNaN(d)) return null;
    return Math.ceil((d - Date.now()) / 86400000);
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Header stats */}
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
            <ClipboardList className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <div className={`flex-1 ${isRtl ? "text-right" : "text-left"}`}>
            <h2 className="font-display text-lg text-gold-gradient leading-tight">
              {lang === "ar" ? "قائمة تحقق التقديم" : "Application Checklist"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {lang === "ar" ? "تابع حالة كل منحة من الحفظ إلى القبول" : "Track every scholarship from saved to accepted"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s];
            return (
              <div key={s} className={`rounded-xl border p-2 text-center ${meta.classes}`}>
                <div className="text-lg font-bold leading-none">{counts[s] ?? 0}</div>
                <div className="text-[10px] mt-1 opacity-90">{meta.label[lang as "ar" | "en"] ?? meta.label.en}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`flex items-center gap-2 overflow-x-auto no-scrollbar ${isRtl ? "justify-end" : "justify-start"}`}
      >
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        {(["all", ...STATUS_ORDER] as const).map((k) => {
          const active = filter === k;
          const label =
            k === "all"
              ? (lang === "ar" ? "الكل" : "All")
              : STATUS_META[k].label[lang as "ar" | "en"];
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                active
                  ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold"
                  : "bg-card/40 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label} · {counts[k] ?? 0}
            </button>
          );
        })}
      </div>

      {/* List / empty */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-card-gradient border-gold flex items-center justify-center">
            <Bookmark className="w-10 h-10 text-primary" strokeWidth={1.3} />
          </div>
          <h3 className="font-display text-xl text-gold-gradient mb-2">
            {lang === "ar" ? "لا توجد طلبات بعد" : "No applications yet"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {lang === "ar"
              ? "اسحب منحة إلى اليمين في تبويب المنح لتظهر هنا."
              : "Swipe a scholarship right on the Scholarships tab to see it here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((r, i) => {
              const meta = STATUS_META[r.status];
              const Icon = meta.icon;
              const dl = daysLeft(r.deadline);
              const isEditing = editingNote === r.id;
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card-gradient border border-border rounded-2xl p-4 backdrop-blur-md"
                >
                  <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.classes}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-base text-foreground line-clamp-2">{r.title}</h4>
                      {r.org && <p className="text-xs text-primary/90 font-semibold mt-0.5 truncate">{r.org}</p>}
                      <div className={`flex flex-wrap items-center gap-2 mt-2 ${isRtl ? "justify-end" : ""}`}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.classes}`}>
                          {meta.label[lang as "ar" | "en"]}
                        </span>
                        {dl !== null && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            dl < 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : dl <= 14 ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-muted/40 text-muted-foreground border-border"
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {dl < 0
                              ? (lang === "ar" ? "انتهت" : "Closed")
                              : (lang === "ar" ? `متبقٍ ${dl} يوم` : `${dl} days left`)}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(r.updatedAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status pills */}
                  <div className={`flex flex-wrap gap-1.5 mt-3 ${isRtl ? "justify-end" : ""}`}>
                    {STATUS_ORDER.map((s) => {
                      const on = r.status === s;
                      const m = STATUS_META[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setStatus(r.id, s)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            on ? `${m.classes} scale-105` : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {m.label[lang as "ar" | "en"]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Notes */}
                  {isEditing ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder={lang === "ar" ? "متطلبات، مستندات، ملاحظات..." : "Requirements, docs, notes..."}
                        className="min-h-24 bg-background/60 border-border text-sm"
                        dir={isRtl ? "rtl" : "ltr"}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="luxe" className="flex-1" onClick={() => saveNote(r.id)}>
                          <Sparkles className={`w-3.5 h-3.5 ${isRtl ? "ml-1" : "mr-1"}`} />
                          {lang === "ar" ? "حفظ" : "Save"}
                        </Button>
                        <Button size="sm" variant="ghostGold" onClick={() => setEditingNote(null)}>
                          {lang === "ar" ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  ) : r.notes ? (
                    <button
                      onClick={() => openNote(r)}
                      className={`mt-3 w-full text-xs text-muted-foreground bg-background/40 border border-border/60 rounded-xl p-2.5 hover:border-primary/40 transition-colors ${isRtl ? "text-right" : "text-left"}`}
                    >
                      <span className="inline-flex items-center gap-1 text-primary/90 font-bold mb-1">
                        <StickyNote className="w-3 h-3" />
                        {lang === "ar" ? "ملاحظاتي" : "My notes"}
                      </span>
                      <p className="line-clamp-2 whitespace-pre-wrap">{r.notes}</p>
                    </button>
                  ) : null}

                  {/* Actions */}
                  <div className={`flex gap-2 mt-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                    {r.url && (
                      <Button
                        size="sm"
                        variant="luxe"
                        className="flex-1"
                        onClick={() => window.open(r.url, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className={`w-3.5 h-3.5 ${isRtl ? "ml-1" : "mr-1"}`} />
                        {lang === "ar" ? "فتح المصدر" : "Open source"}
                      </Button>
                    )}
                    {!isEditing && (
                      <Button size="sm" variant="ghostGold" onClick={() => openNote(r)}>
                        <StickyNote className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghostGold" onClick={() => remove(r.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
