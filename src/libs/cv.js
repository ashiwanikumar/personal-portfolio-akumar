// Single source of truth for the CV file. When the PDF is replaced, update
// these two values and add a redirect from the old path in next.config.mjs.
export const CV_FILENAME = "Ashiwani_Kumar_DevOps_SRE.pdf";
export const CV_PATH = `/cv/${CV_FILENAME}`;

/** Report a CV view/download/open_tab to the analytics backend. Never throws. */
export function trackCvEvent(action) {
	try {
		const data = {
			action,
			referrer: document.referrer || "",
			source: document.referrer ? new URL(document.referrer).hostname : "direct",
			pageUrl: window.location.href,
			screenResolution: `${window.screen.width}x${window.screen.height}`,
			language: navigator.language || "",
		};

		const params = new URLSearchParams(window.location.search);
		if (params.get("utm_source")) data.utmSource = params.get("utm_source");
		if (params.get("utm_medium")) data.utmMedium = params.get("utm_medium");
		if (params.get("utm_campaign")) data.utmCampaign = params.get("utm_campaign");

		// Fire and forget - don't block the user action
		fetch("/api/public/cv", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
			keepalive: true,
		}).catch(() => {});
	} catch {
		// Silently fail - tracking should never break UX
	}
}
