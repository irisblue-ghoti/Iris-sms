import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "请输入邮箱和密码" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
      );
    }

    // 生成简单的 token（生产环境建议使用 JWT）
    const token = crypto.randomBytes(32).toString("hex");

    // 可以将 token 存储到数据库或 Redis 中，这里简化处理
    // 实际生产中应该有 token 表或使用 JWT

    return NextResponse.json({
      id: user.id,
      email: user.email,
      balance: user.balance.toString(),
      token: `${user.id}:${token}`, // 简化的 token 格式
    });
  } catch (error) {
    console.error("Extension login error:", error);
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}
