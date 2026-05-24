"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboard, Pagination, DataTable, Icons } from "../_components/DashboardShell";

const colorMap = {
	download: "emerald",
	view: "blue",
	open_tab: "violet",
};

function StatCard({ label, value, color = "emerald" }) {
	const colors = {
		emerald: "border-emerald-500/20 from-emerald-500/10 to-emerald-600/5 text-emerald-400",
		blue: "border-blue-500/20 from-blue-500/10 to-blue-600/5 text-blue-400",
		violet: "border-violet-500/20 from-violet-500/10 to-violet-600/5 text-violet-400",
		amber: "border-amber-500/20 from-amber-500/10 to-amber-600/5 text-amber-400",
		zinc: "border-zinc-500/20 from-zinc-500/10 to-zinc-600/5 text-zinc-400",
	};
	const c = colors[color] || colors.emerald;
	return (
		<div className={`rounded-xl border bg-gradient-to-br p-5 ${c}`}>
			<p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
			<p className="mt-2 text-2xl font-bold text-white">{value}</p>
		</div>
	);
}

function ActionBadge({ action }) {
	const styles = {
		download: "bg-emerald-500/10 text-emerald-400",
		view: "bg-blue-500/10 text-blue-400",
		open_tab: "bg-violet-500/10 text-violet-400",
	};
	const labels = { download: "Download", view: "View", open_tab: "Open Tab" };
	return (
		<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[action] || "bg-zinc-500/10 text-zinc-400"}`}>
			{labels[action] || action}
		</span>
	);
}

export default function CvAnalyticsPage() {
	const { session } = useDashboard();
	const [analytics, setAnalytics] = useState(null);
	const [events, setEvents] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [eventsLoading, setEventsLoading] = useState(false);
	const [days, setDays] = useState(30);
	const perPage = 15;

	const fetchAnalytics = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/admin/cv?days=${days}`, { cache: "no-store" });
			if (res.ok) {
				const data = await res.json();
				setAnalytics(data);
			}
		} catch {
			// Silent fail
		} finally {
			setLoading(false);
		}
	}, [days]);

	const fetchEvents = useCallback(async (p) => {
		setEventsLoading(true);
		try {
			const res = await fetch(`/api/admin/cv?page=${p}&perPage=${perPage}`, { cache: "no-store" });
			if (res.ok) {
				const data = await res.json();
				setEvents(data.events || []);
				setTotalPages(data.paginationData?.totalPages || 1);
			}
		} catch {
			setEvents([]);
		} finally {
			setEventsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (session?.authenticated) {
			fetchAnalytics();
			fetchEvents(page);
		}
	}, [session, fetchAnalytics, fetchEvents, page]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="relative h-8 w-8">
					<div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
				</div>
			</div>
		);
	}

	const summary = analytics?.summary || {};
	const allTime = analytics?.allTime || {};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-white">CV Analytics</h2>
					<p className="mt-1 text-xs text-zinc-400">Track who views and downloads your CV</p>
				</div>
				<select
					value={days}
					onChange={(e) => setDays(Number(e.target.value))}
					className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 outline-none focus:border-emerald-500/30"
				>
					<option value={7}>Last 7 days</option>
					<option value={30}>Last 30 days</option>
					<option value={90}>Last 90 days</option>
					<option value={365}>Last year</option>
				</select>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
				<StatCard label="Downloads" value={summary.downloads || 0} color="emerald" />
				<StatCard label="Views" value={summary.views || 0} color="blue" />
				<StatCard label="Open Tab" value={summary.openTab || 0} color="violet" />
				<StatCard label="Unique Visitors" value={summary.uniqueVisitors || 0} color="amber" />
				<StatCard label="All Time" value={allTime.total || 0} color="zinc" />
			</div>

			{/* Geographic breakdown */}
			{analytics?.byCountry?.length > 0 && (
				<div className="grid gap-4 lg:grid-cols-2">
					{/* By Country */}
					<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
						<h3 className="mb-4 text-sm font-semibold text-white">By Country</h3>
						<div className="space-y-2">
							{analytics.byCountry.slice(0, 8).map((c) => (
								<div key={c.countryCode} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
									<div className="flex items-center gap-2">
										<span className="text-sm">{c.countryCode}</span>
										<span className="text-sm font-medium text-zinc-200">{c.country}</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-xs text-emerald-400">{c.downloads} DL</span>
										<span className="text-xs text-blue-400">{c.views} V</span>
										<span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">{c.total}</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* By City */}
					<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
						<h3 className="mb-4 text-sm font-semibold text-white">By City</h3>
						<div className="space-y-2">
							{(analytics?.byCity || []).slice(0, 8).map((c, i) => (
								<div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
									<span className="text-sm font-medium text-zinc-200">{c.city || "Unknown"}, {c.country}</span>
									<span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">{c.total}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Device & Browser */}
			{(analytics?.byDevice?.length > 0 || analytics?.byBrowser?.length > 0) && (
				<div className="grid gap-4 lg:grid-cols-2">
					<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
						<h3 className="mb-4 text-sm font-semibold text-white">Device Type</h3>
						<div className="flex flex-wrap gap-2">
							{(analytics?.byDevice || []).map((d) => (
								<div key={d._id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
									<span className="text-xs font-medium capitalize text-zinc-300">{d._id || "unknown"}</span>
									<span className="ml-2 text-xs font-bold text-emerald-400">{d.count}</span>
								</div>
							))}
						</div>
					</div>
					<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
						<h3 className="mb-4 text-sm font-semibold text-white">Browser</h3>
						<div className="flex flex-wrap gap-2">
							{(analytics?.byBrowser || []).map((b) => (
								<div key={b._id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
									<span className="text-xs font-medium text-zinc-300">{b._id || "unknown"}</span>
									<span className="ml-2 text-xs font-bold text-blue-400">{b.count}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Event Log */}
			<div>
				<h3 className="mb-4 text-sm font-semibold text-white">Recent Activity</h3>
				{eventsLoading ? (
					<div className="flex items-center justify-center py-10">
						<div className="relative h-6 w-6">
							<div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
						</div>
					</div>
				) : (
					<DataTable
						columns={["Action", "Location", "Device", "IP", "Time"]}
						data={events}
						emptyText="No CV interactions recorded yet."
						renderRow={(event) => (
							<tr key={event._id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
								<td className="px-4 py-3"><ActionBadge action={event.action} /></td>
								<td className="px-4 py-3">
									<div>
										<p className="text-sm font-medium text-zinc-200">{event.city || "Unknown"}</p>
										<p className="text-xs text-zinc-500">{event.country} {event.region ? `· ${event.region}` : ""}</p>
									</div>
								</td>
								<td className="px-4 py-3">
									<div>
										<p className="text-sm text-zinc-300">{event.browser || "—"}</p>
										<p className="text-xs text-zinc-500">{event.os} · {event.deviceType}</p>
									</div>
								</td>
								<td className="px-4 py-3 text-xs font-mono text-zinc-400">{event.ip}</td>
								<td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
									{event.createdAt ? new Date(event.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
								</td>
							</tr>
						)}
					/>
				)}
				<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
			</div>
		</div>
	);
}
