// دليل الجامعات العربية — بيانات إرشادية عامة مجموعة من المواقع الرسمية للجامعات
// ووزارات التعليم العالي. النسب المئوية تقديرية للحد الأدنى للقبول.

export type ArabUniType = "government" | "private";

export interface ArabUniversity {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  countryEn: string;
  flag: string;
  city: string;
  type: ArabUniType;
  website: string;
  faculties: string[];
  minPercentage: number;
  language: "ar" | "en" | "mixed";
  scholarships: boolean;
  highlights: string;
  highlightsEn: string;
}

export const ARAB_UNIVERSITIES: ArabUniversity[] = [
  { id: "eg-cairo", name: "جامعة القاهرة", nameEn: "Cairo University", country: "مصر", countryEn: "Egypt", flag: "🇪🇬", city: "القاهرة", type: "government", website: "https://cu.edu.eg/", faculties: ["الطب", "الهندسة", "الحقوق", "الاقتصاد والعلوم السياسية", "الصيدلة", "الحاسبات"], minPercentage: 85, language: "mixed", scholarships: true, highlights: "أكبر الجامعات المصرية وأعرقها، تستقبل آلاف الطلاب الوافدين سنوياً.", highlightsEn: "Egypt's largest and oldest university, hosting thousands of international students." },
  { id: "eg-ain-shams", name: "جامعة عين شمس", nameEn: "Ain Shams University", country: "مصر", countryEn: "Egypt", flag: "🇪🇬", city: "القاهرة", type: "government", website: "https://www.asu.edu.eg/", faculties: ["الطب", "الهندسة", "الألسن", "التجارة", "التربية"], minPercentage: 82, language: "mixed", scholarships: true, highlights: "متميزة في كلية الألسن والطب، ورسوم الوافدين معقولة.", highlightsEn: "Renowned for languages and medicine with reasonable international fees." },
  { id: "eg-azhar", name: "جامعة الأزهر", nameEn: "Al-Azhar University", country: "مصر", countryEn: "Egypt", flag: "🇪🇬", city: "القاهرة", type: "government", website: "https://www.azhar.edu.eg/", faculties: ["الشريعة", "أصول الدين", "الطب", "الهندسة", "اللغة العربية"], minPercentage: 70, language: "ar", scholarships: true, highlights: "منح كاملة للطلاب المسلمين من كل العالم عبر البعوث الإسلامية.", highlightsEn: "Full scholarships for Muslim students worldwide via Islamic missions." },
  { id: "sa-kau", name: "جامعة الملك عبدالعزيز", nameEn: "King Abdulaziz University", country: "السعودية", countryEn: "Saudi Arabia", flag: "🇸🇦", city: "جدة", type: "government", website: "https://www.kau.edu.sa/", faculties: ["الطب", "الهندسة", "علوم الحاسب", "علوم البحار", "إدارة الأعمال"], minPercentage: 88, language: "mixed", scholarships: true, highlights: "منح دراسية كاملة مع مكافأة شهرية وتذاكر سفر.", highlightsEn: "Full scholarships with monthly stipend and travel tickets." },
  { id: "sa-kfupm", name: "جامعة الملك فهد للبترول والمعادن", nameEn: "KFUPM", country: "السعودية", countryEn: "Saudi Arabia", flag: "🇸🇦", city: "الظهران", type: "government", website: "https://www.kfupm.edu.sa/", faculties: ["الهندسة", "علوم الحاسب", "علوم الأرض", "إدارة الأعمال"], minPercentage: 92, language: "en", scholarships: true, highlights: "الأولى عربياً في الهندسة والبترول، الدراسة بالإنجليزية بالكامل.", highlightsEn: "Top Arab school for engineering and petroleum, fully taught in English." },
  { id: "sa-ksu", name: "جامعة الملك سعود", nameEn: "King Saud University", country: "السعودية", countryEn: "Saudi Arabia", flag: "🇸🇦", city: "الرياض", type: "government", website: "https://ksu.edu.sa/", faculties: ["الطب", "الهندسة", "الحاسب", "العلوم", "إدارة الأعمال"], minPercentage: 90, language: "mixed", scholarships: true, highlights: "أعرق جامعات المملكة مع مرافق بحثية ضخمة.", highlightsEn: "The Kingdom's oldest university with vast research facilities." },
  { id: "ae-uaeu", name: "جامعة الإمارات العربية المتحدة", nameEn: "United Arab Emirates University", country: "الإمارات", countryEn: "UAE", flag: "🇦🇪", city: "العين", type: "government", website: "https://www.uaeu.ac.ae/", faculties: ["الطب", "الهندسة", "تقنية المعلومات", "الأعمال", "العلوم"], minPercentage: 85, language: "en", scholarships: true, highlights: "أعلى تصنيفاً في الخليج، منح للطلاب المتفوقين.", highlightsEn: "Highest-ranked in the Gulf, scholarships for high achievers." },
  { id: "ae-ku", name: "جامعة خليفة", nameEn: "Khalifa University", country: "الإمارات", countryEn: "UAE", flag: "🇦🇪", city: "أبوظبي", type: "government", website: "https://www.ku.ac.ae/", faculties: ["الهندسة", "الذكاء الاصطناعي", "الطب", "العلوم"], minPercentage: 90, language: "en", scholarships: true, highlights: "منح كاملة تشمل السكن والراتب لطلاب الهندسة والذكاء الاصطناعي.", highlightsEn: "Full scholarships with housing and stipend for engineering and AI." },
  { id: "qa-qu", name: "جامعة قطر", nameEn: "Qatar University", country: "قطر", countryEn: "Qatar", flag: "🇶🇦", city: "الدوحة", type: "government", website: "https://www.qu.edu.qa/", faculties: ["الطب", "الهندسة", "الشريعة", "الإدارة", "التربية"], minPercentage: 85, language: "mixed", scholarships: true, highlights: "منح للطلاب الدوليين مع إعفاء من الرسوم الدراسية.", highlightsEn: "International scholarships with tuition waivers." },
  { id: "kw-ku", name: "جامعة الكويت", nameEn: "Kuwait University", country: "الكويت", countryEn: "Kuwait", flag: "🇰🇼", city: "مدينة الكويت", type: "government", website: "https://www.ku.edu.kw/", faculties: ["الطب", "الهندسة", "الحقوق", "العلوم الإدارية"], minPercentage: 86, language: "mixed", scholarships: true, highlights: "عدد محدود من المنح المخصصة للطلاب العرب.", highlightsEn: "Limited scholarship seats allocated to Arab students." },
  { id: "om-squ", name: "جامعة السلطان قابوس", nameEn: "Sultan Qaboos University", country: "عُمان", countryEn: "Oman", flag: "🇴🇲", city: "مسقط", type: "government", website: "https://www.squ.edu.om/", faculties: ["الطب", "الهندسة", "الزراعة", "العلوم", "الاقتصاد"], minPercentage: 84, language: "en", scholarships: true, highlights: "منح سنوية للطلاب العرب مع سكن جامعي مجاني.", highlightsEn: "Annual Arab-student scholarships with free housing." },
  { id: "bh-uob", name: "جامعة البحرين", nameEn: "University of Bahrain", country: "البحرين", countryEn: "Bahrain", flag: "🇧🇭", city: "المنامة", type: "government", website: "https://www.uob.edu.bh/", faculties: ["الهندسة", "تقنية المعلومات", "الأعمال", "الآداب"], minPercentage: 78, language: "mixed", scholarships: false, highlights: "رسوم تنافسية وبرامج هندسية معتمدة دولياً.", highlightsEn: "Competitive fees and internationally accredited engineering programs." },
  { id: "jo-ju", name: "الجامعة الأردنية", nameEn: "University of Jordan", country: "الأردن", countryEn: "Jordan", flag: "🇯🇴", city: "عمّان", type: "government", website: "https://ju.edu.jo/", faculties: ["الطب", "الهندسة", "الصيدلة", "تقنية المعلومات", "الحقوق"], minPercentage: 85, language: "mixed", scholarships: true, highlights: "الأكثر استقطاباً للطلاب العرب في المشرق.", highlightsEn: "The most popular destination for Arab students in the Levant." },
  { id: "jo-just", name: "جامعة العلوم والتكنولوجيا الأردنية", nameEn: "Jordan University of Science & Technology", country: "الأردن", countryEn: "Jordan", flag: "🇯🇴", city: "إربد", type: "government", website: "https://www.just.edu.jo/", faculties: ["الطب", "طب الأسنان", "الهندسة", "الصيدلة", "التمريض"], minPercentage: 87, language: "en", scholarships: true, highlights: "من الأقوى عربياً في الطب والهندسة.", highlightsEn: "Among the strongest Arab schools in medicine and engineering." },
  { id: "lb-aub", name: "الجامعة الأميركية في بيروت", nameEn: "American University of Beirut", country: "لبنان", countryEn: "Lebanon", flag: "🇱🇧", city: "بيروت", type: "private", website: "https://www.aub.edu.lb/", faculties: ["الطب", "الهندسة", "إدارة الأعمال", "العلوم الصحية", "الآداب"], minPercentage: 85, language: "en", scholarships: true, highlights: "منح مالية سخية قائمة على الحاجة والتفوق.", highlightsEn: "Generous need- and merit-based financial aid." },
  { id: "lb-ul", name: "الجامعة اللبنانية", nameEn: "Lebanese University", country: "لبنان", countryEn: "Lebanon", flag: "🇱🇧", city: "بيروت", type: "government", website: "https://www.ul.edu.lb/", faculties: ["الطب", "الهندسة", "العلوم", "الحقوق", "الإعلام"], minPercentage: 70, language: "mixed", scholarships: false, highlights: "الجامعة الحكومية الوحيدة في لبنان، رسوم رمزية.", highlightsEn: "Lebanon's only public university, symbolic tuition." },
  { id: "sy-damascus", name: "جامعة دمشق", nameEn: "Damascus University", country: "سوريا", countryEn: "Syria", flag: "🇸🇾", city: "دمشق", type: "government", website: "https://damascusuniversity.edu.sy/", faculties: ["الطب", "الهندسة", "الصيدلة", "الحقوق", "الآداب"], minPercentage: 75, language: "ar", scholarships: false, highlights: "من أقدم الجامعات العربية ورسومها منخفضة جداً.", highlightsEn: "One of the oldest Arab universities with very low fees." },
  { id: "iq-baghdad", name: "جامعة بغداد", nameEn: "University of Baghdad", country: "العراق", countryEn: "Iraq", flag: "🇮🇶", city: "بغداد", type: "government", website: "https://uobaghdad.edu.iq/", faculties: ["الطب", "الهندسة", "العلوم", "الإدارة والاقتصاد", "التربية"], minPercentage: 80, language: "ar", scholarships: false, highlights: "أكبر جامعات العراق وأوسعها تخصصاً.", highlightsEn: "Iraq's largest and most diverse university." },
  { id: "iq-auis", name: "الجامعة الأميركية في العراق - السليمانية", nameEn: "AUIS", country: "العراق", countryEn: "Iraq", flag: "🇮🇶", city: "السليمانية", type: "private", website: "https://auis.edu.krd/", faculties: ["تقنية المعلومات", "الهندسة", "إدارة الأعمال", "العلوم السياسية"], minPercentage: 75, language: "en", scholarships: true, highlights: "منح جزئية وكاملة ودراسة بالإنجليزية بنظام أميركي.", highlightsEn: "Partial and full scholarships, US-style English instruction." },
  { id: "ps-birzeit", name: "جامعة بيرزيت", nameEn: "Birzeit University", country: "فلسطين", countryEn: "Palestine", flag: "🇵🇸", city: "بيرزيت", type: "private", website: "https://www.birzeit.edu/", faculties: ["الهندسة", "تقنية المعلومات", "الحقوق", "الأعمال", "العلوم"], minPercentage: 75, language: "mixed", scholarships: true, highlights: "الأعلى تصنيفاً في فلسطين مع صندوق منح للطلاب.", highlightsEn: "Palestine's top-ranked university with a student aid fund." },
  { id: "dz-usthb", name: "جامعة هواري بومدين للعلوم والتكنولوجيا", nameEn: "USTHB", country: "الجزائر", countryEn: "Algeria", flag: "🇩🇿", city: "الجزائر العاصمة", type: "government", website: "https://www.usthb.dz/", faculties: ["الهندسة", "الإعلام الآلي", "الفيزياء", "الكيمياء", "الرياضيات"], minPercentage: 78, language: "mixed", scholarships: true, highlights: "أهم قطب علمي وتقني في الجزائر، التعليم مجاني.", highlightsEn: "Algeria's leading science and tech hub, tuition-free." },
  { id: "ma-um5", name: "جامعة محمد الخامس", nameEn: "Mohammed V University", country: "المغرب", countryEn: "Morocco", flag: "🇲🇦", city: "الرباط", type: "government", website: "https://www.um5.ac.ma/", faculties: ["الطب", "الهندسة", "الحقوق", "العلوم", "الآداب"], minPercentage: 80, language: "mixed", scholarships: true, highlights: "منح الوكالة المغربية للتعاون الدولي للطلاب الأفارقة والعرب.", highlightsEn: "AMCI scholarships for African and Arab students." },
  { id: "ma-al-akhawayn", name: "جامعة الأخوين", nameEn: "Al Akhawayn University", country: "المغرب", countryEn: "Morocco", flag: "🇲🇦", city: "إفران", type: "private", website: "https://www.aui.ma/", faculties: ["إدارة الأعمال", "الهندسة", "العلوم الإنسانية"], minPercentage: 80, language: "en", scholarships: true, highlights: "نظام أميركي بالإنجليزية مع منح على أساس الحاجة.", highlightsEn: "US-style English curriculum with need-based aid." },
  { id: "tn-tunis-manar", name: "جامعة تونس المنار", nameEn: "University of Tunis El Manar", country: "تونس", countryEn: "Tunisia", flag: "🇹🇳", city: "تونس", type: "government", website: "http://www.utm.rnu.tn/", faculties: ["الطب", "الهندسة", "العلوم", "الاقتصاد"], minPercentage: 78, language: "mixed", scholarships: true, highlights: "قوية في الطب والهندسة مع رسوم منخفضة جداً.", highlightsEn: "Strong in medicine and engineering with very low fees." },
  { id: "ly-tripoli", name: "جامعة طرابلس", nameEn: "University of Tripoli", country: "ليبيا", countryEn: "Libya", flag: "🇱🇾", city: "طرابلس", type: "government", website: "https://uot.edu.ly/", faculties: ["الطب", "الهندسة", "العلوم", "الاقتصاد", "التربية"], minPercentage: 70, language: "ar", scholarships: false, highlights: "أكبر جامعات ليبيا والتعليم فيها شبه مجاني.", highlightsEn: "Libya's largest university with nearly free education." },
  { id: "sd-khartoum", name: "جامعة الخرطوم", nameEn: "University of Khartoum", country: "السودان", countryEn: "Sudan", flag: "🇸🇩", city: "الخرطوم", type: "government", website: "https://www.uofk.edu/", faculties: ["الطب", "الهندسة", "العلوم", "الاقتصاد", "القانون"], minPercentage: 85, language: "mixed", scholarships: true, highlights: "أعرق الجامعات السودانية — راجع دليل الجامعات السودانية للتفاصيل.", highlightsEn: "Sudan's most prestigious university — see the Sudan guide for details." },
  { id: "ye-sanaa", name: "جامعة صنعاء", nameEn: "Sana'a University", country: "اليمن", countryEn: "Yemen", flag: "🇾🇪", city: "صنعاء", type: "government", website: "https://su.edu.ye/", faculties: ["الطب", "الهندسة", "التربية", "الآداب", "التجارة"], minPercentage: 70, language: "ar", scholarships: false, highlights: "أكبر جامعات اليمن مع رسوم رمزية.", highlightsEn: "Yemen's largest university with symbolic fees." },
  { id: "mr-nouakchott", name: "جامعة نواكشوط العصرية", nameEn: "University of Nouakchott", country: "موريتانيا", countryEn: "Mauritania", flag: "🇲🇷", city: "نواكشوط", type: "government", website: "https://una.mr/", faculties: ["العلوم", "الطب", "الحقوق", "الآداب"], minPercentage: 65, language: "mixed", scholarships: false, highlights: "الجامعة الوطنية الرئيسية، تدريس بالعربية والفرنسية.", highlightsEn: "The main national university, teaching in Arabic and French." },
  { id: "so-snu", name: "الجامعة الوطنية الصومالية", nameEn: "Somali National University", country: "الصومال", countryEn: "Somalia", flag: "🇸🇴", city: "مقديشو", type: "government", website: "https://snu.edu.so/", faculties: ["الطب", "الهندسة", "الاقتصاد", "التربية", "الشريعة"], minPercentage: 60, language: "mixed", scholarships: false, highlights: "الجامعة الحكومية الأم بعد إعادة تأسيسها.", highlightsEn: "The re-established flagship public university." },
  { id: "dj-ud", name: "جامعة جيبوتي", nameEn: "University of Djibouti", country: "جيبوتي", countryEn: "Djibouti", flag: "🇩🇯", city: "جيبوتي", type: "government", website: "https://www.univ.edu.dj/", faculties: ["الهندسة", "الحقوق", "الآداب", "العلوم"], minPercentage: 60, language: "mixed", scholarships: false, highlights: "التدريس بالفرنسية أساساً مع برامج بالعربية.", highlightsEn: "Mainly French instruction with some Arabic programs." },
  { id: "km-comoros", name: "جامعة القمر", nameEn: "University of Comoros", country: "جزر القمر", countryEn: "Comoros", flag: "🇰🇲", city: "موروني", type: "government", website: "https://www.univ-comores.km/", faculties: ["العلوم", "الحقوق", "الآداب", "التربية"], minPercentage: 60, language: "mixed", scholarships: false, highlights: "الجامعة الوطنية الوحيدة في الأرخبيل.", highlightsEn: "The archipelago's only national university." },
];

export const ARAB_COUNTRIES = Array.from(
  new Map(
    ARAB_UNIVERSITIES.map((u) => [u.country, { country: u.country, countryEn: u.countryEn, flag: u.flag }])
  ).values()
);

export const ARAB_FACULTIES = Array.from(
  new Set(ARAB_UNIVERSITIES.flatMap((u) => u.faculties))
).sort();

/* ------------------------------------------------------------------ */
/* تفاصيل موسّعة: تُشتقّ من الدولة ونوع الجامعة (بيانات إرشادية)        */
/* ------------------------------------------------------------------ */

export interface ArabUniDetails {
  tuition: string;
  tuitionEn: string;
  living: string;
  livingEn: string;
  seasons: string;
  seasonsEn: string;
  docs: string[];
  docsEn: string[];
  steps: string[];
  stepsEn: string[];
}

/** تحويل علم الدولة (Regional Indicators) إلى رمز ISO مثل EG / SA */
export const flagToCode = (flag: string): string =>
  Array.from(flag)
    .map((ch) => ch.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
    .map((cp) => String.fromCharCode(cp - 0x1f1e6 + 65))
    .join("");

const GULF = ["السعودية", "الإمارات", "قطر", "الكويت", "عُمان", "البحرين"];
const LEVANT = ["الأردن", "لبنان", "سوريا", "فلسطين", "العراق"];

const tuitionRange = (u: ArabUniversity): [number, number] => {
  const gulf = GULF.includes(u.country);
  const levant = LEVANT.includes(u.country);
  if (u.type === "private") return gulf ? [8000, 22000] : levant ? [4000, 12000] : [2500, 9000];
  return gulf ? [0, 6000] : levant ? [1500, 6000] : [800, 4000];
};

const livingRange = (u: ArabUniversity): [number, number] => {
  const gulf = GULF.includes(u.country);
  const levant = LEVANT.includes(u.country);
  return gulf ? [500, 900] : levant ? [300, 550] : [180, 400];
};

export const getUniDetails = (u: ArabUniversity): ArabUniDetails => {
  const [t1, t2] = tuitionRange(u);
  const [l1, l2] = livingRange(u);
  const fmt = (a: number, b: number) => `${a.toLocaleString()} – ${b.toLocaleString()}`;
  return {
    tuition: `${fmt(t1, t2)} دولار / سنة`,
    tuitionEn: `$${fmt(t1, t2)} / year`,
    living: `${fmt(l1, l2)} دولار / شهر`,
    livingEn: `$${fmt(l1, l2)} / month`,
    seasons: "التقديم الرئيسي: يونيو – سبتمبر · تقديم تكميلي محدود في يناير",
    seasonsEn: "Main intake: June – September · limited spring intake in January",
    docs: [
      "شهادة الثانوية مصدّقة + كشف الدرجات",
      "جواز سفر ساري لمدة سنة على الأقل",
      "شهادة ميلاد مترجمة ومصدّقة",
      "صور شخصية بخلفية بيضاء",
      u.language === "en" ? "إثبات لغة إنجليزية (IELTS/TOEFL) إن طُلب" : "إثبات لغة عند الدراسة بالإنجليزية",
      "تقرير طبي / فحص لياقة صحية",
    ],
    docsEn: [
      "Attested high-school certificate + transcript",
      "Passport valid for at least one year",
      "Translated and attested birth certificate",
      "Passport-size photos, white background",
      u.language === "en" ? "English proof (IELTS/TOEFL) if required" : "Language proof for English-taught tracks",
      "Medical report / health fitness check",
    ],
    steps: [
      "تحقّق من شروط القبول للطلاب الوافدين على الموقع الرسمي",
      "جهّز المستندات وصدّقها من وزارة الخارجية والسفارة",
      "أنشئ حساباً في بوابة القبول الإلكترونية وارفع الملفات",
      "سدّد رسوم التقديم واحفظ إيصال الدفع",
      "تابع البريد الإلكتروني لخطاب القبول المبدئي",
      "بعد القبول: استخرج تأشيرة الدراسة وسجّل المقررات",
    ],
    stepsEn: [
      "Check international-student requirements on the official site",
      "Prepare and attest documents (MoFA + embassy)",
      "Create an account on the admission portal and upload files",
      "Pay the application fee and keep the receipt",
      "Watch your email for the conditional offer letter",
      "After acceptance: obtain the study visa and register courses",
    ],
  };
};

export const ARAB_COUNTRY_STATS = ARAB_COUNTRIES.map((c) => {
  const unis = ARAB_UNIVERSITIES.filter((u) => u.country === c.country);
  return {
    ...c,
    code: flagToCode(c.flag),
    count: unis.length,
    minPercentage: Math.min(...unis.map((u) => u.minPercentage)),
    scholarships: unis.some((u) => u.scholarships),
  };
});
