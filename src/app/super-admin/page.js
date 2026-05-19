import Link from "next/link";

export const metadata = {
	title: "Super Admin",
	description: "Super admin management area for client dashboard operations.",
	robots: {
		index: false,
		follow: false,
	},
};

const managementAreas = [
	{
		name: "Users",
		description: "Manage admins, members, invitations, and account access.",
		routes: ["/api/v1/user", "/api/v1/super-admin", "/api/v1/member"],
	},
	{
		name: "Roles",
		description: "Control resource permissions and role assignment policies.",
		routes: ["/api/v1/role", "/api/v1/resources"],
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

const auditRows = [
	["Role", "super-admin"],
	["Scope", "Full management"],
	["Namespace", "ashiwani-perfosnal-protfolia"],
	["Repository", "corevault-labs/landing-page"],
];

export default function SuperAdminPage() {
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
							Role-based control surface for managing users, content, API operations, and deployment
							readiness from one secured area.
						</p>
					</div>
					<Link
						href="/client-dashboard"
						className="w-fit rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-emerald-400/60 hover:text-emerald-300"
					>
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
						<p className="text-sm font-semibold text-emerald-300">Role path</p>
						<p className="mt-2 text-sm text-zinc-400">
							This management role is available at <code className="text-emerald-300">/super-admin</code>.
						</p>
					</div>
				</aside>
			</section>
		</main>
	);
}
