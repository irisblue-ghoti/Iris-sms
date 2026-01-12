import { NextResponse } from "next/server";
import { tigerSms } from "@/lib/tiger-sms";

export const dynamic = 'force-dynamic';

// 汇率和加价配置
const RUB_TO_RMB = 0.08; // 1卢布 ≈ 0.08人民币
const MARKUP = 3; // 3倍加价

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const service = searchParams.get("service");

    if (!country || !service) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const result = await tigerSms.getPrice(service, country);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 价格计算: 卢布 → 人民币 → 3倍加价
    // 例: 35卢布 × 0.08 × 3 = 8.4元
    const priceInRmb = result.price * RUB_TO_RMB * MARKUP;

    return NextResponse.json({
      price: Math.ceil(priceInRmb * 100) / 100, // 保留2位小数，向上取整
      count: result.count,
    });
  } catch (error) {
    console.error("Get price error:", error);
    return NextResponse.json({ error: "获取价格失败" }, { status: 500 });
  }
}
