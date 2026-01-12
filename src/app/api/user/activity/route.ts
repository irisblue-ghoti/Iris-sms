import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // Get recent SMS orders with messages
    const recentSmsOrders = await prisma.smsOrder.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        messages: {
          orderBy: { receivedAt: "desc" },
          take: 1,
        },
      },
    });

    // Get recent recharge orders
    const recentRechargeOrders = await prisma.rechargeOrder.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Combine and sort activities
    const activities = [
      ...recentSmsOrders.map((order) => ({
        id: order.id,
        type: "sms" as const,
        title: order.serviceName,
        description: order.phoneNumber || "等待分配号码",
        status: order.status,
        code: order.messages[0]?.code || null,
        createdAt: order.createdAt.toISOString(),
      })),
      ...recentRechargeOrders.map((order) => {
        // 根据支付方式显示对应的文字
        let paymentMethodText = "USDT";
        switch (order.paymentMethod) {
          case "alipay":
            paymentMethodText = "支付宝";
            break;
          case "wxpay":
            paymentMethodText = "微信";
            break;
          case "card_code":
            paymentMethodText = "卡密";
            break;
          case "usdt":
            paymentMethodText = "USDT";
            break;
        }
        return {
          id: order.id,
          type: "recharge" as const,
          title: `充值 ¥${order.amount}`,
          description: paymentMethodText,
          status: order.status,
          code: null,
          createdAt: order.createdAt.toISOString(),
        };
      }),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activity error:", error);
    return NextResponse.json({ error: "获取活动失败" }, { status: 500 });
  }
}
