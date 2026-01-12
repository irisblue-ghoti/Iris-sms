import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

interface AuthUser {
  id: string;
  email: string;
  balance: string;
}

export async function getAuthUser(request?: Request): Promise<AuthUser | null> {
  // 首先尝试从 NextAuth session 获取用户
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, balance: true },
    });
    if (user) {
      return {
        id: user.id,
        email: user.email,
        balance: user.balance.toString(),
      };
    }
  }

  // 如果没有 session，尝试从 Authorization header 获取 token
  if (request) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // token 格式: userId:randomToken
      const [userId] = token.split(":");
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, balance: true },
        });
        if (user) {
          return {
            id: user.id,
            email: user.email,
            balance: user.balance.toString(),
          };
        }
      }
    }
  }

  return null;
}
