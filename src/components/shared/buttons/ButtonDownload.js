"use client";

const ButtonDownload = ({ text, path }) => {
	function handleClick() {
		try {
			fetch("/api/public/cv", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "download",
					referrer: document.referrer || "",
					source: document.referrer ? new URL(document.referrer).hostname : "direct",
					pageUrl: window.location.href,
					screenResolution: `${window.screen.width}x${window.screen.height}`,
					language: navigator.language || "",
				}),
			}).catch(() => {});
		} catch {
			// Silently fail
		}
	}

	return (
		<div>
			<a
				href={path || "/cv/Ashiwani_Kumar_CV.pdf"}
				download="Ashiwani_Kumar_CV.pdf"
				onClick={handleClick}
				className="text-sm font-medium text-[#022c22] py-2.5 px-5 bg-[#10b981] hover:bg-[#34d399] rounded-lg leading-1 text-nowrap group inline-flex gap-x-2.5 items-center transition-all duration-300"
				aria-label={text || "Download CV"}
			>
				{text ? text : "Download CV"}
				<span className="relative overflow-hidden" aria-hidden="true">
					<i className="flaticon-download ml-0.5 text-size-15 group-hover:translate-y-150% transition-all duration-500 inline-block"></i>
					<i className="flaticon-download ml-0.5 text-size-15 absolute left-0 top-0 -translate-y-150% group-hover:translate-y-0 transition-all duration-500"></i>
				</span>
			</a>
		</div>
	);
};

export default ButtonDownload;
