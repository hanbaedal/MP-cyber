import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const payload: {
    ok: boolean;
    time: string;
    mongo: "connected" | "skipped" | "error";
    message?: string;
  } = {
    ok: true,
    time: new Date().toISOString(),
    mongo: "skipped",
  };

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(payload);
  }

  try {
    await connectMongo();
    payload.mongo = "connected";
    return NextResponse.json(payload);
  } catch (error) {
    payload.mongo = "error";
    payload.message = error instanceof Error ? error.message : "unknown error";
    // Keep HTTP 200 so Render health checks pass while Mongo is being configured.
    return NextResponse.json(payload);
  }
}
