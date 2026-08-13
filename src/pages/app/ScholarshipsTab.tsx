import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ExternalLink, BadgeCheck, Search, Award, MapPin, Clock, Link2, Share2, Sparkles, Globe, Star, GraduationCap, Briefcase, ArrowLeft, Layers, List, Heart, X } from "lucide-react";
import { ScholarshipCard } from "@/components/foras/ScholarshipCard";
import { UniversitiesGuide } from "@/components/foras/UniversitiesGuide";
import { SCHOLARSHIPS, Scholarship, computeMatchScore } from "@/lib/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { nativeShare } from "@/lib/share";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsStore } from "@/lib/applicationsStorage";

export const ScholarshipsTab = () => {
  const { info: geo } = useGeolocation(true);
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [filter, setFilter] = useState<"arab" | "global">("arab");
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");

  // Filter by category, then prioritise scholarships in user's country
  const orderedDeck = useMemo(() => {
    const filtered = SCHOLARSHIPS.filter(s => s.category === filter);
    const country = (geo?.country || "").toLowerCase();
    if (!country) return filtered;
    const matches = filtered.filter(s =>
      s.country.toLowerCase().includes(country) || country.includes(s.country.toLowerCase())
    );
    const rest = filtered.filter(s => !matches.includes(s));
    return [...matches, ...rest];
  }, [geo?.country, filter]);

  const [deck, setDeck] = useState<Scholarship[]>(orderedDeck);
  const [detail, setDetail] = useState<Scholarship | null>(null);
  const [aiNotice, setAiNotice] = useState(false);
  const [uniOpen, setUniOpen] = useState(false);
  const [profile, setProfile] = useState<{ location?: string; skills?: string[]; interests?: string[] }>({});
  const { user } = useAuth();

  useEffect(() => {
    // Show once per session; auto-dismiss after 5s (per UX rule).
    const dismissedKey = "aiNoticeDismissed";
    if (sessionStorage.getItem(dismissedKey)) return;
    const showT = setTimeout(() => setAiNotice(true), 1200);
    const hideT = setTimeout(() => {
      setAiNotice(false);
      sessionStorage.setItem(dismissedKey, "1");
    }, 1200 + 5000);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  }, []);

  // Re-sort the deck when GPS resolves (only if user hasn't already swiped)
  useEffect(() => {
    setDeck(orderedDeck);
    // eslint-disable-next-line
  }, [orderedDeck.length, geo?.country, filter]);

  // Deep-link: open detail when ?scholarship=ID is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("scholarship");
    if (!id) return;
    const target = SCHOLARSHIPS.find(s => s.id === id);
    if (target) {
      setDetail(target);
      // Clean URL so it doesn't re-trigger
      const url = new URL(window.location.href);
      url.searchParams.delete("scholarship");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("location, skills, interests").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data as any); });
  }, [user]);

  const handleSwipe = async (dir: "left" | "right", s: Scholarship) => {
    if (dir === "right") {
      applicationsStore.upsertFromScholarship(s, "saved");
      toast.success(t("saved"));
    } else if (dir === "left") {
      toast(t("dismissed"), { description: s.title });
    }
    setDeck(prev => prev.slice(1));
  };

  const shareDetail = async () => {
    if (!detail) return;
    const origin = window.location.origin;
    await nativeShare({
      title: `الفرص — ${detail.title}`,
      text: `${detail.title} — ${detail.org} (${detail.country})`,
      url: `${origin}/?scholarship=${encodeURIComponent(detail.id)}`,
    });
  };

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-180px)] overflow-y-auto overscroll-contain pb-4">
      {/* Segmented filter — Arab vs Global */}
      <div className="mb-3 px-1">
        <div className="relative inline-flex w-full p-1 rounded-2xl bg-card/60 backdrop-blur-md border border-border overflow-hidden">
          {(["arab", "global"] as const).map((key) => {
            const active = filter === key;
            const isArab = key === "arab";
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`relative flex-1 z-10 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300
                  ${active
                    ? isArab
                      ? "bg-gold-gradient text-primary-foreground shadow-gold"
                      : "bg-gradient-to-r from-[hsl(210_70%_50%)] to-[hsl(220_60%_45%)] text-white shadow-[0_8px_24px_-8px_hsl(210_70%_50%/0.6)]"
                    : "text-muted-foreground hover:text-foreground"}`}
              >
                {isArab ? <Star className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {isArab ? t("filterArabScholarships") : t("filterGlobalScholarships")}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI matching notice — placed ABOVE the scholarship deck, below segmented filter */}
      <AnimatePresence>
        {aiNotice && (
          <motion.div
            initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
            className="mx-1 mb-3 glass border-gold rounded-2xl p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">AI</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-primary font-bold mb-0.5">{t("aiMatchBadge")}</p>
              <p className="text-sm text-foreground leading-snug">{t("aiMatchBody")}</p>
            </div>
            <button
              onClick={() => { setAiNotice(false); sessionStorage.setItem("aiNoticeDismissed", "1"); }}
              className="text-muted-foreground text-xs"
              aria-label="إغلاق"
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick access cards: Sudan universities + Jobs */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 mx-1">
        <button
          onClick={() => setUniOpen(true)}
          className="group relative overflow-hidden rounded-2xl p-3.5 bg-card/60 backdrop-blur-md border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all text-right flex flex-col items-start gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
            <GraduationCap className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm font-bold text-gold-gradient leading-tight">دليل الجامعات السودانية</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              16 جامعة · نسب القبول · تخصصات · تكاليف
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-1">
            اكتشف <ArrowLeft className="w-3 h-3" />
          </span>
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "jobs" } }))}
          className="group relative overflow-hidden rounded-2xl p-3.5 bg-card/60 backdrop-blur-md border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all text-right flex flex-col items-start gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210_70%_50%)] to-[hsl(220_60%_45%)] flex items-center justify-center shadow-[0_8px_24px_-8px_hsl(210_70%_50%/0.6)]">
            <Briefcase className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm font-bold bg-gradient-to-r from-[hsl(210_70%_60%)] to-[hsl(220_60%_55%)] bg-clip-text text-transparent leading-tight">
              فرص العمل
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              50+ موقع · فريلانسر · وظائف · تدريس أونلاين
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(210_70%_60%)] mt-1">
            اكتشف <ArrowLeft className="w-3 h-3" />
          </span>
        </button>
      </div>

      <div className="mb-3 px-1 text-[11px] text-muted-foreground flex items-center gap-1.5 leading-relaxed">
        <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span>{t("scholarshipsHint")}</span>
      </div>

      {/* View mode toggle: swipe deck vs vertical scrollable list */}
      <div className="mb-3 px-1 flex items-center gap-2">
        {([
          { key: "deck" as const, icon: Layers, label: isRtl ? "سحب" : "Swipe" },
          { key: "list" as const, icon: List, label: isRtl ? "قائمة" : "List" },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all
              ${viewMode === key
                ? "bg-primary/15 border-primary/50 text-primary"
                : "bg-card/50 border-border text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
        <span className={`text-[11px] text-muted-foreground ${isRtl ? "mr-auto" : "ml-auto"}`}>
          {deck.length} {isRtl ? "فرصة" : "results"}
        </span>
      </div>

      {viewMode === "list" ? (
        <div className="flex flex-col gap-2.5 px-1">
          {deck.length === 0 ? (
            <EmptyState t={t} onReload={() => setDeck(orderedDeck)} />
          ) : (
            deck.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setDetail(s)}
                className={`cursor-pointer rounded-2xl p-3.5 bg-card/50 backdrop-blur-md border transition-all hover:bg-primary/5
                  ${s.category === "arab" ? "border-primary/30 hover:border-primary/60" : "border-[hsl(210_70%_60%/0.35)] hover:border-[hsl(210_70%_60%/0.7)]"} ${alignClass}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-background/70 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                    <span>{s.flag}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary text-xs font-extrabold truncate">{s.org}</p>
                    <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{s.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{s.country}</span>
                      <span className="inline-flex items-center gap-1"><Award className="w-3 h-3 text-primary" />{s.amount}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-primary" />
                        {new Date(s.deadline).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 border border-primary/40 text-primary">
                      <Sparkles className="w-3 h-3" />{computeMatchScore(s, profile)}%
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSwipe("left", s); }}
                        className="w-8 h-8 rounded-full border border-destructive/40 hover:bg-destructive/10 flex items-center justify-center"
                        aria-label="dismiss"
                      >
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSwipe("right", s); }}
                        className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold"
                        aria-label="save"
                      >
                        <Heart className="w-3.5 h-3.5 text-primary-foreground fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
      <div className="relative flex-1 min-h-[560px]">
        {deck.length === 0 ? (
          <EmptyState t={t} onReload={() => setDeck(orderedDeck)} />
        ) : (
          deck.slice(0, 3).map((s, i) => (
            <ScholarshipCard
              key={s.id}
              scholarship={s}
              index={i}
              active={i === 0}
              matchScore={computeMatchScore(s, profile)}
              onSwipe={(d) => handleSwipe(d, s)}
              onTap={() => i === 0 && setDetail(s)}
            />
          ))
        )}
      </div>
      )}

      {viewMode === "deck" && (
        <p className="text-center text-muted-foreground pt-3 my-[10px] text-xs">
          {t("swipeHint")}
        </p>
      )}

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent side="bottom" className="bg-card border-gold/30 rounded-t-3xl max-h-[92vh] overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    {detail.verified && (
                      <span className="inline-flex items-center gap-1 bg-verified/15 border border-verified/40 text-verified px-2 py-1 rounded-full text-xs font-medium">
                        <BadgeCheck className="w-3.5 h-3.5" /> {t("verified")}
                      </span>
                    )}
                    {detail.manualReview && (
                      <span className="inline-flex items-center gap-1 bg-review/15 border border-review/40 text-review px-2 py-1 rounded-full text-xs">
                        <Search className="w-3.5 h-3.5" /> {t("manualReview")}
                      </span>
                    )}
                  </div>
                  <button onClick={shareDetail}
                    className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 flex items-center justify-center"
                    aria-label="مشاركة">
                    <Share2 className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <SheetTitle className={`${alignClass} font-display text-2xl text-gold-gradient`}>{detail.title}</SheetTitle>
                <p className={`text-primary text-sm ${alignClass}`}>{detail.org}</p>
              </SheetHeader>
              <div className="space-y-4 mt-6 pb-6">
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">{t("matchPercent")}</span>
                  <span className={`font-bold text-primary text-lg ${isRtl ? "mr-auto" : "ml-auto"}`}>{computeMatchScore(detail, profile)}%</span>
                </div>
                <p className="text-foreground leading-relaxed">{detail.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Detail icon={MapPin} label={t("country")} value={detail.country} />
                  <Detail icon={Award} label={t("amount")} value={detail.amount} />
                  <Detail icon={Clock} label={t("deadline")} value={new Date(detail.deadline).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")} />
                  <Detail icon={BadgeCheck} label={t("level")} value={detail.level} />
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Button asChild variant="luxe" size="lg" className="w-full">
                    <a
                      href={detail.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer external"
                      onClick={() => setDetail(null)}
                    >
                      <ExternalLink className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                      {t("applyOfficial")}
                    </a>
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    {t("applyOfficialNote")}
                  </p>
                </div>

                <div className="border-t border-border pt-3 mt-2">
                  <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Link2 className="w-3 h-3 text-primary" /> {t("sourceLink")}
                  </p>
                  <a href={detail.sourceUrl} target="_blank" rel="noopener noreferrer"
                    dir="ltr" className="text-xs text-primary hover:underline break-all block text-left">
                    {detail.sourceUrl}
                  </a>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <UniversitiesGuide open={uniOpen} onOpenChange={setUniOpen} />
    </div>
  );
};

const Detail = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="bg-background/40 border border-border rounded-xl p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
      <Icon className="w-3 h-3" />{label}
    </div>
    <p className="text-foreground font-medium">{value}</p>
  </div>
);
