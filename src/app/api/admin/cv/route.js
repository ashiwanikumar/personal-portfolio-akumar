import { NextResponse } from "next/server";
import { apiFetch, getAdminToken } from "@/lib/admin-api";

export async function GET(request) {
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = searchParams.get("days") || "30";
  const page = searchParams.get("page");
  const perPage = searchParams.get("perPage");
  const action = searchParams.get("action");
  const country = searchParams.get("country");

  try {
    // If page param exists, fetch paginated events
    if (page) {
      let url = `/cv/analytics/paginated?page=${page}&perPage=${perPage || 15}`;
      if (action) url += `&action=${action}`;
      if (country) url += `&country=${country}`;

      const data = await apiFetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return NextResponse.json(data);
    }

    // Otherwise fetch analytics summary
    const data = await apiFetch(`/cv/analytics?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
