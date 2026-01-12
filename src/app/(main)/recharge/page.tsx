"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Wallet, CreditCard, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useCurrency } from "@/lib/currency-context";

export default function RechargePage() {
  const { data: session, update } = useSession();
  const { t } = useLanguage();
  const { formatAmount, getCurrencySymbol } = useCurrency();
  const [cardCode, setCardCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ amount: number; balance: number } | null>(null);
  const [currentBalance, setCurrentBalance] = useState<string>("0.00");
  const { toast } = useToast();

  // Sync balance from session
  useEffect(() => {
    if (session?.user?.balance) {
      setCurrentBalance(session.user.balance);
    }
  }, [session?.user?.balance]);

  // Redeem card code
  async function handleRedeem() {
    if (!cardCode.trim()) {
      toast({
        title: t("recharge.emptyCode"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSuccess(null);

    try {
      const response = await fetch("/api/recharge/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cardCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("recharge.failed"));
      }

      const newBalance = parseFloat(data.balance).toFixed(2);

      setSuccess({
        amount: parseFloat(data.amount),
        balance: parseFloat(data.balance),
      });

      // Immediately update displayed balance
      setCurrentBalance(newBalance);

      setCardCode("");

      // Update session balance
      await update();

      toast({
        title: t("recharge.success"),
        description: data.message,
      });
    } catch (error) {
      toast({
        title: t("recharge.failed"),
        description: error instanceof Error ? error.message : t("recharge.checkCode"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("recharge.title")}</h1>
        <p className="text-muted-foreground">{t("recharge.subtitle")}</p>
      </div>

      {/* Current Balance */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("recharge.currentBalance")}</p>
              <p className="text-3xl font-bold text-primary">
                {getCurrencySymbol()}{formatAmount(currentBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">{t("recharge.success")}</p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {t("recharge.amount")}: {getCurrencySymbol()}{formatAmount(success.amount)} | {t("common.balance")}: {getCurrencySymbol()}{formatAmount(success.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Get Card Code Hint */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="text-4xl">💬</div>
            <h3 className="font-semibold text-lg">{t("recharge.howToGet")}</h3>
            <p className="text-muted-foreground text-sm">
              {t("recharge.contactSupport")} <span className="text-primary font-bold">{getCurrencySymbol()}{formatAmount(10)}</span>
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <a
                href="https://t.me/shodan1q"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b5] transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.94z"/>
                </svg>
                {t("recharge.contactBtn")}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Code Recharge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("recharge.cardRecharge")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t("recharge.enterFormat")}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder={t("recharge.enterCode")}
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value.toUpperCase())}
              className="text-center text-lg tracking-wider font-mono"
              maxLength={19}
            />

            <Button
              className="w-full"
              size="lg"
              onClick={handleRedeem}
              disabled={loading || !cardCode.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("recharge.rechargeNow")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recharge.instructions")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>{t("recharge.inst1")}</p>
          <p>{t("recharge.inst2")}</p>
          <p>{t("recharge.inst3")}</p>
          <p>{t("recharge.inst4")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
