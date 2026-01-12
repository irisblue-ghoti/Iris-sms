import { NextResponse } from "next/server";
import { tigerSms } from "@/lib/tiger-sms";

export async function GET() {
  try {
    const result = await tigerSms.getServices();

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ services: result.services });
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json({ error: "获取服务列表失败" }, { status: 500 });
  }
}
