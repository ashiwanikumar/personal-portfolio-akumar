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
	} catch {
		return NextResponse.json({ authenticated: true, user: cookieUser, degraded: true });
	}
}
