import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectMongo();
    return NextResponse.json({
      ok: true,
      mongo: "connected",
      time: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { ok: false, mongo: "error", message },
      { status: 500 },
    );
  }
}
