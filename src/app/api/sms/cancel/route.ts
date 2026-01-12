import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { tigerSms } from "@/lib/tiger-sms";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "缺少订单ID" }, { status: 400 });
    }

    const order = await prisma.smsOrder.findFirst({
      where: {
        id: orderId,
        userId: authUser.id,
        status: { in: ["pending", "active"] },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在或无法取消" }, { status: 404 });
    }

    // 取消Tiger SMS订单
    if (order.tigerId) {
      await tigerSms.setStatus(order.tigerId, "cancel");
    }

    // 退款并更新订单状态
    await prisma.$transaction([
      prisma.smsOrder.update({
        where: { id: order.id },
        data: { status: "cancelled" },
      }),
      prisma.user.update({
        where: { id: authUser.id },
        data: {
          balance: { increment: Number(order.cost) },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: "取消失败" }, { status: 500 });
  }
}
