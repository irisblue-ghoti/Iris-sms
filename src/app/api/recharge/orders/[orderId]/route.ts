import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { orderId } = params;

    // Find the order and verify ownership
    const order = await prisma.rechargeOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (order.userId !== authUser.id) {
      return NextResponse.json({ error: "无权删除此订单" }, { status: 403 });
    }

    // Delete the order
    await prisma.rechargeOrder.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete recharge order error:", error);
    return NextResponse.json({ error: "删除订单失败" }, { status: 500 });
  }
}
