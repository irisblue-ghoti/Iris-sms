import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { tigerSms, COUNTRIES } from "@/lib/tiger-sms";
import { generateOrderNo } from "@/lib/utils";
import { getDialCode } from "@/lib/country-codes";

// 汇率和加价配置
const RUB_TO_RMB = 0.08; // 1卢布 ≈ 0.08人民币
const MARKUP = 3; // 3倍加价

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { country, service } = await request.json();

    if (!country || !service) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    // 获取价格
    const priceResult = await tigerSms.getPrice(service, country);
    if ("error" in priceResult) {
      return NextResponse.json({ error: priceResult.error }, { status: 500 });
    }

    // 价格计算: 卢布 → 人民币 → 3倍加价
    const cost = Math.ceil(priceResult.price * RUB_TO_RMB * MARKUP * 100) / 100;

    // 检查余额（需要有足够余额来预留，但不立即扣费）
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { balance: true },
    });

    if (!user || Number(user.balance) < cost) {
      return NextResponse.json({ error: "余额不足" }, { status: 400 });
    }

    // 获取号码
    const numberResult = await tigerSms.getNumber(service, country);
    if ("error" in numberResult) {
      return NextResponse.json({ error: numberResult.error }, { status: 500 });
    }

    // 获取服务名称
    const servicesResult = await tigerSms.getServices();
    const serviceName = "services" in servicesResult
      ? servicesResult.services.find((s) => s.code === service)?.name || service
      : service;

    // 获取国家名称和区号
    const countryInfo = COUNTRIES.find(c => c.id === country);
    const countryName = countryInfo?.name || country;
    const countryCode = getDialCode(country);

    // 创建订单（不扣款，isPaid = false）
    const order = await prisma.smsOrder.create({
      data: {
        userId: authUser.id,
        orderNo: generateOrderNo("SMS"),
        country,
        countryName,
        countryCode,
        service,
        serviceName,
        phoneNumber: numberResult.phone,
        cost,
        isPaid: false, // 不立即扣费
        status: "active",
        tigerId: numberResult.id,
        expiredAt: new Date(Date.now() + 20 * 60 * 1000), // 20分钟有效期
      },
    });

    return NextResponse.json({
      orderId: order.id,
      phone: numberResult.phone,
      countryCode,
      cost,
    });
  } catch (error) {
    console.error("Get number error:", error);
    return NextResponse.json({ error: "获取号码失败" }, { status: 500 });
  }
}
