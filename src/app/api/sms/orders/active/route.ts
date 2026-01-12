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

    // 获取进行中和已完成的订单（最近30分钟内）
    const orders = await prisma.smsOrder.findMany({
      where: {
        userId: authUser.id,
        status: { in: ["active", "completed"] },
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // 最近30分钟
        },
      },
      include: {
        messages: {
          select: {
            content: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((order) => {
        // 去重消息
        const uniqueMessages = order.messages.filter(
          (msg, index, self) =>
            index === self.findIndex((m) => m.content === msg.content)
        );
        const latestMessage = uniqueMessages[0];
        return {
          id: order.id,
          phone: order.phoneNumber || "",
          countryCode: order.countryCode || "",
          countryName: order.countryName || order.country,
          service: order.serviceName,
          country: order.country,
          status: order.status === "completed" ? "received" : "waiting",
          code: latestMessage?.code || null,
          message: latestMessage?.content || null,
          note: order.note || null,
          cost: order.cost,
          createdAt: order.createdAt.toISOString(),
          expiredAt: order.expiredAt?.toISOString() || new Date(order.createdAt.getTime() + 20 * 60 * 1000).toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error("Get active orders error:", error);
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
  }
}
