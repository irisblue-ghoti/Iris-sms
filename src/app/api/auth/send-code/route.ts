import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendVerificationCode } from "@/lib/mailer";
import { z } from "zod";

const sendCodeSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = sendCodeSchema.parse(body);
    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 }
      );
    }

    // Check rate limiting - only allow one code per minute
    const recentCode = await prisma.verifyToken.findFirst({
      where: {
        email: normalizedEmail,
        type: "register_code",
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // within last minute
        },
      },
    });

    if (recentCode) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new code" },
        { status: 429 }
      );
    }

    // Delete old codes for this email
    await prisma.verifyToken.deleteMany({
      where: {
        email: normalizedEmail,
        type: "register_code",
      },
    });

    // Generate and store new code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verifyToken.create({
      data: {
        email: normalizedEmail,
        token: code,
        type: "register_code",
        expiresAt,
      },
    });

    // Send verification code email
    await sendVerificationCode(normalizedEmail, code);

    return NextResponse.json({
      message: "Verification code sent",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Failed to send code, please try again" },
      { status: 500 }
    );
  }
}
