import { cookies } from "next/headers";

export const ADMIN_TOKEN_COOKIE = "cv_admin_access_token";
export const ADMIN_USER_COOKIE = "cv_admin_user";
export const ADMIN_REFRESH_COOKIE = "cv_admin_refresh_token";

// How long a browser stays signed in. The access token is short-lived and gets
// renewed from the refresh token behind the scenes, so this is the real session
// length rather than a window in which the dashboard silently stops working.
export const SESSION_MAX_AGE = 14 * 24 * 60 * 60;

export function adminCookieOptions(maxAge = SESSION_MAX_AGE) {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge,
	};
}

/** Write the signed-in cookie set onto a response. */
export function setAdminCookies(response, { accessToken, user, refreshToken }) {
	if (accessToken) response.cookies.set(ADMIN_TOKEN_COOKIE, accessToken, adminCookieOptions());
	if (user) response.cookies.set(ADMIN_USER_COOKIE, encodeAdminUser(user), adminCookieOptions());
	if (refreshToken) response.cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, adminCookieOptions());
	return response;
}

export function clearAdminCookies(response) {
	[ADMIN_TOKEN_COOKIE, ADMIN_USER_COOKIE, ADMIN_REFRESH_COOKIE].forEach((name) =>
		response.cookies.set(name, "", { ...adminCookieOptions(0), maxAge: 0 })
	);
	return response;
}

/** The API sets its refresh token as a Set-Cookie; pull it out server-side. */
export function extractRefreshToken(setCookieHeader) {
	if (!setCookieHeader) return "";
	const match = /(?:^|,\s*)refreshToken=([^;]+)/.exec(setCookieHeader);
	return match ? match[1] : "";
}

export function getBackendApiBase() {
	const baseUrl = process.env.BACKEND_API || process.env.NEXT_PUBLIC_BACKEND_API;

	if (!baseUrl) {
		throw new Error("BACKEND_API or NEXT_PUBLIC_BACKEND_API must be configured.");
	}

	return baseUrl.replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
}

export function isSuperAdminUser(user) {
	if (!user) return false;

	const legacyRole = String(user.role || "").toLowerCase();
	const roleInfo = user.roleInfo || {};
	const roleName = String(roleInfo.name || "").toLowerCase();

	return (
		legacyRole === "superadmin" ||
		legacyRole === "super-admin" ||
		roleInfo.hierarchyLevel === 1 ||
		roleName === "super admin" ||
		roleName === "super-admin"
	);
}

export async function apiFetch(path, options = {}) {
	const response = await fetch(`${getBackendApiBase()}${path}`, {
		cache: "no-store",
		...options,
		headers: {
			Accept: "application/json",
			...(options.body ? { "Content-Type": "application/json" } : {}),
			...options.headers,
		},
	});

	const text = await response.text();
	const data = text ? JSON.parse(text) : null;

	if (!response.ok) {
		const rawMessage = data?.message || data?.error;
		const message =
			typeof rawMessage === "string" && rawMessage
				? rawMessage
				: data?.type?.[0]?.message || `Request failed with ${response.status}`;

		// Callers need the status to tell a rejected token from an outage.
		const error = new Error(message);
		error.status = response.status;
		error.body = data;
		throw error;
	}

	return data;
}

export async function getAdminRefreshToken() {
	const cookieStore = await cookies();
	return cookieStore.get(ADMIN_REFRESH_COOKIE)?.value || "";
}

/**
 * Trade the refresh token for a new access token. Returns null when there is no
 * usable refresh token, which means the session is genuinely over.
 */
export async function refreshAccessToken() {
	const refreshToken = await getAdminRefreshToken();
	if (!refreshToken) return null;

	try {
		const response = await fetch(`${getBackendApiBase()}/refresh_token`, {
			method: "POST",
			headers: { Accept: "application/json", Cookie: `refreshToken=${refreshToken}` },
			cache: "no-store",
		});

		if (!response.ok) return null;

		const data = await response.json();
		if (!data?.accessToken || !isSuperAdminUser(data.user)) return null;

		return { accessToken: data.accessToken, user: data.user };
	} catch {
		return null;
	}
}

/**
 * Call the API as the admin, renewing the access token once if it has expired.
 * Returns the payload plus any refreshed credentials the caller must persist.
 */
export async function apiFetchAsAdmin(path, options = {}) {
	const token = await getAdminToken();
	if (!token) {
		const error = new Error("Unauthorized");
		error.status = 401;
		throw error;
	}

	const withAuth = (accessToken) => ({
		...options,
		headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
	});

	try {
		return { data: await apiFetch(path, withAuth(token)), refreshed: null };
	} catch (error) {
		if (error?.status !== 401) throw error;

		const refreshed = await refreshAccessToken();
		if (!refreshed) throw error;

		const data = await apiFetch(path, withAuth(refreshed.accessToken));
		return { data, refreshed };
	}
}

export async function getAdminToken() {
	const cookieStore = await cookies();
	return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value || "";
}

export async function getAdminUserFromCookie() {
	const cookieStore = await cookies();
	const encodedUser = cookieStore.get(ADMIN_USER_COOKIE)?.value;
	if (!encodedUser) return null;

	try {
		return JSON.parse(Buffer.from(encodedUser, "base64url").toString("utf8"));
	} catch {
		return null;
	}
}

export function encodeAdminUser(user) {
	const safeUser = {
		_id: user?._id,
		name: user?.name,
		email: user?.email,
		role: user?.role,
		roleInfo: user?.roleInfo
			? {
					name: user.roleInfo.name,
					hierarchyLevel: user.roleInfo.hierarchyLevel,
			  }
			: null,
	};

	return Buffer.from(JSON.stringify(safeUser)).toString("base64url");
}
