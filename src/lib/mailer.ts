import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("SMTP not configured, skipping email send");
    return { success: false, error: "SMTP未配置" };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@example.com",
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Send email error:", error);
    return { success: false, error: "邮件发送失败" };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "验证您的邮箱 - IrisSMS",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
        <h2 style="color: #333;">验证您的邮箱</h2>
        <p>您好，</p>
        <p>请点击下方按钮验证您的邮箱地址：</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          验证邮箱
        </a>
        <p>或者复制以下链接到浏览器：</p>
        <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
        <p>链接有效期为24小时。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">如果您没有注册账号，请忽略此邮件。</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "重置密码 - IrisSMS",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
        <h2 style="color: #333;">重置密码</h2>
        <p>您好，</p>
        <p>我们收到了您的密码重置请求。请点击下方按钮重置密码：</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          重置密码
        </a>
        <p>或者复制以下链接到浏览器：</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>链接有效期为1小时。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">如果您没有请求重置密码，请忽略此邮件。</p>
      </div>
    `,
  });
}

export async function sendVerificationCode(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: "Registration Verification Code - IrisSMS",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p>Hello,</p>
        <p>Your registration verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 15px 30px; background-color: #f3f4f6; color: #333; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; font-family: monospace;">
            ${code}
          </span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  });
}
