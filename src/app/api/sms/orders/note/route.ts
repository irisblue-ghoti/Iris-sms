import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// 更新订单备注
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, note } = body;

    if (!orderId) {
      return NextResponse.json({ error: "缺少订单ID" }, { status: 400 });
    }

    // 验证订单属于当前用户
    const order = await prisma.smsOrder.findFirst({
      where: {
        id: orderId,
        userId: authUser.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 更新备注
    await prisma.smsOrder.update({
      where: { id: orderId },
      data: { note: note || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
