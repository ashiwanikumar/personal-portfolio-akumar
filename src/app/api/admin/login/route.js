import { NextResponse } from "next/server";
import {
	ADMIN_TOKEN_COOKIE,
	ADMIN_USER_COOKIE,
	apiFetch,
	encodeAdminUser,
	isSuperAdminUser,
} from "@/lib/admin-api";

export async function POST(request) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ message: "Email and password are required." },
				{ status: 400 }
			);
		}

		const data = await apiFetch("/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});

		if (data?.mfaRequired) {
			return NextResponse.json(
				{ message: "MFA is required. MFA login UI is not enabled yet.", mfaRequired: true },
				{ status: 403 }
			);
		}

		if (!data?.accessToken || !isSuperAdminUser(data.user)) {
			return NextResponse.json(
				{ message: "Only super-admin users can access this dashboard." },
				{ status: 403 }
			);
		}

		const response = NextResponse.json({
			user: data.user,
			message: "Login successful.",
		});

		const secure = process.env.NODE_ENV === "production";
		response.cookies.set(ADMIN_TOKEN_COOKIE, data.accessToken, {
			httpOnly: true,
			secure,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 8,
		});
		response.cookies.set(ADMIN_USER_COOKIE, encodeAdminUser(data.user), {
			httpOnly: true,
			secure,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 8,
		});

		return response;
	} catch (error) {
		return NextResponse.json(
			{ message: error.message || "Login failed." },
			{ status: 401 }
		);
	}
}
