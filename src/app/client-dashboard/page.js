import ClientDashboardApp from "./_components/ClientDashboardApp";

export const metadata = {
	title: "Client Dashboard",
	description: "Client dashboard for portfolio API, deployment, and content operations.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function ClientDashboardPage() {
	return <ClientDashboardApp />;
}
