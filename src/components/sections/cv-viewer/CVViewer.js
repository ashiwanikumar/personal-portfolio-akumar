"use client";

import { useState, useCallback } from "react";

function trackCvEvent(action) {
	try {
		const data = {
			action,
			referrer: document.referrer || "",
			source: document.referrer ? new URL(document.referrer).hostname : "direct",
			pageUrl: window.location.href,
			screenResolution: `${window.screen.width}x${window.screen.height}`,
			language: navigator.language || "",
		};

		// Extract UTM params from URL
		const params = new URLSearchParams(window.location.search);
		if (params.get("utm_source")) data.utmSource = params.get("utm_source");
		if (params.get("utm_medium")) data.utmMedium = params.get("utm_medium");
		if (params.get("utm_campaign")) data.utmCampaign = params.get("utm_campaign");

		// Fire and forget - don't block the user action
		fetch("/api/public/cv", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		}).catch(() => {});
	} catch {
		// Silently fail - tracking should never break UX
	}
}

const CVViewer = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const cvPath = "/cv/Ashiwani_Kumar_CV.pdf";

	const openModal = useCallback(() => {
		setIsModalOpen(true);
		document.body.style.overflow = "hidden";
		trackCvEvent("view");
	}, []);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		document.body.style.overflow = "auto";
	}, []);

	const handleDownload = useCallback(() => {
		trackCvEvent("download");
	}, []);

	const handleOpenTab = useCallback(() => {
		trackCvEvent("open_tab");
	}, []);

	const stats = [
		{ value: "7+", label: "Years in production" },
		{ value: "99.9%", label: "Uptime maintained" },
		{ value: "5", label: "UAE airports" },
		{ value: "6+", label: "Certifications" },
	];

	return (
		<>
			<section id="cv" className="py-60px md:py-20 lg:py-30 bg-[#09090b]">
				<div className="container">
					<div className="text-center mb-50px">
						<span className="section-badge mb-6 inline-flex">Resume</span>
						<h2 className="text-[26px] md:text-[30px] lg:text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-white mb-4">
							The full story, <span className="gradient-text">on paper.</span>
						</h2>
						<p className="text-white/45 leading-[1.75] max-w-600px mx-auto text-base">
							Complete work history, certifications, and technical skills — view it
							here or take a copy with you.
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						{/* CV Preview Card */}
						<div className="glass-card rounded-3xl p-6 md:p-10">
							{/* Header */}
							<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/[0.08]">
								<div className="flex items-center gap-4 min-w-0 w-full lg:w-auto">
									<div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#10b981]/10 border border-[#10b981]/15 rounded-2xl flex items-center justify-center flex-shrink-0">
										<i className="fa-solid fa-file-pdf text-2xl sm:text-3xl text-[#34d399]"></i>
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-1 sm:mb-2 tracking-[-0.01em] break-words">
											Ashiwani Kumar — CV
										</h3>
										<p className="text-white/45 text-sm sm:text-base font-mono break-words">
											Linux DevOps Engineer · Open source enthusiast
										</p>
									</div>
								</div>

								<div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
									<button
										onClick={openModal}
										className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-transparent border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-medium rounded-lg transition-all duration-300 text-sm whitespace-nowrap"
									>
										<i className="fa-solid fa-eye"></i>
										View CV
									</button>
									<a
										href={cvPath}
										download="Ashiwani_Kumar_CV.pdf"
										onClick={handleDownload}
										className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-medium rounded-lg transition-all duration-300 text-sm whitespace-nowrap"
									>
										<i className="fa-solid fa-download"></i>
										Download
									</a>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-5">
								{stats.map((stat) => (
									<div key={stat.label} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
										<div className="text-2xl md:text-3xl font-semibold text-white tracking-[-0.02em] mb-2">{stat.value}</div>
										<div className="text-white/35 text-xs font-mono">{stat.label}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* PDF Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/90 backdrop-blur-sm"
						onClick={closeModal}
					></div>

					{/* Close button - Fixed position for mobile */}
					<button
						onClick={closeModal}
						className="fixed top-4 right-4 z-[10000] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/15 backdrop-blur-md transition-all duration-300"
						aria-label="Close"
					>
						<i className="fa-solid fa-xmark text-xl"></i>
					</button>

					{/* Modal Content */}
					<div className="relative w-full max-w-6xl h-[90vh] mx-2 sm:mx-4 bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
						{/* Modal Header */}
						<div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.08] bg-white/[0.02]">
							<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
								<i className="fa-solid fa-file-pdf text-lg sm:text-xl text-[#34d399] flex-shrink-0"></i>
								<span className="text-white font-mono font-semibold text-sm sm:text-base truncate">
									Ashiwani Kumar — CV
								</span>
							</div>
							<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
								<a
									href={cvPath}
									download="Ashiwani_Kumar_CV.pdf"
									onClick={handleDownload}
									className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-semibold rounded-lg transition-all duration-300 text-xs sm:text-sm"
								>
									<i className="fa-solid fa-download"></i>
									<span className="hidden sm:inline">Download</span>
								</a>
								<a
									href={cvPath}
									target="_blank"
									rel="noopener noreferrer"
									onClick={handleOpenTab}
									className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-semibold rounded-lg transition-all duration-300 text-sm"
								>
									<i className="fa-solid fa-external-link"></i>
									Open in New Tab
								</a>
							</div>
						</div>

						{/* PDF Viewer */}
						<div className="h-[calc(90vh-60px)] sm:h-[calc(90vh-70px)] bg-[#111]">
							<iframe
								src={`${cvPath}#toolbar=1&navpanes=0&scrollbar=1`}
								className="w-full h-full"
								title="Ashiwani Kumar CV"
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default CVViewer;
