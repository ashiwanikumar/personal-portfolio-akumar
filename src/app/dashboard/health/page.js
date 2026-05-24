"use client";

import { useDashboard, Icons } from "../_components/DashboardShell";

export default function HealthPage() {
	const { checks, summary, loadDashboard } = useDashboard();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-white">System Health</h2>
					<p className="mt-1 text-xs text-zinc-400">Last checked: {summary?.checkedAt ? new Date(summary.checkedAt).toLocaleString() : "N/A"}</p>
				</div>
				<button onClick={loadDashboard} className="group inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400">
					<span className="transition-transform group-hover:rotate-180" style={{ transitionDuration: "500ms" }}>{Icons.refresh}</span>
					Refresh
				</button>
			</div>
			<div className="space-y-2">
				{checks.map((check) => (
					<div key={check.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
						<div className="flex items-center gap-3">
							<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${check.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
							<div>
								<p className="text-sm font-medium text-zinc-200">{check.label || check.name}</p>
								<p className="text-xs text-zinc-400">{check.ok ? "Connected" : check.error || check.fallback}</p>
							</div>
						</div>
						<span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${check.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
							{check.ok ? "Healthy" : "Pending"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
