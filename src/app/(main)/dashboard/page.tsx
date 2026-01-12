"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, MessageSquare, History, ArrowRight, Phone, CreditCard, Sparkles, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { useCurrency } from "@/lib/currency-context";

interface DashboardStats {
  balance: string;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
}

interface Activity {
  id: string;
  type: "sms" | "recharge";
  title: string;
  description: string;
  status: string;
  code: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { formatAmount, getCurrencySymbol } = useCurrency();
  const [stats, setStats] = useState<DashboardStats>({
    balance: "0.00",
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/user/activity"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with gradient text */}
      <div className={`${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="gradient-text">{t("dashboard.welcome")}</span>
          <Sparkles className="h-5 w-5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-muted-foreground">{session?.user?.email}</p>
      </div>

      {/* Stats Cards with staggered animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <Card className={`hover-lift card-shine animate-pulse-glow ${mounted ? 'animate-fade-in-up animate-delay-100' : 'opacity-0'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.balance")}</CardTitle>
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-full">
              <Wallet className="h-4 w-4 text-primary animate-icon-bounce" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text stats-number">
              {getCurrencySymbol()}{loading ? "--" : formatAmount(stats.balance)}
            </div>
            <Link href="/recharge">
              <Button variant="link" className="p-0 h-auto text-xs group">
                {t("dashboard.recharge")}
                <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card className={`hover-lift card-shine ${mounted ? 'animate-fade-in-up animate-delay-200' : 'opacity-0'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalOrders")}</CardTitle>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
              <History className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold stats-number">
              {loading ? "--" : stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">{t("dashboard.allTimeOrders")}</p>
          </CardContent>
        </Card>

        {/* Active Orders Card */}
        <Card className={`hover-lift card-shine ${mounted ? 'animate-fade-in-up animate-delay-300' : 'opacity-0'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.active")}</CardTitle>
            <div className="p-2 bg-orange-500/10 dark:bg-orange-500/20 rounded-full animate-pulse">
              <Zap className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 dark:text-orange-400 stats-number">
              {loading ? "--" : stats.activeOrders}
            </div>
            <p className="text-xs text-muted-foreground">{t("dashboard.waitingForCode")}</p>
          </CardContent>
        </Card>

        {/* Completed Orders Card */}
        <Card className={`hover-lift card-shine ${mounted ? 'animate-fade-in-up animate-delay-400' : 'opacity-0'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.completed")}</CardTitle>
            <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-full">
              <MessageSquare className="h-4 w-4 text-green-500 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 dark:text-green-400 stats-number">
              {loading ? "--" : stats.completedOrders}
            </div>
            <p className="text-xs text-muted-foreground">{t("dashboard.codeReceived")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className={`hover-glow ${mounted ? 'animate-fade-in-up animate-delay-500' : 'opacity-0'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("dashboard.quickActions")}
            <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/services">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 hover-scale group">
              <MessageSquare className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span>{t("dashboard.getNumber")}</span>
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 hover-scale group">
              <History className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span>{t("dashboard.viewOrders")}</span>
            </Button>
          </Link>
          <Link href="/recharge">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 hover-scale group">
              <Wallet className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span>{t("dashboard.recharge")}</span>
            </Button>
          </Link>
          <Link href="/services">
            <Button className="w-full h-20 flex-col gap-2 hover-scale animated-gradient-bg text-white group">
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              <span>{t("dashboard.startNow")}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className={`${mounted ? 'animate-fade-in-up animate-delay-600' : 'opacity-0'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="group">
              {t("dashboard.viewAll")}
              <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="mt-2">{t("dashboard.loading")}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="animate-float mb-2">📭</div>
              {t("dashboard.noRecentActivity")}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`activity-item flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${
                    mounted ? 'animate-fade-in-left' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className={`p-2 rounded-full transition-transform hover:scale-110 ${
                    activity.type === "sms" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                    {activity.type === "sms" ? (
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                      {activity.code && (
                        <span className="ml-2 text-green-600 font-medium animate-pulse">
                          {t("status.code")}: {activity.code}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-1 rounded transition-all hover:scale-105 ${
                      activity.status === "completed" || activity.status === "paid"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : activity.status === "active" || activity.status === "pending"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}>
                      {activity.status === "completed" ? t("status.completed") :
                       activity.status === "paid" ? t("status.paid") :
                       activity.status === "active" ? t("status.active") :
                       activity.status === "pending" ? t("status.pending") :
                       activity.status === "cancelled" ? t("status.cancelled") : activity.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
