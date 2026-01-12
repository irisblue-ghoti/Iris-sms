import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET - Verify token validity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "无效的链接" }, { status: 400 });
    }

    const verifyToken = await prisma.verifyToken.findUnique({
      where: { token },
    });

    if (!verifyToken || verifyToken.type !== "password_reset") {
      return NextResponse.json({ error: "无效的链接" }, { status: 400 });
    }

    if (verifyToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.verifyToken.delete({ where: { id: verifyToken.id } });
      return NextResponse.json({ error: "链接已过期" }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}

// POST - Reset password
export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少为6位" }, { status: 400 });
    }

    const verifyToken = await prisma.verifyToken.findUnique({
      where: { token },
    });

    if (!verifyToken || verifyToken.type !== "password_reset" || !verifyToken.userId) {
      return NextResponse.json({ error: "无效的链接" }, { status: 400 });
    }

    if (verifyToken.expiresAt < new Date()) {
      await prisma.verifyToken.delete({ where: { id: verifyToken.id } });
      return NextResponse.json({ error: "链接已过期" }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verifyToken.userId },
        data: { passwordHash },
      }),
      prisma.verifyToken.delete({
        where: { id: verifyToken.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "重置失败，请稍后重试" }, { status: 500 });
  }
}
