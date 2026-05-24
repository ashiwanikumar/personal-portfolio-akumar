"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboard, Pagination, DataTable } from "../_components/DashboardShell";

export default function ContactsPage() {
	const { session } = useDashboard();
	const [contacts, setContacts] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalContacts, setTotalContacts] = useState(0);
	const [loading, setLoading] = useState(true);
	const perPage = 10;

	const fetchContacts = useCallback(async (p) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/admin/contacts?page=${p}&perPage=${perPage}`, { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to fetch contacts");
			const data = await res.json();
			setContacts(data.contacts || []);
			setTotalPages(data.paginationData?.totalPages || 1);
			setTotalContacts(data.paginationData?.totalContacts || 0);
		} catch {
			setContacts([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (session?.authenticated) fetchContacts(page);
	}, [session, page, fetchContacts]);

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
				<h2 className="text-lg font-semibold text-white">Contact Requests</h2>
				<span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">{totalContacts} Total</span>
			</div>
			<DataTable
				columns={["Name", "Email", "Category", "Message", "Date"]}
				data={contacts}
				emptyText="No contact submissions yet."
				renderRow={(contact) => (
					<tr key={contact._id || contact.email} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
						<td className="px-4 py-3 text-sm font-medium text-white">{contact.name || "Unknown"}</td>
						<td className="px-4 py-3 text-sm text-zinc-400">{contact.email}</td>
						<td className="px-4 py-3">
							<span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
								{contact.category?.name || contact.category?.id || "General"}
							</span>
						</td>
						<td className="max-w-xs px-4 py-3 text-sm text-zinc-400 truncate">{contact.message}</td>
						<td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
							{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
						</td>
					</tr>
				)}
			/>
			<Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
		</div>
	);
}
