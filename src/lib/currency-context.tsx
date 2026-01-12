"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type Currency = "CNY" | "USDT";

interface ExchangeRate {
  rate: number; // CNY per USD/USDT
  updatedAt: string;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: ExchangeRate | null;
  loading: boolean;
  formatAmount: (amountInCNY: number | string) => string;
  getCurrencySymbol: () => string;
  refreshRate: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("CNY");
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem("currency") as Currency;
    if (saved && (saved === "CNY" || saved === "USDT")) {
      setCurrencyState(saved);
    }
  }, []);

  // Fetch exchange rate
  const fetchExchangeRate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/exchange-rate");
      if (response.ok) {
        const data = await response.json();
        setExchangeRate({
          rate: data.rate,
          updatedAt: data.updatedAt,
        });
      }
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch exchange rate on mount and periodically
  useEffect(() => {
    fetchExchangeRate();
    // Refresh every 5 minutes
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("currency", curr);
  };

  const getCurrencySymbol = () => {
    return currency === "CNY" ? "¥" : "$";
  };

  const formatAmount = (amountInCNY: number | string): string => {
    const amount = typeof amountInCNY === "string" ? parseFloat(amountInCNY) : amountInCNY;

    if (isNaN(amount)) return "--";

    if (currency === "CNY") {
      return amount.toFixed(2);
    }

    // Convert CNY to USDT (1 USDT = 1 USD)
    if (exchangeRate && exchangeRate.rate > 0) {
      const usdAmount = amount / exchangeRate.rate;
      return usdAmount.toFixed(2);
    }

    // Fallback if no exchange rate available
    return amount.toFixed(2);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        loading,
        formatAmount,
        getCurrencySymbol,
        refreshRate: fetchExchangeRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

// Currency switcher component
export function CurrencySwitcher({ className = "", collapsed = false }: { className?: string; collapsed?: boolean }) {
  const { currency, setCurrency, exchangeRate, loading } = useCurrency();

  return (
    <button
      onClick={() => setCurrency(currency === "CNY" ? "USDT" : "CNY")}
      disabled={loading}
      className={`flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${collapsed ? "w-10 h-10 p-0" : "px-3 py-1.5"} ${className}`}
      title={collapsed ? `Switch to ${currency === "CNY" ? "USDT" : "CNY"}` : undefined}
    >
      <span className="font-bold">{currency === "CNY" ? "¥" : "$"}</span>
      {!collapsed && (
        <span className="text-xs">
          {currency}
          {exchangeRate && currency === "USDT" && (
            <span className="text-muted-foreground ml-1">
              (1≈¥{exchangeRate.rate.toFixed(2)})
            </span>
          )}
        </span>
      )}
    </button>
  );
}
