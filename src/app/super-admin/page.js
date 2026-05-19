import SuperAdminApp from "./_components/SuperAdminApp";

export const metadata = {
	title: "Super Admin",
	description: "Super admin management area for client dashboard operations.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function SuperAdminPage() {
	return <SuperAdminApp />;
}
