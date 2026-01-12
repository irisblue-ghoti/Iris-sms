import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 使用卡密充值
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "请输入卡密" },
        { status: 400 }
      );
    }

    // 标准化卡密格式（移除空格，转大写）
    const normalizedCode = code.trim().toUpperCase();

    // 查找卡密
    const cardCode = await prisma.cardCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!cardCode) {
      return NextResponse.json(
        { error: "卡密不存在" },
        { status: 404 }
      );
    }

    if (cardCode.status === "used") {
      return NextResponse.json(
        { error: "卡密已被使用" },
        { status: 400 }
      );
    }

    if (cardCode.status === "disabled") {
      return NextResponse.json(
        { error: "卡密已失效" },
        { status: 400 }
      );
    }

    // 使用事务：更新卡密状态 + 增加用户余额 + 创建充值记录
    const result = await prisma.$transaction(async (tx) => {
      // 更新卡密状态
      await tx.cardCode.update({
        where: { id: cardCode.id },
        data: {
          status: "used",
          usedBy: session.user.id,
          usedAt: new Date(),
        },
      });

      // 增加用户余额
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            increment: cardCode.amount,
          },
        },
      });

      // 创建充值记录
      const orderNo = `CARD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      await tx.rechargeOrder.create({
        data: {
          userId: session.user.id,
          orderNo,
          amount: cardCode.amount,
          paymentMethod: "card_code",
          status: "paid",
          callbackData: JSON.stringify({ cardCode: normalizedCode }),
          paidAt: new Date(),
        },
      });

      return {
        amount: cardCode.amount,
        newBalance: user.balance,
      };
    });

    return NextResponse.json({
      success: true,
      amount: result.amount,
      balance: result.newBalance,
      message: `充值成功！充值金额 ¥${result.amount}`,
    });
  } catch (error) {
    console.error("Redeem card code error:", error);
    return NextResponse.json(
      { error: "充值失败，请稍后重试" },
      { status: 500 }
    );
  }
}
