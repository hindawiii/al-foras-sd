import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ExternalLink, BadgeCheck, Search, Award, MapPin, Clock, Link2, Share2, Sparkles, Globe, Star, GraduationCap } from "lucide-react";
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

export const ScholarshipsTab = () => {
  const { info: geo } = useGeolocation(true);
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [filter, setFilter] = useState<"arab" | "global">("arab");

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
    const t = setTimeout(() => setAiNotice(true), 4000);
    return () => clearTimeout(t);
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
    if (dir === "right" && user) {
      await supabase.from("saved_scholarships").upsert({
        user_id: user.id, scholarship_id: s.id, scholarship_title: s.title,
        scholarship_data: s as any, status: "saved",
      }, { onConflict: "user_id,scholarship_id" });
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
    <div className="relative h-[calc(100vh-180px)] flex flex-col">
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

      {/* Sudan universities guide entry */}
      <button
        onClick={() => setUniOpen(true)}
        className="mb-3 mx-1 w-[calc(100%-0.5rem)] flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all text-right"
      >
        <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
          <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gold-gradient leading-tight">دليل الجامعات السودانية</p>
          <p className="text-[11px] text-muted-foreground">جامعات، تخصصات، ونسب القبول</p>
        </div>
        <ExternalLink className="w-4 h-4 text-primary" />
      </button>

      <div className="mb-3 px-1 text-[11px] text-muted-foreground flex items-center gap-1.5 leading-relaxed">
        <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span>{t("scholarshipsHint")}</span>
      </div>

      <AnimatePresence>
        {aiNotice && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="mx-1 mb-3 glass border-gold rounded-2xl p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">AI</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-primary font-bold mb-0.5">{t("aiMatchBadge")}</p>
              <p className="text-sm text-foreground leading-snug">
                {t("aiMatchBody")}
              </p>
            </div>
            <button onClick={() => setAiNotice(false)} className="text-muted-foreground text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1">
        {deck.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-3xl bg-card-gradient border-gold flex items-center justify-center mb-6">
              <Award className="w-12 h-12 text-primary" strokeWidth={1.2} />
            </div>
            <h3 className="font-display text-2xl text-gold-gradient mb-2">{t("noScholarshipsCategory")}</h3>
            <p className="text-muted-foreground mb-6">{t("noMoreScholarshipsDesc")}</p>
            <Button variant="luxe" onClick={() => setDeck(orderedDeck)}>{t("reload")}</Button>
          </div>
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

      <p className="text-center text-muted-foreground pt-3 my-[10px] text-xs">
        {t("swipeHint")}
      </p>

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
