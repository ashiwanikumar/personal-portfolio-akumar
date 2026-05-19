import { NextResponse } from "next/server";
import { apiFetch, getAdminToken, getAdminUserFromCookie } from "@/lib/admin-api";

async function settle(name, task) {
	try {
		return { name, ok: true, data: await task() };
	} catch (error) {
		return { name, ok: false, error: error.message };
	}
}

export async function GET() {
	const token = await getAdminToken();
	const user = await getAdminUserFromCookie();

	if (!token || !user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const headers = { Authorization: `Bearer ${token}` };
	const checks = await Promise.all([
		settle("health", () => apiFetch("/healthCheck")),
		settle("roles", () => apiFetch("/roles/stats", { headers })),
		settle("team", () => apiFetch("/super-admin/team/members", { headers })),
		settle("analytics", () => apiFetch("/super-admin/analytics", { headers })),
		settle("contactStats", () => apiFetch("/contact-us/contacts/statistics", { headers })),
		settle("recentContacts", () =>
			apiFetch("/contact-us/contacts/paginated?page=1&perPage=5", { headers })
		),
		settle("newsletterStats", () => apiFetch("/newsletter/stats", { headers })),
		settle("recentSubscribers", () =>
			apiFetch("/newsletter/subscribers/paginated?page=1&perPage=5", { headers })
		),
	]);

	return NextResponse.json({
		user,
		checkedAt: new Date().toISOString(),
		checks,
	});
}
