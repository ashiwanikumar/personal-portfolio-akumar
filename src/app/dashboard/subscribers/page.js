"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboard, Pagination, DataTable } from "../_components/DashboardShell";

export default function SubscribersPage() {
	const { session } = useDashboard();
	const [subscribers, setSubscribers] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalSubscribers, setTotalSubscribers] = useState(0);
	const [loading, setLoading] = useState(true);
	const perPage = 10;

	const fetchSubscribers = useCallback(async (p) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/admin/subscribers?page=${p}&perPage=${perPage}`, { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to fetch subscribers");
			const data = await res.json();
			setSubscribers(data.subscribers || []);
			setTotalPages(data.paginationData?.totalPages || 1);
			setTotalSubscribers(data.paginationData?.totalSubscribers || 0);
		} catch {
			setSubscribers([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (session?.authenticated) fetchSubscribers(page);
	}, [session, page, fetchSubscribers]);

	function handlePageChange(p) {
		setPage(p);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="relative h-8 w-8">
					<div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-white">Newsletter Subscribers</h2>
				<span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400">{totalSubscribers} Total</span>
			</div>
			<DataTable
				columns={["Name", "Email", "Status", "Frequency", "Joined"]}
				data={subscribers}
				emptyText="No subscribers yet."
				renderRow={(sub) => (
					<tr key={sub._id || sub.email} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
						<td className="px-4 py-3 text-sm font-medium text-white">{sub.name?.firstName || sub.name || "Subscriber"}</td>
						<td className="px-4 py-3 text-sm text-zinc-400">{sub.email}</td>
						<td className="px-4 py-3">
							<span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-400">
								{sub.status || "active"}
							</span>
						</td>
						<td className="px-4 py-3 text-sm text-zinc-400">{sub.communicationPrefs?.emailFrequency || "weekly"}</td>
						<td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
							{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
						</td>
					</tr>
				)}
			/>
			<Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
		</div>
	);
}
