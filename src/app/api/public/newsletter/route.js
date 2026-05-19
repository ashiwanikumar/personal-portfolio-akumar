import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/admin-api";

export async function POST(request) {
	try {
		const body = await request.json();
		const data = await apiFetch("/newsletter/subscribe", {
			method: "POST",
			body: JSON.stringify(body),
		});

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		const isDuplicate = /already subscribed/i.test(error.message || "");
		return NextResponse.json(
			{ message: error.message || "Unable to subscribe.", status: "error" },
			{ status: isDuplicate ? 409 : 400 }
		);
	}
}
