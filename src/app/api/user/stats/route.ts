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

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { balance: true },
    });

    const [totalOrders, activeOrders, completedOrders] = await Promise.all([
      prisma.smsOrder.count({
        where: { userId: authUser.id },
      }),
      prisma.smsOrder.count({
        where: {
          userId: authUser.id,
          status: { in: ["pending", "active"] },
        },
      }),
      prisma.smsOrder.count({
        where: {
          userId: authUser.id,
          status: "completed",
        },
      }),
    ]);

    return NextResponse.json({
      balance: user?.balance.toString() || "0.00",
      totalOrders,
      activeOrders,
      completedOrders,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
