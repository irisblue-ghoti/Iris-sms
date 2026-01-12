import { NextResponse } from "next/server";
import { getCountriesWithPrices } from "@/lib/tiger-sms";

export const dynamic = 'force-dynamic';

// 汇率和加价配置
const RUB_TO_RMB = 0.08; // 1卢布 ≈ 0.08人民币
const MARKUP = 3; // 3倍加价

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    if (!service) {
      return NextResponse.json({ error: "缺少服务参数" }, { status: 400 });
    }

    console.log("Getting prices for service:", service);

    // 使用新的 getCountriesWithPrices API
    const result = await getCountriesWithPrices(service);

    if ("error" in result) {
      console.error("Tiger SMS error:", result.error);
      return NextResponse.json({
        service,
        countries: [],
        error: result.error
      });
    }

    // 转换价格并过滤
    const validPrices = result.countries
      .filter(c => c.count > 0)
      .map(c => ({
        countryCode: c.id,
        countryName: c.name,
        // 价格计算: 卢布 → 人民币 → 3倍加价
        price: Math.ceil(c.price * RUB_TO_RMB * MARKUP * 100) / 100,
        count: c.count,
      }))
      .sort((a, b) => a.price - b.price);

    console.log("Returning countries:", validPrices.length);

    return NextResponse.json({
      service,
      countries: validPrices,
    });
  } catch (error) {
    console.error("Get prices by service error:", error);
    return NextResponse.json({
      service: "",
      countries: [],
      error: "获取价格失败"
    });
  }
}
