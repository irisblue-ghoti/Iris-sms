import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { nanoid } from "nanoid";

// 生成卡密
export async function POST(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const { amount, count = 1 } = await request.json();

    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: "金额必须大于等于10元" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: "生成数量必须在1-100之间" },
        { status: 400 }
      );
    }

    // 批量生成卡密
    const codes: string[] = [];
    const cardCodes = [];

    for (let i = 0; i < count; i++) {
      // 生成16位卡密: XXXX-XXXX-XXXX-XXXX
      const code = `${nanoid(4)}-${nanoid(4)}-${nanoid(4)}-${nanoid(4)}`.toUpperCase();
      codes.push(code);
      cardCodes.push({
        code,
        amount,
        createdBy: admin.username,
      });
    }

    // 批量插入数据库
    await prisma.cardCode.createMany({
      data: cardCodes,
    });

    return NextResponse.json({
      success: true,
      codes,
      amount,
      count,
      message: `成功生成 ${count} 张面值 ¥${amount} 的卡密`
    });
  } catch (error) {
    console.error("Generate card codes error:", error);
    return NextResponse.json(
      { error: "生成卡密失败" },
      { status: 500 }
    );
  }
}

// 获取卡密列表
export async function GET(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // unused, used, disabled
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = status ? { status } : {};

    const [cardCodes, total] = await Promise.all([
      prisma.cardCode.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cardCode.count({ where }),
    ]);

    return NextResponse.json({
      cardCodes: cardCodes.map(c => ({
        id: c.id,
        code: c.code,
        amount: c.amount,
        status: c.status,
        usedBy: c.user?.email || null,
        usedAt: c.usedAt,
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get card codes error:", error);
    return NextResponse.json(
      { error: "获取卡密列表失败" },
      { status: 500 }
    );
  }
}

// 禁用卡密
export async function DELETE(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("id");

    if (!codeId) {
      return NextResponse.json(
        { error: "缺少卡密ID" },
        { status: 400 }
      );
    }

    const cardCode = await prisma.cardCode.findUnique({
      where: { id: codeId },
    });

    if (!cardCode) {
      return NextResponse.json(
        { error: "卡密不存在" },
        { status: 404 }
      );
    }

    if (cardCode.status === "used") {
      return NextResponse.json(
        { error: "已使用的卡密无法禁用" },
        { status: 400 }
      );
    }

    await prisma.cardCode.update({
      where: { id: codeId },
      data: { status: "disabled" },
    });

    return NextResponse.json({
      success: true,
      message: "卡密已禁用"
    });
  } catch (error) {
    console.error("Disable card code error:", error);
    return NextResponse.json(
      { error: "禁用卡密失败" },
      { status: 500 }
    );
  }
}
