import { NextResponse } from "next/server";

import { applySessionCookie, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { getZodErrorMessage, loginSchema } from "@/lib/validation";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: getZodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "ADMIN" || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json(
      { message: "Email hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  }

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: "ADMIN",
  });

  const response = NextResponse.json({ message: "Đăng nhập thành công" });
  applySessionCookie(response, token);

  return response;
}
