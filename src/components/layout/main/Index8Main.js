import About5 from "@/components/sections/about/About5";
import AIThoughts from "@/components/sections/ai-thoughts/AIThoughts";
import Cta5 from "@/components/sections/cta/Cta5";
import Hero8 from "@/components/sections/heros/Hero8";
import Newsletter from "@/components/sections/newsletter/Newsletter";
import Portfolio8 from "@/components/sections/portfolio/Portfolio8";
import Resume7 from "@/components/sections/resume/Resume7";
import Services8 from "@/components/sections/services/Services8";
import Testimonials8 from "@/components/sections/testimonials/Testimonials8";

const Index8Main = () => {
	return (
		<main id="main-content" className="overflow-hidden">
			<Hero8 />
			<About5 />
			<Services8 />
			<Portfolio8 />
			<Resume7 />
			<AIThoughts />
			<Testimonials8 />
			<Newsletter />
			<Cta5 />
		</main>
	);
};

export default Index8Main;
