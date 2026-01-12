"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: t("auth.login.failed"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.login.success"),
          description: t("auth.login.success.desc"),
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast({
        title: t("auth.login.failed"),
        description: "An error occurred, please try again",
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
          <CardTitle className="text-xl text-gray-900 dark:text-white">{t("auth.login")}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">{t("auth.login.desc")}</CardDescription>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t("auth.login.forgot")}
                </Link>
              </div>
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.login")}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t("auth.login.noAccount")}{" "}
              <Link href="/register" className="text-primary hover:underline">
                {t("auth.login.register")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
