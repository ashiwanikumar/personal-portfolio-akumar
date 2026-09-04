"use client";
import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import FooterContextProvider from "@/context_api/FooterContext";
import HeaderContextProvider from "@/context_api/HeaderContext";
import PortfolioRenderContextProvider from "@/context_api/PortfolioRenderContext";
import smoothScroll from "@/libs/smoothScroll";
import { useEffect } from "react";
import BackToTop from "../others/BackToTop";

import LinkedInFollowModal from "../modals/LinkedInFollowModal";

const PageWrapper = ({
	children,
	isIndexPage,
	isInnerPage,
	isResumeBtn,
	headerType,
	footerType,
}) => {
	useEffect(() => {
		smoothScroll();
	}, []);
	return (
		<div>
			<LinkedInFollowModal />

			<BackToTop />
			<HeaderContextProvider
				value={{ isIndexPage, isInnerPage, headerType, isResumeBtn }}
			>
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
