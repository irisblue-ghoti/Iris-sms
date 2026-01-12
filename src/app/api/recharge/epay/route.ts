import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { epay } from "@/lib/epay";
import { generateOrderNo } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { amount, type } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "金额至少1元" }, { status: 400 });
    }

    if (!["alipay", "wxpay"].includes(type)) {
      return NextResponse.json({ error: "不支持的支付方式" }, { status: 400 });
    }

    const orderNo = generateOrderNo("PAY");

    // 创建充值订单
    await prisma.rechargeOrder.create({
      data: {
        userId: authUser.id,
        orderNo,
        amount,
        paymentMethod: type,
        status: "pending",
      },
    });

    // 生成支付URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const payUrl = epay.createPaymentUrl({
      orderNo,
      amount,
      type,
      notifyUrl: `${baseUrl}/api/webhook/epay`,
      returnUrl: `${baseUrl}/recharge?status=success`,
      name: "余额充值",
    });

    return NextResponse.json({ payUrl, orderNo });
  } catch (error) {
    console.error("Create epay order error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
