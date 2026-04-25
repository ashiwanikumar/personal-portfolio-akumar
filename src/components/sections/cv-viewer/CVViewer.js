"use client";

import { useState } from "react";

const CVViewer = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const cvPath = "/cv/Ashiwani_Kumar_CV.pdf";

	const openModal = () => {
		setIsModalOpen(true);
		document.body.style.overflow = "hidden";
	};

	const closeModal = () => {
		setIsModalOpen(false);
		document.body.style.overflow = "auto";
	};

	return (
		<>
			<section id="cv" className="py-60px md:py-20 lg:py-30 bg-[#09090b]">
				<div className="container">
					<div className="text-center mb-50px">
						<span className="text-xs uppercase text-[#00ff41] font-semibold tracking-0.2em mb-4 block font-mono">
							&gt;_ My Resume
						</span>
						<h2 className="text-[26px] md:text-[32px] lg:text-[38px] uppercase font-bold leading-1.2 -tracking-0.02em text-white mb-4">
							View My CV
						</h2>
						<p className="text-[#00cc33] leading-1.5 max-w-600px mx-auto text-lg font-mono">
							Download or view my detailed resume with complete work history,
							certifications, and technical skills.
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						{/* CV Preview Card */}
						<div className="bg-[#09090b] border border-[#00ff41]/30 rounded-[30px] p-6 md:p-10">
							{/* Header */}
							<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#00ff41]/20">
								<div className="flex items-center gap-4 min-w-0 w-full lg:w-auto">
									<div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#00ff41]/10 border border-[#00ff41]/30 rounded-[15px] sm:rounded-[20px] flex items-center justify-center flex-shrink-0">
										<i className="fa-solid fa-file-pdf text-2xl sm:text-4xl text-[#00ff41]"></i>
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#00ff41] font-mono mb-1 sm:mb-2 break-words">
											Ashiwani Kumar CV
										</h3>
										<p className="text-[#00cc33] text-sm sm:text-base font-mono break-words">
											Linux DevOps Engineer | Open Source Enthusiast
										</p>
									</div>
								</div>

								<div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
									<button
										onClick={openModal}
										className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-bold rounded-full hover:bg-[#00ff41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all duration-300 font-mono text-sm whitespace-nowrap"
									>
										<i className="fa-solid fa-eye"></i>
										View CV
									</button>
									<a
										href={cvPath}
										download="Ashiwani_Kumar_CV.pdf"
										className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#00ff41] text-[#09090b] font-bold rounded-full hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300 font-mono text-sm whitespace-nowrap"
									>
										<i className="fa-solid fa-download"></i>
										Download
									</a>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-5">
								<div className="bg-[#111113] border border-[#00ff41]/20 rounded-[20px] p-6 text-center">
									<div className="text-3xl md:text-4xl font-bold text-[#00ff41] font-mono mb-2">7+</div>
									<div className="text-[#00cc33] text-sm font-mono">Years Experience</div>
								</div>
								<div className="bg-[#111113] border border-[#00ff41]/20 rounded-[20px] p-6 text-center">
									<div className="text-3xl md:text-4xl font-bold text-[#00ff41] font-mono mb-2">99.9%</div>
									<div className="text-[#00cc33] text-sm font-mono">Uptime Achieved</div>
								</div>
								<div className="bg-[#111113] border border-[#00ff41]/20 rounded-[20px] p-6 text-center">
									<div className="text-3xl md:text-4xl font-bold text-[#00ff41] font-mono mb-2">5</div>
									<div className="text-[#00cc33] text-sm font-mono">UAE Airports</div>
								</div>
								<div className="bg-[#111113] border border-[#00ff41]/20 rounded-[20px] p-6 text-center">
									<div className="text-3xl md:text-4xl font-bold text-[#00ff41] font-mono mb-2">6+</div>
									<div className="text-[#00cc33] text-sm font-mono">Certifications</div>
								</div>
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
						className="fixed top-4 right-4 z-[10000] w-12 h-12 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-500 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,0,0.5)] border-2 border-white"
						aria-label="Close"
					>
						<i className="fa-solid fa-xmark text-2xl font-bold"></i>
					</button>

					{/* Modal Content */}
					<div className="relative w-full max-w-6xl h-[90vh] mx-2 sm:mx-4 bg-[#09090b] border border-[#00ff41]/50 rounded-[20px] overflow-hidden shadow-[0_0_50px_rgba(0,255,65,0.3)]">
						{/* Modal Header */}
						<div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#00ff41]/30 bg-[#111113]">
							<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
								<i className="fa-solid fa-file-pdf text-lg sm:text-xl text-[#00ff41] flex-shrink-0"></i>
								<span className="text-[#00ff41] font-mono font-bold text-sm sm:text-base truncate">
									Ashiwani Kumar CV
								</span>
							</div>
							<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
								<a
									href={cvPath}
									download="Ashiwani_Kumar_CV.pdf"
									className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#00ff41] text-[#09090b] font-bold rounded-lg hover:bg-[#00ff88] transition-all duration-300 font-mono text-xs sm:text-sm"
								>
									<i className="fa-solid fa-download"></i>
									<span className="hidden sm:inline">Download</span>
								</a>
								<a
									href={cvPath}
									target="_blank"
									rel="noopener noreferrer"
									className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#00ff41] text-[#00ff41] font-bold rounded-lg hover:bg-[#00ff41]/10 transition-all duration-300 font-mono text-sm"
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
