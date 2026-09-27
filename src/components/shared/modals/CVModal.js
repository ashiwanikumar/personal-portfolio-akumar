"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CV_FILENAME, CV_PATH, trackCvEvent } from "@/libs/cv";

const CVModal = ({ onClose }) => {
	// Lock page scroll while open, close on Escape, and restore the previous
	// overflow value on unmount so navigating away never leaves the page frozen.
	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [onClose]);

	return createPortal(
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="cv-modal-title"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/90 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			></div>

			{/* Close button - Fixed position for mobile */}
			<button
				onClick={onClose}
				autoFocus
				className="fixed top-4 right-4 z-[10000] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/15 backdrop-blur-md transition-all duration-300"
				aria-label="Close CV"
			>
				<i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
			</button>

			{/* Modal Content */}
			<div className="relative w-full max-w-6xl h-[90vh] mx-2 sm:mx-4 bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
				{/* Modal Header */}
				<div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.08] bg-white/[0.02]">
					<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
						<i className="fa-solid fa-file-pdf text-lg sm:text-xl text-[#34d399] flex-shrink-0" aria-hidden="true"></i>
						<span id="cv-modal-title" className="text-white font-mono font-semibold text-sm sm:text-base truncate">
							Ashiwani Kumar — CV
						</span>
					</div>
					<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
						<a
							href={CV_PATH}
							download={CV_FILENAME}
							onClick={() => trackCvEvent("download")}
							className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-semibold rounded-lg transition-all duration-300 text-xs sm:text-sm"
							aria-label="Download CV"
						>
							<i className="fa-solid fa-download" aria-hidden="true"></i>
							<span className="hidden sm:inline">Download</span>
						</a>
						<a
							href={CV_PATH}
							target="_blank"
							rel="noopener noreferrer"
							onClick={() => trackCvEvent("open_tab")}
							className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-semibold rounded-lg transition-all duration-300 text-sm"
						>
							<i className="fa-solid fa-external-link" aria-hidden="true"></i>
							Open in New Tab
						</a>
					</div>
				</div>

				{/* PDF Viewer */}
				<div className="h-[calc(90vh-60px)] sm:h-[calc(90vh-70px)] bg-[#111]">
					<iframe
						src={`${CV_PATH}#toolbar=1&navpanes=0&scrollbar=1`}
						className="w-full h-full"
						title="Ashiwani Kumar CV"
					/>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default CVModal;
