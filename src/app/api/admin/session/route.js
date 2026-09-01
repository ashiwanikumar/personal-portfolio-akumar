import { NextResponse } from "next/server";
import {
	apiFetchAsAdmin,
	getAdminToken,
	getAdminUserFromCookie,
	isSuperAdminUser,
	setAdminCookies,
} from "@/lib/admin-api";

export async function GET() {
	const token = await getAdminToken();
	const cookieUser = await getAdminUserFromCookie();

	if (!token || !cookieUser) {
		return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
	}

	try {
		// Renews the access token from the refresh token when it has expired,
		// which is what keeps a browser signed in for the full session length.
		const { data, refreshed } = await apiFetchAsAdmin("/currentSuperAdmin", { method: "POST" });
		const user = data?.user || data?.superAdmin || cookieUser;

		if (!isSuperAdminUser(user) && !isSuperAdminUser(cookieUser)) {
			return NextResponse.json({ authenticated: false, user: null }, { status: 403 });
		}

		const response = NextResponse.json({ authenticated: true, user: user || cookieUser });
		if (refreshed) {
			setAdminCookies(response, { accessToken: refreshed.accessToken, user: refreshed.user });
		}
		return response;
	} catch (error) {
		// The refresh token is gone or rejected: the session really is over.
		if (error?.status === 401 || error?.status === 403) {
			return NextResponse.json(
				{ authenticated: false, user: null, reason: "session_expired" },
				{ status: 401 }
			);
		}

		// Backend unreachable — keep the session rather than bouncing to login.
		return NextResponse.json({ authenticated: true, user: cookieUser, degraded: true });
	}
}
