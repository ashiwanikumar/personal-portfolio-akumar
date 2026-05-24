import { NextResponse } from "next/server";
import { apiFetch, getAdminToken } from "@/lib/admin-api";

export async function GET(request) {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const page = searchParams.get("page") || "1";
	const perPage = searchParams.get("perPage") || "10";

	try {
		const data = await apiFetch(
			`/newsletter/subscribers/paginated?page=${page}&perPage=${perPage}`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
