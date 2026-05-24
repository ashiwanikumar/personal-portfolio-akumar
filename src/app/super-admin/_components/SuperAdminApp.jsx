"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const managementAreas = [
	{
		name: "Users",
		description: "Manage admins, members, invitations, and account access.",
		routes: ["/api/v1/user", "/api/v1/super-admin/team/members", "/api/v1/member"],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
			</svg>
		),
	},
	{
		name: "Roles",
		description: "Control resource permissions and role assignment policies.",
		routes: ["/api/v1/roles", "/api/v1/resources", "/api/v1/roles/stats"],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				<path d="m9 12 2 2 4-4" />
			</svg>
		),
	},
	{
		name: "Content",
		description: "Manage blog, gallery, hero sections, announcements, and contact records.",
		routes: ["/api/v1/blog", "/api/v1/gallery-section", "/api/v1/announcement"],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
				<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
			</svg>
		),
	},
	{
		name: "Operations",
		description: "Review health checks, deployment status, monitoring, and staging tools.",
		routes: ["/api/v1/healthCheck", "/api/v1/monitoring/health"],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
				<rect x="2" y="2" width="20" height="8" rx="2" />
				<rect x="2" y="14" width="20" height="8" rx="2" />
				<circle cx="6" cy="6" r="1" fill="currentColor" />
				<circle cx="6" cy="18" r="1" fill="currentColor" />
			</svg>
		),
	},
];

export default function SuperAdminApp() {
	const [session, setSession] = useState(null);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(true);

	async function loadData() {
		setLoading(true);
		try {
			const sessionRes = await fetch("/api/admin/session", { cache: "no-store" });
			if (!sessionRes.ok) {
				setSession({ authenticated: false });
				return;
			}
			setSession(await sessionRes.json());

			const summaryRes = await fetch("/api/admin/summary", { cache: "no-store" });
			if (summaryRes.ok) setSummary(await summaryRes.json());
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadData();
	}, []);

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
				<div className="flex flex-col items-center gap-4">
					<div className="relative h-10 w-10">
						<div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
						<div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-b-emerald-400/30" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
					</div>
					<p className="text-sm font-medium tracking-wide text-zinc-500">Loading admin console...</p>
				</div>
			</main>
		);
	}

	if (!session?.authenticated) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4">
				<div className="max-w-sm text-center">
					<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
						<svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-amber-400">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							<path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</div>
					<h1 className="text-xl font-bold text-white">Authentication Required</h1>
					<p className="mt-3 text-sm leading-relaxed text-zinc-500">
						Sign in through the dashboard with a super-admin account to access this console.
					</p>
					<Link
						href="/dashboard"
						className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-emerald-400"
					>
						Go to Dashboard
						<svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
							<path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</Link>
				</div>
			</main>
		);
	}

	const auditRows = [
		{ label: "Role", value: session.user?.roleInfo?.name || session.user?.role || "super-admin" },
		{ label: "Scope", value: "Full management" },
		{ label: "Namespace", value: "ashiwani-personal-portfolio" },
		{ label: "Repository", value: "corevault-labs/landing-page" },
		{ label: "Last check", value: summary?.checkedAt || "Not loaded" },
	];

	const healthyCount = summary?.checks?.filter((c) => c.ok).length || 0;
	const totalCount = summary?.checks?.length || 4;

	return (
		<main className="min-h-screen bg-[#0a0a0b] text-zinc-100">
			{/* Header */}
			<header className="border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-xl">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
							<svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 text-purple-400">
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								<path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<div>
							<h1 className="text-base font-semibold text-white">Admin Console</h1>
							<p className="text-xs text-zinc-500">{session.user?.email}</p>
						</div>
					</div>
					<Link
						href="/dashboard"
						className="rounded-lg border border-white/[0.08] px-3.5 py-2 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400"
					>
						Dashboard
					</Link>
				</div>
			</header>

			{/* Title section */}
			<section className="border-b border-white/[0.06] bg-gradient-to-b from-purple-500/[0.03] to-transparent">
				<div className="mx-auto w-full max-w-7xl px-6 py-8">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
						Super Admin
					</p>
					<h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
						Management Console
					</h2>
					<p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
						Full control surface for users, roles, content, and operational readiness.
					</p>
				</div>
			</section>

			{/* Main content */}
			<section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
				{/* Management areas */}
				<div className="grid gap-4 md:grid-cols-2">
					{managementAreas.map((area) => (
						<div
							key={area.name}
							className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
						>
							<div className="flex items-center gap-3">
								<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-400 transition-colors group-hover:text-purple-400">
									{area.icon}
								</span>
								<h3 className="text-base font-semibold text-white">{area.name}</h3>
							</div>
							<p className="mt-3 text-sm leading-relaxed text-zinc-500">{area.description}</p>
							<div className="mt-4 space-y-1.5">
								{area.routes.map((route) => (
									<code
										key={route}
										className="block rounded-lg border border-white/[0.04] bg-black/30 px-3 py-2 text-xs text-emerald-400/80"
									>
										{route}
									</code>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Sidebar */}
				<aside className="space-y-4">
					{/* Access summary */}
					<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
						<h3 className="text-sm font-semibold text-white">Access Summary</h3>
						<div className="mt-4 space-y-0 divide-y divide-white/[0.04]">
							{auditRows.map((row) => (
								<div key={row.label} className="flex items-start justify-between gap-3 py-3 text-xs">
									<span className="text-zinc-500">{row.label}</span>
									<span className="max-w-[180px] text-right font-medium text-zinc-300">{row.value}</span>
								</div>
							))}
						</div>
					</div>

					{/* Health summary */}
					<div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold text-emerald-400">Backend Status</p>
							<span className="text-xs text-zinc-500">
								{healthyCount}/{totalCount}
							</span>
						</div>
						<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
							<div
								className="h-full rounded-full bg-emerald-500 transition-all duration-500"
								style={{ width: `${(healthyCount / totalCount) * 100}%` }}
							/>
						</div>
						<p className="mt-3 text-xs text-zinc-500">
							{healthyCount === totalCount
								? "All systems operational"
								: `${totalCount - healthyCount} check(s) need attention`}
						</p>
					</div>
				</aside>
			</section>
		</main>
	);
}
