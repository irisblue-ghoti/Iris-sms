import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

// 管理员凭据
const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "!Aa123456";
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "admin-secret-key";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 生成管理员token
    const token = sign(
      { email: ADMIN_EMAIL, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      success: true,
      token,
      message: "登录成功"
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}
