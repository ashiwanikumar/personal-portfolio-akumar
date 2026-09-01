import { NextResponse } from "next/server";

/**
 * Keeps an admin signed in for the life of the session cookie.
 *
 * The access token is deliberately short-lived. Before any admin route runs,
 * this renews it from the refresh token when it has expired or is about to,
 * writes the new one back as a cookie, and hands the request on with the fresh
 * value — so a page load hours later just works instead of returning 401s while
 * the shell still looks signed in.
 */

const ACCESS_COOKIE = "cv_admin_access_token";
const REFRESH_COOKIE = "cv_admin_refresh_token";

// Renew this far ahead of expiry so a request in flight cannot age out mid-call.
const RENEW_BEFORE_SECONDS = 120;
const SESSION_MAX_AGE = 14 * 24 * 60 * 60;

/** Read `exp` without verifying — the API is still the one that validates. */
function secondsUntilExpiry(token) {
	try {
		const [, payload] = token.split(".");
		const json = JSON.parse(
			atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
		);
		if (!json?.exp) return null;
		return json.exp - Math.floor(Date.now() / 1000);
	} catch {
		return null;
	}
}

function backendBase() {
	const base = process.env.BACKEND_API || process.env.NEXT_PUBLIC_BACKEND_API;
	return base ? base.replace(/^['"]|['"]$/g, "").replace(/\/$/, "") : "";
}

export default async function proxy(request) {
	const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
	const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

	// Nothing to renew, or nothing to renew with.
	if (!refreshToken || !backendBase()) return NextResponse.next();

	const remaining = accessToken ? secondsUntilExpiry(accessToken) : null;
	const needsRenewal = !accessToken || remaining === null || remaining < RENEW_BEFORE_SECONDS;
	if (!needsRenewal) return NextResponse.next();

	let renewed = "";
	try {
		const upstream = await fetch(`${backendBase()}/refresh_token`, {
			method: "POST",
			headers: { Accept: "application/json", Cookie: `refreshToken=${refreshToken}` },
			cache: "no-store",
		});

		if (upstream.ok) {
			const data = await upstream.json();
			if (data?.accessToken) renewed = data.accessToken;
		}
	} catch {
		// Backend unreachable: fall through with the old token rather than
		// signing the user out over a transient failure.
	}

	if (!renewed) return NextResponse.next();

	// Hand the fresh token to the route handler in this same request...
	const headers = new Headers(request.headers);
	const cookiePairs = request.cookies
		.getAll()
		.map((c) => (c.name === ACCESS_COOKIE ? `${c.name}=${renewed}` : `${c.name}=${c.value}`));
	headers.set("cookie", cookiePairs.join("; "));

	// ...and persist it in the browser.
	const response = NextResponse.next({ request: { headers } });
	response.cookies.set(ACCESS_COOKIE, renewed, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_MAX_AGE,
	});

	return response;
}

export const config = {
	matcher: ["/api/admin/:path*", "/dashboard/:path*"],
};
