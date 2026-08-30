import { NextResponse } from "next/server";
import { getAdminToken, getBackendApiBase } from "@/lib/admin-api";

/**
 * Streams the .xlsx (or .csv) export through from the API server. Binary, so it
 * bypasses apiFetch's JSON parsing and forwards the upstream body untouched.
 */
export async function GET(request) {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const params = new URLSearchParams();
	["folder", "q", "domain", "days", "format", "limit"].forEach((key) => {
		const value = searchParams.get(key);
		if (value) params.set(key, value);
	});

	try {
		const upstream = await fetch(`${getBackendApiBase()}/gmail-cv/export?${params.toString()}`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: "no-store",
		});

		if (!upstream.ok) {
			return NextResponse.json({ message: "Export failed" }, { status: upstream.status });
		}

		return new NextResponse(upstream.body, {
			status: 200,
			headers: {
				"Content-Type":
					upstream.headers.get("content-type") ||
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": upstream.headers.get("content-disposition") || "attachment",
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 502 });
	}
}
