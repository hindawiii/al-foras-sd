import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Newspaper, TrendingUp, AlertTriangle } from "lucide-react";
import { CurrencyTab } from "./CurrencyTab";
import { NewsTab } from "./NewsTab";
import { useLiveRates } from "@/hooks/useLiveRates";

type SubTab = "currency" | "news";

export const EconomyNewsTab = () => {
  const [sub, setSub] = useState<SubTab>("currency");
  const { rates } = useLiveRates();

  // Smart alert: USD strengthened vs SDG / EGP => scholarships abroad may cost more
  const sdg = rates["SDG"];
  const egp = rates["EGP"];
  const showAlert = (sdg && sdg > 600) || (egp && egp > 48);

  return (
    <div className="space-y-4 pb-24">
      {/* Sub-tab switcher */}
      <div className="glass rounded-2xl p-1.5 flex gap-1.5 sticky top-[76px] z-20">
        {[
          { id: "currency" as const, label: "العملات", icon: Coins },
          { id: "news" as const, label: "الأخبار", icon: Newspaper },
        ].map((s) => {
          const Icon = s.icon;
          const active = sub === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSub(s.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                active
                  ? "bg-gold-gradient text-primary-foreground shadow-gold"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Smart cross-alert */}
      {showAlert && sub === "currency" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-review/40 bg-review/10 p-3 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-review mt-0.5 shrink-0" />
          <div className="text-right flex-1">
            <p className="text-xs font-bold text-review">
              تنبيه: ارتفاع الدولار قد يزيد تكلفة منحك الدراسية
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              راقب أسعار الصرف قبل تحويل رسوم التقديم أو دفع رسوم الجامعة.
            </p>
          </div>
        </motion.div>
      )}

      {sub === "currency" && (
        <>
          <CurrencyTab />
          {/* Mini economic insight */}
          <div className="rounded-2xl border border-primary/20 bg-card-gradient p-4">
            <h3 className="font-display text-sm text-gold-gradient flex items-center gap-2 justify-end">
              <TrendingUp className="w-4 h-4 text-primary" />
              كيف يؤثر هذا على منحك؟
            </h3>
            <ul className="mt-2 space-y-1.5 text-[12px] text-muted-foreground text-right leading-relaxed">
              <li>• ارتفاع الدولار = زيادة تكلفة الدراسة بالخارج والرسوم بالعملة الأجنبية.</li>
              <li>• انخفاض عملة بلدك = فرصة أفضل للمنح الممولة بالكامل بالدولار أو اليورو.</li>
              <li>• استخدم حاسبة العملات لتقدير المبلغ الشهري بعملتك المحلية.</li>
            </ul>
          </div>
        </>
      )}
      {sub === "news" && <NewsTab />}
    </div>
  );
};
