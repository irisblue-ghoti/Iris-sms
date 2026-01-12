"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: t("auth.register.failed"),
        description: t("auth.email"),
        variant: "destructive",
      });
      return;
    }

    setSendingCode(true);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send code");
      }

      setCodeSent(true);
      setCountdown(60);
      toast({
        title: t("auth.register.codeSent"),
        description: t("auth.register.codeSent.desc"),
      });
    } catch (error) {
      toast({
        title: t("auth.register.failed"),
        description: error instanceof Error ? error.message : "Failed to send code",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast({
        title: t("auth.register.failed"),
        description: t("auth.register.codeInvalid"),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t("auth.register.failed"),
        description: t("auth.register.password.mismatch"),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t("auth.register.failed"),
        description: t("auth.register.password.short"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: t("auth.register.success"),
        description: t("auth.register.success.desc"),
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: t("auth.register.failed"),
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center pt-6 pb-0">
          <Link href="/" className="flex justify-center mb-3">
            <Image
              src="/logo.png"
              alt="IrisSMS"
              width={100}
              height={30}
              className="object-contain block dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              alt="IrisSMS"
              width={100}
              height={30}
              className="object-contain hidden dark:block"
            />
          </Link>
          <CardTitle className="text-xl text-gray-900 dark:text-white">{t("auth.register")}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">{t("auth.register.desc")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.email.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || codeSent}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0 || !email || loading}
                  className="whitespace-nowrap"
                >
                  {sendingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : countdown > 0 ? (
                    language === "zh" ? `${countdown}${t("auth.register.resendIn")}` : `${t("auth.register.resendIn")} ${countdown}s`
                  ) : codeSent ? (
                    t("auth.register.resend")
                  ) : (
                    t("auth.register.sendCode")
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">{t("auth.register.code")}</Label>
              <Input
                id="code"
                type="text"
                placeholder={t("auth.register.code.placeholder")}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                disabled={loading}
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.password.placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("auth.confirmPassword.placeholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || !codeSent}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.register")}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t("auth.register.hasAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("auth.register.signin")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
