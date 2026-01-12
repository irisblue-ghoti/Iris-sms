import { NextResponse } from "next/server";
import { tigerSms } from "@/lib/tiger-sms";

export async function GET() {
  try {
    const result = await tigerSms.getCountries();

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ countries: result.countries });
  } catch (error) {
    console.error("Get countries error:", error);
    return NextResponse.json({ error: "获取国家列表失败" }, { status: 500 });
  }
}
