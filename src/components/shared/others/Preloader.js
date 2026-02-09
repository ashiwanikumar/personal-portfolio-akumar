"use client";

import preloaderController from "@/libs/preloaderController";
import { useEffect } from "react";

const Preloader = () => {
	useEffect(() => {
		preloaderController();
	}, []);
	return (
		<div className="preloader">
			<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
				<path
					id="preloaderSvg"
					d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"
				></path>
			</svg>

			<div className="preloader-heading">
				<div className="load-text">
					<span>A</span>
					<span>S</span>
					<span>H</span>
					<span>I</span>
					<span>W</span>
					<span>A</span>
					<span>N</span>
					<span>I</span>
				</div>
				<div className="load-subtext">
					<span className="terminal-cursor">&gt;_</span> Initializing...
				</div>
			</div>
		</div>
	);
};

export default Preloader;
