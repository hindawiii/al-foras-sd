import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Briefcase, Search, Star, Globe, MapPin, DollarSign, CreditCard,
  CheckCircle2, XCircle, ExternalLink, Share2, Heart, ChevronLeft,
  Sparkles, Users, Clock, ShieldCheck, AlertTriangle, BadgeCheck,
  Mail, Facebook, Instagram, Twitter, Linkedin, MessageCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { JOBS, JOB_CATEGORIES, Job, JobCategory } from "@/lib/jobsData";
import { jobsStore } from "@/lib/jobsStorage";
import { nativeShare } from "@/lib/share";
import { useSettings } from "@/contexts/SettingsContext";

const MY_COUNTRY_LABEL = "السودان";

const isJobAvailableInCountry = (job: Job, country: string): boolean => {
  if (job.availability.global || job.availability.countries.includes("all")) {
    return !job.availability.restrictedCountries.includes(country);
  }
  return job.availability.countries.some(c => c.includes(country) || country.includes(c));
};

export const JobsTab = () => {
  const { countryCode } = useSettings();
  const myCountry = MY_COUNTRY_LABEL; // default; could be resolved from countryCode
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<JobCategory | "all">("all");
  const [onlyMyCountry, setOnlyMyCountry] = useState<boolean>(() => jobsStore.getFilters().onlyMyCountry);
  const [savedIds, setSavedIds] = useState<string[]>(() => jobsStore.savedIds());
  const [active, setActive] = useState<Job | null>(null);

  useEffect(() => {
    jobsStore.setFilters({ onlyMyCountry, category });
  }, [onlyMyCountry, category]);

  const list = useMemo(() => {
    let l = JOBS;
    if (category !== "all") {
      if (category === "new") l = l.filter(j => j.isNew);
      else if (category === "entry") l = l.filter(j => j.salary.min <= 20 || j.type.includes("مبتدئ"));
      else l = l.filter(j => j.category === category);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      l = l.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q)),
      );
    }
    if (onlyMyCountry) l = l.filter(j => isJobAvailableInCountry(j, myCountry));
    return l;
  }, [category, query, onlyMyCountry, myCountry]);

  const featured = list.filter(j => j.isFeatured);
  const recent = [...list].sort((a, b) => (b.dateAdded > a.dateAdded ? 1 : -1));

  const toggleSave = (id: string) => {
    const nowSaved = jobsStore.toggle(id);
    setSavedIds(jobsStore.savedIds());
    toast.success(nowSaved ? "تمت الإضافة إلى المفضلة" : "تمت الإزالة من المفضلة");
  };

  const shareJob = (job: Job) => {
    nativeShare({
      title: `${job.emoji} ${job.title} — ${job.company}`,
      text: `وجدت هذه الفرصة في تطبيق الفرص: ${job.title} لدى ${job.company}. ${job.description}`,
      url: job.contact.website ?? undefined,
    });
  };

  return (
    <div className="space-y-5" dir="rtl">
      <header className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gold-gradient/10 border border-primary/30 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">فرص العمل</h1>
          <p className="text-xs text-muted-foreground">فريلانسر، عن بُعد، ووظائف محلية موثوقة.</p>
        </div>
      </header>

      {/* Search */}
      <div className="glass rounded-2xl p-3 border border-primary/15 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ابحث عن فرصة، شركة، أو مهارة..."
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-0 text-sm"
        />
      </div>

      {/* Smart country filter */}
      <div className="glass rounded-2xl p-4 border border-primary/15 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          <div>
            <div className="text-sm font-semibold">ابحث حسب بلدي: {myCountry} 🇸🇩</div>
            <div className="text-[11px] text-muted-foreground">يعرض فقط الفرص المتاحة في بلدك</div>
          </div>
        </div>
        <Switch checked={onlyMyCountry} onCheckedChange={setOnlyMyCountry} />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-4 gap-2">
        {JOB_CATEGORIES.map(c => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id as any)}
              className={`glass rounded-xl p-3 border transition-all flex flex-col items-center gap-1 ${
                active ? "border-primary bg-primary/10" : "border-primary/15 hover:border-primary/40"
              }`}
            >
              <span className="text-xl leading-none">{c.emoji}</span>
              <span className={`text-[11px] font-medium ${active ? "text-primary" : "text-foreground"}`}>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-primary">فرص مميزة</h2>
          </div>
          <div className="space-y-2">
            {featured.map(j => (
              <JobCard key={j.id} job={j} saved={savedIds.includes(j.id)} onOpen={() => setActive(j)}
                onSave={() => toggleSave(j.id)} onShare={() => shareJob(j)} myCountry={myCountry} />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-primary">فرص حديثة</h2>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {recent.map(j => (
              <motion.div key={j.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <JobCard job={j} saved={savedIds.includes(j.id)} onOpen={() => setActive(j)}
                  onSave={() => toggleSave(j.id)} onShare={() => shareJob(j)} myCountry={myCountry} />
              </motion.div>
            ))}
          </AnimatePresence>
          {recent.length === 0 && (
            <div className="glass rounded-2xl p-6 border border-primary/15 text-center text-sm text-muted-foreground">
              لا توجد فرص مطابقة حالياً — جرّب تعديل الفلتر.
            </div>
          )}
        </div>
      </section>

      <JobDetailSheet
        job={active}
        onClose={() => setActive(null)}
        saved={active ? savedIds.includes(active.id) : false}
        onSave={() => active && toggleSave(active.id)}
        onShare={() => active && shareJob(active)}
        myCountry={myCountry}
      />
    </div>
  );
};

// ---------------- Card ----------------
interface CardProps {
  job: Job;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
  onShare: () => void;
  myCountry: string;
}

const JobCard = ({ job, saved, onOpen, onSave, onShare, myCountry }: CardProps) => {
  const available = isJobAvailableInCountry(job, myCountry);
  const salaryLabel = `${job.salary.min}-${job.salary.max} ${job.salary.currency}/${
    job.salary.period === "hour" ? "ساعة" : job.salary.period === "month" ? "شهر" : "مشروع"
  }`;
  return (
    <div className="glass rounded-2xl p-4 border border-primary/15 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl shrink-0">
            {job.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold truncate">{job.title}</h3>
              {job.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
              {job.isNew && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">جديد</Badge>}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{job.company} · {job.type}</div>
          </div>
        </div>
        <button onClick={onSave} aria-label="حفظ" className="p-1.5 rounded-lg hover:bg-primary/10 transition">
          <Heart className={`w-4 h-4 ${saved ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{job.availability.global ? "عالمي" : job.availability.countries.join("، ")}</span>
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary" />{job.rating.score}</span>
        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{salaryLabel}</span>
      </div>

      <div className={`text-[11px] flex items-center gap-1 ${available ? "text-emerald-500" : "text-destructive"}`}>
        {available ? <><CheckCircle2 className="w-3.5 h-3.5" /> متاح في بلدك ({myCountry})</> : <><XCircle className="w-3.5 h-3.5" /> غير متاح في بلدك</>}
        <span className="mx-1 text-muted-foreground">·</span>
        <span className="text-muted-foreground">{job.rating.totalReviews.toLocaleString("ar-EG")}+ تقييم</span>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="luxe" className="flex-1 h-9" onClick={onOpen}>التفاصيل</Button>
        <Button size="sm" variant="outline" className="h-9 px-3" onClick={onShare}><Share2 className="w-4 h-4" /></Button>
      </div>
    </div>
  );
};

// ---------------- Detail Sheet ----------------
interface DetailProps {
  job: Job | null;
  onClose: () => void;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  myCountry: string;
}

const JobDetailSheet = ({ job, onClose, saved, onSave, onShare, myCountry }: DetailProps) => {
  if (!job) return null;
  const available = isJobAvailableInCountry(job, myCountry);
  const salaryLabel = `${job.salary.min} - ${job.salary.max} ${job.salary.currency} / ${
    job.salary.period === "hour" ? "ساعة" : job.salary.period === "month" ? "شهر" : "مشروع"
  }`;

  return (
    <Sheet open={!!job} onOpenChange={o => !o && onClose()}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto glass border-primary/20" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 rounded hover:bg-primary/10"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-base">{job.emoji} {job.title}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 pb-24">
          {/* Company header */}
          <div className="glass rounded-2xl p-4 border border-primary/15 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl">
              {job.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{job.company}</div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="w-3 h-3 text-primary" />
                {job.rating.score} ({job.rating.totalReviews.toLocaleString("ar-EG")} تقييم)
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {job.isVerified && <Badge variant="secondary" className="text-[9px] gap-1"><ShieldCheck className="w-3 h-3" />موثّق</Badge>}
                {job.isFeatured && <Badge className="text-[9px]">🔥 مميز</Badge>}
              </div>
            </div>
          </div>

          {/* Availability */}
          <Section title="التوفر" icon={<Globe className="w-4 h-4" />}>
            <div className={`flex items-center gap-2 text-sm ${available ? "text-emerald-500" : "text-destructive"}`}>
              {available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {available ? `متاح في بلدك: ${myCountry} 🇸🇩` : `غير متاح في بلدك (${myCountry})`}
            </div>
            <div className="text-[12px] text-muted-foreground mt-1">
              {job.availability.global ? "🌐 متاح عالمياً في جميع الدول" : `متاح في: ${job.availability.countries.join("، ")}`}
            </div>
            {job.availability.notes && <p className="text-[12px] text-muted-foreground mt-1">{job.availability.notes}</p>}
          </Section>

          {/* Salary */}
          <Section title="الأرباح" icon={<DollarSign className="w-4 h-4" />}>
            <div className="text-lg font-bold text-primary">{salaryLabel}</div>
            {job.salary.average && <div className="text-[12px] text-muted-foreground">المتوسط: {job.salary.average} {job.salary.currency}</div>}
            <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
              <InfoLine label="الحد الأدنى للسحب" value={`${job.withdrawal.minAmount} ${job.withdrawal.currency}`} />
              {job.withdrawal.processingTime && <InfoLine label="مدة التحويل" value={job.withdrawal.processingTime} />}
              {job.commission && <InfoLine label="العمولة" value={job.commission.percentage} />}
            </div>
          </Section>

          {/* Payment methods */}
          <Section title="طرق الدفع" icon={<CreditCard className="w-4 h-4" />}>
            <ul className="space-y-1.5 text-sm">
              {job.withdrawal.methods.map(m => (
                <li key={m.name} className="flex items-start gap-2">
                  {m.availableInSudan
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                  <div>
                    <div className="font-medium">{m.name} {m.availableInSudan ? "— يعمل في السودان" : "— غير متاح في السودان"}</div>
                    {m.notes && <div className="text-[11px] text-muted-foreground">{m.notes}</div>}
                    {!m.availableInSudan && m.alternativeForSudan && (
                      <div className="text-[11px] text-primary">💡 البديل: {m.alternativeForSudan}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* Description */}
          <Section title="الوصف">
            <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          </Section>

          {/* Requirements */}
          <Section title="المتطلبات" icon={<CheckCircle2 className="w-4 h-4" />}>
            <ul className="space-y-1 text-sm">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span><span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Skills */}
          <Section title="المهارات المطلوبة">
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(s => (
                <Badge key={s} variant="outline" className="border-primary/30 text-primary">{s}</Badge>
              ))}
            </div>
          </Section>

          {/* Success stories */}
          {job.successStories.length > 0 && (
            <Section title="قصص نجاح من بلدك" icon={<Users className="w-4 h-4" />}>
              <div className="space-y-2">
                {job.successStories.map((s, i) => (
                  <div key={i} className="rounded-xl border border-primary/15 p-3 bg-card/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">👤 {s.name}{s.city && ` — ${s.city}`}</div>
                      {s.earnings && <span className="text-primary text-xs font-bold">{s.earnings}</span>}
                    </div>
                    {s.currentLocation && <div className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{s.currentLocation}</div>}
                    <p className="text-[12px] text-muted-foreground">"{s.story}"</p>
                    {s.tips && <p className="text-[11px] text-primary">💡 {s.tips}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Registration guide */}
          <Section title="دليل التسجيل والتقديم" icon={<Sparkles className="w-4 h-4" />}>
            <div className="space-y-2">
              {job.registrationGuide.steps.map(st => (
                <div key={st.step} className="rounded-xl border border-primary/15 p-3 bg-card/40">
                  <div className="text-sm font-bold text-primary">الخطوة {st.step}: {st.title}</div>
                  <p className="text-[12px] text-muted-foreground mt-1">{st.description}</p>
                  {st.tips && <p className="text-[11px] text-primary mt-1">💡 نصيحة: {st.tips}</p>}
                </div>
              ))}
              {job.registrationGuide.estimatedTime && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> الوقت المقدر: {job.registrationGuide.estimatedTime}
                </div>
              )}
            </div>
          </Section>

          {/* Contact */}
          <Section title="تواصل مع الموقع" icon={<MessageCircle className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {job.contact.website && <ContactLink icon={<Globe className="w-3.5 h-3.5" />} label="الموقع" href={job.contact.website} />}
              {job.contact.email && <ContactLink icon={<Mail className="w-3.5 h-3.5" />} label={job.contact.email} href={`mailto:${job.contact.email}`} />}
              {job.contact.whatsapp && <ContactLink icon={<MessageCircle className="w-3.5 h-3.5" />} label="واتساب" href={job.contact.whatsapp} />}
              {job.contact.facebook && <ContactLink icon={<Facebook className="w-3.5 h-3.5" />} label="فيسبوك" href={job.contact.facebook} />}
              {job.contact.instagram && <ContactLink icon={<Instagram className="w-3.5 h-3.5" />} label="إنستغرام" href={job.contact.instagram} />}
              {job.contact.twitter && <ContactLink icon={<Twitter className="w-3.5 h-3.5" />} label="تويتر" href={job.contact.twitter} />}
              {job.contact.linkedin && <ContactLink icon={<Linkedin className="w-3.5 h-3.5" />} label="لينكدإن" href={job.contact.linkedin} />}
              {job.contact.supportCenter && <ContactLink icon={<ShieldCheck className="w-3.5 h-3.5" />} label="الدعم" href={job.contact.supportCenter} />}
            </div>
          </Section>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Section title="المميزات" icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}>
              <ul className="space-y-1 text-sm">
                {job.pros.map((p, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">✓</span>{p}</li>)}
              </ul>
            </Section>
            <Section title="العيوب" icon={<AlertTriangle className="w-4 h-4 text-destructive" />}>
              <ul className="space-y-1 text-sm">
                {job.cons.map((c, i) => <li key={i} className="flex gap-2"><span className="text-destructive">✗</span>{c}</li>)}
              </ul>
            </Section>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-6 px-6 py-3 glass border-t border-primary/20 flex gap-2">
            <Button variant="ghostGold" className="h-11 px-3" onClick={onSave} aria-label="حفظ">
              <Heart className={`w-4 h-4 ${saved ? "fill-destructive text-destructive" : ""}`} />
            </Button>
            <Button variant="outline" className="h-11 px-3" onClick={onShare} aria-label="مشاركة"><Share2 className="w-4 h-4" /></Button>
            {job.contact.website && (
              <Button
                variant="luxe" className="flex-1 h-11"
                onClick={() => window.open(job.contact.website!, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="w-4 h-4" /> التقديم عبر الموقع الرسمي
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ---------------- Small helpers ----------------
const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="glass rounded-2xl p-4 border border-primary/15 space-y-2">
    <div className="flex items-center gap-2 text-sm font-bold text-primary">
      {icon}<span>{title}</span>
    </div>
    {children}
  </div>
);

const InfoLine = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-primary/10 bg-card/40 p-2">
    <div className="text-[10px] text-muted-foreground">{label}</div>
    <div className="text-[12px] font-semibold">{value}</div>
  </div>
);

const ContactLink = ({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="flex items-center gap-1.5 rounded-lg border border-primary/15 bg-card/40 p-2 hover:border-primary/40 transition truncate">
    <span className="text-primary">{icon}</span>
    <span className="truncate">{label}</span>
  </a>
);
