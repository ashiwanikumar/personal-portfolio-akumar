import DashboardShellWrapper from "./_components/DashboardShellWrapper";

export const metadata = {
	title: "Dashboard | Ashiwani Kumar",
	description: "Portfolio management dashboard for content, deployments, and operations.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function DashboardLayout({ children }) {
	return (
		<div className="dashboard-scope">
			<DashboardShellWrapper>{children}</DashboardShellWrapper>
		</div>
	);
}
