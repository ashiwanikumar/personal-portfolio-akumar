"use client";
import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import FooterContextProvider from "@/context_api/FooterContext";
import HeaderContextProvider from "@/context_api/HeaderContext";
import PortfolioRenderContextProvider from "@/context_api/PortfolioRenderContext";
import useSticky from "@/hooks/useSticky";
import animateInvertText from "@/libs/animateInvertText";
import animateSplitText from "@/libs/animateSplitText ";
import controlVanillaTilt from "@/libs/controlVanillaTilt";
import smoothScroll from "@/libs/smoothScroll";
import tjTitleAnim from "@/libs/tjTitleAnim";
import { useEffect } from "react";
import BackToTop from "../others/BackToTop";
import MagicCusror1 from "../others/MagicCusror1";

import LinkedInFollowModal from "../modals/LinkedInFollowModal";

const PageWrapper = ({
	children,
	isIndexPage,
	isInnerPage,
	isResumeBtn,
	headerType,
	footerType,
}) => {
	useSticky();
	useEffect(() => {
		import("wow.js").then(({ default: WOW }) => {
			new WOW().init();
			controlVanillaTilt();
		});
		smoothScroll();
		animateSplitText();
		animateInvertText();
		tjTitleAnim();
	}, []);
	return (
		<div>
			<LinkedInFollowModal />

			<BackToTop />
			{headerType === 4 ? <MagicCusror1 /> : ""}
			<HeaderContextProvider
				value={{ isIndexPage, isInnerPage, headerType, isResumeBtn }}
			>
				<Header />
				<Header isSticky={true} />
			</HeaderContextProvider>
			<PortfolioRenderContextProvider>
				{children ? children : ""}
			</PortfolioRenderContextProvider>
			<FooterContextProvider value={{ footerType }}>
				<Footer />
			</FooterContextProvider>
		</div>
	);
};

export default PageWrapper;
