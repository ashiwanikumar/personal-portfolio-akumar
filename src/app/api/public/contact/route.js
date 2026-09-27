import { NextResponse } from "next/server";
import { apiFetch, visitorHeaders } from "@/lib/admin-api";

const GENERIC_ERROR = "Your message didn't go through. Please try again, or email me at ashvanikumar109@gmail.com.";

function badRequest(message) {
	return NextResponse.json({ message, status: "error" }, { status: 400 });
}

export async function POST(request) {
	let body;
	try {
		body = await request.json();
	} catch {
		return badRequest("Invalid request.");
	}

	// The form checks these too, but a direct POST skips the browser.
	const name = typeof body?.name === "string" ? body.name.trim() : "";
	const email = typeof body?.email === "string" ? body.email.trim() : "";
	const message = typeof body?.message === "string" ? body.message.trim() : "";
	if (!name || name.length > 100) return badRequest("Please enter your name.");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
		return badRequest("That email address doesn't look right.");
	if (!message || message.length > 5000) return badRequest("Please write a message of up to 5000 characters.");

	try {
		const data = await apiFetch("/contact-us/contacts", {
			method: "POST",
			headers: visitorHeaders(request),
			body: JSON.stringify({ ...body, name, email, message }),
		});

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		// Pass the backend's validation message through for 4xx. For outages or a
		// missing BACKEND_API, don't show raw internals to the visitor.
		const status = error?.status;
		if (status >= 400 && status < 500) {
			return NextResponse.json(
				{ message: error.message || GENERIC_ERROR, status: "error" },
				{ status }
			);
		}
		console.error("Contact form submission failed:", error);
		return NextResponse.json({ message: GENERIC_ERROR, status: "error" }, { status: 502 });
	}
}
