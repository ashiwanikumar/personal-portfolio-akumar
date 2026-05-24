import { NextResponse } from "next/server";
import { getBackendApiBase } from "@/lib/admin-api";

export async function POST(request) {
  try {
    const body = await request.json();
    const backendUrl = `${getBackendApiBase()}/cv/track`;

    // Forward the real client IP
    const forwardedFor = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": forwardedFor,
        "x-real-ip": forwardedFor.split(",")[0]?.trim() || "",
        "user-agent": userAgent,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
