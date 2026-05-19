import { cookies } from "next/headers";

export const ADMIN_TOKEN_COOKIE = "cv_admin_access_token";
export const ADMIN_USER_COOKIE = "cv_admin_user";

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
		const message = data?.message || data?.error || `Request failed with ${response.status}`;
		throw new Error(message);
	}

	return data;
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
