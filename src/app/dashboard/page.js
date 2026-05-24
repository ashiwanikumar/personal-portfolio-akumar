import DashboardApp from "./_components/DashboardApp";

export const metadata = {
	title: "Dashboard | Ashiwani Kumar",
	description: "Portfolio management dashboard for content, deployments, and operations.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function DashboardPage() {
	return <DashboardApp />;
}
