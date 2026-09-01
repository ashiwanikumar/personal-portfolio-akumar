import { NextResponse } from "next/server";
import {
	extractRefreshToken,
	getBackendApiBase,
	isSuperAdminUser,
	setAdminCookies,
} from "@/lib/admin-api";

export async function POST(request) {
	try {
		const { email, otp } = await request.json();

		if (!email || !otp) {
			return NextResponse.json(
				{ message: "Email and OTP are required." },
				{ status: 400 }
			);
		}

		// Direct fetch so the API's Set-Cookie (its refresh token) can be read;
		// it is issued for the API's own domain and never reaches the browser.
		const upstream = await fetch(`${getBackendApiBase()}/otp/verify`, {
			method: "POST",
			headers: { Accept: "application/json", "Content-Type": "application/json" },
			body: JSON.stringify({ email, otp }),
			cache: "no-store",
		});

		const text = await upstream.text();
		const data = text ? JSON.parse(text) : null;

		if (!upstream.ok) {
			return NextResponse.json(
				{ message: data?.message || data?.type?.[0]?.message || "OTP verification failed." },
				{ status: upstream.status === 401 ? 401 : 400 }
			);
		}

		const refreshToken = extractRefreshToken(upstream.headers.get("set-cookie"));

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
			{ message: error.message || "OTP verification failed." },
			{ status: 401 }
		);
	}
}
