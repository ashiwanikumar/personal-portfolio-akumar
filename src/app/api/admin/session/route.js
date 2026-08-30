import { NextResponse } from "next/server";
import {
	apiFetch,
	getAdminToken,
	getAdminUserFromCookie,
	isSuperAdminUser,
} from "@/lib/admin-api";

export async function GET() {
	const token = await getAdminToken();
	const cookieUser = await getAdminUserFromCookie();

	if (!token || !cookieUser) {
		return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
	}

	try {
		const data = await apiFetch("/currentSuperAdmin", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const user = data?.user || data?.superAdmin || cookieUser;

		if (!isSuperAdminUser(user) && !isSuperAdminUser(cookieUser)) {
			return NextResponse.json({ authenticated: false, user: null }, { status: 403 });
		}

		return NextResponse.json({ authenticated: true, user: user || cookieUser });
	} catch (error) {
		// An expired or rejected token is not a live session — say so, or the
		// dashboard renders as signed in and every data call fails with 401.
		if (error?.status === 401 || error?.status === 403) {
			return NextResponse.json(
				{ authenticated: false, user: null, reason: "session_expired" },
				{ status: 401 }
			);
		}

		// Anything else (backend down, network) keeps the degraded session.
		return NextResponse.json({ authenticated: true, user: cookieUser, degraded: true });
	}
}
