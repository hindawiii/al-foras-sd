import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Sparkles, X, Send, Loader2, Trash2, Bot, GraduationCap, Calculator, University, FileText, Mic } from "lucide-react";
import { chatStorage, type ChatMessage } from "@/lib/aiChatStorage";
import { guestStorage } from "@/lib/guestStorage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const uid = () => Math.random().toString(36).slice(2, 10);

const QUICK_ACTIONS = [
  { icon: GraduationCap, label: "ما هي المنح المناسبة لي؟", prompt: "بناءً على ملفي الشخصي، ما هي أفضل 3 منح دراسية مناسبة لي حاليًا؟ اذكر الاسم، الدولة، والمتطلبات الأساسية." },
  { icon: Calculator, label: "احسب نتيجتي المتوقعة", prompt: "أريد أن أحسب نتيجتي وأعرف تقديري. اسألني عن درجاتي في المواد الأساسية ثم احسب النسبة والتقدير." },
  { icon: University, label: "ما الجامعات المناسبة لي؟", prompt: "ما هي الجامعات السودانية والعربية المناسبة لملفي؟ صنّفها إلى: مضمونة القبول، تنافسية، وطموحة." },
  { icon: FileText, label: "كيف أُحسّن ملفي؟", prompt: "قيّم ملفي الشخصي واذكر نقاط القوة والضعف واقتراحات محددة للتحسين." },
  { icon: Mic, label: "🎤 محاكاة مقابلة المنحة", prompt: "ابدأ الآن محاكاة مقابلة رسمية للمنحة الدراسية. اطرح عليّ سؤالًا واحدًا فقط في كل مرة، وانتظر جوابي، ثم قيّم جوابي من 10 مع ملاحظات تحسين قصيرة قبل السؤال التالي. اجعل الأسئلة واقعية (الدافع، الأهداف، نقاط القوة والضعف، لماذا هذه الدولة/الجامعة). بعد 5 أسئلة أعطني تقريرًا نهائيًا وتقديرًا عامًا." },
];

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const AIAdvisor = () => {
  const { user, isGuest } = useAuth();
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lastScroll = useRef(0);

  // Load history + FAB position
  useEffect(() => {
    (async () => {
      const m = await chatStorage.loadMessages();
      setMessages(m);
      const pos = await chatStorage.loadFabPosition();
      if (pos) { x.set(pos.x); y.set(pos.y); }
    })();
    const tipTimer = window.setTimeout(() => setShowTip(true), 1500);
    const hideTip = window.setTimeout(() => setShowTip(false), 6000);
    return () => { window.clearTimeout(tipTimer); window.clearTimeout(hideTip); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide FAB on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastScroll.current) < 8) return;
      setVisible(y < lastScroll.current || y < 40);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Persist messages
  useEffect(() => { chatStorage.saveMessages(messages); }, [messages]);

  const getProfile = () => {
    if (isGuest) return guestStorage.get("profile") ?? null;
    return null; // profile is fetched server-side per user; kept minimal here
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    const userMsg: ChatMessage = { id: uid(), role: "user", content, createdAt: Date.now() };
    const assistantMsg: ChatMessage = { id: uid(), role: "assistant", content: "", createdAt: Date.now() };
    const nextMsgs = [...messages, userMsg, assistantMsg];
    setMessages(nextMsgs);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = {
        messages: nextMsgs
          .filter(m => m.id !== assistantMsg.id && m.content.trim())
          .map(m => ({ role: m.role, content: m.content })),
        profile: getProfile(),
      };

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON}`,
          "apikey": ANON,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({ error: "خطأ في الاتصال" }));
        setMessages(prev => prev.map(m => m.id === assistantMsg.id
          ? { ...m, content: `⚠️ ${errBody.error || "تعذّر الاتصال بالمستشار. حاول مجددًا."}` } : m));
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length) {
              acc += delta;
              setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: acc } : m));
            }
          } catch { /* ignore parse errors on partial chunks */ }
        }
      }

      if (!acc.trim()) {
        setMessages(prev => prev.map(m => m.id === assistantMsg.id
          ? { ...m, content: "لم أستطع توليد رد. حاول مرة أخرى." } : m));
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setMessages(prev => prev.map(m => m.id === assistantMsg.id
          ? { ...m, content: "⚠️ تعذّر الاتصال بالمستشار. تحقق من الإنترنت وحاول مجددًا." } : m));
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const clearChat = async () => {
    await chatStorage.clearMessages();
    setMessages([]);
  };

  const dragConstraints = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return { left: -window.innerWidth + 100, right: 20, top: -window.innerHeight + 160, bottom: 20 };
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={dragConstraints}
        style={{ x, y }}
        onDragEnd={() => chatStorage.saveFabPosition({ x: x.get(), y: y.get() })}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6, pointerEvents: visible ? "auto" : "none" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="fixed bottom-24 right-4 z-40 cursor-grab active:cursor-grabbing"
      >
        <div className="relative">
          <AnimatePresence>
            {showTip && !open && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-full right-0 mb-2 whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1B5E20]/95 backdrop-blur-md border border-[#D4AF37]/60 text-white text-xs shadow-lg"
              >
                اسألني عن المنح والقبول! ✨
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20] to-[#D4AF37] rounded-2xl blur-lg opacity-60 animate-pulse" />
          <button
            onClick={() => setOpen(v => !v)}
            aria-label="مستشار الفرص الذكي"
            style={{ borderRadius: 16 }}
            className="relative w-14 h-14 bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#D4AF37] border-2 border-[#D4AF37]/70 flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(212,175,55,0.6)] active:scale-95 transition-transform"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.div>
              ) : (
                <motion.div key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Sparkles className="w-6 h-6 text-white drop-shadow" strokeWidth={2.2} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            dir="rtl"
            className="fixed z-50 inset-x-2 bottom-2 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[420px] sm:h-[600px] max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl"
            style={{
              background: "linear-gradient(160deg, rgba(27,94,32,0.92), rgba(15,45,20,0.95))",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#D4AF37]/30 bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#1B5E20]" />
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1B5E20] animate-pulse" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-tight">مستشار الفرص الذكي</p>
                  <p className="text-[10px] text-emerald-200/80 leading-tight">متصل — مدعوم بالذكاء الاصطناعي</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={clearChat} aria-label="مسح المحادثة"
                    className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/70 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} aria-label="إغلاق"
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/70 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center px-4 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] mx-auto flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-[#1B5E20]" />
                  </div>
                  <p className="text-white text-base font-bold mb-1">أهلًا بك 👋</p>
                  <p className="text-emerald-100/80 text-xs leading-relaxed mb-4">
                    اسألني عن المنح، الجامعات، حاسبة النتائج، أو كتابة طلب التقديم.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_ACTIONS.map(q => {
                      const Icon = q.icon;
                      return (
                        <button key={q.label} onClick={() => send(q.prompt)}
                          className="flex items-center gap-2 text-right px-3 py-2.5 rounded-xl bg-white/5 hover:bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-white text-xs transition-colors">
                          <Icon className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                          <span className="flex-1">{q.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#1B1B1B] rounded-br-sm shadow-md"
                        : "bg-[#0F3B15]/80 text-white border border-[#D4AF37]/30 rounded-bl-sm"
                    }`}
                  >
                    {m.content || (busy && <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />)}
                  </div>
                </div>
              ))}

              {busy && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-end">
                  <div className="bg-[#0F3B15]/80 border border-[#D4AF37]/30 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="p-3 border-t border-[#D4AF37]/30 bg-black/20 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="اسأل عن المنح أو الجامعات..."
                disabled={busy}
                dir="rtl"
                className="flex-1 h-11 px-4 rounded-xl bg-white/10 border border-[#D4AF37]/30 text-white placeholder:text-emerald-100/50 text-sm outline-none focus:border-[#D4AF37] focus:bg-white/15 transition-colors"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="إرسال"
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                {busy
                  ? <Loader2 className="w-5 h-5 text-[#1B5E20] animate-spin" />
                  : <Send className="w-5 h-5 text-[#1B5E20]" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAdvisor;