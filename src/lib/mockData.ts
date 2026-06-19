export interface Scholarship {
  id: string;
  title: string;
  org: string;
  country: string;
  countryCode: string;     // ISO 3166-1 alpha-2
  flag: string;            // emoji flag
  category: "arab" | "global";
  studyLang: "ar" | "en" | "both";
  deadline: string;
  amount: string;
  field: string;
  level: string;
  verified: boolean;
  manualReview?: boolean;
  description: string;
  tags: string[];
  sourceUrl: string;
  officialUrl: string;
  interests: string[];
}

const mk = (s: Omit<Scholarship, "sourceUrl" | "officialUrl" | "interests"> & Partial<Pick<Scholarship, "sourceUrl" | "officialUrl" | "interests">>): Scholarship => ({
  sourceUrl: s.sourceUrl ?? "https://www.scholars4dev.com",
  officialUrl: s.officialUrl ?? "https://www.scholars4dev.com",
  interests: s.interests ?? [],
  ...s,
});

export const SCHOLARSHIPS: Scholarship[] = [
  mk({
    id: "s1", title: "منحة تشيفنينغ البريطانية الكاملة", org: "الحكومة البريطانية", country: "المملكة المتحدة",
    countryCode: "GB", flag: "🇬🇧", category: "global", studyLang: "en",
    deadline: "2026-11-01", amount: "تمويل كامل", field: "متعدد التخصصات", level: "ماجستير",
    verified: true, description: "منحة دراسية كاملة لقادة المستقبل تشمل الرسوم والإقامة والسفر.",
    tags: ["قيادة", "ماجستير", "أوروبا"],
    interests: ["قيادة", "إدارة", "سياسات"],
    officialUrl: "https://www.chevening.org/", sourceUrl: "https://www.chevening.org/scholarship/",
  }),
  mk({
    id: "s2", title: "منحة فولبرايت للدراسات العليا", org: "السفارة الأمريكية", country: "الولايات المتحدة",
    countryCode: "US", flag: "🇺🇸", category: "global", studyLang: "en",
    deadline: "2026-09-15", amount: "$45,000", field: "العلوم والهندسة", level: "ماجستير ودكتوراه",
    verified: true, description: "برنامج تبادل أكاديمي مرموق يدعم الدراسات العليا والبحث العلمي في أمريكا.",
    tags: ["بحث", "أمريكا", "دكتوراه"],
    interests: ["تكنولوجيا", "هندسة", "علوم"],
    officialUrl: "https://foreign.fulbrightonline.org/", sourceUrl: "https://foreign.fulbrightonline.org/about",
  }),
  mk({
    id: "s3", title: "منحة DAAD الألمانية", org: "الهيئة الألمانية للتبادل", country: "ألمانيا",
    countryCode: "DE", flag: "🇩🇪", category: "global", studyLang: "en",
    deadline: "2026-10-20", amount: "€934/شهر", field: "هندسة وتكنولوجيا", level: "ماجستير",
    verified: true, description: "منح شهرية مع تأمين صحي ودعم لتعلم اللغة الألمانية.",
    tags: ["ألمانيا", "هندسة"],
    interests: ["هندسة", "تكنولوجيا"],
    officialUrl: "https://www.daad.de/en/", sourceUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
  }),
  mk({
    id: "s4", title: "منحة الملك عبدالله للتميز العلمي", org: "جامعة كاوست", country: "المملكة العربية السعودية",
    countryCode: "SA", flag: "🇸🇦", category: "arab", studyLang: "both",
    deadline: "2026-12-01", amount: "تمويل كامل + راتب", field: "علوم وتكنولوجيا", level: "ماجستير ودكتوراه",
    verified: true, description: "تمويل كامل مع راتب شهري وسكن للدراسات العليا في كاوست.",
    tags: ["السعودية", "كاوست"],
    interests: ["علوم", "تكنولوجيا", "بحث"],
    officialUrl: "https://www.kaust.edu.sa/", sourceUrl: "https://www.kaust.edu.sa/en/study/fellowship",
  }),
  mk({
    id: "s5", title: "برنامج إيراسموس موندوس", org: "الاتحاد الأوروبي", country: "أوروبا",
    countryCode: "EU", flag: "🇪🇺", category: "global", studyLang: "en",
    deadline: "2026-01-10", amount: "€1,400/شهر", field: "متعدد التخصصات", level: "ماجستير مشترك",
    verified: false, manualReview: true,
    description: "برنامج ماجستير مشترك بين عدة جامعات أوروبية مع منحة شاملة.",
    tags: ["أوروبا", "تبادل"],
    interests: ["تبادل", "أوروبا"],
    officialUrl: "https://erasmus-plus.ec.europa.eu/", sourceUrl: "https://erasmus-plus.ec.europa.eu/opportunities",
  }),
  mk({
    id: "s6", title: "منحة جامعة طوكيو الدولية", org: "MEXT اليابان", country: "اليابان",
    countryCode: "JP", flag: "🇯🇵", category: "global", studyLang: "en",
    deadline: "2026-06-30", amount: "¥147,000/شهر", field: "هندسة وعلوم", level: "بكالوريوس وماجستير",
    verified: true, description: "منحة حكومية يابانية كاملة تشمل الرسوم وتذاكر السفر والراتب.",
    tags: ["اليابان", "آسيا"],
    interests: ["هندسة", "علوم"],
    officialUrl: "https://www.studyinjapan.go.jp/en/", sourceUrl: "https://www.studyinjapan.go.jp/en/planning/scholarship/",
  }),
  mk({
    id: "s7", title: "منحة قطر للتنمية البشرية", org: "مؤسسة قطر", country: "قطر",
    countryCode: "QA", flag: "🇶🇦", category: "arab", studyLang: "both",
    deadline: "2026-08-15", amount: "تمويل كامل", field: "السياسات والإدارة", level: "ماجستير",
    verified: false, manualReview: true,
    description: "برنامج رائد لتنمية الكوادر القيادية في المنطقة العربية.",
    tags: ["قطر", "قيادة"],
    interests: ["قيادة", "إدارة"],
    officialUrl: "https://www.qf.org.qa/", sourceUrl: "https://www.qf.org.qa/education",
  }),
  mk({
    id: "s8", title: "منحة ETH زيورخ للهندسة", org: "ETH Zürich", country: "سويسرا",
    countryCode: "CH", flag: "🇨🇭", category: "global", studyLang: "en",
    deadline: "2026-12-15", amount: "CHF 11,000/سنة", field: "هندسة وحاسوب", level: "ماجستير",
    verified: true, description: "منحة تميز للطلاب الدوليين المتفوقين في تخصصات الهندسة.",
    tags: ["سويسرا", "تميز"],
    interests: ["هندسة", "تكنولوجيا"],
    officialUrl: "https://ethz.ch/", sourceUrl: "https://ethz.ch/students/en/studies/financial/scholarships.html",
  }),
  mk({
    id: "s9", title: "منحة جامعة الإمارات للماجستير", org: "جامعة الإمارات", country: "الإمارات",
    countryCode: "AE", flag: "🇦🇪", category: "arab", studyLang: "both",
    deadline: "2026-07-20", amount: "تمويل كامل + سكن", field: "متعدد التخصصات", level: "ماجستير",
    verified: true, description: "منحة شاملة تغطي الرسوم والسكن لطلاب الدراسات العليا في الإمارات.",
    tags: ["الإمارات", "ماجستير"],
    interests: ["إدارة", "هندسة"],
    officialUrl: "https://www.uaeu.ac.ae/", sourceUrl: "https://www.uaeu.ac.ae/en/admission/",
  }),
  mk({
    id: "s10", title: "منحة الأزهر الشريف للوافدين", org: "جامعة الأزهر", country: "مصر",
    countryCode: "EG", flag: "🇪🇬", category: "arab", studyLang: "ar",
    deadline: "2026-09-30", amount: "رسوم + إقامة", field: "علوم شرعية ولغوية", level: "بكالوريوس وماجستير",
    verified: true, description: "منحة الأزهر الشريف للطلاب الوافدين لدراسة العلوم الشرعية واللغة العربية.",
    tags: ["مصر", "الأزهر"],
    interests: ["تعليم", "بحث"],
    officialUrl: "https://www.azhar.edu.eg/", sourceUrl: "https://www.azhar.edu.eg/",
  }),
];

export interface NewsItem {
  id: string; title: string; category: "global" | "local" | "sports" | "economy" | "weather";
  summary: string; time: string; source: string; image?: string; aiLink?: string;
}

export const NEWS: NewsItem[] = [
  { id: "n1", category: "economy", title: "ارتفاع الذهب لأعلى مستوياته خلال شهر", summary: "سجل سعر الذهب ارتفاعاً ملحوظاً مع تراجع الدولار الأمريكي.", time: "قبل ساعة", source: "رويترز",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=70",
    aiLink: "هذا الارتفاع قد يؤثر على المنح الممولة بالدولار — راجع منح فولبرايت." },
  { id: "n2", category: "global", title: "الاتحاد الأوروبي يوسع برامج المنح للطلاب الدوليين", summary: "إعلان عن زيادة مخصصات إيراسموس بنسبة 15% للعام القادم.", time: "قبل 3 ساعات", source: "EU News",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=70",
    aiLink: "فرصة جديدة! تحقق من برنامج إيراسموس موندوس في صفحة المنح." },
  { id: "n3", category: "local", title: "افتتاح مركز ابتكار جديد في الرياض", summary: "يستهدف المركز دعم رواد الأعمال والباحثين الشباب.", time: "قبل 5 ساعات", source: "العربية",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=70" },
  { id: "n4", category: "sports", title: "كأس العالم 2026: التحضيرات تدخل مرحلتها النهائية", summary: "ثلاث دول مستضيفة تستعد لاستقبال أكبر بطولة كروية.", time: "قبل 6 ساعات", source: "BBC",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=70" },
  { id: "n5", category: "weather", title: "موجة حر متوقعة على دول الخليج", summary: "هيئة الأرصاد تحذر من ارتفاع درجات الحرارة الأسبوع القادم.", time: "قبل ساعتين", source: "الأرصاد",
    image: "https://images.unsplash.com/photo-1561489413-985b06da5bee?w=800&auto=format&fit=crop&q=70" },
  { id: "n6", category: "economy", title: "البنك المركزي الأوروبي يبقي أسعار الفائدة دون تغيير", summary: "قرار متوقع من قبل المحللين وسط استقرار التضخم.", time: "قبل 8 ساعات", source: "Bloomberg",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=70" },
];

export interface Currency {
  code: string;
  name: string;
  rate: number;
  flag: string;
  symbol: string;
  apiCode?: string; // code used by external rates API
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "دولار أمريكي", rate: 1,      flag: "🇺🇸", symbol: "$",   apiCode: "USD" },
  { code: "EUR", name: "يورو",          rate: 0.92,  flag: "🇪🇺", symbol: "€",   apiCode: "EUR" },
  { code: "SAR", name: "ريال سعودي",    rate: 3.75,  flag: "🇸🇦", symbol: "ر.س", apiCode: "SAR" },
  { code: "AED", name: "درهم إماراتي",  rate: 3.67,  flag: "🇦🇪", symbol: "د.إ", apiCode: "AED" },
  { code: "QTR", name: "ريال قطري",     rate: 3.64,  flag: "🇶🇦", symbol: "ر.ق", apiCode: "QAR" },
  { code: "SDG", name: "جنيه سوداني",   rate: 600,   flag: "🇸🇩", symbol: "ج.س", apiCode: "SDG" },
  { code: "EGP", name: "جنيه مصري",     rate: 49,    flag: "🇪🇬", symbol: "ج.م", apiCode: "EGP" },
  { code: "DZD", name: "دينار جزائري",  rate: 134,   flag: "🇩🇿", symbol: "د.ج", apiCode: "DZD" },
  { code: "MAD", name: "درهم مغربي",    rate: 9.95,  flag: "🇲🇦", symbol: "د.م", apiCode: "MAD" },
  { code: "GOLD", name: "غرام ذهب 24",  rate: 0.0144, flag: "🥇", symbol: "g",   apiCode: "XAU" },
];

export const INTEREST_OPTIONS = [
  "طب", "هندسة", "تكنولوجيا", "علوم", "إدارة", "سياسات",
  "قيادة", "بحث", "فنون", "اقتصاد", "قانون", "تعليم", "تبادل",
];

export const computeMatchScore = (
  s: Scholarship,
  profile: { location?: string | null; skills?: string[] | null; interests?: string[] | null }
): number => {
  let score = 50;
  const loc = (profile.location || "").toLowerCase();
  if (loc && s.country && (loc.includes(s.country.toLowerCase()) || s.country.toLowerCase().includes(loc))) score += 20;
  const interests = profile.interests ?? [];
  const matchInterests = s.interests.filter(i => interests.includes(i)).length;
  score += Math.min(20, matchInterests * 10);
  const skills = profile.skills ?? [];
  const matchSkills = s.tags.filter(t => skills.includes(t)).length;
  score += Math.min(10, matchSkills * 5);
  return Math.min(99, Math.max(40, score));
};
