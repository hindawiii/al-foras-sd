import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { COUNTRIES } from "@/lib/countries";

export type Lang = "ar" | "en";

interface LanguageCtx {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const STRINGS: Record<Lang, Record<string, string>> = {
  ar: {
    settings: "الإعدادات",
    darkMode: "الوضع الليلي",
    accountSettings: "إعدادات الحساب",
    privacy: "الخصوصية والأمان",
    about: "حول التطبيق",
    clearCache: "مسح الملفات المؤقتة",
    shareApp: "مشاركة التطبيق",
    logout: "تسجيل الخروج",
    language: "اللغة",
    arabic: "العربية",
    english: "English",
    notifications: "الإشعارات",
    confirmLogout: "تأكيد تسجيل الخروج",
    confirmLogoutDesc: "هل أنت متأكد أنك تريد الخروج من حسابك؟",
    yesLogout: "نعم، اخرج",
    cancel: "إلغاء",
    privacyTitle: "سياسة الخصوصية والأمان",
    privacyBody:
      "نحن نلتزم بحماية بياناتك الشخصية. لا نشارك معلوماتك مع أطراف ثالثة دون إذنك. تُخزّن البيانات الحساسة بشكل مشفّر، ويُستخدم بريدك الإلكتروني فقط لتسجيل الدخول والإشعارات. يمكنك حذف حسابك وبياناتك في أي وقت من إعدادات الحساب.",
    close: "إغلاق",
    // Tabs
    tabScholarships: "المنح والفرص",
    tabNews: "الأخبار والاقتصاد",
    tabCurrency: "العملات",
    tabApplications: "طلباتي",
    tabProfile: "الملف الشخصي",
    tabJobs: "فرص العمل",
    // Notifications
    notifMatchTitle: "مطابقة ذكية جديدة",
    notifMatchBody: "وجدنا 3 منح تطابق مهاراتك بناءً على أحدث الأخبار العالمية.",
    notifDeadlineTitle: "اقترب الموعد النهائي",
    notifDeadlineBody: "منحة تشيفنينغ تنتهي خلال 14 يوماً. لا تفوّت الفرصة.",
    notifNewsTitle: "خبر يربطك بفرصة",
    notifNewsBody: "الاتحاد الأوروبي وسّع برامج إيراسموس — تحقق من الفرص الجديدة.",
    timeMinutesAgo: "قبل دقائق",
    timeHourAgo: "قبل ساعة",
    time3HoursAgo: "قبل 3 ساعات",
    notifFooter: "الإشعارات تربط الأخبار العالمية بالفرص المناسبة لملفك الشخصي.",
    // Scholarships
    scholarshipsHint: "الفرص مجمّعة من مصادر رسمية عالمية وعربية، ومُرتّبة حسب موقعك واهتماماتك.",
    aiMatchBadge: "مطابقة ذكية جديدة",
    aiMatchBody: "وجدنا 3 منح تطابق مهاراتك بناءً على تحليل أحدث الأخبار العالمية",
    swipeHint: "اسحب لليمين للحفظ • لليسار للتجاهل",
    noMoreScholarships: "انتهت المنح المتاحة",
    noMoreScholarshipsDesc: "سنخبرك حال توفر منح جديدة تناسبك",
    reload: "إعادة التحميل",
    filterArabScholarships: "المنح العربية",
    filterGlobalScholarships: "المنح العالمية",
    studyLanguage: "لغة الدراسة",
    langArabic: "العربية",
    langEnglish: "الإنجليزية",
    langBoth: "عربي/إنجليزي",
    noScholarshipsCategory: "لا توجد منح في هذا التصنيف حالياً",
    verified: "موثقة",
    manualReview: "مراجعة يدوية",
    matchPercent: "مناسبة لك بنسبة",
    country: "الدولة",
    amount: "المبلغ",
    deadline: "آخر موعد",
    level: "المستوى",
    applyOfficial: "التقديم على الموقع الرسمي",
    applyOfficialNote: "سيتم فتح الموقع الرسمي للجهة المانحة داخل التطبيق لتقديم طلبك مباشرة.",
    sourceLink: "رابط المصدر",
    saved: "تم حفظ المنحة في طلباتك",
    dismissed: "تم تجاهل المنحة",
    // News
    dataSaver: "وضع توفير البيانات (نص فقط)",
    catAll: "الكل",
    catLocal: "محلي",
    catArab: "عربي",
    catGlobal: "عالمي",
    lastUpdated: "آخر تحديث",
    loadingShort: "جارٍ التحميل...",
    newsCount: "خبر",
    openSource: "افتح المصدر",
    // Weather
    searchCityPlaceholder: "ابحث عن طقس مدينة أخرى...",
    search: "بحث",
    cityNotFound: "لم يتم العثور على المدينة",
    weatherFailed: "تعذر تحديث الطقس",
    loadingWeather: "جارٍ تحميل الطقس...",
    // Currency Calculator
    liveGoldCurrency: "حاسبة العملات والذهب الحية",
    calc: "حاسبة",
    currency: "العملات",
    gold: "الذهب",
    from: "من",
    to: "إلى",
    weight: "الوزن (غ)",
    karat: "العيار",
    estValue: "القيمة التقديرية",
    fetchingRates: "جارٍ جلب أحدث الأسعار...",
    liveRatesAt: "أسعار حية — آخر تحديث",
    fetchingGold: "جارٍ جلب سعر الذهب...",
    liveGoldAt: "سعر الذهب الحي — آخر تحديث",
    // Applications
    loading: "جاري التحميل...",
    noApps: "لا توجد طلبات بعد",
    noAppsDesc: "ابدأ بحفظ المنح من قسم \"المنح والفرص\"",
    statusApplied: "متقدّم",
    statusSaved: "محفوظة",
    markApplied: "علّم كمتقدّم",
    markedApplied: "تم وضع علامة كمتقدّم",
    updated: "تم التحديث",
    removed: "تمت الإزالة",
    // Profile
    fullName: "الاسم الكامل",
    location: "الموقع",
    bio: "نبذة",
    education: "التعليم",
    interests: "الاهتمامات الأساسية",
    skills: "المهارات",
    addSkill: "أضف مهارة...",
    noSkills: "لم تُضِف مهارات بعد",
    save: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    saveFailed: "تعذر الحفظ",
    saved2: "تم حفظ ملفك الشخصي",
    edit: "تعديل",
    editProfile: "تعديل الملف الشخصي",
    editProfileDesc: "حدّث بياناتك للحصول على فرص أنسب",
    profileCompletion: "اكتمال الملف الشخصي",
    completeProfileHint: "أكمل بياناتك للحصول على مطابقات أدق للمنح والفرص.",
    personalInfo: "المعلومات الشخصية",
    interestsHint: "تُستخدم لمطابقتك بالمنح والفرص الأنسب لك.",
    yourNameHolder: "اكتب اسمك",
    locationHolder: "المدينة، الدولة",
    bioHolder: "عرّف عن نفسك...",
    eduHolder: "مثال: بكالوريوس هندسة حاسوب، جامعة الملك سعود، 2024",
    eduLabel: "المؤهل التعليمي",
    idCard: "FORAS · ID CARD",
    yourFullName: "اسمك الكامل",
    // Privacy & Security page
    privacySection: "الخصوصية والأمان",
    backToSettings: "العودة إلى الإعدادات",
    locationShare: "مشاركة الموقع الجغرافي",
    locationShareDesc: "يُستخدم لخدمات الطقس وتحديد الفرص القريبة منك.",
    hideProfile: "إخفاء بيانات الملف الشخصي",
    hideProfileDesc: "إخفاء معلوماتك عن مستخدمي التطبيق الآخرين.",
    twoFA: "المصادقة الثنائية (2FA)",
    twoFADesc: "طبقة حماية إضافية لحسابك.",
    setUp: "إعداد",
    twoFASoon: "ميزة المصادقة الثنائية ستتوفر قريباً.",
    locationDisabledToast: "تم إيقاف مشاركة الموقع. لن يتم استخدام GPS.",
    locationEnabledToast: "تم تفعيل مشاركة الموقع.",
    // About dialog
    aboutTitle: "حول التطبيق",
    aboutVisionLabel: "رؤيتنا",
    aboutVisionBody: "تمكين الشباب العربي من الوصول لأفضل الفرص التعليمية العالمية.",
    aboutTechLabel: "تقنيتنا",
    aboutTechBody: "فلترة ذكية ومطابقة دقيقة باستخدام الذكاء الاصطناعي.",
    aboutTrustLabel: "موثوقيتنا",
    aboutTrustBody: "جميع المصادر رسمية ومحدثة لحظياً.",
    contactUs: "تواصل معنا",
    aboutVersion: "الفُرَص — الإصدار 1.0",
    // Landing
    landingTagline: "بوابتك الذهبية للفرص العالمية",
    landingHeadline: "اكتشف، تقدّم، وحقق طموحك الأكاديمي",
    landingSubheadline: "منصة الفُرَص تجمع لك أفضل المنح الدراسية العربية والعالمية، مع مطابقة ذكية تبني على ملفك الشخصي.",
    landingCtaPrimary: "ابدأ الآن مجاناً",
    landingCtaSecondary: "تسجيل الدخول",
    landingFeaturesTitle: "لماذا منصة الفُرَص؟",
    landingFeature1Title: "مطابقة ذكية",
    landingFeature1Body: "خوارزمية AI تربط مهاراتك بالفرص الأنسب فوراً.",
    landingFeature2Title: "مصادر موثوقة",
    landingFeature2Body: "جميع المنح من جهات رسمية ومحدثة لحظياً.",
    landingFeature3Title: "تجربة فاخرة",
    landingFeature3Body: "تصميم زجاجي عصري بهوية ذهبية أنيقة.",
    landingWhyTitle: "رسالتنا ورؤيتنا",
    landingWhy1Title: "طموح بلا حدود",
    landingWhy1Body: "رؤيتنا هي تمكين كل طالب عربي من الوصول لأرقى الجامعات العالمية.",
    landingWhy2Title: "مطابقة ذكية",
    landingWhy2Body: "نستخدم تقنيات متطورة لربط ملفك الشخصي بالمنحة المثالية لك.",
    landingWhy3Title: "مصادر موثوقة",
    landingWhy3Body: "نضمن لك الوصول إلى بيانات دقيقة ومحدثة من الجهات الرسمية مباشرة.",
    landingContactSupport: "تواصل مع فريق الدعم",
    landingScholarshipsTitle: "أحدث المنح",
    landingScholarshipsSubtitle: "نظرة سريعة على فرص متاحة الآن",
    landingViewAll: "استعرض جميع المنح",
    landingFooter: "© 2026 الفُرَص — جميع الحقوق محفوظة",
  },
  en: {
    settings: "Settings",
    darkMode: "Dark mode",
    accountSettings: "Account settings",
    privacy: "Privacy & Security",
    about: "About",
    clearCache: "Clear cache",
    shareApp: "Share app",
    logout: "Sign out",
    language: "Language",
    arabic: "العربية",
    english: "English",
    notifications: "Notifications",
    confirmLogout: "Confirm sign out",
    confirmLogoutDesc: "Are you sure you want to sign out?",
    yesLogout: "Yes, sign out",
    cancel: "Cancel",
    privacyTitle: "Privacy & Security Policy",
    privacyBody:
      "We are committed to protecting your personal data. We never share your information with third parties without consent. Sensitive data is stored encrypted, and your email is used only for sign-in and notifications. You can delete your account and data at any time from account settings.",
    close: "Close",
    // Tabs
    tabScholarships: "Scholarships",
    tabNews: "News & Economy",
    tabCurrency: "Currency",
    tabApplications: "My Applications",
    tabProfile: "Profile",
    tabJobs: "Jobs",
    // Notifications
    notifMatchTitle: "New smart match",
    notifMatchBody: "We found 3 scholarships matching your skills based on the latest global news.",
    notifDeadlineTitle: "Deadline approaching",
    notifDeadlineBody: "Chevening scholarship closes in 14 days. Don't miss it.",
    notifNewsTitle: "News linked to an opportunity",
    notifNewsBody: "The EU expanded Erasmus programs — check the new opportunities.",
    timeMinutesAgo: "minutes ago",
    timeHourAgo: "an hour ago",
    time3HoursAgo: "3 hours ago",
    notifFooter: "Notifications connect global news to opportunities matching your profile.",
    // Scholarships
    scholarshipsHint: "Opportunities aggregated from official global and Arab sources, sorted by your location and interests.",
    aiMatchBadge: "New smart match",
    aiMatchBody: "We found 3 scholarships matching your skills based on the latest global news.",
    swipeHint: "Swipe right to save • left to dismiss",
    noMoreScholarships: "No more scholarships",
    noMoreScholarshipsDesc: "We'll notify you when new ones become available",
    reload: "Reload",
    filterArabScholarships: "Arab Scholarships",
    filterGlobalScholarships: "Global Scholarships",
    studyLanguage: "Study language",
    langArabic: "Arabic",
    langEnglish: "English",
    langBoth: "Arabic/English",
    noScholarshipsCategory: "No scholarships in this category right now",
    verified: "Verified",
    manualReview: "Manual review",
    matchPercent: "Match",
    country: "Country",
    amount: "Amount",
    deadline: "Deadline",
    level: "Level",
    applyOfficial: "Apply on official website",
    applyOfficialNote: "The official website will open inside the app for you to apply directly.",
    sourceLink: "Source link",
    saved: "Scholarship saved to your applications",
    dismissed: "Scholarship dismissed",
    // News
    dataSaver: "Data saver (text only)",
    catAll: "All",
    catLocal: "Local",
    catArab: "Arab",
    catGlobal: "Global",
    lastUpdated: "Updated",
    loadingShort: "Loading...",
    newsCount: "stories",
    openSource: "Open source",
    // Weather
    searchCityPlaceholder: "Search weather for another city...",
    search: "Search",
    cityNotFound: "City not found",
    weatherFailed: "Couldn't update weather",
    loadingWeather: "Loading weather...",
    // Currency Calculator
    liveGoldCurrency: "Live currency & gold calculator",
    calc: "Calc",
    currency: "Currency",
    gold: "Gold",
    from: "From",
    to: "To",
    weight: "Weight (g)",
    karat: "Karat",
    estValue: "Estimated value",
    fetchingRates: "Fetching latest rates...",
    liveRatesAt: "Live rates — updated",
    fetchingGold: "Fetching gold price...",
    liveGoldAt: "Live gold price — updated",
    // Applications
    loading: "Loading...",
    noApps: "No applications yet",
    noAppsDesc: "Start by saving scholarships from the \"Scholarships\" tab",
    statusApplied: "Applied",
    statusSaved: "Saved",
    markApplied: "Mark as applied",
    markedApplied: "Marked as applied",
    updated: "Updated",
    removed: "Removed",
    // Profile
    fullName: "Full name",
    location: "Location",
    bio: "Bio",
    education: "Education",
    interests: "Core interests",
    skills: "Skills",
    addSkill: "Add a skill...",
    noSkills: "No skills added yet",
    save: "Save changes",
    saving: "Saving...",
    saveFailed: "Couldn't save",
    saved2: "Profile saved",
    edit: "Edit",
    editProfile: "Edit profile",
    editProfileDesc: "Update your details for better matches",
    profileCompletion: "Profile completion",
    completeProfileHint: "Complete your details for sharper scholarship matches.",
    personalInfo: "Personal info",
    interestsHint: "Used to match you with the most relevant opportunities.",
    yourNameHolder: "Type your name",
    locationHolder: "City, country",
    bioHolder: "Introduce yourself...",
    eduHolder: "e.g. BSc Computer Engineering, KSU, 2024",
    eduLabel: "Qualification",
    idCard: "FORAS · ID CARD",
    yourFullName: "Your full name",
    // Privacy & Security page
    privacySection: "Privacy & Security",
    backToSettings: "Back to settings",
    locationShare: "Share location",
    locationShareDesc: "Used for weather services and nearby opportunities.",
    hideProfile: "Hide profile details",
    hideProfileDesc: "Hide your details from other app users.",
    twoFA: "Two-factor authentication (2FA)",
    twoFADesc: "Extra protection for your account.",
    setUp: "Set up",
    twoFASoon: "Two-factor authentication will be available soon.",
    locationDisabledToast: "Location sharing turned off. GPS will not be used.",
    locationEnabledToast: "Location sharing enabled.",
    // About dialog
    aboutTitle: "About Al-Foras",
    aboutVisionLabel: "Our Vision",
    aboutVisionBody: "Empowering Arab youth to reach the world's best educational opportunities.",
    aboutTechLabel: "Our Technology",
    aboutTechBody: "Smart filtering and precise AI-powered matching.",
    aboutTrustLabel: "Our Trust",
    aboutTrustBody: "All sources are official and updated in real time.",
    contactUs: "Contact Us",
    aboutVersion: "Al-Foras — Version 1.0",
    // Landing
    landingTagline: "Your golden gateway to global opportunities",
    landingHeadline: "Discover, apply, and achieve your academic dream",
    landingSubheadline: "Al-Foras curates the best Arab and global scholarships with AI-powered matching tailored to your profile.",
    landingCtaPrimary: "Get Started — It's Free",
    landingCtaSecondary: "Sign In",
    landingFeaturesTitle: "Why Al-Foras Platform?",
    landingFeature1Title: "Smart Matching",
    landingFeature1Body: "AI algorithm connects your skills to the best-fit opportunities instantly.",
    landingFeature2Title: "Trusted Sources",
    landingFeature2Body: "Every scholarship is from an official, real-time updated source.",
    landingFeature3Title: "Premium Experience",
    landingFeature3Body: "Modern glassmorphism design with an elegant gold identity.",
    landingWhyTitle: "Our Mission & Vision",
    landingWhy1Title: "Limitless Ambition",
    landingWhy1Body: "Our vision is to empower every Arab student to reach the world's top universities.",
    landingWhy2Title: "Smart Matching",
    landingWhy2Body: "Advanced technology connects your profile to the scholarship that fits you best.",
    landingWhy3Title: "Trusted Sources",
    landingWhy3Body: "We guarantee access to accurate, real-time data straight from official authorities.",
    landingContactSupport: "Contact Support Team",
    landingScholarshipsTitle: "Latest Scholarships",
    landingScholarshipsSubtitle: "A quick look at opportunities available now",
    landingViewAll: "Browse all scholarships",
    landingFooter: "© 2026 Al-Foras — All rights reserved",
  },
};

const ARABIC_COUNTRY_CODES = new Set(
  ["SA","AE","QA","KW","BH","OM","EG","SD","MA","DZ","TN","LY","JO","LB","SY","IQ","YE","PS"]
);

const detectInitialLang = (): Lang => {
  const stored = localStorage.getItem("foras-lang") as Lang | null;
  if (stored === "ar" || stored === "en") return stored;
  // Country code from previous geo-sync
  const cc = localStorage.getItem("foras-countrycode");
  if (cc && ARABIC_COUNTRY_CODES.has(cc.toUpperCase())) return "ar";
  // Browser language
  const browser = (navigator.language || "en").toLowerCase();
  if (browser.startsWith("ar")) return "ar";
  return "en";
};

const Ctx = createContext<LanguageCtx>({
  lang: "ar", dir: "rtl",
  setLang: () => {}, toggleLang: () => {},
  t: (k) => k,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("foras-lang", lang);
  }, [lang, dir]);

  // If country code becomes known later and user hasn't manually picked, refine.
  useEffect(() => {
    const onCountry = (e: Event) => {
      if (localStorage.getItem("foras-lang-manual")) return;
      const code = (e as CustomEvent).detail?.code as string | undefined;
      if (!code) return;
      setLangState(ARABIC_COUNTRY_CODES.has(code.toUpperCase()) ? "ar" : "en");
    };
    window.addEventListener("foras:countrychange", onCountry as EventListener);
    return () => window.removeEventListener("foras:countrychange", onCountry as EventListener);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("foras-lang-manual", "true");
  }, []);
  const toggleLang = useCallback(() => setLang(lang === "ar" ? "en" : "ar"), [lang, setLang]);
  const t = useCallback((key: string) => STRINGS[lang][key] ?? key, [lang]);

  // touch COUNTRIES so tree-shaker keeps the import side-effect-free
  void COUNTRIES;

  return (
    <Ctx.Provider value={{ lang, dir, setLang, toggleLang, t }}>{children}</Ctx.Provider>
  );
};

export const useLanguage = () => useContext(Ctx);
