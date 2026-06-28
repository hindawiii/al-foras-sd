// مستشار الفرص الذكي — Lovable AI Gateway streaming proxy
// يعالج وضعين: scholarship-match (مقارنة الملف بمنحة) و general (مستشار عام)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Profile {
  full_name?: string;
  bio?: string;
  education?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  gpa?: string;
}

interface Scholarship {
  title: string; org: string; country: string; amount: string;
  deadline: string; level: string; field?: string; description?: string;
  tags?: string[]; interests?: string[]; studyLang?: string; officialUrl?: string;
}

interface ReqBody {
  mode: "scholarship-match" | "general";
  lang: "ar" | "en";
  profile: Profile;
  scholarship?: Scholarship;
  allScholarships?: Scholarship[];
  userQuestion?: string;
}

const buildSystemPrompt = (lang: "ar" | "en") =>
  lang === "ar"
    ? `أنت "مستشار الفرص الذكي" — مستشار أكاديمي خبير في المنح الدولية والقبولات الاحترافية.
- استخدم تنسيق Markdown نظيف مع عناوين ## وقوائم نقطية وكلمات **عريضة**.
- كن دقيقاً، عملياً، ومحفّزاً. تجنّب الكلام العام.
- لا تخترع متطلبات غير موجودة في بيانات المنحة المقدّمة.
- اكتب باللغة العربية الفصحى الواضحة.`
    : `You are "Al-Foras AI Advisor" — an elite academic consultant for international scholarships and professional admissions.
- Use clean Markdown with ## headings, bullet lists, and **bold** emphasis.
- Be precise, actionable, and motivating. Avoid generic filler.
- Do not invent requirements that aren't in the provided scholarship data.
- Write in clear, professional English.`;

const buildUserPrompt = (body: ReqBody): string => {
  const { mode, lang, profile, scholarship, allScholarships, userQuestion } = body;
  const profileBlock = JSON.stringify(profile ?? {}, null, 2);

  if (mode === "scholarship-match" && scholarship) {
    const sBlock = JSON.stringify(scholarship, null, 2);
    return lang === "ar"
      ? `بيانات المستخدم (من ملفه الشخصي):
\`\`\`json
${profileBlock}
\`\`\`

المنحة المستهدفة:
\`\`\`json
${sBlock}
\`\`\`

قارن بدقة بين الملف ومتطلبات المنحة وأخرج التحليل في الأقسام التالية بهذا الترتيب:

## ✅ المؤهلات المستوفاة
اذكر بنقاط ما يمتلكه المستخدم فعلاً ويناسب المنحة.

## ⚠️ النواقص والمتطلبات المتبقية
اذكر بنقاط ما ينقصه (شهادات لغة، مستندات، خبرات، إلخ).

## 🗺️ خريطة التقديم الاحترافية
خطوات مرقّمة عملية للتقديم على هذه المنحة تحديداً (٥-٧ خطوات).

## 💡 نصيحة المستشار
جملة أو جملتان محفّزتان مخصّصتان لحالته.`
      : `User profile data:
\`\`\`json
${profileBlock}
\`\`\`

Target scholarship:
\`\`\`json
${sBlock}
\`\`\`

Compare the profile against the scholarship and produce the analysis in this exact order:

## ✅ Qualifications Met
Bullet list of what the user already has that matches the scholarship.

## ⚠️ Missing Requirements
Bullet list of what's missing (language tests, documents, experience, etc.).

## 🗺️ Professional Application Roadmap
5-7 numbered, concrete steps to apply to **this** scholarship.

## 💡 Advisor's Tip
One or two motivating sentences tailored to their situation.`;
  }

  // general mode
  const allBlock = allScholarships?.length
    ? JSON.stringify(
        allScholarships.map(s => ({
          title: s.title, org: s.org, country: s.country, level: s.level,
          field: s.field, interests: s.interests, studyLang: s.studyLang,
        })),
        null,
        2,
      )
    : "[]";
  const q = userQuestion?.trim() || (lang === "ar" ? "اقترح لي أفضل الفرص المناسبة لملفي." : "Recommend the best opportunities for my profile.");

  return lang === "ar"
    ? `بيانات المستخدم:
\`\`\`json
${profileBlock}
\`\`\`

المنح المتاحة في النظام حالياً:
\`\`\`json
${allBlock}
\`\`\`

سؤال المستخدم:
"${q}"

أجب بشكل احترافي ومنظّم. إن كان السؤال عن توصيات، رشّح **أفضل ٣ منح** من القائمة فقط مع سبب مختصر لكل واحدة.`
    : `User profile:
\`\`\`json
${profileBlock}
\`\`\`

Scholarships currently in the system:
\`\`\`json
${allBlock}
\`\`\`

User question:
"${q}"

Answer professionally and structured. If asked for recommendations, pick the **top 3 scholarships** from the list only, each with a brief reason.`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as ReqBody;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: buildSystemPrompt(body.lang) },
          { role: "user", content: buildUserPrompt(body) },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text();
      return new Response(JSON.stringify({ error: "AI gateway error", status: upstream.status, detail: txt }), {
        status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Re-stream SSE through to the client, parsing OpenAI-style chunks into plain text deltas.
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buf = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") { controller.close(); return; }
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length) {
                  controller.enqueue(encoder.encode(delta));
                }
              } catch { /* ignore non-JSON keepalives */ }
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});