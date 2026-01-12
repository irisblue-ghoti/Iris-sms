import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { tigerSms } from "@/lib/tiger-sms";
import { extractCode } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "缺少订单ID" }, { status: 400 });
    }

    const order = await prisma.smsOrder.findFirst({
      where: {
        id: orderId,
        userId: authUser.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (!order.tigerId) {
      return NextResponse.json({ error: "订单无效" }, { status: 400 });
    }

    // 如果订单已完成，直接返回已保存的验证码
    if (order.status === "completed") {
      const message = await prisma.smsMessage.findFirst({
        where: { smsOrderId: order.id },
        orderBy: { receivedAt: "desc" },
      });
      return NextResponse.json({
        status: "received",
        code: message?.code || null,
        message: message?.content || null,
      });
    }

    // 查询验证码状态
    const statusResult = await tigerSms.getStatus(order.tigerId);

    if ("error" in statusResult) {
      return NextResponse.json({ status: "waiting", code: null });
    }

    if (statusResult.status === "received" && statusResult.code) {
      const code = extractCode(statusResult.code) || statusResult.code;

      // 检查是否已存在相同内容的消息（防止重复保存）
      const existingMessage = await prisma.smsMessage.findFirst({
        where: {
          smsOrderId: order.id,
          content: statusResult.code,
        },
      });

      if (existingMessage) {
        // 消息已存在，确保订单状态也是 completed
        if (order.status !== "completed") {
          await prisma.smsOrder.update({
            where: { id: order.id },
            data: { status: "completed" },
          });
        }
        // 直接返回已保存的验证码
        return NextResponse.json({
          status: "received",
          code,
          message: statusResult.code,
        });
      }

      // 检查用户余额
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { balance: true },
      });

      if (!user || Number(user.balance) < Number(order.cost)) {
        return NextResponse.json({ error: "余额不足，无法完成订单" }, { status: 400 });
      }

      // 保存短信记录，扣费，更新订单状态
      await prisma.$transaction([
        prisma.smsMessage.create({
          data: {
            smsOrderId: order.id,
            content: statusResult.code,
            code,
          },
        }),
        prisma.smsOrder.update({
          where: { id: order.id },
          data: {
            status: "completed",
            isPaid: true, // 标记已扣费
          },
        }),
        // 收到验证码时才扣费
        prisma.user.update({
          where: { id: authUser.id },
          data: {
            balance: { decrement: Number(order.cost) },
          },
        }),
      ]);

      // 确认激活
      await tigerSms.setStatus(order.tigerId, "confirm");

      return NextResponse.json({
        status: "received",
        code,
        message: statusResult.code,
      });
    }

    return NextResponse.json({
      status: statusResult.status,
      code: null,
    });
  } catch (error) {
    console.error("Check code error:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
