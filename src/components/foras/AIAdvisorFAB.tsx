import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AIAdvisorSheet } from "./AIAdvisorSheet";
import { useLanguage } from "@/contexts/LanguageContext";

export const AIAdvisorFAB = () => {
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const { lang, dir } = useLanguage();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      if (delta > 0 && y > 80) setVisible(false); // scrolling down
      else setVisible(true);                       // scrolling up
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const label = lang === "ar" ? "مستشار الفرص الذكي" : "AI Advisor";
  const side = dir === "rtl" ? "left-5" : "right-5";

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            onClick={() => setOpen(true)}
            aria-label={label}
            className={`fixed bottom-24 ${side} z-40 group`}
          >
            {/* glowing gold ring */}
            <span className="absolute inset-0 rounded-full bg-gold-gradient opacity-60 blur-xl animate-pulse" />
            <span className="relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-full
                             bg-gradient-to-br from-[hsl(155_60%_20%/0.9)] to-[hsl(155_70%_12%/0.95)]
                             border-2 border-[hsl(43_85%_55%)] backdrop-blur-xl
                             shadow-[0_10px_40px_-10px_hsl(43_74%_50%/0.8)]
                             hover:scale-105 active:scale-95 transition-transform">
              <span className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </span>
              <span className="text-sm font-bold text-primary hidden sm:inline">{label}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <AIAdvisorSheet open={open} onOpenChange={setOpen} mode="general" />
    </>
  );
};