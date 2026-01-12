import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status"); // pending, paid, failed, expired

    const where: { userId: string; status?: string } = { userId: authUser.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.rechargeOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.rechargeOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNo: order.orderNo,
        amount: order.amount.toString(),
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt?.toISOString() || null,
      })),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("Get recharge orders error:", error);
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
  }
}
