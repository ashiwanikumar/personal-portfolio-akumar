import { NextResponse } from "next/server";
import { clearAdminCookies, getAdminRefreshToken, getBackendApiBase } from "@/lib/admin-api";

export async function POST() {
	// Tell the API to drop its refresh cookie as well, so signing out here is
	// not just a local cookie delete.
	try {
		const refreshToken = await getAdminRefreshToken();
		await fetch(`${getBackendApiBase()}/logout`, {
			method: "POST",
			headers: refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : {},
			cache: "no-store",
		});
	} catch {
		// A failed upstream logout must not stop the local session ending.
	}

	return clearAdminCookies(NextResponse.json({ message: "Logged out." }));
}
