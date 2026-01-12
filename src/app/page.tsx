"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Shield,
  Zap,
  Globe,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
} from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/language-context";
import { ThemeSwitcher } from "@/lib/theme-context";

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Floating particles background - more subtle, soft blur circles
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400/5 dark:bg-blue-300/5 animate-float-slow"
          style={{
            width: `${Math.random() * 150 + 80}px`,
            height: `${Math.random() * 150 + 80}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 15 + 20}s`,
            filter: 'blur(40px)',
          }}
        />
      ))}
    </div>
  );
}

// Feature card with hover effect
function FeatureCard({ icon: Icon, title, description, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group relative p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Pricing card
function PricingCard({ title, price, features, popular = false, ctaText, fromText }: {
  title: string;
  price: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  fromText: string;
}) {
  return (
    <div className={`relative p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
      popular
        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/30 scale-105"
        : "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl"
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-sm font-medium text-gray-900">
          {fromText === "from" ? "Most Popular" : "最受欢迎"}
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className={`text-lg font-medium mb-2 ${popular ? "text-blue-100" : "text-gray-600 dark:text-gray-400"}`}>{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-5xl font-bold ${popular ? "text-white" : "text-gray-900 dark:text-white"}`}>{price}</span>
          <span className={popular ? "text-blue-200" : "text-gray-500 dark:text-gray-400"}>{fromText}</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckCircle2 className={`h-5 w-5 ${popular ? "text-blue-200" : "text-blue-500"}`} />
            <span className={popular ? "text-blue-50" : "text-gray-700 dark:text-gray-300"}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/register">
        <Button
          className={`w-full ${
            popular
              ? "bg-white text-blue-600 hover:bg-blue-50"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          }`}
          size="lg"
        >
          {ctaText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 overflow-hidden transition-colors duration-300">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="IrisSMS"
              width={120}
              height={36}
              className="object-contain dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              alt="IrisSMS"
              width={120}
              height={36}
              className="object-contain hidden dark:block"
            />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                {t("header.login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25">
                {t("header.register")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <ParticlesBackground />

        {/* Gradient orbs - more subtle and elegant */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-400/15 dark:bg-purple-500/8 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[60px] animate-pulse-slow" style={{ animationDelay: "4s" }} />

        <div className="container mx-auto px-4 relative">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
              <Sparkles className="h-4 w-4" />
              {t("hero.badge")}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                {t("hero.title1")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.desc1")} <span className="text-blue-600 dark:text-blue-400 font-semibold">{t("hero.desc2")}</span>
              <br />
              {t("hero.desc3")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1">
                  {t("hero.cta1")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/extension">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-gray-300 dark:border-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-400 transition-all duration-300 hover:-translate-y-1">
                  {t("hero.cta2")}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { icon: Globe, value: 30, suffix: "+", label: t("stats.countries") },
                { icon: Users, value: 2000, suffix: "+", label: t("stats.users") },
                { icon: MessageSquare, value: 50000, suffix: "+", label: t("stats.codes") },
                { icon: Clock, value: 98, suffix: "%", label: t("stats.uptime") },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {mounted && <AnimatedCounter end={stat.value} suffix={stat.suffix} />}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {t("features.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {t("features.desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Globe}
              title={t("features.global.title")}
              description={t("features.global.desc")}
              delay={0}
            />
            <FeatureCard
              icon={MessageSquare}
              title={t("features.platform.title")}
              description={t("features.platform.desc")}
              delay={100}
            />
            <FeatureCard
              icon={Zap}
              title={t("features.fast.title")}
              description={t("features.fast.desc")}
              delay={200}
            />
            <FeatureCard
              icon={Shield}
              title={t("features.secure.title")}
              description={t("features.secure.desc")}
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t("how.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{t("how.desc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: t("how.step1.title"), desc: t("how.step1.desc") },
              { step: "02", title: t("how.step2.title"), desc: t("how.step2.desc") },
              { step: "03", title: t("how.step3.title"), desc: t("how.step3.desc") },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-500/30">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-blue-100 dark:from-blue-600 dark:to-blue-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t("pricing.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{t("pricing.desc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            <PricingCard
              title={t("pricing.basic.title")}
              price={t("pricing.basic.price")}
              features={[t("pricing.basic.f1"), t("pricing.basic.f2"), t("pricing.basic.f3"), t("pricing.basic.f4")]}
              ctaText={t("pricing.cta")}
              fromText={t("pricing.from")}
            />
            <PricingCard
              title={t("pricing.hot.title")}
              price={t("pricing.hot.price")}
              features={[t("pricing.hot.f1"), t("pricing.hot.f2"), t("pricing.hot.f3"), t("pricing.hot.f4")]}
              popular
              ctaText={t("pricing.cta")}
              fromText={t("pricing.from")}
            />
            <PricingCard
              title={t("pricing.premium.title")}
              price={t("pricing.premium.price")}
              features={[t("pricing.premium.f1"), t("pricing.premium.f2"), t("pricing.premium.f3"), t("pricing.premium.f4")]}
              ctaText={t("pricing.cta")}
              fromText={t("pricing.from")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHY2aDR2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              {t("cta.desc1")}
              <br />
              {t("cta.desc2")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-10 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
                  {t("cta.register")}
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" className="px-10 py-6 text-lg border-2 border-white bg-transparent text-white hover:bg-white/20">
                  {t("cta.login")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-dark.png"
                alt="IrisSMS"
                width={100}
                height={30}
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/extension" className="hover:text-white transition-colors">{t("footer.extension")}</Link>
              <a href="#" className="hover:text-white transition-colors">{t("footer.terms")}</a>
              <a href="#" className="hover:text-white transition-colors">{t("footer.privacy")}</a>
            </div>
            <p className="text-sm">© 2025 IrisSMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes gentle-glow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 200% 200%;
        }

        .animate-gentle-glow {
          animation: gentle-glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
