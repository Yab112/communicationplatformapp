import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { userId: string } } | Promise<{ params: { userId: string } }>
) {
  const { params } = await context;
  const userId = params.userId;
  return NextResponse.json({ userId });
}
