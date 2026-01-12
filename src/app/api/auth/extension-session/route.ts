import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sign } from "jsonwebtoken";

export const dynamic = 'force-dynamic';

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// 为浏览器插件生成会话token
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get language from cookie
    const languageCookie = request.cookies.get('language');
    const language = languageCookie?.value || 'en';

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未登录", language },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      );
    }

    // 生成extension用的token
    const token = sign(
      { userId: session.user.id, email: session.user.email },
      process.env.NEXTAUTH_SECRET || "secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      email: session.user.email,
      balance: session.user.balance,
      language,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  } catch (error) {
    console.error("Extension session error:", error);
    return NextResponse.json(
      { error: "获取会话失败" },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );
  }
}
