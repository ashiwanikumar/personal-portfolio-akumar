"use client";

import { useDashboard, getCheck, getTotalSubscribers, Icons } from "./_components/DashboardShell";

// ─── Color map for stat cards ──────────────────────────────────
const colorMap = {
	emerald: { bg: "from-emerald-500/10 to-emerald-600/5", text: "text-emerald-400", border: "border-emerald-500/20" },
	blue: { bg: "from-blue-500/10 to-blue-600/5", text: "text-blue-400", border: "border-blue-500/20" },
	violet: { bg: "from-violet-500/10 to-violet-600/5", text: "text-violet-400", border: "border-violet-500/20" },
	amber: { bg: "from-amber-500/10 to-amber-600/5", text: "text-amber-400", border: "border-amber-500/20" },
};

function StatCard({ label, value, detail, icon, color }) {
	const c = colorMap[color] || colorMap.emerald;
	return (
		<div className={`rounded-xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 transition-all hover:border-opacity-50`}>
			<div className="flex items-center justify-between">
				<span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
				<span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] ${c.text}`}>{icon}</span>
			</div>
			<p className="mt-3 text-2xl font-bold text-white">{value}</p>
			<p className="mt-1 truncate text-xs text-zinc-400">{detail}</p>
		</div>
	);
}

function HealthSummary({ checks, loadDashboard }) {
	const healthyCount = checks.filter((c) => c.ok).length;
	const totalCount = checks.length;

	return (
		<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h3 className="text-sm font-semibold text-white">System Health</h3>
					<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${healthyCount === totalCount ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
						{healthyCount}/{totalCount} Healthy
					</span>
				</div>
				<button onClick={loadDashboard} className="group inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400">
					<span className="transition-transform group-hover:rotate-180" style={{ transitionDuration: "500ms" }}>{Icons.refresh}</span>
					Refresh
				</button>
			</div>
			<div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
				{checks.slice(0, 8).map((check) => (
					<div key={check.name} className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
						<span className={`h-2 w-2 shrink-0 rounded-full ${check.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
						<span className="truncate text-xs font-medium text-zinc-300">{check.label || check.name}</span>
						<span className={`ml-auto shrink-0 text-[10px] font-semibold ${check.ok ? "text-emerald-400" : "text-amber-400"}`}>
							{check.ok ? "OK" : "?"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function RecentContactsPanel({ checks }) {
	const check = getCheck(checks, "recentContacts");
	const items = check?.ok ? (check.data?.contacts || []) : [];

	return (
		<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-zinc-400">{Icons.contacts}</span>
					<h3 className="text-sm font-semibold text-white">Recent Contacts</h3>
				</div>
				<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
					{check?.ok ? `${items.length} shown` : "Protected"}
				</span>
			</div>
			<div className="mt-4 space-y-2">
				{check?.ok ? (
					items.length ? items.map((contact) => (
						<div key={contact._id || contact.email} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-white">{contact.name || "Unknown"}</p>
								<p className="truncate text-xs text-zinc-400">{contact.email}</p>
							</div>
							<span className="ml-3 shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
								{contact.category?.name || contact.category?.id || "General"}
							</span>
						</div>
					)) : (
						<p className="py-4 text-center text-xs text-zinc-400">No contact submissions yet.</p>
					)
				) : (
					<p className="py-4 text-center text-xs text-zinc-400">{check?.error || "Sign in to access."}</p>
				)}
			</div>
		</div>
	);
}

function RecentSubscribersPanel({ checks }) {
	const check = getCheck(checks, "recentSubscribers");
	const items = check?.ok ? (check.data?.subscribers || []) : [];

	return (
		<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-zinc-400">{Icons.newsletter}</span>
					<h3 className="text-sm font-semibold text-white">Recent Subscribers</h3>
				</div>
				<span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
					{check?.ok ? `${items.length} shown` : "Protected"}
				</span>
			</div>
			<div className="mt-4 space-y-2">
				{check?.ok ? (
					items.length ? items.map((sub) => (
						<div key={sub._id || sub.email} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-white">{sub.name?.firstName || sub.name || "Subscriber"}</p>
								<p className="truncate text-xs text-zinc-400">{sub.email}</p>
							</div>
							<span className="ml-3 shrink-0 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
								{sub.status || "active"}
							</span>
						</div>
					)) : (
						<p className="py-4 text-center text-xs text-zinc-400">No subscribers yet.</p>
					)
				) : (
					<p className="py-4 text-center text-xs text-zinc-400">{check?.error || "Sign in to access."}</p>
				)}
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const { session, checks, cards, loadDashboard } = useDashboard();
	const userName = session?.user?.name?.split(" ")[0] || "Admin";

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-white/[0.06] bg-gradient-to-r from-emerald-500/[0.08] to-transparent p-6">
				<h2 className="text-xl font-bold text-white sm:text-2xl">Welcome back, {userName}</h2>
				<p className="mt-1 text-sm text-zinc-400">Here&apos;s an overview of your portfolio platform.</p>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{cards.map((card) => (
					<StatCard key={card.label} {...card} />
				))}
			</div>

			<HealthSummary checks={checks} loadDashboard={loadDashboard} />

			<div className="grid gap-4 lg:grid-cols-2">
				<RecentContactsPanel checks={checks} />
				<RecentSubscribersPanel checks={checks} />
			</div>
		</div>
	);
}
