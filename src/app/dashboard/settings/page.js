"use client";

import { useDashboard } from "../_components/DashboardShell";

export default function SettingsPage() {
	const { session } = useDashboard();

	return (
		<div className="space-y-6">
			<h2 className="text-lg font-semibold text-white">Settings</h2>
			<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
				<h3 className="text-sm font-semibold text-white">Account Information</h3>
				<div className="mt-4 space-y-3">
					<div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
						<span className="text-sm text-zinc-400">Name</span>
						<span className="text-sm font-medium text-white">{session?.user?.name || "N/A"}</span>
					</div>
					<div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
						<span className="text-sm text-zinc-400">Email</span>
						<span className="text-sm font-medium text-white">{session?.user?.email || "N/A"}</span>
					</div>
					<div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
						<span className="text-sm text-zinc-400">Role</span>
						<span className="text-sm font-medium text-white">{session?.user?.roleInfo?.name || session?.user?.role || "N/A"}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-zinc-400">Website</span>
						<a href="https://ashiwanikumar.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-400 hover:underline">ashiwanikumar.com</a>
					</div>
				</div>
			</div>
		</div>
	);
}
