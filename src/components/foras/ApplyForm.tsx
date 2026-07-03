import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Scholarship } from "@/lib/mockData";
import { applicationsStore } from "@/lib/applicationsStorage";

interface Props {
  scholarship: Scholarship | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const ApplyForm = ({ scholarship, open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [motivation, setMotivation] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!scholarship) return;
    if (!name.trim() || !email.trim() || !motivation.trim()) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة"); return;
    }
    setBusy(true);
    try {
      applicationsStore.upsertFromScholarship(scholarship, "applied", {
        notes: `${name} · ${email}${phone ? " · " + phone : ""}\n\n${motivation}`,
      });
    } catch (e) {
      setBusy(false);
      toast.error("تعذر حفظ الطلب"); return;
    }
    setBusy(false);
    toast.success("تم إرسال طلبك بنجاح");
    onOpenChange(false);
    setName(""); setPhone(""); setMotivation("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-gold/30 rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-right font-display text-2xl text-gold-gradient">
            التقديم داخل التطبيق
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-right mt-1">{scholarship?.title}</p>
        </SheetHeader>
        <div className="space-y-4 mt-6 pb-6">
          <div className="space-y-1.5">
            <Label className="text-foreground">الاسم الكامل *</Label>
            <Input value={name} onChange={e => setName(e.target.value)}
              className="bg-input border-gold/30 text-right" placeholder="اكتب اسمك الكامل" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">البريد الإلكتروني *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
              dir="ltr" className="bg-input border-gold/30" placeholder="example@email.com" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">رقم الهاتف</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)}
              dir="ltr" className="bg-input border-gold/30" placeholder="+966..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">رسالة الدوافع *</Label>
            <Textarea value={motivation} onChange={e => setMotivation(e.target.value)}
              className="bg-input border-gold/30 text-right min-h-32"
              placeholder="لماذا تتقدم لهذه المنحة؟ ما هي أهدافك؟" />
          </div>
          <Button variant="luxe" size="lg" className="w-full" onClick={submit} disabled={busy}>
            <Send className="w-4 h-4 ml-2" />
            {busy ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            يُحفظ طلبك في "طلباتي" ويُرسل إلى الجهة المعنية عبر مصدرها الرسمي.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
