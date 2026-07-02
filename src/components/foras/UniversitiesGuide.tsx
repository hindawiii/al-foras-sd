import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, MapPin, ExternalLink, Search, Building2, Filter, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SUDAN_UNIVERSITIES,
  CITY_LIST,
  FACULTY_LIST,
  type SudanUniversity,
  type UniType,
} from "@/lib/sudanUniversities";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** User's exam percentage — used to highlight universities they qualify for. */
  userPercentage?: number;
}

const typeLabel: Record<UniType, string> = {
  government: "حكومية",
  private: "خاصة",
  technical: "تقنية",
};

const typeBadgeClass: Record<UniType, string> = {
  government: "bg-primary/15 text-primary border-primary/40",
  private: "bg-amber-500/15 text-amber-500 border-amber-500/40",
  technical: "bg-blue-500/15 text-blue-400 border-blue-500/40",
};

export const UniversitiesGuide = ({ open, onOpenChange, userPercentage }: Props) => {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [type, setType] = useState<UniType | "">("");

  const filtered = useMemo<SudanUniversity[]>(() => {
    const term = q.trim();
    return SUDAN_UNIVERSITIES.filter((u) => {
      if (city && u.city !== city) return false;
      if (type && u.type !== type) return false;
      if (faculty && !u.faculties.includes(faculty)) return false;
      if (!term) return true;
      const hay = `${u.name} ${u.nameEn} ${u.city} ${u.faculties.join(" ")}`.toLowerCase();
      return hay.includes(term.toLowerCase());
    }).sort((a, b) => {
      // If user has a percentage, put qualifying schools first.
      if (userPercentage) {
        const aOk = userPercentage >= a.minPercentage ? 0 : 1;
        const bOk = userPercentage >= b.minPercentage ? 0 : 1;
        if (aOk !== bOk) return aOk - bOk;
      }
      return b.minPercentage - a.minPercentage;
    });
  }, [q, city, faculty, type, userPercentage]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-card border-gold/30 rounded-t-3xl max-h-[92vh] overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <GraduationCap className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            </div>
            <div className="text-right flex-1">
              <SheetTitle className="text-right font-display text-xl text-gold-gradient">
                دليل الجامعات السودانية
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SUDAN_UNIVERSITIES.length} جامعة — مرتبة حسب متطلبات القبول
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Filters */}
        <div className="space-y-2.5 mt-3 pb-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث باسم الجامعة، مدينة، أو تخصص…"
              className="pr-10 text-right bg-background/40 border-border"
              dir="rtl"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 min-w-[110px] h-9 rounded-lg bg-background/40 border border-border text-xs px-2 text-right"
              dir="rtl"
            >
              <option value="">كل المدن</option>
              {CITY_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="flex-1 min-w-[110px] h-9 rounded-lg bg-background/40 border border-border text-xs px-2 text-right"
              dir="rtl"
            >
              <option value="">كل التخصصات</option>
              {FACULTY_LIST.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as UniType | "")}
              className="flex-1 min-w-[100px] h-9 rounded-lg bg-background/40 border border-border text-xs px-2 text-right"
              dir="rtl"
            >
              <option value="">كل الأنواع</option>
              <option value="government">حكومية</option>
              <option value="private">خاصة</option>
              <option value="technical">تقنية</option>
            </select>
          </div>

          {(q || city || faculty || type) && (
            <button
              onClick={() => { setQ(""); setCity(""); setFaculty(""); setType(""); }}
              className="text-[11px] text-primary flex items-center gap-1 hover:underline"
            >
              <Filter className="w-3 h-3" />
              مسح كل الفلاتر
            </button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-3 mt-2 pb-8">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              لا توجد جامعات تطابق البحث
            </div>
          )}

          {filtered.map((u, i) => {
            const qualifies = userPercentage ? userPercentage >= u.minPercentage : null;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="bg-background/40 border border-border hover:border-primary/40 rounded-2xl p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 text-right">
                    <h4 className="font-display text-base text-gold-gradient leading-tight">
                      {u.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5" dir="ltr">
                      {u.nameEn} · {u.founded}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${typeBadgeClass[u.type]}`}
                  >
                    {typeLabel[u.type]}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> {u.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-primary" /> {u.faculties.length} كلية
                  </span>
                </div>

                <p className="text-xs text-foreground/85 leading-relaxed mb-2.5 text-right">
                  {u.highlights}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {u.faculties.slice(0, 6).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 border border-primary/25 text-foreground/80"
                    >
                      {f}
                    </span>
                  ))}
                  {u.faculties.length > 6 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground">
                      +{u.faculties.length - 6}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">أقل نسبة قبول تقريبية</p>
                    <p className={`text-sm font-bold ${
                      qualifies === true ? "text-emerald-400"
                      : qualifies === false ? "text-muted-foreground"
                      : "text-primary"
                    }`}>
                      {u.minPercentage}%
                      {qualifies === true && (
                        <span className="mr-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-400">
                          <Sparkles className="w-3 h-3" /> مؤهل
                        </span>
                      )}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="luxe">
                    <a href={u.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      الموقع الرسمي
                    </a>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed pb-4">
          البيانات إرشادية — راجع الموقع الرسمي لكل جامعة للحصول على أحدث متطلبات القبول والرسوم.
        </p>
      </SheetContent>
    </Sheet>
  );
};
