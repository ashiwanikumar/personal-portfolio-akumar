"use client";

import { useState, useCallback } from "react";
import CVModal from "@/components/shared/modals/CVModal";
import { CV_FILENAME, CV_PATH, trackCvEvent } from "@/libs/cv";
import resume from "../../../../public/fakedata/resume.json";

// Some entries group several certs (e.g. "RHCSA & RHCE"), so sum their counts.
const certCount = (resume[1]?.resumeItems || [])
	.filter((item) => item.type === "certification")
	.reduce((total, item) => total + (item.count || 1), 0);

const CVViewer = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = useCallback(() => {
		setIsModalOpen(true);
		trackCvEvent("view");
	}, []);

	const closeModal = useCallback(() => setIsModalOpen(false), []);

	const stats = [
		{ value: "7+", label: "Years in production" },
		{ value: "99.9%", label: "Uptime maintained" },
		{ value: "5", label: "UAE airports" },
		{ value: String(certCount), label: "Certifications" },
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
										type="button"
										onClick={openModal}
										className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-transparent border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-medium rounded-lg transition-all duration-300 text-sm whitespace-nowrap"
									>
										<i className="fa-solid fa-eye"></i>
										View CV
									</button>
									<a
										href={CV_PATH}
										download={CV_FILENAME}
										onClick={() => trackCvEvent("download")}
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
										<div className="text-white/50 text-xs font-mono">{stat.label}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{isModalOpen && <CVModal onClose={closeModal} />}
		</>
	);
};

export default CVViewer;
