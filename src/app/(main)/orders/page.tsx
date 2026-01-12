"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { RefreshCw, Phone, Copy, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/language-context";
import { useCurrency } from "@/lib/currency-context";
import { getDialCode } from "@/lib/country-codes";

interface SmsOrder {
  id: string;
  orderNo: string;
  country: string;
  countryName: string;
  countryCode: string;
  service: string;
  serviceName: string;
  phoneNumber: string | null;
  cost: string;
  status: string;
  isPaid: boolean;
  createdAt: string;
  messages: Array<{ content: string; code: string | null }>;
}

interface RechargeOrder {
  id: string;
  orderNo: string;
  amount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function OrdersPage() {
  const { t } = useLanguage();
  const { formatAmount, getCurrencySymbol } = useCurrency();
  const [smsOrders, setSmsOrders] = useState<SmsOrder[]>([]);
  const [rechargeOrders, setRechargeOrders] = useState<RechargeOrder[]>([]);
  const [smsPage, setSmsPage] = useState(1);
  const [rechargePage, setRechargePage] = useState(1);
  const [smsPagination, setSmsPagination] = useState<Pagination | null>(null);
  const [rechargePagination, setRechargePagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSmsOrders(smsPage);
  }, [smsPage]);

  useEffect(() => {
    loadRechargeOrders(rechargePage);
  }, [rechargePage]);

  async function loadSmsOrders(page: number) {
    setLoading(true);
    try {
      const response = await fetch(`/api/sms/orders?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setSmsOrders(data.orders);
        setSmsPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load SMS orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRechargeOrders(page: number) {
    try {
      const response = await fetch(`/api/recharge/orders?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setRechargeOrders(data.orders);
        setRechargePagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load recharge orders:", error);
    }
  }

  function loadOrders() {
    loadSmsOrders(smsPage);
    loadRechargeOrders(rechargePage);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: t("orders.copied"),
      description: text,
    });
  }

  // Get the dial code for a country and strip the phone number
  function getPhoneNumberWithoutDialCode(phoneNumber: string, country: string, countryCode: string): string {
    // countryCode is already the dial code like "+351", or use country ID to look up
    const dialCode = countryCode || getDialCode(country);
    if (!dialCode) return phoneNumber;

    // Remove the + from dial code to get the prefix
    const prefix = dialCode.replace("+", "");

    // If phone number starts with the prefix, remove it
    if (phoneNumber.startsWith(prefix)) {
      return phoneNumber.substring(prefix.length);
    }
    return phoneNumber;
  }

  // Get display dial code
  function getDisplayDialCode(country: string, countryCode: string): string {
    return countryCode || getDialCode(country) || "";
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
      active: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      completed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      cancelled: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
      expired: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      paid: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    };

    const labels: Record<string, string> = {
      pending: t("status.pending"),
      active: t("status.active"),
      completed: t("status.completed"),
      cancelled: t("status.cancelled"),
      expired: t("status.cancelled"),
      paid: t("status.paid"),
      failed: t("recharge.failed"),
    };

    return (
      <span className={`text-xs px-2 py-1 rounded ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  }

  function getPaymentMethodLabel(method: string) {
    const labels: Record<string, string> = {
      alipay: t("orders.alipay"),
      wxpay: t("orders.wxpay"),
      usdt: t("orders.usdt"),
      card_code: t("orders.cardCode"),
    };
    return labels[method] || method;
  }

  async function handleDeleteSmsOrder(orderId: string) {
    if (!confirm(t("orders.confirmDelete"))) return;

    try {
      const response = await fetch(`/api/sms/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: t("orders.deleted"),
          description: t("orders.deletedDesc"),
        });
        loadSmsOrders(smsPage);
      } else {
        const data = await response.json();
        throw new Error(data.error || t("orders.deleteFailed"));
      }
    } catch (error) {
      toast({
        title: t("orders.deleteFailed"),
        description: error instanceof Error ? error.message : t("orders.deleteFailed"),
        variant: "destructive",
      });
    }
  }

  async function handleDeleteRechargeOrder(orderId: string) {
    if (!confirm(t("orders.confirmDelete"))) return;

    try {
      const response = await fetch(`/api/recharge/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: t("orders.deleted"),
          description: t("orders.deletedDesc"),
        });
        loadRechargeOrders(rechargePage);
      } else {
        const data = await response.json();
        throw new Error(data.error || t("orders.deleteFailed"));
      }
    } catch (error) {
      toast({
        title: t("orders.deleteFailed"),
        description: error instanceof Error ? error.message : t("orders.deleteFailed"),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("orders.title")}</h1>
          <p className="text-muted-foreground">{t("orders.subtitle")}</p>
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {t("orders.refresh")}
        </Button>
      </div>

      <Tabs defaultValue="sms">
        <TabsList>
          <TabsTrigger value="sms">{t("orders.smsOrders")}</TabsTrigger>
          <TabsTrigger value="recharge">{t("orders.rechargeOrders")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("orders.smsOrders")}
                {smsPagination && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({t("orders.total")} {smsPagination.total})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {smsOrders.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {t("orders.noSmsOrders")}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {smsOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 relative"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          onClick={() => handleDeleteSmsOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center justify-between pr-10">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {order.countryName} {getDisplayDialCode(order.country, order.countryCode)}
                            </span>
                            <span className="font-mono">
                              {order.phoneNumber
                                ? getPhoneNumberWithoutDialCode(order.phoneNumber, order.country, order.countryCode)
                                : t("orders.pending")}
                            </span>
                            {order.phoneNumber && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  copyToClipboard(
                                    getPhoneNumberWithoutDialCode(order.phoneNumber!, order.country, order.countryCode)
                                  )
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <span>{order.serviceName}</span>
                          <span className="mx-2">|</span>
                          <span>{getCurrencySymbol()}{formatAmount(order.cost)}</span>
                          <span className="mx-2">|</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>

                        {order.messages.length > 0 && (
                          <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded space-y-1">
                            {order.messages.map((msg, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="text-muted-foreground">{t("orders.sms")}: </span>
                                <span>{msg.content}</span>
                                {msg.code && (
                                  <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                                    {t("orders.code")}: {msg.code}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {smsPagination && smsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSmsPage((p) => Math.max(1, p - 1))}
                        disabled={smsPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t("orders.previous")}
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        {smsPage} / {smsPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSmsPage((p) => Math.min(smsPagination.totalPages, p + 1))}
                        disabled={smsPage === smsPagination.totalPages}
                      >
                        {t("orders.next")}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recharge" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("orders.rechargeOrders")}
                {rechargePagination && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({t("orders.total")} {rechargePagination.total})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rechargeOrders.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {t("orders.noRechargeOrders")}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {rechargeOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between relative"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getCurrencySymbol()}{formatAmount(order.amount)}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                            <span className="mx-2">|</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t("orders.orderNo")}: {order.orderNo}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          onClick={() => handleDeleteRechargeOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {rechargePagination && rechargePagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRechargePage((p) => Math.max(1, p - 1))}
                        disabled={rechargePage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t("orders.previous")}
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        {rechargePage} / {rechargePagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRechargePage((p) => Math.min(rechargePagination.totalPages, p + 1))}
                        disabled={rechargePage === rechargePagination.totalPages}
                      >
                        {t("orders.next")}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
