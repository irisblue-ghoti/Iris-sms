import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { generateOrderNo } from "@/lib/utils";

const USDT_RATE = 7.2; // 1 USDT = 7.2 CNY

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount < 10) {
      return NextResponse.json({ error: "USDT充值最低10元" }, { status: 400 });
    }

    const orderNo = generateOrderNo("USDT");
    const usdtAmount = (amount / USDT_RATE).toFixed(2);

    // 创建充值订单
    await prisma.rechargeOrder.create({
      data: {
        userId: authUser.id,
        orderNo,
        amount,
        paymentMethod: "usdt",
        status: "pending",
      },
    });

    const receiveAddress = process.env.SOLANA_RECEIVE_ADDRESS || "";

    return NextResponse.json({
      orderNo,
      amount,
      usdtAmount,
      receiveAddress,
      rate: USDT_RATE,
    });
  } catch (error) {
    console.error("Create USDT order error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
