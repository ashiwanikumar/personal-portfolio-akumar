import Link from "next/link";

export const metadata = {
	title: "Client Dashboard",
	description: "Client dashboard for portfolio API, deployment, and content operations.",
	robots: {
		index: false,
		follow: false,
	},
};

const statusCards = [
	{ label: "API Server", value: "Online", detail: "/api/v1/healthCheck", tone: "green" },
	{ label: "Environment", value: "Staging", detail: "corevault-labs/landing-page", tone: "blue" },
	{ label: "Role", value: "Super Admin", detail: "Management access", tone: "violet" },
	{ label: "Deployments", value: "K8s Ready", detail: "ashiwani-perfosnal-protfolia", tone: "amber" },
];

const modules = [
	{
		title: "Portfolio Content",
		description: "Manage profile sections, services, projects, resume data, and public page content.",
		items: ["Hero profile", "Services", "Portfolio", "Resume"],
	},
	{
		title: "API Operations",
		description: "Review backend health, route groups, environment readiness, and service status.",
		items: ["Health checks", "Auth routes", "User routes", "Role routes"],
	},
	{
		title: "Deployment Control",
		description: "Track Jenkins, Docker image, namespace, ingress, and Kubernetes rollout state.",
		items: ["Jenkins", "Docker", "Kubernetes", "Ingress"],
	},
];

export default function ClientDashboardPage() {
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
							Central workspace for managing the portfolio frontend, API server, deployment state,
							and super-admin actions.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link
							href="/super-admin"
							className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
						>
							Open Super Admin
						</Link>
						<Link
							href="/"
							className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-emerald-400/60 hover:text-emerald-300"
						>
							View Site
						</Link>
					</div>
				</div>
			</section>

			<section className="mx-auto w-full max-w-7xl px-5 py-8">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{statusCards.map((card) => (
						<div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{card.label}</p>
							<div className="mt-4 flex items-center justify-between gap-3">
								<p className="text-2xl font-semibold text-white">{card.value}</p>
								<span className={`h-3 w-3 rounded-full ${card.tone === "green" ? "bg-emerald-400" : card.tone === "blue" ? "bg-sky-400" : card.tone === "violet" ? "bg-violet-400" : "bg-amber-400"}`} />
							</div>
							<p className="mt-3 truncate text-sm text-zinc-500">{card.detail}</p>
						</div>
					))}
				</div>

				<div className="mt-8 grid gap-5 lg:grid-cols-3">
					{modules.map((module) => (
						<section key={module.title} className="rounded-lg border border-white/10 bg-[#0f1115] p-6">
							<h2 className="text-lg font-semibold text-white">{module.title}</h2>
							<p className="mt-3 min-h-16 text-sm leading-6 text-zinc-400">{module.description}</p>
							<div className="mt-5 grid gap-2">
								{module.items.map((item) => (
									<div key={item} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm">
										<span className="text-zinc-300">{item}</span>
										<span className="text-emerald-400">Ready</span>
									</div>
								))}
							</div>
						</section>
					))}
				</div>
			</section>
		</main>
	);
}
