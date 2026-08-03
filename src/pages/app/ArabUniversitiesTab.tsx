import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Search, ExternalLink, MapPin, Languages as LangIcon,
  Award, CheckCircle2, SlidersHorizontal, Building2,
} from "lucide-react";
import { ARAB_UNIVERSITIES, ARAB_COUNTRIES, ARAB_FACULTIES, type ArabUniversity } from "@/lib/arabUniversities";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const PCT_KEY = "foras-student-percentage";

export const ArabUniversitiesTab = () => {
  const { lang, t } = useLanguage();
  const ar = lang === "ar";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<string | null>(null);
  const [pct, setPct] = useState(() => localStorage.getItem(PCT_KEY) ?? "");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [selected, setSelected] = useState<ArabUniversity | null>(null);

  const percentage = Number(pct);
  const hasPct = pct !== "" && !Number.isNaN(percentage);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = ARAB_UNIVERSITIES.filter((u) => {
      if (country && u.country !== country) return false;
      if (faculty && !u.faculties.includes(faculty)) return false;
      if (q && !`${u.name} ${u.nameEn} ${u.city} ${u.country} ${u.countryEn}`.toLowerCase().includes(q)) return false;
      if (eligibleOnly && hasPct && percentage < u.minPercentage) return false;
      return true;
    });
    if (hasPct) {
      items = [...items].sort((a, b) => {
        const ea = percentage >= a.minPercentage ? 0 : 1;
        const eb = percentage >= b.minPercentage ? 0 : 1;
        return ea - eb || b.minPercentage - a.minPercentage;
      });
    }
    return items;
  }, [query, country, faculty, eligibleOnly, hasPct, percentage]);

  const eligibleCount = hasPct
    ? ARAB_UNIVERSITIES.filter((u) => percentage >= u.minPercentage).length
    : 0;

  const langLabel = (l: ArabUniversity["language"]) =>
    l === "ar" ? (ar ? "عربي" : "Arabic") : l === "en" ? (ar ? "إنجليزي" : "English") : (ar ? "عربي/إنجليزي" : "Arabic/English");

  return (
    <div className="space-y-4 pb-24">
      <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-4">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">{t("arabUniTitle")}</h1>
        </div>
        <p className="text-xs text-muted-foreground">{t("arabUniSubtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("arabUniSearch")}
          className="w-full h-11 ps-9 pe-3 rounded-xl bg-card border border-primary/20 focus:border-primary outline-none text-sm text-foreground"
        />
      </div>

      {/* Smart matching */}
      <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{t("arabUniMatchTitle")}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} max={100} inputMode="decimal"
            value={pct}
            onChange={(e) => { setPct(e.target.value); localStorage.setItem(PCT_KEY, e.target.value); }}
            placeholder={t("arabUniPctPlaceholder")}
            className="w-28 h-10 px-3 rounded-xl bg-background border border-primary/20 focus:border-primary outline-none text-sm text-foreground"
          />
          <button
            onClick={() => setEligibleOnly((v) => !v)}
            disabled={!hasPct}
            className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 ${
              eligibleOnly ? "bg-primary/20 border-primary text-primary" : "bg-background border-primary/20 text-muted-foreground"
            }`}
          >
            {t("arabUniEligibleOnly")}
          </button>
        </div>
        {hasPct && (
          <p className="text-xs text-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("arabUniEligibleCount").replace("{n}", String(eligibleCount))}
          </p>
        )}
      </div>

      {/* Country chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => setCountry(null)}
          className={`shrink-0 h-9 px-3 rounded-full text-xs font-bold border ${country === null ? "bg-primary/20 border-primary text-primary" : "bg-card border-primary/20 text-muted-foreground"}`}>
          {t("arabUniAllCountries")}
        </button>
        {ARAB_COUNTRIES.map((c) => (
          <button key={c.country} onClick={() => setCountry(country === c.country ? null : c.country)}
            className={`shrink-0 h-9 px-3 rounded-full text-xs font-bold border flex items-center gap-1.5 ${country === c.country ? "bg-primary/20 border-primary text-primary" : "bg-card border-primary/20 text-muted-foreground"}`}>
            <span>{c.flag}</span>{ar ? c.country : c.countryEn}
          </button>
        ))}
      </div>

      {/* Faculty chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => setFaculty(null)}
          className={`shrink-0 h-8 px-3 rounded-full text-[11px] border ${faculty === null ? "bg-primary/15 border-primary/60 text-primary" : "bg-card border-primary/15 text-muted-foreground"}`}>
          {t("arabUniAllFaculties")}
        </button>
        {ARAB_FACULTIES.slice(0, 24).map((f) => (
          <button key={f} onClick={() => setFaculty(faculty === f ? null : f)}
            className={`shrink-0 h-8 px-3 rounded-full text-[11px] border ${faculty === f ? "bg-primary/15 border-primary/60 text-primary" : "bg-card border-primary/15 text-muted-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t("arabUniResults").replace("{n}", String(list.length))}
      </p>

      {/* Cards */}
      <div className="space-y-3">
        {list.map((u, i) => {
          const eligible = hasPct && percentage >= u.minPercentage;
          return (
            <motion.button
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => setSelected(u)}
              className="w-full text-start rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-4 hover:border-primary/60 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xl">
                  {u.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-primary truncate">{ar ? u.name : u.nameEn}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{u.city} · {ar ? u.country : u.countryEn}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      {u.type === "government" ? t("arabUniGov") : t("arabUniPrivate")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-primary/10 text-muted-foreground flex items-center gap-1">
                      <LangIcon className="w-3 h-3" />{langLabel(u.language)}
                    </span>
                    {u.scholarships && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center gap-1">
                        <Award className="w-3 h-3" />{t("arabUniHasScholarships")}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${eligible ? "bg-primary/20 border-primary text-primary" : "bg-muted/30 border-primary/10 text-muted-foreground"}`}>
                      {t("arabUniMin")} {u.minPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
        {list.length === 0 && (
          <div className="rounded-2xl border border-primary/15 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            {t("arabUniEmpty")}
          </div>
        )}
      </div>

      {/* Details sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-primary text-start flex items-center gap-2">
                  <span className="text-2xl">{selected.flag}</span>
                  {ar ? selected.name : selected.nameEn}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4 text-start">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ar ? selected.highlights : selected.highlightsEn}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                    <p className="text-muted-foreground">{t("arabUniCity")}</p>
                    <p className="text-foreground font-bold mt-1">{selected.city}</p>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                    <p className="text-muted-foreground">{t("arabUniMin")}</p>
                    <p className="text-foreground font-bold mt-1">{selected.minPercentage}%</p>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                    <p className="text-muted-foreground">{t("arabUniType")}</p>
                    <p className="text-foreground font-bold mt-1">
                      {selected.type === "government" ? t("arabUniGov") : t("arabUniPrivate")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                    <p className="text-muted-foreground">{t("arabUniLanguage")}</p>
                    <p className="text-foreground font-bold mt-1">{langLabel(selected.language)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                    <Building2 className="w-4 h-4 text-primary" />{t("arabUniFaculties")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.faculties.map((f) => (
                      <span key={f} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{f}</span>
                    ))}
                  </div>
                </div>
                <a href={selected.website} target="_blank" rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-gold-gradient text-background font-bold flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />{t("arabUniVisit")}
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ArabUniversitiesTab;
