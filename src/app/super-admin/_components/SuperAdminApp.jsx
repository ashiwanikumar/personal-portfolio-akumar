"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const managementAreas = [
	{
		name: "Users",
		description: "Manage admins, members, invitations, and account access.",
		routes: ["/api/v1/user", "/api/v1/super-admin/team/members", "/api/v1/member"],
	},
	{
		name: "Roles",
		description: "Control resource permissions and role assignment policies.",
		routes: ["/api/v1/roles", "/api/v1/resources", "/api/v1/roles/stats"],
	},
	{
		name: "Content",
		description: "Manage blog, gallery, hero sections, announcements, and contact records.",
		routes: ["/api/v1/blog", "/api/v1/gallery-section", "/api/v1/announcement"],
	},
	{
		name: "Operations",
		description: "Review health checks, deployment status, monitoring, and staging tools.",
		routes: ["/api/v1/healthCheck", "/api/v1/monitoring/health"],
	},
];

export default function SuperAdminApp() {
	const [session, setSession] = useState(null);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(true);

	async function loadData() {
		setLoading(true);
		try {
			const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
			if (!sessionResponse.ok) {
				setSession({ authenticated: false });
				return;
			}
			setSession(await sessionResponse.json());

			const summaryResponse = await fetch("/api/admin/summary", { cache: "no-store" });
			if (summaryResponse.ok) setSummary(await summaryResponse.json());
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadData();
	}, []);

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-100">
				<div className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-5 text-sm text-zinc-300">
					Checking super-admin session...
				</div>
			</main>
		);
	}

	if (!session?.authenticated) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-zinc-100">
				<section className="max-w-xl rounded-lg border border-white/10 bg-[#0f1115] p-7 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
						Super Admin
					</p>
					<h1 className="mt-3 text-3xl font-bold text-white">Sign in required</h1>
					<p className="mt-4 text-sm leading-6 text-zinc-400">
						Use the client dashboard login with a super-admin account before opening this management area.
					</p>
					<Link
						href="/client-dashboard"
						className="mt-6 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
					>
						Go to Login
					</Link>
				</section>
			</main>
		);
	}

	const auditRows = [
		["Role", session.user?.roleInfo?.name || session.user?.role || "super-admin"],
		["Scope", "Full management"],
		["Namespace", "ashiwani-perfosnal-protfolia"],
		["Repository", "corevault-labs/landing-page"],
		["Last API check", summary?.checkedAt || "Not loaded"],
	];

	return (
		<main className="min-h-screen bg-[#09090b] text-zinc-100">
			<header className="border-b border-white/10 bg-[#0f1115]">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
							Super Admin
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
							Management Console
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
							Protected control surface for {session.user?.email}. Manage users, roles, content,
							and operational readiness through backend-backed endpoints.
						</p>
					</div>
					<Link href="/client-dashboard" className="w-fit rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-emerald-400/60 hover:text-emerald-300">
						Client Dashboard
					</Link>
				</div>
			</header>

			<section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_360px]">
				<div className="grid gap-5 md:grid-cols-2">
					{managementAreas.map((area) => (
						<section key={area.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
							<h2 className="text-xl font-semibold text-white">{area.name}</h2>
							<p className="mt-3 text-sm leading-6 text-zinc-400">{area.description}</p>
							<div className="mt-5 grid gap-2">
								{area.routes.map((route) => (
									<code key={route} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-emerald-300">
										{route}
									</code>
								))}
							</div>
						</section>
					))}
				</div>

				<aside className="rounded-lg border border-white/10 bg-[#0f1115] p-6">
					<h2 className="text-lg font-semibold text-white">Access Summary</h2>
					<div className="mt-5 divide-y divide-white/10">
						{auditRows.map(([label, value]) => (
							<div key={label} className="flex items-start justify-between gap-4 py-4 text-sm">
								<span className="text-zinc-500">{label}</span>
								<span className="max-w-48 text-right font-medium text-zinc-200">{value}</span>
							</div>
						))}
					</div>
					<div className="mt-6 rounded-md border border-emerald-400/20 bg-emerald-400/5 p-4">
						<p className="text-sm font-semibold text-emerald-300">Backend checks</p>
						<p className="mt-2 text-sm text-zinc-400">
							{summary?.checks?.filter((check) => check.ok).length || 0} of {summary?.checks?.length || 4} checks connected.
						</p>
					</div>
				</aside>
			</section>
		</main>
	);
}
