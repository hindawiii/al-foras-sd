import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, X, GraduationCap, MapPin, Mail, Phone, User as UserIcon, Edit3, Sparkles, Check, Camera, Loader2 } from "lucide-react";
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

interface ProfileState {
  full_name: string; bio: string; education: string; location: string; avatar_url: string; phone: string;
  skills: string[]; interests: string[];
}

const empty: ProfileState = { full_name: "", bio: "", education: "", location: "", avatar_url: "", phone: "", skills: [], interests: [] };

export const ProfileTab = () => {
  const { user, isGuest } = useAuth();
  const { t, dir } = useLanguage();
  const { hideProfile } = useSettings();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const [profile, setProfile] = useState<ProfileState>(empty);
  const [draft, setDraft] = useState<ProfileState>(empty);
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const completion = useMemo(() => {
    const fields = [
      profile.full_name, profile.bio, profile.education, profile.location,
      profile.skills.length > 0 ? "x" : "", profile.interests.length > 0 ? "x" : "",
    ];
    const filled = fields.filter(f => f && String(f).trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const startEdit = () => { setDraft(profile); setEditing(true); };
  const cancelEdit = () => { setDraft(profile); setEditing(false); };

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
    setSaving(true);
    if (isGuest) {
      guestStorage.set("profile", draft);
      setSaving(false);
      setProfile(draft);
      setEditing(false);
      toast.success(t("saved2"));
      return;
    }
    const { error } = await supabase.from("profiles").update(draft).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(t("saveFailed")); return; }
    setProfile(draft);
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
            className={`bg-input border-gold/30 ${alignClass}`} placeholder={t("locationHolder")} />
        </Field>
        <Field icon={Phone} label="رقم الهاتف">
          <Input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass}`} placeholder="+249 9xxxxxxxx" dir="ltr" type="tel" />
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
