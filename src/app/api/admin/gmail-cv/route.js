import { NextResponse } from "next/server";
import { apiFetch, getAdminToken } from "@/lib/admin-api";

/**
 * Gmail CV outreach proxy.
 *   ?view=messages  (default) — paginated inbox list
 *   ?view=analytics           — summary + charts
 *   ?view=status              — connection & sync state
 *   ?view=message&id=...      — single email + related
 *   ?view=body&id=...         — live body fetch from Gmail
 */
export async function PATCH(request) {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");
	if (!id) return NextResponse.json({ message: "id is required" }, { status: 400 });

	try {
		const payload = await request.json();
		const data = await apiFetch(`/gmail-cv/messages/${encodeURIComponent(id)}`, {
			method: "PATCH",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(payload),
		});
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function GET(request) {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const view = searchParams.get("view") || "messages";
	const id = searchParams.get("id");
	const auth = { headers: { Authorization: `Bearer ${token}` } };

	try {
		if (view === "status") {
			// probe=0 skips the upstream Gmail round-trip; used while polling a sync.
			const probe = searchParams.get("probe");
			const query = probe ? `?probe=${encodeURIComponent(probe)}` : "";
			return NextResponse.json(await apiFetch(`/gmail-cv/status${query}`, auth));
		}

		if (view === "analytics") {
			const days = searchParams.get("days") || "30";
			return NextResponse.json(await apiFetch(`/gmail-cv/analytics?days=${days}`, auth));
		}

		if (view === "message") {
			if (!id) return NextResponse.json({ message: "id is required" }, { status: 400 });
			return NextResponse.json(await apiFetch(`/gmail-cv/messages/${encodeURIComponent(id)}`, auth));
		}

		if (view === "body") {
			if (!id) return NextResponse.json({ message: "id is required" }, { status: 400 });
			return NextResponse.json(await apiFetch(`/gmail-cv/messages/${encodeURIComponent(id)}/body`, auth));
		}

		// Default: message list
		const params = new URLSearchParams();
		["page", "perPage", "folder", "q", "domain", "days"].forEach((key) => {
			const value = searchParams.get(key);
			if (value) params.set(key, value);
		});

		return NextResponse.json(await apiFetch(`/gmail-cv/messages?${params.toString()}`, auth));
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
