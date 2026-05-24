import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/admin-api";

export async function POST(request) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ message: "Email is required." },
				{ status: 400 }
			);
		}

		const data = await apiFetch("/otp/request", {
			method: "POST",
			body: JSON.stringify({ email }),
		});

		return NextResponse.json({
			success: true,
			message: data.message || "If an account exists, an OTP has been sent.",
		});
	} catch (error) {
		// Always return success to prevent email enumeration
		return NextResponse.json({
			success: true,
			message: "If an account exists, an OTP has been sent.",
		});
	}
}
