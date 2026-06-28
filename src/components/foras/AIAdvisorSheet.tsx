import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Loader2, AlertTriangle, UserCog } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { guestStorage } from "@/lib/guestStorage";
import { SCHOLARSHIPS, type Scholarship } from "@/lib/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { ENV } from "@/lib/env";

interface Profile {
  full_name?: string; bio?: string; education?: string; location?: string;
  skills?: string[]; interests?: string[]; gpa?: string; avatar_url?: string;
}

type Mode = "scholarship-match" | "general";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  scholarship?: Scholarship | null;
}

const STR = {
  ar: {
    titleMatch: "مستشار الفرص الذكي",
    titleGeneral: "مستشار الفرص الذكي",
    subMatch: "مطابقة ملفك مع متطلبات هذه المنحة",
    subGeneral: "استشارة أكاديمية عامة وتوصيات مخصّصة",
    askPlaceholder: "اسأل المستشار أو اطلب توصيات…",
    send: "إرسال",
    matchNow: "ابدأ المطابقة الآن",
    suggest: "اقترح لي أفضل ٣ منح تناسب ملفي",
    incomplete: "ملفك الشخصي غير مكتمل",
    incompleteDesc: "لتقديم تحليل دقيق، نحتاج بعض البيانات الأساسية (التعليم، المهارات، الموقع، الاهتمامات).",
    completeNow: "أكمل ملفك الشخصي الآن",
    thinking: "جاري التحليل…",
    error: "تعذّر الوصول إلى المستشار. حاول مرة أخرى.",
    poweredBy: "مدعوم بالذكاء الاصطناعي",
  },
  en: {
    titleMatch: "Al-Foras AI Advisor",
    titleGeneral: "Al-Foras AI Advisor",
    subMatch: "Match your profile with this scholarship's requirements",
    subGeneral: "General academic consultation and tailored recommendations",
    askPlaceholder: "Ask the advisor or request recommendations…",
    send: "Send",
    matchNow: "Start matching now",
    suggest: "Recommend the top 3 scholarships for my profile",
    incomplete: "Your profile is incomplete",
    incompleteDesc: "For accurate analysis, we need a few basics (education, skills, location, interests).",
    completeNow: "Complete your profile now",
    thinking: "Analyzing…",
    error: "Could not reach the advisor. Please try again.",
    poweredBy: "AI-powered",
  },
} as const;

const isProfileComplete = (p: Profile | null): boolean => {
  if (!p) return false;
  const filled = [p.full_name, p.education, p.location].filter((v) => v && String(v).trim()).length;
  const hasSkills = (p.skills?.length ?? 0) > 0;
  const hasInterests = (p.interests?.length ?? 0) > 0;
  return filled >= 2 && (hasSkills || hasInterests);
};

export const AIAdvisorSheet = ({ open, onOpenChange, mode, scholarship }: Props) => {
  const { lang, dir } = useLanguage();
  const s = STR[lang];
  const isRtl = dir === "rtl";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const p = guestStorage.get<Profile>("profile");
    setProfile(p);
    setResponse("");
    setError(null);
  }, [open, mode, scholarship?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [response]);

  const ask = async (userQuestion?: string) => {
    if (!ENV.SUPABASE_URL) { setError(s.error); return; }
    setLoading(true); setError(null); setResponse("");
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch(`${ENV.SUPABASE_URL}/functions/v1/ai-advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          lang,
          profile: profile ?? {},
          scholarship: mode === "scholarship-match" ? scholarship : undefined,
          allScholarships: mode === "general" ? SCHOLARSHIPS : undefined,
          userQuestion,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        if (res.status === 429) throw new Error(lang === "ar" ? "تم تجاوز الحد المسموح، حاول لاحقًا." : "Rate limit exceeded, try again later.");
        if (res.status === 402) throw new Error(lang === "ar" ? "نفدت رصيد الذكاء الاصطناعي." : "AI credits exhausted.");
        throw new Error(s.error);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setResponse(acc);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || s.error);
    } finally {
      setLoading(false);
    }
  };

  const goToProfile = () => {
    onOpenChange(false);
    window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "profile" } }));
  };

  const complete = isProfileComplete(profile);
  const title = mode === "scholarship-match" ? s.titleMatch : s.titleGeneral;
  const sub = mode === "scholarship-match" ? s.subMatch : s.subGeneral;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[92vh] flex flex-col p-0 border-t border-primary/40
                   bg-gradient-to-b from-card/95 to-background/95 backdrop-blur-2xl
                   shadow-[0_-20px_60px_-20px_hsl(43_74%_45%/0.45)]"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gold-gradient" />
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-3" dir={dir}>
            <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <SheetTitle className="font-display text-xl text-gold-gradient">{title}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
          {mode === "scholarship-match" && scholarship && (
            <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs text-foreground" dir={dir}>
              <span className="text-primary font-bold">{scholarship.org}</span> — {scholarship.title}
            </div>
          )}
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4" dir={dir}>
          {!complete && !response && !loading && (
            <div className="mt-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 flex flex-col items-start gap-3">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold">{s.incomplete}</span>
              </div>
              <p className="text-sm text-foreground/90">{s.incompleteDesc}</p>
              <Button variant="luxe" onClick={goToProfile} className="self-stretch">
                <UserCog className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                {s.completeNow}
              </Button>
            </div>
          )}

          {complete && !response && !loading && !error && (
            <div className="mt-2 flex flex-col gap-2">
              {mode === "scholarship-match" ? (
                <Button variant="luxe" size="lg" onClick={() => ask()}>
                  <Sparkles className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {s.matchNow}
                </Button>
              ) : (
                <Button variant="luxe" size="lg" onClick={() => ask(s.suggest)}>
                  <Sparkles className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {s.suggest}
                </Button>
              )}
            </div>
          )}

          {loading && !response && (
            <div className="mt-6 flex items-center justify-center gap-2 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">{s.thinking}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/40 text-sm text-destructive">
              {error}
            </div>
          )}

          {response && (
            <article
              className="mt-3 prose prose-invert prose-sm max-w-none
                         prose-headings:text-primary prose-headings:font-display
                         prose-strong:text-primary prose-li:marker:text-primary
                         prose-a:text-primary prose-p:leading-relaxed"
            >
              <ReactMarkdown>{response}</ReactMarkdown>
              {loading && <span className="inline-block w-2 h-4 align-middle bg-primary animate-pulse ml-1" />}
            </article>
          )}
        </div>

        {mode === "general" && complete && (
          <div className="border-t border-primary/20 p-3 flex items-center gap-2 bg-background/60 backdrop-blur" dir={dir}>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={s.askPlaceholder}
              onKeyDown={(e) => { if (e.key === "Enter" && question.trim() && !loading) { ask(question); setQuestion(""); } }}
              className="flex-1 bg-card/80 border-primary/30"
              disabled={loading}
            />
            <Button
              variant="luxe"
              size="icon"
              disabled={!question.trim() || loading}
              onClick={() => { ask(question); setQuestion(""); }}
              aria-label={s.send}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <div className="px-5 py-2 text-[10px] text-muted-foreground text-center border-t border-border/40">
          {s.poweredBy} · Lovable AI
        </div>
      </SheetContent>
    </Sheet>
  );
};