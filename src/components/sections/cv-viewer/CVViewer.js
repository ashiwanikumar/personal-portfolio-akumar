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
			<section id="cv" className="py-60px md:py-20 lg:py-30 bg-[#002200]">
				<div className="container">
					<div className="text-center mb-50px">
						<span className="text-xs uppercase text-[#00ff41] font-semibold tracking-0.2em mb-4 block font-mono">
							&gt;_ My Resume
						</span>
						<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-bold leading-1.2 -tracking-0.02em text-[#00ff41] mb-4">
							View My CV
						</h2>
						<p className="text-[#00cc33] leading-1.5 max-w-600px mx-auto text-lg font-mono">
							Download or view my detailed resume with complete work history,
							certifications, and technical skills.
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						{/* CV Preview Card */}
						<div className="bg-[#001100] border border-[#00ff41]/30 rounded-[30px] p-8 hover:border-[#00ff41] transition-all duration-300">
							{/* Header */}
							<div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 bg-[#00ff41]/10 border border-[#00ff41]/30 rounded-[15px] flex items-center justify-center">
										<i className="fa-solid fa-file-pdf text-3xl text-[#00ff41]"></i>
									</div>
									<div>
										<h3 className="text-xl font-bold text-[#00ff41] font-mono">
											Ashiwani_Kumar_CV.pdf
										</h3>
										<p className="text-[#00cc33]/70 text-sm font-mono">
											Site Reliability Engineer | DevOps Expert
										</p>
									</div>
								</div>

								<div className="flex gap-4">
									<button
										onClick={openModal}
										className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-bold rounded-full hover:bg-[#00ff41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all duration-300 font-mono"
									>
										<i className="fa-solid fa-eye"></i>
										View CV
									</button>
									<a
										href={cvPath}
										download="Ashiwani_Kumar_CV.pdf"
										className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ff41] text-[#001100] font-bold rounded-full hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300 font-mono"
									>
										<i className="fa-solid fa-download"></i>
										Download
									</a>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="bg-[#002200] border border-[#00ff41]/20 rounded-[15px] p-4 text-center">
									<div className="text-2xl font-bold text-[#00ff41] font-mono">6+</div>
									<div className="text-[#00cc33]/70 text-sm font-mono">Years Experience</div>
								</div>
								<div className="bg-[#002200] border border-[#00ff41]/20 rounded-[15px] p-4 text-center">
									<div className="text-2xl font-bold text-[#00ff41] font-mono">99.9%</div>
									<div className="text-[#00cc33]/70 text-sm font-mono">Uptime Achieved</div>
								</div>
								<div className="bg-[#002200] border border-[#00ff41]/20 rounded-[15px] p-4 text-center">
									<div className="text-2xl font-bold text-[#00ff41] font-mono">5</div>
									<div className="text-[#00cc33]/70 text-sm font-mono">UAE Airports</div>
								</div>
								<div className="bg-[#002200] border border-[#00ff41]/20 rounded-[15px] p-4 text-center">
									<div className="text-2xl font-bold text-[#00ff41] font-mono">6+</div>
									<div className="text-[#00cc33]/70 text-sm font-mono">Certifications</div>
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

					{/* Modal Content */}
					<div className="relative w-full max-w-6xl h-[90vh] mx-4 bg-[#001100] border border-[#00ff41]/50 rounded-[20px] overflow-hidden shadow-[0_0_50px_rgba(0,255,65,0.3)]">
						{/* Modal Header */}
						<div className="flex items-center justify-between p-4 border-b border-[#00ff41]/30 bg-[#002200]">
							<div className="flex items-center gap-3">
								<i className="fa-solid fa-file-pdf text-xl text-[#00ff41]"></i>
								<span className="text-[#00ff41] font-mono font-bold">
									Ashiwani_Kumar_CV.pdf
								</span>
							</div>
							<div className="flex items-center gap-3">
								<a
									href={cvPath}
									download="Ashiwani_Kumar_CV.pdf"
									className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff41] text-[#001100] font-bold rounded-lg hover:bg-[#00ff88] transition-all duration-300 font-mono text-sm"
								>
									<i className="fa-solid fa-download"></i>
									Download
								</a>
								<a
									href={cvPath}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#00ff41] text-[#00ff41] font-bold rounded-lg hover:bg-[#00ff41]/10 transition-all duration-300 font-mono text-sm"
								>
									<i className="fa-solid fa-external-link"></i>
									Open in New Tab
								</a>
								<button
									onClick={closeModal}
									className="w-10 h-10 flex items-center justify-center text-[#00ff41] hover:bg-[#00ff41]/10 rounded-lg transition-all duration-300"
								>
									<i className="fa-solid fa-xmark text-xl"></i>
								</button>
							</div>
						</div>

						{/* PDF Viewer */}
						<div className="h-[calc(90vh-70px)] bg-[#111]">
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
