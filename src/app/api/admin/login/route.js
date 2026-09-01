import { NextResponse } from "next/server";
import {
	extractRefreshToken,
	getBackendApiBase,
	isSuperAdminUser,
	setAdminCookies,
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

		// Called directly rather than through apiFetch so the API's Set-Cookie
		// (its refresh token) can be captured — it never reaches the browser.
		const upstream = await fetch(`${getBackendApiBase()}/login`, {
			method: "POST",
			headers: { Accept: "application/json", "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
			cache: "no-store",
		});

		const text = await upstream.text();
		const data = text ? JSON.parse(text) : null;

		if (!upstream.ok) {
			return NextResponse.json(
				{ message: data?.message || data?.type?.[0]?.message || "Login failed." },
				{ status: upstream.status === 401 ? 401 : 400 }
			);
		}

		const refreshToken = extractRefreshToken(upstream.headers.get("set-cookie"));

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

		return setAdminCookies(response, {
			accessToken: data.accessToken,
			user: data.user,
			refreshToken,
		});
	} catch (error) {
		return NextResponse.json(
			{ message: error.message || "Login failed." },
			{ status: 401 }
		);
	}
}
