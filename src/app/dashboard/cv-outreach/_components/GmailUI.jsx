"use client";

/**
 * Gmail-styled primitives for the CV Outreach mailbox.
 * Palette and metrics follow Gmail's dark theme (surface #1a1a1a, hover #2a2a2a,
 * search #333438, active label pill #004a77 / #c2e7ff, accent link #8ab4f8).
 */

// ─── Icons (Material-style, as Gmail uses) ──────────────────────────────────
export const MailIcons = {
	menu: <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />,
	search: <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />,
	tune: <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />,
	close: <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
	inbox: <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z" />,
	send: <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />,
	star: <path d="m12 17.27 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z" />,
	starOutline: <path d="m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />,
	schedule: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />,
	reply: <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />,
	error: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />,
	refresh: <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />,
	chevronLeft: <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />,
	chevronRight: <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />,
	chevronDown: <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />,
	arrowBack: <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />,
	attachment: <path d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6h-1.5z" />,
	download: <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />,
	openInNew: <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />,
	insights: <path d="M21 8a2 2 0 1 1-3.5 1.32l-2.71 1.53a2 2 0 0 1-.15 1.06l3 3.05A2 2 0 1 1 16.5 17l-3.05-3a2 2 0 0 1-1.06.15L10.86 16.9A2 2 0 1 1 7 17.5l1.53-2.71a2 2 0 0 1 0-2.58L7 9.5A2 2 0 1 1 9.5 7l2.71 1.53a2 2 0 0 1 2.58 0L17.5 7A2 2 0 0 1 21 8z" />,
	checkbox: <path d="M19 5v14H5V5h14m0-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />,
	checkboxChecked: <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />,
	label: <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z" />,
	person: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
	print: <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-1-9H6v4h12V3z" />,
	description: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />,
	table: <path d="M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM10 19H4v-6h6v6zm0-8H4V9h6v2zm10 8h-8v-6h8v6zm0-8h-8V9h8v2zm0-4H4V5h16v2z" />,
};

export function Icon({ path, className = "h-5 w-5", viewBox = "0 0 24 24" }) {
	return (
		<svg viewBox={viewBox} fill="currentColor" className={className} aria-hidden="true">
			{path}
		</svg>
	);
}

// ─── Formatting helpers ─────────────────────────────────────────────────────
export function formatGmailDate(value) {
	if (!value) return "";
	const date = new Date(value);
	const now = new Date();
	const sameDay = date.toDateString() === now.toDateString();

	if (sameDay) {
		return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
	}
	if (date.getFullYear() === now.getFullYear()) {
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	}
	return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function formatFullDate(value) {
	if (!value) return "";
	return new Date(value).toLocaleString("en-IN", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export function formatBytes(bytes) {
	if (!bytes) return "";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Classify a send as today / yesterday / older in the mailbox's timezone (the
 * server reports it), so rows and the Today card can never disagree.
 */
export function dayKeyInTz(value, timezone) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: timezone || undefined,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(value));
}

export function dayBucket(value, timezone) {
	if (!value) return "older";

	const key = dayKeyInTz(value, timezone);
	if (key === dayKeyInTz(Date.now(), timezone)) return "today";
	if (key === dayKeyInTz(Date.now() - 24 * 60 * 60 * 1000, timezone)) return "yesterday";
	return "older";
}

// Gmail's own accent hues; both sit well clear of the row surface on contrast.
export const DAY_ACCENT = {
	today: "#8ab4f8",
	yesterday: "#fdd663",
	older: "transparent",
};

export function daysAgo(value) {
	if (!value) return 0;
	return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
}

export function displayName(message) {
	return (
		message.companyName ||
		message.primaryRecipientName ||
		message.primaryRecipient ||
		"(no recipient)"
	);
}

export function avatarColor(seed = "") {
	const palette = [
		"bg-[#8ab4f8] text-[#062e6f]",
		"bg-[#f28b82] text-[#5c1a16]",
		"bg-[#fdd663] text-[#5c4200]",
		"bg-[#81c995] text-[#0d3b1e]",
		"bg-[#d7aefb] text-[#3d1c5c]",
		"bg-[#78d9ec] text-[#0b3c47]",
		"bg-[#fcad70] text-[#5c2f00]",
	];
	let hash = 0;
	for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
	return palette[hash % palette.length];
}

// ─── Small shared pieces ────────────────────────────────────────────────────
export function IconButton({ label, children, onClick, disabled, className = "", active = false }) {
	return (
		<button
			type="button"
			title={label}
			aria-label={label}
			onClick={onClick}
			disabled={disabled}
			className={`grid h-10 w-10 place-items-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#2f3033] hover:text-[#e8eaed] disabled:cursor-not-allowed disabled:opacity-40 ${
				active ? "bg-[#004a77] text-[#c2e7ff] hover:bg-[#005a8f] hover:text-[#c2e7ff]" : ""
			} ${className}`}
		>
			{children}
		</button>
	);
}

export function StatusChip({ message }) {
	if (message.bounced) {
		return (
			<span className="inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-[#5c1a16] px-1.5 py-[1px] text-[10px] font-medium text-[#f28b82]">
				Bounced
			</span>
		);
	}
	if (message.replied) {
		return (
			<span className="inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-[#0d3b1e] px-1.5 py-[1px] text-[10px] font-medium text-[#81c995]">
				Replied
			</span>
		);
	}
	return (
		<span className="inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-[#3c3418] px-1.5 py-[1px] text-[10px] font-medium text-[#fdd663]">
			Awaiting
		</span>
	);
}
