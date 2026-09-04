"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const LinkedInFollowModal = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		// Check if user has already dismissed the modal in this session
		const dismissed = sessionStorage.getItem("linkedinModalDismissed");
		if (dismissed) return;

		// Show modal after 2 minutes (120000ms)
		const showTimer = setTimeout(() => {
			if (!sessionStorage.getItem("linkedinModalDismissed")) {
				setIsVisible(true);
			}
		}, 120000);

		return () => {
			clearTimeout(showTimer);
		};
	}, []);

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
				className={`relative bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] w-full max-w-[360px] transform transition-all duration-300 ${
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
				<div className="p-7 text-center">
					<h3 className="text-white font-semibold text-lg mb-1 tracking-[-0.01em]">
						Let&apos;s connect
					</h3>
					<p className="text-white/50 text-sm mb-6">
						Follow me on LinkedIn for DevOps insights and updates
					</p>

					{/* Profile card */}
					<div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6 text-left">
						<div className="flex items-center gap-4 mb-3">
							<Image
								src="/img/hero/ashiwani.png"
								alt="Ashiwani Kumar"
								width={96}
								height={96}
								className="w-14 h-14 rounded-full object-cover border border-white/10 flex-shrink-0"
							/>
							<div className="min-w-0">
								<div className="flex items-center gap-1.5">
									<span className="text-white font-semibold text-[15px] truncate">
										Ashiwani Kumar
									</span>
									<i className="fa-solid fa-circle-check text-[#38bdf8] text-xs" aria-hidden="true"></i>
								</div>
								<span className="text-white/40 text-xs font-mono">
									Astek Middle East · Abu Dhabi, UAE
								</span>
							</div>
						</div>
						<p className="text-white/55 text-[13px] leading-[1.6]">
							Linux DevOps Engineer · Government &amp; airport infrastructure ·
							AWS, Terraform, Kubernetes · CI/CD &amp; DevSecOps · UAE/Oman projects
						</p>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2.5">
						<a
							href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=ashiwanikumar"
							target="_blank"
							rel="noopener noreferrer"
							onClick={handleClose}
							className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10b981] text-[#022c22] font-medium text-sm rounded-lg hover:bg-[#34d399] transition-all duration-300"
						>
							<i className="fa-brands fa-linkedin"></i>
							Follow on LinkedIn
						</a>
						<a
							href="https://www.linkedin.com/in/ashiwanikumar/"
							target="_blank"
							rel="noopener noreferrer"
							onClick={handleClose}
							className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-medium text-sm rounded-lg transition-all duration-300"
						>
							View profile
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LinkedInFollowModal;
