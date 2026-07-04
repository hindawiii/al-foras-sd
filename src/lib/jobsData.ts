export type JobCategory = "programming" | "design" | "writing" | "teaching" | "trades" | "content" | "entry" | "new";

export interface JobStep {
  step: number;
  title: string;
  description: string;
  tips?: string;
}

export interface JobStory {
  name: string;
  city?: string;
  currentLocation?: string;
  earnings?: string;
  story: string;
  tips?: string;
}

export interface PaymentMethod {
  name: string;
  availableInSudan: boolean;
  notes?: string;
  alternativeForSudan?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  emoji: string;
  type: string;
  category: JobCategory;
  subCategory?: string;
  availability: {
    global: boolean;
    countries: string[];        // ISO country names in Arabic or "all"
    restrictedCountries: string[];
    notes?: string;
  };
  salary: { min: number; max: number; currency: string; period: "hour" | "month" | "project"; average?: string };
  withdrawal: {
    minAmount: number;
    currency: string;
    methods: PaymentMethod[];
    processingTime?: string;
  };
  commission?: { percentage: string; notes?: string };
  rating: { score: number; totalReviews: number; trustLevel: string };
  description: string;
  requirements: string[];
  skills: string[];
  registrationGuide: { steps: JobStep[]; estimatedTime?: string; videoTutorial?: string };
  contact: {
    website?: string;
    email?: string;
    whatsapp?: string | null;
    facebook?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    supportCenter?: string;
  };
  successStories: JobStory[];
  pros: string[];
  cons: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  dateAdded: string;
}

export const JOB_CATEGORIES: { id: JobCategory | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "الكل", emoji: "🌟" },
  { id: "programming", label: "برمجة", emoji: "💻" },
  { id: "design", label: "تصميم", emoji: "🎨" },
  { id: "writing", label: "كتابة", emoji: "✍️" },
  { id: "teaching", label: "تدريس", emoji: "🎓" },
  { id: "trades", label: "مهني", emoji: "🔧" },
  { id: "content", label: "محتوى", emoji: "📱" },
  { id: "entry", label: "مبتدئ", emoji: "💰" },
  { id: "new", label: "جديد", emoji: "🆕" },
];

export const JOBS: Job[] = [
  {
    id: "upwork-001",
    title: "مطور React.js",
    company: "Upwork",
    emoji: "💻",
    type: "فريلانسر",
    category: "programming",
    subCategory: "تطوير الويب",
    availability: {
      global: true,
      countries: ["all"],
      restrictedCountries: [],
      notes: "متاح لجميع الدول",
    },
    salary: { min: 30, max: 80, currency: "USD", period: "hour", average: "50" },
    withdrawal: {
      minAmount: 100,
      currency: "USD",
      methods: [
        { name: "PayPal", availableInSudan: false, alternativeForSudan: "Payoneer" },
        { name: "Payoneer", availableInSudan: true, notes: "يعمل في السودان" },
        { name: "Bank Transfer", availableInSudan: true, notes: "عبر بنكك المحلي" },
      ],
      processingTime: "2-5 أيام عمل",
    },
    commission: { percentage: "10-20%", notes: "تنخفض مع زيادة العمل" },
    rating: { score: 4.8, totalReviews: 150000, trustLevel: "عالي جداً" },
    description: "أكبر منصة فريلانسر في العالم تربط المستقلين بالعملاء من كل مكان.",
    requirements: ["خبرة سنتين+ في React.js", "محفظة أعمال (Portfolio)", "إجادة اللغة الإنجليزية"],
    skills: ["React", "TypeScript", "Node.js", "Git"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب", description: "ادخل إلى upwork.com واضغط Sign Up", tips: "استخدم إيميل حقيقي" },
        { step: 2, title: "إكمال الملف الشخصي", description: "أضف صورة، وصف، مهارات، ومحفظة أعمال", tips: "اكتب وصفاً احترافياً بالإنجليزية" },
        { step: 3, title: "اجتياز اختبار القبول", description: "قد يطلب Upwork اختباراً للموافقة على حسابك", tips: "اقرأ شروط المنصة جيداً" },
        { step: 4, title: "التقديم على أول مشروع", description: "ابحث عن مشاريع مناسبة وقدّم عرضاً", tips: "ابدأ بأسعار منخفضة لبناء سمعتك" },
      ],
      estimatedTime: "30 دقيقة",
    },
    contact: {
      website: "https://www.upwork.com",
      email: "support@upwork.com",
      facebook: "https://facebook.com/upwork",
      instagram: "https://instagram.com/upwork",
      twitter: "https://twitter.com/upwork",
      linkedin: "https://linkedin.com/company/upwork",
      supportCenter: "https://support.upwork.com",
    },
    successStories: [
      { name: "أحمد محمد", city: "الخرطوم", currentLocation: "خارج السودان — الإمارات", earnings: "$5000/شهر", story: "بدأت في Upwork عام 2019 كمطور واجهات، وبعد سنة كنت أعمل بدوام كامل عن بُعد.", tips: "الصبر والاستمرارية هما المفتاح" },
      { name: "فاطمة علي", city: "بورتسودان", currentLocation: "داخل السودان", earnings: "$2000/شهر", story: "أعمل من منزلي في بورتسودان مع عملاء من أوروبا وأمريكا.", tips: "تعلم الإنجليزية جيداً" },
    ],
    pros: ["أكبر منصة فريلانسر في العالم", "فرص عمل وفيرة", "حماية للمستقل والعميل"],
    cons: ["منافسة شديدة", "عمولة مرتفعة في البداية", "يحتاج إنجليزية جيدة"],
    isFeatured: true,
    isVerified: true,
    dateAdded: "2024-01-15",
  },
  {
    id: "preply-001",
    title: "معلم لغة عربية عن بُعد",
    company: "Preply",
    emoji: "🎓",
    type: "عن بُعد",
    category: "teaching",
    subCategory: "تدريس اللغات",
    availability: { global: true, countries: ["all"], restrictedCountries: [], notes: "متاح لجميع الدول" },
    salary: { min: 10, max: 40, currency: "USD", period: "hour", average: "20" },
    withdrawal: {
      minAmount: 20, currency: "USD",
      methods: [
        { name: "PayPal", availableInSudan: false, alternativeForSudan: "Payoneer" },
        { name: "Payoneer", availableInSudan: true, notes: "يعمل في السودان" },
        { name: "Skrill", availableInSudan: false, alternativeForSudan: "Payoneer" },
      ],
      processingTime: "1-3 أيام عمل",
    },
    commission: { percentage: "18-33%", notes: "تنخفض حسب عدد الساعات" },
    rating: { score: 4.5, totalReviews: 50000, trustLevel: "عالي" },
    description: "منصة عالمية لتدريس اللغات عبر الإنترنت، مناسبة لمعلمي اللغة العربية للناطقين بغيرها.",
    requirements: ["إتقان اللغة العربية", "قدرة تدريس واضحة", "كاميرا وميكروفون بجودة جيدة"],
    skills: ["تدريس", "اللغة العربية", "التواصل", "Zoom"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل كمعلم", description: "أنشئ حساباً على preply.com واختر تعليم العربية", tips: "استخدم اسمك الحقيقي" },
        { step: 2, title: "تسجيل فيديو تعريفي", description: "سجّل فيديو قصير يقدّمك للطلاب", tips: "ابتسم وتحدث بوضوح" },
        { step: 3, title: "ضبط السعر والجدول", description: "حدّد سعر الساعة والأوقات المتاحة" },
        { step: 4, title: "استقبال الطلاب", description: "ابدأ بجلسات تجريبية لاستقطاب طلابك الأوائل" },
      ],
      estimatedTime: "45 دقيقة",
    },
    contact: {
      website: "https://preply.com",
      email: "support@preply.com",
      facebook: "https://facebook.com/preply",
      instagram: "https://instagram.com/preply",
      supportCenter: "https://help.preply.com",
    },
    successStories: [
      { name: "منى عبدالله", city: "أم درمان", currentLocation: "داخل السودان", earnings: "$1200/شهر", story: "بدأت بجلستين أسبوعياً والآن لديّ 30 طالباً منتظماً.", tips: "استمعي لطلابك جيداً" },
    ],
    pros: ["مرونة في الأوقات", "تعلّم لغات أخرى مجاناً", "لا تحتاج شهادات معتمدة"],
    cons: ["منافسة كبيرة في البداية", "عمولة مرتفعة على المبتدئين"],
    isFeatured: true,
    isVerified: true,
    dateAdded: "2024-02-01",
  },
  {
    id: "sudan-plumber-001",
    title: "سبّاك محترف",
    company: "شركة مقاولات السودان",
    emoji: "🔧",
    type: "دوام كامل",
    category: "trades",
    availability: { global: false, countries: ["السودان"], restrictedCountries: [], notes: "داخل السودان فقط" },
    salary: { min: 400000, max: 600000, currency: "SDG", period: "month", average: "500000" },
    withdrawal: {
      minAmount: 0, currency: "SDG",
      methods: [
        { name: "نقداً", availableInSudan: true },
        { name: "بنك محلي", availableInSudan: true, notes: "أي بنك سوداني" },
      ],
      processingTime: "فوري",
    },
    rating: { score: 4.2, totalReviews: 200, trustLevel: "جيد" },
    description: "فرصة عمل بدوام كامل لسبّاكين محترفين في مشاريع سكنية وتجارية داخل السودان.",
    requirements: ["خبرة سنتين+ في السباكة", "أدوات شخصية", "الالتزام بمواعيد العمل"],
    skills: ["السباكة", "قراءة المخططات", "الصيانة"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التواصل مع الشركة", description: "اتصل أو أرسل رسالة عبر واتساب", tips: "احضر السيرة الذاتية" },
        { step: 2, title: "مقابلة شخصية", description: "قد تُطلب مقابلة قصيرة لتقييم الخبرة" },
        { step: 3, title: "توقيع العقد", description: "توقيع عقد عمل رسمي" },
      ],
      estimatedTime: "أسبوع",
    },
    contact: {
      whatsapp: "https://wa.me/249900000000",
      email: "jobs@example.sd",
    },
    successStories: [],
    pros: ["راتب ثابت شهرياً", "لا يحتاج إنجليزية", "متاح داخل السودان"],
    cons: ["عمل ميداني مجهد", "يحتاج تنقلاً بين المواقع"],
    isNew: true,
    isVerified: true,
    dateAdded: "2024-06-20",
  },
  {
    id: "canva-designer-001",
    title: "مصمم جرافيك عن بُعد",
    company: "Fiverr",
    emoji: "🎨",
    type: "فريلانسر",
    category: "design",
    availability: { global: true, countries: ["all"], restrictedCountries: [], notes: "متاح لجميع الدول" },
    salary: { min: 5, max: 200, currency: "USD", period: "project", average: "50" },
    withdrawal: {
      minAmount: 20, currency: "USD",
      methods: [
        { name: "PayPal", availableInSudan: false, alternativeForSudan: "Payoneer" },
        { name: "Payoneer", availableInSudan: true, notes: "الأفضل للسودانيين" },
        { name: "Bank Transfer", availableInSudan: true },
      ],
      processingTime: "2-14 يوماً",
    },
    commission: { percentage: "20%", notes: "ثابتة على كل عملية" },
    rating: { score: 4.6, totalReviews: 90000, trustLevel: "عالي" },
    description: "منصة عالمية لبيع الخدمات المصغّرة، خصوصاً في التصميم والكتابة والفيديو.",
    requirements: ["إتقان أدوات التصميم", "محفظة أعمال", "إنجليزية أساسية"],
    skills: ["Photoshop", "Illustrator", "Figma", "Canva"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب بائع", description: "سجّل في fiverr.com واختر Become a Seller" },
        { step: 2, title: "إنشاء أول Gig", description: "أضف عنواناً، وصفاً، صوراً، وأسعاراً" },
        { step: 3, title: "الترويج للخدمة", description: "شارك رابط الـ Gig على شبكاتك الاجتماعية" },
      ],
      estimatedTime: "20 دقيقة",
    },
    contact: {
      website: "https://www.fiverr.com",
      email: "support@fiverr.com",
      supportCenter: "https://help.fiverr.com",
    },
    successStories: [
      { name: "خالد إبراهيم", city: "الخرطوم", currentLocation: "داخل السودان", earnings: "$800/شهر", story: "بدأت بتصميم شعارات بـ 5 دولار والآن أتقاضى 100 دولار لكل شعار.", tips: "الجودة أهم من السعر" },
    ],
    pros: ["بداية سهلة", "لا يحتاج مقابلات", "دفع مضمون"],
    cons: ["عمولة 20% ثابتة", "منافسة كبيرة على الخدمات الرخيصة"],
    isNew: true,
    isFeatured: false,
    isVerified: true,
    dateAdded: "2024-05-10",
  },
];
