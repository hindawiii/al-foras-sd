import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Save, Plus, X, GraduationCap, MapPin, Mail, Phone, User as UserIcon,
  Edit3, Sparkles, Check, Camera, Loader2, Link as LinkIcon, Trash2,
  Star, Briefcase, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { INTEREST_OPTIONS } from "@/lib/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { guestStorage } from "@/lib/guestStorage";
import {
  profileExtras, defaultExtras, type ProfileExtras, type PersonalLink,
  type LinkType, type SkillEntry,
} from "@/lib/profileExtras";
import { PHONE_COUNTRIES, findPhoneCountry, validatePhone } from "@/lib/phoneCountries";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface ProfileState {
  full_name: string; bio: string; education: string; location: string; avatar_url: string; phone: string;
  skills: string[]; interests: string[];
}

const empty: ProfileState = { full_name: "", bio: "", education: "", location: "", avatar_url: "", phone: "", skills: [], interests: [] };

const LINK_META: Record<LinkType, { label: string; emoji: string; placeholder: string }> = {
  portfolio: { label: "موقع شخصي / Portfolio", emoji: "💼", placeholder: "https://myportfolio.com" },
  linkedin:  { label: "LinkedIn", emoji: "💼", placeholder: "https://linkedin.com/in/..." },
  twitter:   { label: "Twitter / X", emoji: "🐦", placeholder: "https://twitter.com/..." },
  telegram:  { label: "Telegram", emoji: "📱", placeholder: "https://t.me/..." },
  instagram: { label: "Instagram", emoji: "📸", placeholder: "https://instagram.com/..." },
  youtube:   { label: "YouTube", emoji: "🎥", placeholder: "https://youtube.com/..." },
  github:    { label: "GitHub", emoji: "💻", placeholder: "https://github.com/..." },
  behance:   { label: "Behance", emoji: "🎨", placeholder: "https://behance.net/..." },
  medium:    { label: "Medium", emoji: "📝", placeholder: "https://medium.com/@..." },
  cv:        { label: "السيرة الذاتية (CV)", emoji: "📄", placeholder: "https://..." },
  other:     { label: "رابط آخر", emoji: "🔗", placeholder: "https://..." },
};

const DEGREE_OPTIONS: { value: NonNullable<ProfileExtras["degree"]>; label: string }[] = [
  { value: "secondary", label: "ثانوي" },
  { value: "diploma",   label: "دبلوم" },
  { value: "bachelor",  label: "بكالوريوس" },
  { value: "master",    label: "ماجستير" },
  { value: "phd",       label: "دكتوراه" },
];

const EXPERIENCE_OPTIONS: { value: NonNullable<ProfileExtras["experienceYears"]>; label: string }[] = [
  { value: "none",  label: "بدون خبرة" },
  { value: "0-1",   label: "0 - 1 سنة" },
  { value: "1-3",   label: "1 - 3 سنوات" },
  { value: "3-5",   label: "3 - 5 سنوات" },
  { value: "5-10",  label: "5 - 10 سنوات" },
  { value: "10+",   label: "أكثر من 10 سنوات" },
];

const SKILL_CATEGORY_META: Record<SkillEntry["category"], { label: string; emoji: string }> = {
  tech:     { label: "المهارات التقنية", emoji: "💻" },
  creative: { label: "المهارات الإبداعية", emoji: "🎨" },
  language: { label: "المهارات اللغوية", emoji: "📝" },
  other:    { label: "مهارات أخرى", emoji: "🛠️" },
};

export const ProfileTab = () => {
  const { user, isGuest } = useAuth();
  const { t, dir } = useLanguage();
  const { hideProfile } = useSettings();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const [profile, setProfile] = useState<ProfileState>(empty);
  const [draft, setDraft] = useState<ProfileState>(empty);
  const [extras, setExtras] = useState<ProfileExtras>(defaultExtras);
  const [extrasDraft, setExtrasDraft] = useState<ProfileExtras>(defaultExtras);
  // Phone local part (digits only, without country code)
  const [phoneLocal, setPhoneLocal] = useState("");
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load extras from IndexedDB
  useEffect(() => {
    profileExtras.load().then((v) => {
      setExtras(v);
      setExtrasDraft(v);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (isGuest) {
      const p = guestStorage.get<ProfileState>("profile");
      if (p) { setProfile(p); setDraft(p); }
      setLoading(false);
      return;
    }
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p: ProfileState = {
            full_name: data.full_name ?? "", bio: data.bio ?? "",
            education: data.education ?? "", location: data.location ?? "",
            avatar_url: data.avatar_url ?? "",
            phone: (data as any).phone ?? "",
            skills: data.skills ?? [], interests: (data as any).interests ?? [],
          };
          setProfile(p); setDraft(p);
        }
        setLoading(false);
      });
  }, [user, isGuest]);

  // Derive local phone digits from stored phone (strip leading country code if it matches)
  useEffect(() => {
    const stored = draft.phone || "";
    const code = extrasDraft.phoneCountryCode || "+249";
    if (stored.startsWith(code)) {
      setPhoneLocal(stored.slice(code.length).replace(/^\s+/, ""));
    } else {
      setPhoneLocal(stored.replace(/^\+\d+\s*/, ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.phone, extras.phoneCountryCode, editing]);

  const completion = useMemo(() => {
    const fields = [
      profile.full_name, profile.bio, profile.education, profile.location,
      profile.skills.length > 0 ? "x" : "", profile.interests.length > 0 ? "x" : "",
      extras.university || extras.highSchool ? "x" : "",
      extras.detailedSkills.length > 0 ? "x" : "",
      extras.links.length > 0 ? "x" : "",
    ];
    const filled = fields.filter(f => f && String(f).trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile, extras]);

  const startEdit = () => { setDraft(profile); setExtrasDraft(extras); setEditing(true); };
  const cancelEdit = () => { setDraft(profile); setExtrasDraft(extras); setEditing(false); };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("الرجاء اختيار صورة"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("الصورة أكبر من 4 ميجابايت"); return; }
    setUploading(true);
    if (isGuest) {
      // وضع الضيف: تخزين الصورة محليًا كـ dataURL
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || "");
        const next = { ...profile, avatar_url: url };
        setProfile(next); setDraft(d => ({ ...d, avatar_url: url }));
        guestStorage.set("profile", next);
        setUploading(false);
        toast.success("تم تحديث صورتك");
      };
      reader.onerror = () => { setUploading(false); toast.error("تعذر قراءة الصورة"); };
      reader.readAsDataURL(file);
      return;
    }
    const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600", upsert: true, contentType: file.type || "image/jpeg",
    });
    if (upErr) {
      console.error("Avatar upload error:", upErr);
      setUploading(false);
      toast.error(`تعذر رفع الصورة: ${upErr.message}`);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setUploading(false);
    if (dbErr) {
      console.error("Avatar DB update error:", dbErr);
      toast.error(`تعذر حفظ الصورة: ${dbErr.message}`);
      return;
    }
    setProfile(p => ({ ...p, avatar_url: url }));
    setDraft(d => ({ ...d, avatar_url: url }));
    toast.success("تم تحديث صورتك");
  };

  const save = async () => {
    if (!user) return;
    // Validate phone
    if (phoneLocal && !validatePhone(extrasDraft.phoneCountryIso, phoneLocal)) {
      toast.error("رقم الهاتف غير صالح لهذه الدولة");
      return;
    }
    const composedPhone = phoneLocal
      ? `${extrasDraft.phoneCountryCode} ${phoneLocal.replace(/\D/g, "")}`
      : "";
    const nextDraft: ProfileState = { ...draft, phone: composedPhone };
    setSaving(true);
    // Save extras (localForage) first — always local-first
    await profileExtras.save(extrasDraft);
    setExtras(extrasDraft);
    if (isGuest) {
      guestStorage.set("profile", nextDraft);
      setSaving(false);
      setProfile(nextDraft);
      setEditing(false);
      toast.success(t("saved2"));
      return;
    }
    const { error } = await supabase.from("profiles").update(nextDraft).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(t("saveFailed")); return; }
    setProfile(nextDraft);
    setEditing(false);
    toast.success(t("saved2"));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !draft.skills.includes(s) && draft.skills.length < 20) {
      setDraft({ ...draft, skills: [...draft.skills, s] });
      setSkillInput("");
    }
  };

  const toggleInterest = (i: string) => {
    setDraft(d => ({
      ...d,
      interests: d.interests.includes(i) ? d.interests.filter(x => x !== i) : [...d.interests, i],
    }));
  };

  // ---- Links helpers ----
  const addLink = (type: LinkType) => {
    setExtrasDraft(d => ({
      ...d,
      links: [...d.links, { id: crypto.randomUUID(), type, url: "" }],
    }));
  };
  const updateLink = (id: string, url: string) => {
    setExtrasDraft(d => ({ ...d, links: d.links.map(l => l.id === id ? { ...l, url } : l) }));
  };
  const removeLink = (id: string) => {
    setExtrasDraft(d => ({ ...d, links: d.links.filter(l => l.id !== id) }));
  };

  // ---- Detailed skills helpers ----
  const addDetailedSkill = (category: SkillEntry["category"]) => {
    setExtrasDraft(d => ({
      ...d,
      detailedSkills: [...d.detailedSkills, { name: "", level: 3, category }],
    }));
  };
  const updateDetailedSkill = (idx: number, patch: Partial<SkillEntry>) => {
    setExtrasDraft(d => ({
      ...d,
      detailedSkills: d.detailedSkills.map((s, i) => i === idx ? { ...s, ...patch } : s),
    }));
  };
  const removeDetailedSkill = (idx: number) => {
    setExtrasDraft(d => ({ ...d, detailedSkills: d.detailedSkills.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="text-center text-muted-foreground py-20">{t("loading")}</div>;

  // ===== Profile Dashboard View =====
  if (!editing) {
    const initial = (profile.full_name || user?.email || "ض")[0].toUpperCase();
    // Circular progress ring math
    const size = 140;
    const stroke = 6;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - completion / 100);

    return (
      <div className="space-y-4 pb-24">
        {/* === Panoramic Gold Dashboard Hero === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-luxe"
        >
          {/* Panoramic faint-gold backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--primary)/0.28),transparent_60%),linear-gradient(180deg,hsl(var(--primary)/0.10),hsl(var(--card)))]" />
          <div className="absolute -top-20 -right-16 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gold-gradient opacity-70" />

          {/* Edit pill (top-start) */}
          <button onClick={startEdit}
            className="absolute top-4 start-4 z-10 flex items-center gap-1.5 text-xs bg-background/60 backdrop-blur-md border border-primary/30 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full">
            <Edit3 className="w-3 h-3" /> {t("edit")}
          </button>

          <div className="relative px-6 pt-10 pb-6 flex flex-col items-center text-center">
            {/* Avatar with progress ring */}
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="absolute inset-0 -rotate-90">
                <defs>
                  <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary-glow))" />
                    <stop offset="50%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-deep))" />
                  </linearGradient>
                </defs>
                <circle cx={size/2} cy={size/2} r={radius} fill="none"
                  stroke="hsl(var(--border))" strokeWidth={stroke} opacity={0.4} />
                <motion.circle
                  cx={size/2} cy={size/2} r={radius} fill="none"
                  stroke="url(#goldRing)" strokeWidth={stroke} strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary)/0.6))" }}
                />
              </svg>

              <div className="absolute inset-[10px] rounded-full bg-card overflow-hidden border border-primary/30 flex items-center justify-center">
                {profile.avatar_url && !hideProfile ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gold-gradient flex items-center justify-center font-display text-4xl text-primary-foreground">
                    {hideProfile ? "•" : initial}
                  </div>
                )}
              </div>

              {/* Upload button */}
              <label className="absolute bottom-1 end-1 w-9 h-9 rounded-full bg-gold-gradient border-2 border-background flex items-center justify-center shadow-gold cursor-pointer hover:scale-105 transition-transform">
                {uploading
                  ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                  : <Camera className="w-4 h-4 text-primary-foreground" />}
                <input type="file" accept="image/*" className="hidden"
                  onChange={handleAvatarUpload} disabled={uploading} />
              </label>

            </div>

            {/* Completion label under the ring */}
            <p className="text-xs font-bold text-primary mt-4 tracking-wide">
              {completion}% {t("profileCompletion")}
            </p>

            <h2 className="font-display text-3xl font-bold text-gold-gradient mt-3 truncate max-w-full">
              {hideProfile ? "•••••" : (profile.full_name || t("yourFullName"))}
            </h2>
            <p className="text-base font-semibold text-gold-gradient/90 truncate max-w-full flex items-center gap-1.5 mt-2 justify-center" dir="ltr">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold">
                {hideProfile ? "•••••@•••••" : (user?.email || "👤 ضيف")}
              </span>
            </p>
            {isGuest && !hideProfile && (
              <div className="mt-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-xs text-primary max-w-sm">
                👋 أنت تستخدم التطبيق كضيف — سنضيف تسجيل الدخول قريبًا لحفظ بياناتك على السحابة.
              </div>
            )}
            {profile.location && !hideProfile && (
              <p className="text-base font-semibold text-foreground flex items-center gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-primary" /> {profile.location}
              </p>
            )}

            {profile.phone && !hideProfile && (
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-2" dir="ltr">
                <Phone className="w-4 h-4 text-primary" /> {profile.phone}
              </p>
            )}

            {completion < 100 && (
              <p className="text-[11px] text-muted-foreground mt-3 max-w-xs">
                {t("completeProfileHint")}
              </p>
            )}
          </div>
        </motion.div>

        {/* === Detail panels === */}
        <div className="space-y-3">
          {profile.bio && !hideProfile && (
            <div className="bg-card-gradient border border-border rounded-2xl p-4">
              <p className="text-[10px] text-primary mb-1 font-bold">{t("bio")}</p>
              <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.education && !hideProfile && (
            <div className="bg-card-gradient border border-border rounded-2xl p-4">
              <p className="text-[10px] text-primary mb-1 font-bold flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> {t("education")}
              </p>
              <p className="text-sm text-foreground leading-relaxed">{profile.education}</p>
            </div>
          )}

          {profile.interests.length > 0 && !hideProfile && (
            <div className="bg-card-gradient border border-border rounded-2xl p-4">
              <p className="text-[10px] text-primary mb-2 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {t("interests")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map(i => (
                  <span key={i} className="text-xs bg-gold-gradient text-primary-foreground font-medium px-2.5 py-1 rounded-full">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.skills.length > 0 && !hideProfile && (
            <div className="bg-card-gradient border border-border rounded-2xl p-4">
              <p className="text-[10px] text-primary mb-2 font-bold">{t("skills")}</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map(s => (
                  <span key={s} className="text-xs bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {extras.detailedSkills.length > 0 && !hideProfile && (
            <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-3">
              <p className="text-[10px] text-primary font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> المهارات والخبرات
              </p>
              {(["tech", "creative", "language", "other"] as SkillEntry["category"][]).map(cat => {
                const list = extras.detailedSkills.filter(s => s.category === cat && s.name.trim());
                if (list.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[11px] text-muted-foreground mb-1">
                      {SKILL_CATEGORY_META[cat].emoji} {SKILL_CATEGORY_META[cat].label}
                    </p>
                    <div className="space-y-1">
                      {list.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{s.name}</span>
                          <span className="text-primary tracking-tight">
                            {"⭐".repeat(s.level)}{"☆".repeat(5 - s.level)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {extras.experienceYears && extras.experienceYears !== "none" && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-primary" />
                  سنوات الخبرة: {EXPERIENCE_OPTIONS.find(o => o.value === extras.experienceYears)?.label}
                </p>
              )}
            </div>
          )}

          {extras.links.filter(l => l.url.trim()).length > 0 && !hideProfile && (
            <div className="bg-card-gradient border border-border rounded-2xl p-4">
              <p className="text-[10px] text-primary mb-2 font-bold flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> الروابط الشخصية
              </p>
              <div className="space-y-1.5">
                {extras.links.filter(l => l.url.trim()).map(l => (
                  <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline" dir="ltr">
                    <span>{LINK_META[l.type].emoji}</span>
                    <span className="truncate">{l.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(extras.highSchool || extras.university || extras.major || extras.gpa || extras.degree) && !hideProfile && (
            <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-1.5">
              <p className="text-[10px] text-primary mb-1 font-bold flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> المعلومات التعليمية
              </p>
              {extras.highSchool && <p className="text-xs text-foreground">🏫 {extras.highSchool}</p>}
              {extras.university && <p className="text-xs text-foreground">🎓 {extras.university}</p>}
              {extras.major && <p className="text-xs text-foreground">📚 {extras.major}</p>}
              {extras.gpa && <p className="text-xs text-foreground">📊 GPA: {extras.gpa}/{extras.gpaScale === "100" ? "100%" : `${extras.gpaScale}.0`}</p>}
              {extras.degree && (
                <p className="text-xs text-foreground">
                  🎓 {DEGREE_OPTIONS.find(o => o.value === extras.degree)?.label}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Edit Mode =====
  return (
    <div className="space-y-5 pb-24">
      <div className="bg-card-gradient border-gold rounded-3xl p-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-gold-gradient">{t("editProfile")}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t("editProfileDesc")}</p>
        </div>
        <Button variant="ghostGold" size="sm" onClick={cancelEdit}>{t("cancel")}</Button>
      </div>

      <Section title={t("personalInfo")} alignClass={alignClass}>
        <Field icon={UserIcon} label={t("fullName")}>
          <Input value={draft.full_name} onChange={e => setDraft({ ...draft, full_name: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass}`} placeholder={t("yourNameHolder")} />
        </Field>
        <Field icon={MapPin} label={t("location")}>
          <Input value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass}`} placeholder="الدولة / المدينة — مثال: السودان / الخرطوم" />
        </Field>
        <Field icon={Phone} label="رقم الهاتف">
          <div className="flex gap-2" dir="ltr">
            <Select
              value={extrasDraft.phoneCountryIso}
              onValueChange={(iso) => {
                const c = findPhoneCountry(iso);
                setExtrasDraft(d => ({ ...d, phoneCountryIso: c.iso, phoneCountryCode: c.code }));
              }}
            >
              <SelectTrigger className="w-[130px] bg-input border-gold/30">
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <span>{findPhoneCountry(extrasDraft.phoneCountryIso).flag}</span>
                    <span className="font-mono text-xs">{extrasDraft.phoneCountryCode}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {PHONE_COUNTRIES.map(c => (
                  <SelectItem key={c.iso} value={c.iso}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span className="font-mono text-xs">{c.code}</span>
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={phoneLocal}
              onChange={e => setPhoneLocal(e.target.value.replace(/[^\d]/g, ""))}
              className="bg-input border-gold/30 flex-1 text-left"
              placeholder="912345678"
              inputMode="tel"
              type="tel"
            />
          </div>
          {phoneLocal && !validatePhone(extrasDraft.phoneCountryIso, phoneLocal) && (
            <p className="text-[10px] text-destructive mt-1">⚠️ رقم غير صالح لهذه الدولة</p>
          )}
        </Field>
        <Field icon={Mail} label={t("bio")}>
          <Textarea value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass} min-h-24`} placeholder={t("bioHolder")} />
        </Field>
      </Section>

      <Section title={t("education")} alignClass={alignClass}>
        <Field icon={GraduationCap} label={t("eduLabel")}>
          <Textarea value={draft.education} onChange={e => setDraft({ ...draft, education: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass} min-h-20`}
            placeholder={t("eduHolder")} />
        </Field>
      </Section>

      {/* Education details (extras / localForage) */}
      <Section title="المعلومات التعليمية 🎓" alignClass={alignClass}>
        <Field icon={GraduationCap} label="🏫 المدرسة الثانوية">
          <Input value={extrasDraft.highSchool}
            onChange={e => setExtrasDraft(d => ({ ...d, highSchool: e.target.value }))}
            className={`bg-input border-gold/30 ${alignClass}`} placeholder="اسم المدرسة الثانوية..." />
        </Field>
        <Field icon={GraduationCap} label="🎓 الجامعة / الكلية">
          <Input value={extrasDraft.university}
            onChange={e => setExtrasDraft(d => ({ ...d, university: e.target.value }))}
            className={`bg-input border-gold/30 ${alignClass}`} placeholder="اسم الجامعة أو الكلية..." />
        </Field>
        <Field icon={GraduationCap} label="📚 التخصص الدراسي">
          <Input value={extrasDraft.major}
            onChange={e => setExtrasDraft(d => ({ ...d, major: e.target.value }))}
            className={`bg-input border-gold/30 ${alignClass}`} placeholder="التخصص..." />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field icon={GraduationCap} label="📊 المعدل التراكمي">
            <Input value={extrasDraft.gpa}
              onChange={e => setExtrasDraft(d => ({ ...d, gpa: e.target.value }))}
              className={`bg-input border-gold/30 ${alignClass}`} placeholder="مثال: 3.6" />
          </Field>
          <Field icon={GraduationCap} label="السلّم">
            <Select
              value={extrasDraft.gpaScale}
              onValueChange={(v) => setExtrasDraft(d => ({ ...d, gpaScale: v as any }))}
            >
              <SelectTrigger className="bg-input border-gold/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">من 4.0</SelectItem>
                <SelectItem value="5">من 5.0</SelectItem>
                <SelectItem value="100">من 100%</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field icon={GraduationCap} label="🎓 الدرجة العلمية">
          <Select
            value={extrasDraft.degree || undefined}
            onValueChange={(v) => setExtrasDraft(d => ({ ...d, degree: v as any }))}
          >
            <SelectTrigger className="bg-input border-gold/30">
              <SelectValue placeholder="اختر الدرجة..." />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* Personal links (extras) */}
      <Section title="الروابط الشخصية 🔗" alignClass={alignClass}>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(LINK_META) as LinkType[]).map(type => (
            <button key={type} type="button" onClick={() => addLink(type)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary flex items-center gap-1">
              <Plus className="w-3 h-3" /> {LINK_META[type].emoji} {LINK_META[type].label}
            </button>
          ))}
        </div>
        <div className="space-y-2 mt-2">
          {extrasDraft.links.map(l => (
            <div key={l.id} className="flex items-center gap-2">
              <span className="text-lg">{LINK_META[l.type].emoji}</span>
              <Input
                value={l.url} onChange={e => updateLink(l.id, e.target.value)}
                className="bg-input border-gold/30 flex-1"
                placeholder={LINK_META[l.type].placeholder} dir="ltr"
              />
              <Button type="button" variant="ghostGold" size="icon" onClick={() => removeLink(l.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {extrasDraft.links.length === 0 && (
            <p className="text-xs text-muted-foreground">لا توجد روابط بعد — اضغط أعلاه لإضافة.</p>
          )}
        </div>
      </Section>

      {/* Detailed skills (with rating) */}
      <Section title="المهارات والخبرات 🛠️" alignClass={alignClass}>
        <div className="flex flex-wrap gap-1.5">
          {(["tech", "creative", "language", "other"] as SkillEntry["category"][]).map(cat => (
            <button key={cat} type="button" onClick={() => addDetailedSkill(cat)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary flex items-center gap-1">
              <Plus className="w-3 h-3" /> {SKILL_CATEGORY_META[cat].emoji} {SKILL_CATEGORY_META[cat].label}
            </button>
          ))}
        </div>
        <div className="space-y-2 mt-2">
          {extrasDraft.detailedSkills.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-base w-6 text-center">{SKILL_CATEGORY_META[s.category].emoji}</span>
              <Input
                value={s.name} onChange={e => updateDetailedSkill(idx, { name: e.target.value })}
                className={`bg-input border-gold/30 flex-1 ${alignClass}`}
                placeholder="اسم المهارة (مثال: React.js)"
              />
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => updateDetailedSkill(idx, { level: n })}>
                    <Star className={`w-4 h-4 ${n <= s.level ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Button type="button" variant="ghostGold" size="icon" onClick={() => removeDetailedSkill(idx)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {extrasDraft.detailedSkills.length === 0 && (
            <p className="text-xs text-muted-foreground">لا توجد مهارات مضافة بعد.</p>
          )}
        </div>
        <Field icon={Briefcase} label="💼 سنوات الخبرة العملية">
          <Select
            value={extrasDraft.experienceYears || undefined}
            onValueChange={(v) => setExtrasDraft(d => ({ ...d, experienceYears: v as any }))}
          >
            <SelectTrigger className="bg-input border-gold/30">
              <SelectValue placeholder="اختر..." />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title={t("interests")} alignClass={alignClass}>
        <p className="text-xs text-muted-foreground -mt-2">{t("interestsHint")}</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(i => {
            const active = draft.interests.includes(i);
            return (
              <button key={i} type="button" onClick={() => toggleInterest(i)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                  active
                    ? "bg-gold-gradient text-primary-foreground border-primary shadow-gold"
                    : "bg-background/40 border-border text-foreground hover:border-primary/50"
                }`}>
                {active && <Check className="w-3 h-3" />}
                {i}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t("skills")} alignClass={alignClass}>
        <div className="flex gap-2">
          <Input value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className={`bg-input border-gold/30 ${alignClass}`} placeholder={t("addSkill")} />
          <Button type="button" variant="gold" size="icon" onClick={addSkill}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.skills.map(s => (
            <span key={s} className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-sm px-3 py-1.5 rounded-full">
              {s}
              <button onClick={() => setDraft({ ...draft, skills: draft.skills.filter(x => x !== s) })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {draft.skills.length === 0 && <p className="text-sm text-muted-foreground">{t("noSkills")}</p>}
        </div>
      </Section>

      <Button variant="luxe" size="lg" className="w-full" onClick={save} disabled={saving}>
        <Save className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
        {saving ? t("saving") : t("save")}
      </Button>
    </div>
  );
};

const Section = ({ title, children, alignClass }: { title: string; children: React.ReactNode; alignClass: string }) => (
  <div className="bg-card-gradient border border-border rounded-2xl p-5 space-y-4">
    <h3 className={`font-display text-lg text-gold-gradient ${alignClass}`}>{title}</h3>
    {children}
  </div>
);

const Field = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-sm text-foreground">
      <Icon className="w-3.5 h-3.5 text-primary" />{label}
    </Label>
    {children}
  </div>
);
