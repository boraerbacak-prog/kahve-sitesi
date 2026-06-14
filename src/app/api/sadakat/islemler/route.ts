import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTransactionHistory } from "@/lib/loyalty";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const transactions = await getTransactionHistory(session.user.id, limit, offset);
  return NextResponse.json({ transactions });
}
