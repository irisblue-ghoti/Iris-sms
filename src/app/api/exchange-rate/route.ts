import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

// Cache the exchange rate in memory
let cachedRate: { rate: number; updatedAt: Date } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchExchangeRate(): Promise<number> {
  try {
    // Try to fetch from exchangerate-api.com (free tier)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 300 } }
    );

    if (response.ok) {
      const data = await response.json();
      // Get CNY rate (how many CNY per 1 USD)
      if (data.rates && data.rates.CNY) {
        return data.rates.CNY;
      }
    }
  } catch (error) {
    console.error("Failed to fetch from exchangerate-api:", error);
  }

  try {
    // Fallback: Try another free API
    const response = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { next: { revalidate: 300 } }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.rates && data.rates.CNY) {
        return data.rates.CNY;
      }
    }
  } catch (error) {
    console.error("Failed to fetch from er-api:", error);
  }

  // Default fallback rate (approximate)
  return 7.25;
}

export async function GET() {
  try {
    const now = new Date();

    // Check if we have a valid cached rate
    if (cachedRate && now.getTime() - cachedRate.updatedAt.getTime() < CACHE_DURATION) {
      return NextResponse.json({
        rate: cachedRate.rate,
        updatedAt: cachedRate.updatedAt.toISOString(),
        cached: true,
      });
    }

    // Fetch fresh rate
    const rate = await fetchExchangeRate();

    // Update cache
    cachedRate = {
      rate,
      updatedAt: now,
    };

    return NextResponse.json({
      rate,
      updatedAt: now.toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error("Exchange rate error:", error);

    // Return cached rate if available, otherwise default
    if (cachedRate) {
      return NextResponse.json({
        rate: cachedRate.rate,
        updatedAt: cachedRate.updatedAt.toISOString(),
        cached: true,
        error: "Failed to fetch fresh rate",
      });
    }

    return NextResponse.json({
      rate: 7.25, // Default fallback
      updatedAt: new Date().toISOString(),
      cached: false,
      error: "Using default rate",
    });
  }
}
