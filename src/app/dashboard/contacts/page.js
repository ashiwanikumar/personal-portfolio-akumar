"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboard, Pagination, DataTable, Icons } from "../_components/DashboardShell";

// ─── Contact Detail Modal ──────────────────────────────────────
function ContactDetailModal({ contact, onClose }) {
	if (!contact) return null;

	const loc = contact.technicalInfo?.location;
	const device = contact.technicalInfo?.device;
	const browser = contact.technicalInfo?.browser;
	const network = contact.technicalInfo?.network;
	const ip = contact.technicalInfo?.ip;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-2xl">
				{/* Header */}
				<div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
					<div>
						<h3 className="text-lg font-semibold text-white">{contact.name || "Unknown"}</h3>
						<p className="text-sm text-zinc-400">{contact.email}</p>
					</div>
					<button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white">
						{Icons.close}
					</button>
				</div>

				{/* Message */}
				<div className="mt-5">
					<h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Message</h4>
					<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
						<p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
							{typeof contact.message === "string" ? contact.message : contact.message?.text || contact.message?.content || JSON.stringify(contact.message)}
						</p>
					</div>
				</div>

				{/* Category & Date */}
				<div className="mt-5 grid grid-cols-2 gap-4">
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Category</h4>
						<span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
							{contact.category?.name || contact.category?.id || "General"}
						</span>
					</div>
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Submitted</h4>
						<p className="text-sm text-zinc-300">
							{contact.createdAt ? new Date(contact.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
						</p>
					</div>
				</div>

				{/* Geolocation */}
				{loc && (loc.city || loc.country) && (
					<div className="mt-5">
						<h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Location</h4>
						<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
							<div className="grid grid-cols-2 gap-3 text-sm">
								{loc.city && <InfoRow label="City" value={loc.city} />}
								{loc.region && <InfoRow label="Region" value={loc.region} />}
								{loc.country && <InfoRow label="Country" value={`${loc.country}${loc.countryCode ? ` (${loc.countryCode})` : ""}`} />}
								{loc.postal && <InfoRow label="Postal" value={loc.postal} />}
								{loc.timezone && <InfoRow label="Timezone" value={loc.timezone} />}
								{loc.coordinates?.latitude && (
									<InfoRow label="Coordinates" value={`${loc.coordinates.latitude}, ${loc.coordinates.longitude}`} />
								)}
							</div>
						</div>
					</div>
				)}

				{/* Network & IP */}
				{(ip?.ipv4 || network?.isp) && (
					<div className="mt-5">
						<h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Network</h4>
						<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
							<div className="grid grid-cols-2 gap-3 text-sm">
								{ip?.ipv4 && <InfoRow label="IPv4" value={ip.ipv4} />}
								{ip?.ipv6 && <InfoRow label="IPv6" value={ip.ipv6} />}
								{network?.isp && <InfoRow label="ISP" value={network.isp} />}
								{network?.organization && <InfoRow label="Organization" value={network.organization} />}
								{network?.asn && <InfoRow label="ASN" value={network.asn} />}
							</div>
						</div>
					</div>
				)}

				{/* Device & Browser */}
				{(device?.type || browser?.name) && (
					<div className="mt-5">
						<h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Device & Browser</h4>
						<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
							<div className="grid grid-cols-2 gap-3 text-sm">
								{device?.type && <InfoRow label="Device" value={device.type} />}
								{device?.vendor && <InfoRow label="Vendor" value={device.vendor} />}
								{device?.model && <InfoRow label="Model" value={device.model} />}
								{device?.os?.name && <InfoRow label="OS" value={`${device.os.name}${device.os.version ? ` ${device.os.version}` : ""}`} />}
								{browser?.name && <InfoRow label="Browser" value={`${browser.name}${browser.version ? ` ${browser.version}` : ""}`} />}
								{browser?.language && <InfoRow label="Language" value={browser.language} />}
								{device?.screen?.width && <InfoRow label="Screen" value={`${device.screen.width}×${device.screen.height}`} />}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function InfoRow({ label, value }) {
	return (
		<div>
			<span className="text-zinc-500 text-xs">{label}</span>
			<p className="text-zinc-200 text-sm font-medium truncate">{value}</p>
		</div>
	);
}

export default function ContactsPage() {
	const { session } = useDashboard();
	const [contacts, setContacts] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalContacts, setTotalContacts] = useState(0);
	const [loading, setLoading] = useState(true);
	const [viewContact, setViewContact] = useState(null);
	const [viewLoading, setViewLoading] = useState(false);
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

	async function handleView(contactId) {
		setViewLoading(true);
		try {
			const res = await fetch(`/api/admin/contacts/${contactId}`, { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to fetch contact details");
			const data = await res.json();
			setViewContact(data.contact || data);
		} catch {
			setViewContact(null);
		} finally {
			setViewLoading(false);
		}
	}

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
				columns={["Name", "Email", "Category", "Date", ""]}
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
						<td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
							{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
						</td>
						<td className="px-4 py-3 text-right">
							<button
								onClick={() => handleView(contact._id)}
								disabled={viewLoading}
								className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
									<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
									<circle cx="12" cy="12" r="3" />
								</svg>
								View
							</button>
						</td>
					</tr>
				)}
			/>
			<Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />

			{/* Detail Modal */}
			{viewContact && (
				<ContactDetailModal contact={viewContact} onClose={() => setViewContact(null)} />
			)}
		</div>
	);
}
