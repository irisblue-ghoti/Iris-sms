import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { epay } from "@/lib/epay";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // 验证签名
    if (!epay.verifyNotify(params)) {
      return new NextResponse("sign error", { status: 400 });
    }

    const orderNo = params.out_trade_no;
    const tradeStatus = params.trade_status;

    if (tradeStatus !== "TRADE_SUCCESS") {
      return new NextResponse("success");
    }

    // 查找订单
    const order = await prisma.rechargeOrder.findUnique({
      where: { orderNo },
    });

    if (!order) {
      return new NextResponse("order not found", { status: 404 });
    }

    if (order.status === "paid") {
      return new NextResponse("success");
    }

    // 更新订单状态并增加用户余额
    await prisma.$transaction([
      prisma.rechargeOrder.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          callbackData: JSON.stringify(params),
        },
      }),
      prisma.user.update({
        where: { id: order.userId },
        data: {
          balance: { increment: Number(order.amount) },
        },
      }),
    ]);

    return new NextResponse("success");
  } catch (error) {
    console.error("Epay webhook error:", error);
    return new NextResponse("error", { status: 500 });
  }
}

export async function GET(request: Request) {
  // 支持GET方式回调
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // 验证签名
  if (!epay.verifyNotify(params)) {
    return new NextResponse("sign error", { status: 400 });
  }

  const orderNo = params.out_trade_no;
  const tradeStatus = params.trade_status;

  if (tradeStatus !== "TRADE_SUCCESS") {
    return new NextResponse("success");
  }

  try {
    const order = await prisma.rechargeOrder.findUnique({
      where: { orderNo },
    });

    if (!order || order.status === "paid") {
      return new NextResponse("success");
    }

    await prisma.$transaction([
      prisma.rechargeOrder.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          callbackData: JSON.stringify(params),
        },
      }),
      prisma.user.update({
        where: { id: order.userId },
        data: {
          balance: { increment: Number(order.amount) },
        },
      }),
    ]);

    return new NextResponse("success");
  } catch (error) {
    console.error("Epay webhook error:", error);
    return new NextResponse("error", { status: 500 });
  }
}
