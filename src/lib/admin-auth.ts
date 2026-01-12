import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "admin-secret-key";

export interface AdminPayload {
  username: string;
  role: string;
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const payload = verify(token, JWT_SECRET) as AdminPayload;
    if (payload.role === "admin") {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(request: Request): AdminPayload | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return verifyAdminToken(token);
}
