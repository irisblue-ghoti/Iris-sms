import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "邮箱已验证" }, { status: 400 });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing verification tokens for this user
    await prisma.verifyToken.deleteMany({
      where: {
        userId: user.id,
        type: "email_verify",
      },
    });

    // Create new verification token
    await prisma.verifyToken.create({
      data: {
        userId: user.id,
        token,
        type: "email_verify",
        expiresAt,
      },
    });

    // Send email
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json({ error: "发送失败，请稍后重试" }, { status: 500 });
  }
}
