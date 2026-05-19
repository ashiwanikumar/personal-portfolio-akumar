import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/admin-api";

export async function POST(request) {
	try {
		const body = await request.json();
		const data = await apiFetch("/contact-us/contacts", {
			method: "POST",
			body: JSON.stringify(body),
		});

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ message: error.message || "Unable to submit contact request.", status: "error" },
			{ status: 400 }
		);
	}
}
