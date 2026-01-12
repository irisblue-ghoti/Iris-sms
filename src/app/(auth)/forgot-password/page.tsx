"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed");
      }

      setSent(true);
      toast({
        title: t("auth.forgot.success"),
        description: t("auth.forgot.success.desc"),
      });
    } catch (error) {
      toast({
        title: t("auth.forgot.title"),
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-gray-900 dark:text-white">{t("auth.forgot.success")}</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {t("auth.forgot.sent.to")} {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("auth.forgot.check.email")}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {t("auth.forgot.not.received")}{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setSent(false)}
              >
                {t("auth.forgot.resend")}
              </Button>
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("auth.forgot.back")}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-xl text-gray-900 dark:text-white">{t("auth.forgot.title")}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">{t("auth.forgot.desc")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.email.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.forgot.submit")}
            </Button>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="inline h-4 w-4 mr-1" />
              {t("auth.forgot.back")}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
