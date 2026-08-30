import { NextResponse } from "next/server";
import { getAdminToken, getBackendApiBase } from "@/lib/admin-api";

/**
 * Streams a CV attachment back from Gmail. Binary, so it bypasses apiFetch's
 * JSON parsing and pipes the upstream response through untouched.
 */
export async function GET(request) {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");
	const attachmentId = searchParams.get("attachmentId");

	if (!id || !attachmentId) {
		return NextResponse.json({ message: "id and attachmentId are required" }, { status: 400 });
	}

	try {
		const upstream = await fetch(
			`${getBackendApiBase()}/gmail-cv/messages/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}`,
			{ headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
		);

		if (!upstream.ok) {
			return NextResponse.json({ message: "Failed to download attachment" }, { status: upstream.status });
		}

		return new NextResponse(upstream.body, {
			status: 200,
			headers: {
				"Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
				"Content-Disposition": upstream.headers.get("content-disposition") || "attachment",
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 502 });
	}
}
