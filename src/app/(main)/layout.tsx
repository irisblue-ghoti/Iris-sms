"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Wallet,
  LogOut,
  Menu,
  X,
  Puzzle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/lib/theme-context";
import { LanguageSwitcher, useLanguage } from "@/lib/language-context";
import { CurrencySwitcher, useCurrency } from "@/lib/currency-context";

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/services", labelKey: "nav.getNumber", icon: MessageSquare },
  { href: "/orders", labelKey: "nav.orders", icon: History },
  { href: "/recharge", labelKey: "nav.recharge", icon: Wallet },
  { href: "/extension", labelKey: "nav.extension", icon: Puzzle },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { formatAmount, getCurrencySymbol } = useCurrency();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Restore collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b dark:border-gray-700 z-50 flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Image
          src="/logo.png"
          alt="IrisSMS"
          width={100}
          height={28}
          className="object-contain dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt="IrisSMS"
          width={100}
          height={28}
          className="object-contain hidden dark:block"
        />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {session.user?.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r dark:border-gray-700 z-50 transform transition-all duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "lg:w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-14 flex items-center border-b dark:border-gray-700 transition-all duration-300",
          sidebarCollapsed ? "justify-center px-2" : "justify-center px-4"
        )}>
          <Link href="/dashboard" className="flex items-center">
            {sidebarCollapsed ? (
              <>
                <Image
                  src="/logo.png"
                  alt="IrisSMS"
                  width={32}
                  height={32}
                  className="object-contain dark:hidden"
                />
                <Image
                  src="/logo-dark.png"
                  alt="IrisSMS"
                  width={32}
                  height={32}
                  className="object-contain hidden dark:block"
                />
              </>
            ) : (
              <>
                <Image
                  src="/logo.png"
                  alt="IrisSMS"
                  width={120}
                  height={32}
                  className="object-contain dark:hidden"
                />
                <Image
                  src="/logo-dark.png"
                  alt="IrisSMS"
                  width={120}
                  height={32}
                  className="object-contain hidden dark:block"
                />
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "p-2 space-y-1",
          sidebarCollapsed ? "px-2" : "px-3"
        )}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? t(item.labelKey) : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  sidebarCollapsed && "justify-center px-2",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  !active && "group-hover:scale-110"
                )} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{t(item.labelKey)}</span>
                )}
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {t(item.labelKey)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button - Desktop only */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-full items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Theme & Language & Currency Switcher - Desktop */}
        <div className={cn(
          "absolute bottom-[140px] left-0 right-0 px-3 transition-all duration-300",
          sidebarCollapsed ? "px-2 flex flex-col items-center gap-2" : "flex flex-col gap-2"
        )}>
          <CurrencySwitcher collapsed={sidebarCollapsed} className={sidebarCollapsed ? "" : "w-full justify-center"} />
          <LanguageSwitcher collapsed={sidebarCollapsed} className={sidebarCollapsed ? "" : "w-full justify-center"} />
          <ThemeSwitcher className={sidebarCollapsed ? "" : "w-full justify-center"} />
        </div>

        {/* User Info */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-3 border-t dark:border-gray-700 transition-all duration-300",
          sidebarCollapsed && "px-2"
        )}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {session.user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {session.user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {session.user?.email}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {t("common.balance")}: {getCurrencySymbol()}{formatAmount(session.user?.balance || "0")}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("common.logout")}
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "pt-14 lg:pt-0 min-h-screen transition-all duration-300",
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
      )}>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t dark:border-gray-700 flex items-center justify-around z-40">
        {navItems.slice(0, 4).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                active
                  ? "text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className={cn(
                "text-xs font-medium",
                active && "text-primary"
              )}>{t(item.labelKey)}</span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
