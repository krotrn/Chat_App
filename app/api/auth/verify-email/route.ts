// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/token.utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = decodeURIComponent(searchParams.get("email")!);
  const code = searchParams.get("code")!;
  const isEncrypted = searchParams.get("encrypted") === "true";

  const result = await verifyToken(email, code, isEncrypted);

  if (result.error) {
    return NextResponse.redirect(
      `/auth/error?message=${encodeURIComponent(result.error)}`
    );
  }

  return NextResponse.redirect("/dashboard");
}