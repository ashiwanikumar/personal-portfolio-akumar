import { Plus_Jakarta_Sans, Manrope, DM_Mono } from "next/font/google";
import DashboardShellWrapper from "./_components/DashboardShellWrapper";

const display = Plus_Jakarta_Sans({
	subsets: ["latin"],
	weight: ["600", "700", "800"],
	variable: "--nx-font-display",
	display: "swap",
});

const sans = Manrope({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--nx-font-sans",
	display: "swap",
});

const mono = DM_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--nx-font-mono",
	display: "swap",
});

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
		<div className={`dashboard-scope ${display.variable} ${sans.variable} ${mono.variable}`}>
			<DashboardShellWrapper>{children}</DashboardShellWrapper>
		</div>
	);
}
