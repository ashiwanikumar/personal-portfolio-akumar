"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const defaultChecks = [
	{ name: "health", ok: false, label: "API Server", fallback: "Waiting" },
	{ name: "roles", ok: false, label: "Roles", fallback: "Protected" },
	{ name: "team", ok: false, label: "Team", fallback: "Protected" },
	{ name: "analytics", ok: false, label: "Analytics", fallback: "Protected" },
];

function getCheck(checks, name) {
	return checks.find((check) => check.name === name);
}

export default function ClientDashboardApp() {
	const [session, setSession] = useState(null);
	const [summary, setSummary] = useState(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const checks = summary?.checks || defaultChecks;

	const cards = useMemo(() => {
		const health = getCheck(checks, "health");
		const roles = getCheck(checks, "roles");
		const team = getCheck(checks, "team");
		const analytics = getCheck(checks, "analytics");

		return [
			{
				label: "API Server",
				value: health?.ok ? "Online" : "Unavailable",
				detail: health?.ok ? health.data?.message || "/api/v1/healthCheck" : health?.error || "No response",
				ok: !!health?.ok,
			},
			{
				label: "Role",
				value: session?.user?.roleInfo?.name || session?.user?.role || "Super Admin",
				detail: session?.user?.email || "Protected access",
				ok: !!session?.authenticated,
			},
			{
				label: "Roles API",
				value: roles?.ok ? "Connected" : "Protected",
				detail: roles?.ok ? "Stats loaded" : roles?.error || "Requires token",
				ok: !!roles?.ok,
			},
			{
				label: "Team API",
				value: team?.ok || analytics?.ok ? "Connected" : "Protected",
				detail: team?.ok ? "Members loaded" : analytics?.ok ? "Analytics loaded" : team?.error || "Requires token",
				ok: !!(team?.ok || analytics?.ok),
			},
		];
	}, [checks, session]);

	async function loadDashboard() {
		setLoading(true);
		setError("");
		try {
			const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
			if (!sessionResponse.ok) {
				setSession({ authenticated: false });
				setSummary(null);
				return;
			}

			const sessionData = await sessionResponse.json();
			setSession(sessionData);

			const summaryResponse = await fetch("/api/admin/summary", { cache: "no-store" });
			if (summaryResponse.ok) {
				setSummary(await summaryResponse.json());
			}
		} catch (loadError) {
			setError(loadError.message || "Failed to load dashboard.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadDashboard();
	}, []);

	async function handleLogin(event) {
		event.preventDefault();
		setSubmitting(true);
		setError("");
		try {
			const response = await fetch("/api/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Login failed.");
			setEmail("");
			setPassword("");
			await loadDashboard();
		} catch (loginError) {
			setError(loginError.message || "Login failed.");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleLogout() {
		await fetch("/api/admin/logout", { method: "POST" });
		setSession({ authenticated: false });
		setSummary(null);
	}

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-100">
				<div className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-5 text-sm text-zinc-300">
					Loading dashboard...
				</div>
			</main>
		);
	}

	if (!session?.authenticated) {
		return (
			<main className="grid min-h-screen bg-[#09090b] px-5 py-10 text-zinc-100 lg:grid-cols-[1fr_440px]">
				<section className="flex items-center">
					<div className="mx-auto max-w-2xl">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
							Client Dashboard
						</p>
						<h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
							Protected portfolio operations
						</h1>
						<p className="mt-5 text-base leading-7 text-zinc-400">
							Sign in with a super-admin account to manage portfolio content, API operations,
							role controls, and Kubernetes deployment visibility.
						</p>
					</div>
				</section>
				<section className="flex items-center">
					<form onSubmit={handleLogin} className="w-full rounded-lg border border-white/10 bg-[#0f1115] p-6">
						<h2 className="text-xl font-semibold text-white">Super-admin sign in</h2>
						{error ? (
							<p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
								{error}
							</p>
						) : null}
						<label className="mt-5 block text-sm font-medium text-zinc-300">
							Email
							<input
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-400"
								autoComplete="email"
								required
							/>
						</label>
						<label className="mt-4 block text-sm font-medium text-zinc-300">
							Password
							<input
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-400"
								autoComplete="current-password"
								required
							/>
						</label>
						<button
							type="submit"
							disabled={submitting}
							className="mt-6 w-full rounded-md bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{submitting ? "Signing in..." : "Sign in"}
						</button>
					</form>
				</section>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-[#09090b] text-zinc-100">
			<section className="border-b border-white/10 bg-[#0f1115]">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
							Client Dashboard
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
							Portfolio Operations
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
							Signed in as {session.user?.name || session.user?.email}. Operational data is loaded
							from the API server through protected Next.js admin endpoints.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link href="/super-admin" className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
							Open Super Admin
						</Link>
						<button onClick={handleLogout} className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-red-400/60 hover:text-red-300">
							Log out
						</button>
					</div>
				</div>
			</section>

			<section className="mx-auto w-full max-w-7xl px-5 py-8">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{cards.map((card) => (
						<div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{card.label}</p>
							<div className="mt-4 flex items-center justify-between gap-3">
								<p className="text-2xl font-semibold text-white">{card.value}</p>
								<span className={`h-3 w-3 rounded-full ${card.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
							</div>
							<p className="mt-3 truncate text-sm text-zinc-500">{card.detail}</p>
						</div>
					))}
				</div>

				<div className="mt-8 rounded-lg border border-white/10 bg-[#0f1115] p-6">
					<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-white">Live API Checks</h2>
							<p className="mt-1 text-sm text-zinc-500">Last checked: {summary?.checkedAt || "Not available"}</p>
						</div>
						<button onClick={loadDashboard} className="w-fit rounded-md border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-400/60 hover:text-emerald-300">
							Refresh
						</button>
					</div>
					<div className="mt-5 grid gap-3">
						{checks.map((check) => (
							<div key={check.name} className="flex flex-col gap-2 rounded-md border border-white/10 px-4 py-3 md:flex-row md:items-center md:justify-between">
								<div>
									<p className="font-medium capitalize text-white">{check.name}</p>
									<p className="mt-1 text-sm text-zinc-500">{check.ok ? "Connected" : check.error || check.fallback}</p>
								</div>
								<span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${check.ok ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
									{check.ok ? "OK" : "Needs attention"}
								</span>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
