import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, ADMIN_USER_COOKIE } from "@/lib/admin-api";

export async function POST() {
	const response = NextResponse.json({ message: "Logged out." });
	response.cookies.delete(ADMIN_TOKEN_COOKIE);
	response.cookies.delete(ADMIN_USER_COOKIE);
	return response;
}
