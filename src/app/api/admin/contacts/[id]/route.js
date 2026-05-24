import { NextResponse } from "next/server";
import { apiFetch, getAdminToken } from "@/lib/admin-api";

export async function GET(request, { params }) {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const data = await apiFetch(`/contact-us/contacts/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
