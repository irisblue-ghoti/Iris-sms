"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Phone, Copy, RefreshCw, Clock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useCurrency } from "@/lib/currency-context";
import { getDialCode } from "@/lib/country-codes";

interface Country {
  id: string;
  name: string;
}

interface CountryWithPrice {
  countryCode: string;
  countryName: string;
  price: number;
  count: number;
}

interface Service {
  code: string;
  name: string;
}

interface ActiveOrder {
  id: string;
  phone: string;
  countryCode: string;
  countryName: string;
  service: string;
  country: string;
  status: string;
  code: string | null;
  message: string | null;
  cost: number;
  createdAt: string;
  expiredAt: string;
}

export default function ServicesPage() {
  const { update: updateSession } = useSession();
  const { t } = useLanguage();
  const { formatAmount, getCurrencySymbol } = useCurrency();
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesWithPrices, setCountriesWithPrices] = useState<CountryWithPrice[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [, setTick] = useState(0); // 用于触发时间更新
  const { toast } = useToast();

  // 格式化剩余时间
  function formatRemainingTime(expiredAt: string): { text: string; isExpiring: boolean; isExpired: boolean } {
    const now = new Date();
    const expired = new Date(expiredAt);
    const diffMs = expired.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { text: t("services.expired"), isExpiring: false, isExpired: true };
    }

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const remainingSec = diffSec % 60;

    const isExpiring = diffMin < 5; // 少于5分钟时警告
    const text = `${diffMin}:${remainingSec.toString().padStart(2, '0')}`;

    return { text, isExpiring, isExpired: false };
  }

  // 每秒更新时间显示
  useEffect(() => {
    if (activeOrders.length === 0) return;
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [activeOrders.length]);

  // Load countries and services
  useEffect(() => {
    async function loadData() {
      try {
        const [countriesRes, servicesRes] = await Promise.all([
          fetch("/api/sms/countries"),
          fetch("/api/sms/services"),
        ]);

        if (countriesRes.ok) {
          const data = await countriesRes.json();
          setCountries(data.countries);
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.services);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }

    loadData();
    loadActiveOrders();
  }, []);

  // Get prices for all countries when service is selected
  useEffect(() => {
    async function getPricesForService() {
      if (!selectedService) {
        setCountriesWithPrices([]);
        setPrice(null);
        setSelectedCountry("");
        return;
      }

      setPriceLoading(true);
      try {
        const response = await fetch(
          `/api/sms/prices-by-service?service=${selectedService}`
        );
        if (response.ok) {
          const data = await response.json();
          setCountriesWithPrices(data.countries || []);
          // Reset country selection when service changes
          setSelectedCountry("");
          setPrice(null);
        }
      } catch (error) {
        console.error("Failed to get prices:", error);
      } finally {
        setPriceLoading(false);
      }
    }

    getPricesForService();
  }, [selectedService]);

  // Update price when country is selected
  useEffect(() => {
    if (selectedCountry && countriesWithPrices.length > 0) {
      const country = countriesWithPrices.find(c => c.countryCode === selectedCountry);
      if (country) {
        setPrice(country.price);
      }
    } else {
      setPrice(null);
    }
  }, [selectedCountry, countriesWithPrices]);

  // Load active orders
  async function loadActiveOrders() {
    try {
      const response = await fetch("/api/sms/orders/active");
      if (response.ok) {
        const data = await response.json();
        setActiveOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to load active orders:", error);
    }
  }

  // Track notified codes to avoid duplicate notifications
  const notifiedCodes = useRef<Set<string>>(new Set());

  // Auto refresh and check codes when there are active orders
  useEffect(() => {
    if (activeOrders.length === 0) return;

    const interval = setInterval(async () => {
      try {
        // 检查每个订单的验证码状态
        for (const order of activeOrders) {
          const response = await fetch(`/api/sms/check-code?orderId=${order.id}`);
          const data = await response.json();

          if (data.code && !notifiedCodes.current.has(order.id)) {
            notifiedCodes.current.add(order.id);
            toast({
              title: t("services.codeReceived"),
              description: `${order.service}: ${data.code}`,
            });
            // 收到验证码后刷新余额
            await updateSession();
            // Play notification sound (optional)
            try {
              const audio = new Audio("/notification.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }
        }

        // 刷新订单列表
        loadActiveOrders();
      } catch (error) {
        console.error("Auto refresh error:", error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [activeOrders, toast, t, updateSession]);

  // Get number
  async function handleGetNumber() {
    if (!selectedCountry || !selectedService) {
      toast({
        title: t("services.selectionRequired"),
        description: t("services.selectBoth"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sms/get-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry,
          service: selectedService,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("services.failed"));
      }

      toast({
        title: t("services.success"),
        description: `${t("services.number")}: ${data.phone}`,
      });

      loadActiveOrders();
    } catch (error) {
      toast({
        title: t("services.failed"),
        description: error instanceof Error ? error.message : t("services.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Check verification code
  async function handleCheckCode(orderId: string) {
    try {
      const response = await fetch(`/api/sms/check-code?orderId=${orderId}`);
      const data = await response.json();

      if (data.code) {
        toast({
          title: t("services.codeReceived"),
          description: data.code,
        });
        // 收到验证码后刷新余额
        await updateSession();
      } else {
        toast({
          title: t("services.waiting"),
          description: t("services.noCodeYet"),
        });
      }

      loadActiveOrders();
    } catch (error) {
      console.error("Check code error:", error);
    }
  }

  // Cancel order
  async function handleCancelOrder(orderId: string) {
    try {
      const response = await fetch("/api/sms/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        toast({
          title: t("services.cancelled"),
          description: t("services.refunded"),
        });
        loadActiveOrders();
      }
    } catch (error) {
      console.error("Cancel error:", error);
    }
  }

  // Strip dial code prefix from phone number for display
  function getPhoneNumberWithoutDialCode(phoneNumber: string, country: string): string {
    const dialCode = getDialCode(country);
    if (!dialCode) return phoneNumber;

    // Remove the + from dial code to get the prefix
    const prefix = dialCode.replace("+", "");

    // If phone number starts with the prefix, remove it
    if (phoneNumber.startsWith(prefix)) {
      return phoneNumber.substring(prefix.length);
    }
    return phoneNumber;
  }

  // Copy to clipboard
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: t("orders.copied"),
      description: text,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("services.title")}</h1>
        <p className="text-muted-foreground">{t("services.subtitle")}</p>
      </div>

      {/* Get Number */}
      <Card>
        <CardHeader>
          <CardTitle>{t("services.getNumber")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("services.selectService")}</label>
              <SearchableSelect
                options={services.map((service) => ({
                  value: service.code,
                  label: service.name,
                }))}
                value={selectedService}
                onValueChange={setSelectedService}
                placeholder={t("services.selectService")}
                searchPlaceholder={t("common.search")}
                noResultsText={t("common.noResults")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("services.selectCountry")}</label>
              <SearchableSelect
                options={countriesWithPrices.map((country) => ({
                  value: country.countryCode,
                  label: country.countryName,
                  extra: <span className="text-primary font-medium">{getCurrencySymbol()}{formatAmount(country.price)}</span>,
                }))}
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                placeholder={selectedService ? t("services.selectCountry") : t("services.selectServiceFirst")}
                searchPlaceholder={t("common.search")}
                noResultsText={t("common.noResults")}
                disabled={!selectedService}
                loading={priceLoading}
                loadingText={t("dashboard.loading")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">{t("services.price")}</p>
              <p className="text-2xl font-bold text-primary">
                {priceLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : price !== null ? (
                  `${getCurrencySymbol()}${formatAmount(price)}`
                ) : (
                  "--"
                )}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleGetNumber}
              disabled={loading || !selectedCountry || !selectedService}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("services.getNumber")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{t("services.activeOrders")}</CardTitle>
            {activeOrders.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {t("services.autoRefreshing")}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={loadActiveOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("orders.refresh")}
          </Button>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("services.noActiveOrders")}
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground font-mono">{getDialCode(order.country)}</span>
                      <span className="font-mono text-lg font-semibold">{getPhoneNumberWithoutDialCode(order.phone, order.country)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(getDialCode(order.country) + getPhoneNumberWithoutDialCode(order.phone, order.country))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      order.status === "received"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}>
                      {order.status === "received" ? t("services.received") : t("services.waiting")}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground flex items-center justify-between">
                    <span>{t("services.service")}: {order.service} | {t("services.country")}: {order.countryName}</span>
                    {order.status !== "received" && (() => {
                      const remaining = formatRemainingTime(order.expiredAt);
                      return (
                        <span className={`flex items-center gap-1 font-mono ${
                          remaining.isExpired
                            ? "text-red-600 dark:text-red-400"
                            : remaining.isExpiring
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-muted-foreground"
                        }`}>
                          <Clock className="h-3.5 w-3.5" />
                          {remaining.text}
                        </span>
                      );
                    })()}
                  </div>

                  {order.code && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">{t("services.verificationCode")}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl font-bold text-green-600 dark:text-green-400">{order.code}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(order.code!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {order.message && order.message !== order.code && (
                        <div className="text-xs text-muted-foreground mt-2 font-mono">{order.message}</div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckCode(order.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {t("services.checkCode")}
                    </Button>
                    {order.status !== "received" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        {t("services.cancel")}
                      </Button>
                    )}
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
