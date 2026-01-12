import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, code } = registerSchema.parse(body);
    const normalizedEmail = email.toLowerCase();

    // Verify the code first
    const verifyToken = await prisma.verifyToken.findFirst({
      where: {
        email: normalizedEmail,
        token: code,
        type: "register_code",
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verifyToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with verified email
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        emailVerified: new Date(), // Email is already verified via code
      },
    });

    // Delete the used verification code
    await prisma.verifyToken.delete({
      where: { id: verifyToken.id },
    });

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed, please try again" },
      { status: 500 }
    );
  }
}
