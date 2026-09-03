"use client";

import { useState, useEffect } from "react";

const LinkedInFollowModal = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [scriptLoaded, setScriptLoaded] = useState(false);

	useEffect(() => {
		// Check if user has already dismissed the modal in this session
		const dismissed = sessionStorage.getItem("linkedinModalDismissed");
		if (dismissed) return;

		// Show modal after 2 minutes (120000ms)
		const showTimer = setTimeout(() => {
			if (!sessionStorage.getItem("linkedinModalDismissed")) {
				setIsVisible(true);
				// Load LinkedIn badge script
				if (!scriptLoaded) {
					const script = document.createElement("script");
					script.src = "https://platform.linkedin.com/badges/js/profile.js";
					script.async = true;
					script.defer = true;
					document.body.appendChild(script);
					setScriptLoaded(true);
				}
			}
		}, 120000); // 2 minutes

		return () => {
			clearTimeout(showTimer);
		};
	}, [scriptLoaded]);

	const handleClose = () => {
		setIsClosing(true);
		sessionStorage.setItem("linkedinModalDismissed", "true");
		setTimeout(() => {
			setIsVisible(false);
			setIsClosing(false);
		}, 300);
	};

	if (!isVisible) return null;

	return (
		<div
			className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
				isClosing ? "opacity-0" : "opacity-100"
			}`}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={handleClose}
			/>

			{/* Modal Content */}
			<div
				className={`relative bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] max-w-sm w-full transform transition-all duration-300 ${
					isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
				}`}
			>
				{/* Close Button */}
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-200 z-10"
					aria-label="Close modal"
				>
					<i className="fa-solid fa-xmark text-lg"></i>
				</button>

				{/* Modal Body */}
				<div className="p-6 text-center">
					{/* Header */}
					<h3 className="text-white font-semibold text-lg mb-2 tracking-[-0.01em]">
						Let&apos;s connect
					</h3>
					<p className="text-white/50 text-sm mb-4">
						Follow me on LinkedIn for DevOps insights and updates
					</p>

					{/* LinkedIn Badge */}
					<div className="flex justify-center mb-4">
						<div
							className="badge-base LI-profile-badge"
							data-locale="en_US"
							data-size="medium"
							data-theme="dark"
							data-type="VERTICAL"
							data-vanity="ashiwanikumar"
							data-version="v1"
						>
							<a
								className="badge-base__link LI-simple-link"
								href="https://ae.linkedin.com/in/ashiwanikumar?trk=profile-badge"
							>
								Ashiwani Kumar
							</a>
						</div>
					</div>

					{/* Follow button */}
					<a
						href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=ashiwanikumar"
						target="_blank"
						rel="noopener noreferrer"
						onClick={handleClose}
						className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] text-[#022c22] font-semibold text-sm rounded-full hover:bg-[#34d399] hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] transition-all duration-300"
					>
						<i className="fa-brands fa-linkedin"></i>
						Follow on LinkedIn
					</a>
				</div>
			</div>
		</div>
	);
};

export default LinkedInFollowModal;
