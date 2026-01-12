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
    const status = searchParams.get("status"); // pending, active, completed, cancelled, expired

    const where: { userId: string; status?: string } = { userId: authUser.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.smsOrder.findMany({
        where,
        include: {
          messages: {
            select: {
              content: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.smsOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((order) => {
        // 对消息进行去重，基于 content 字段
        const uniqueMessages = order.messages.filter(
          (msg, index, self) =>
            index === self.findIndex((m) => m.content === msg.content)
        );
        return {
          id: order.id,
          orderNo: order.orderNo,
          country: order.country,
          countryName: order.countryName || order.country,
          countryCode: order.countryCode || "",
          service: order.service,
          serviceName: order.serviceName,
          phoneNumber: order.phoneNumber,
          cost: order.cost.toString(),
          status: order.status,
          isPaid: order.isPaid,
          note: order.note,
          createdAt: order.createdAt.toISOString(),
          messages: uniqueMessages,
        };
      }),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
  }
}
