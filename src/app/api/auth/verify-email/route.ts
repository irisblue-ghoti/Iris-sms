import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "无效的验证链接" }, { status: 400 });
    }

    const verifyToken = await prisma.verifyToken.findUnique({
      where: { token },
    });

    if (!verifyToken || verifyToken.type !== "email_verify" || !verifyToken.userId) {
      return NextResponse.json({ error: "无效的验证链接" }, { status: 400 });
    }

    if (verifyToken.expiresAt < new Date()) {
      await prisma.verifyToken.delete({ where: { id: verifyToken.id } });
      return NextResponse.json({ error: "链接已过期，请重新发送验证邮件" }, { status: 400 });
    }

    // Update user and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verifyToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.verifyToken.delete({
        where: { id: verifyToken.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "验证失败，请稍后重试" }, { status: 500 });
  }
}
