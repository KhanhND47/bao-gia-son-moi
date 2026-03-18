import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ message: "Đăng xuất thành công" });
  clearSessionCookie(response);
  return response;
}
