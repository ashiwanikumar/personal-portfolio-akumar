import { NextResponse } from "next/server";
import { apiFetch, getAdminToken } from "@/lib/admin-api";

export async function POST(request) {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	let full = false;
	try {
		const body = await request.json();
		full = body?.full === true;
	} catch {
		// no body — incremental sync
	}

	try {
		const data = await apiFetch("/gmail-cv/sync", {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ full }),
		});
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 502 });
	}
}
