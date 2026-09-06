"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "../_components/DashboardShell";
import { Icon, MailIcons } from "./_components/GmailUI";
import MessageList from "./_components/MessageList";
import ReadingPane from "./_components/ReadingPane";
import InsightsDetail, { StatStrip } from "./_components/InsightsPanel";
import "./netraga-theme.css";

const FOLDERS = [
	{ id: "all", label: "All CVs", icon: MailIcons.send, countKey: "all" },
	{ id: "awaiting", label: "Awaiting reply", icon: MailIcons.schedule, countKey: "awaiting" },
	{ id: "replied", label: "Replied", icon: MailIcons.reply, countKey: "replied" },
	{ id: "starred", label: "Starred", icon: MailIcons.star, countKey: "starred" },
	{ id: "bounced", label: "Bounced", icon: MailIcons.error, countKey: "bounced" },
];

const PER_PAGE = 25;

function relativeTime(value) {
	if (!value) return "never";
	const diff = Date.now() - new Date(value).getTime();
	const mins = Math.round(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins} min ago`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `${hours} h ago`;
	return `${Math.round(hours / 24)} d ago`;
}

function SetupNotice({ status }) {
	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<div className="nx-rise max-w-lg rounded-lg border border-[#21252D] bg-[#12151A] p-6 shadow-[0_1px_2px_rgb(0_0_0/0.35)]">
				<span aria-hidden="true" className="mb-2.5 block h-[3px] w-9 rounded-full bg-[#10B981]" />
				<h2 className="nx-display text-[16px] text-[#F4F4F5]">Connect your Gmail</h2>
				<p className="mt-2 text-[13px] leading-5 text-[#A1A1AA]">
					This mailbox view reads your own SENT mail read-only and indexes every message that carries a
					CV attachment.
				</p>

				{status?.missingEnv?.length > 0 && (
					<div className="mt-4 rounded-md border border-[#4E3A0D] border-l-[3px] border-l-[#FBBF24] bg-[#251B07] p-3">
						<p className="text-[12px] font-medium text-[#FBBF24]">Missing environment variables</p>
						<ul className="nx-mono mt-1 space-y-0.5 text-[11px] text-[#A1A1AA]">
							{status.missingEnv.map((key) => (
								<li key={key}>{key}</li>
							))}
						</ul>
					</div>
				)}

				{status?.connectionError && (
					<div className="mt-4 rounded-md border border-[#FB7185]/45 border-l-[3px] border-l-[#FB7185] bg-[#2A1218] p-3">
						<p className="text-[12px] font-medium text-[#FB7185]">Gmail rejected the credentials</p>
						<p className="mt-1 text-[12px] text-[#A1A1AA]">{status.connectionError}</p>
					</div>
				)}

				<ol className="mt-4 space-y-2 text-[13px] text-[#A1A1AA]">
					<li>
						1. Put <span className="nx-mono text-[12px] text-[#34D399]">GMAIL_CLIENT_ID</span> and{" "}
						<span className="nx-mono text-[12px] text-[#34D399]">GMAIL_CLIENT_SECRET</span> in{" "}
						<span className="nx-mono text-[12px]">.env</span>.
					</li>
					<li>
						2. Run{" "}
						<span className="nx-mono text-[12px] text-[#34D399]">
							cd apps/api-server &amp;&amp; npm run gmail:auth
						</span>{" "}
						and approve access.
					</li>
					<li>
						3. Paste the printed{" "}
						<span className="nx-mono text-[12px] text-[#34D399]">GMAIL_REFRESH_TOKEN</span> into{" "}
						<span className="nx-mono text-[12px]">.env</span> and restart the API server.
					</li>
				</ol>
			</div>
		</div>
	);
}

function SessionExpiredNotice() {
	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<div className="nx-rise max-w-md rounded-lg border border-[#4E3A0D] border-l-[3px] border-l-[#FBBF24] bg-[#251B07] p-6 text-center">
				<h2 className="nx-display text-[16px] text-[#FBBF24]">Your session expired</h2>
				<p className="mt-2 text-[13px] leading-5 text-[#A1A1AA]">
					Sign in again to load your CV outreach. Nothing is lost — the sync keeps running on the
					server while you are signed out.
				</p>
				<button
					type="button"
					onClick={async () => {
						await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
						window.location.reload();
					}}
					className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#10B981] px-4 py-2 text-[13px] font-semibold text-[#022C22] shadow-[0_1px_2px_rgb(16_185_129/0.35)] transition-all hover:brightness-110"
				>
					Sign in again
				</button>
			</div>
		</div>
	);
}

/**
 * Centered progress modal for the full re-scan. The percentage is estimated
 * against the index size before the scan started — the server never says how
 * many messages it will walk — so it is capped at 99% until the run reports done.
 */
function FullScanModal({ scan, onHide }) {
	const pct =
		scan.baseline > 0
			? Math.max(2, Math.min(99, Math.round((scan.indexed / scan.baseline) * 100)))
			: null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
			<div className="nx-rise w-full max-w-md rounded-xl border border-[#21252D] bg-[#12151A] p-6 shadow-[0_16px_48px_rgb(0_0_0/0.6)]">
				<div className="flex items-center gap-3">
					<span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#10B981] text-[#022C22]">
						<Icon path={MailIcons.refresh} className="h-5 w-5 animate-spin" />
					</span>
					<div className="min-w-0">
						<h3 className="nx-display text-[15px] text-[#F4F4F5]">Full re-scan in progress</h3>
						<p className="truncate text-[12px] text-[#A1A1AA]">{scan.note}</p>
					</div>
				</div>

				<div className="mt-5">
					<div className="flex items-baseline justify-between">
						<span className="nx-mono text-[11px] tabular-nums text-[#A1A1AA]">
							{scan.indexed.toLocaleString()} indexed
						</span>
						<span className="nx-mono text-[13px] font-medium tabular-nums text-[#34D399]">
							{pct === null ? "…" : `${pct}%`}
						</span>
					</div>
					<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#07080A]">
						{pct === null ? (
							<div className="h-full w-1/3 animate-pulse rounded-full bg-[#10B981]" />
						) : (
							<div
								className="h-full rounded-full bg-[#10B981] transition-[width] duration-500"
								style={{ width: `${pct}%` }}
							/>
						)}
					</div>
				</div>

				<p className="mt-4 text-[12px] leading-5 text-[#70747E]">
					Scanning your entire sent mailbox on the server. You can keep using the app — closing this
					window will not stop the scan.
				</p>

				<div className="mt-4 flex justify-end">
					<button
						type="button"
						onClick={onHide}
						className="rounded-lg border border-[#363C47] px-3.5 py-1.5 text-[12px] font-medium text-[#A1A1AA] transition-colors hover:bg-[#21252D] hover:text-[#F4F4F5]"
					>
						Continue in background
					</button>
				</div>
			</div>
		</div>
	);
}

export default function CvOutreachPage() {
	const { session } = useDashboard();

	const [status, setStatus] = useState(null);
	const [folder, setFolder] = useState("all");
	const [page, setPage] = useState(1);
	const [days, setDays] = useState("all");
	const [searchInput, setSearchInput] = useState("");
	const [query, setQuery] = useState("");
	const [domain, setDomain] = useState("");

	const [messages, setMessages] = useState([]);
	const [folderCounts, setFolderCounts] = useState({});
	const [pagination, setPagination] = useState({});
	const [listLoading, setListLoading] = useState(true);

	const [selectedIds, setSelectedIds] = useState(new Set());
	const [openMessage, setOpenMessage] = useState(null);
	const [related, setRelated] = useState([]);

	const [analytics, setAnalytics] = useState(null);
	const [analyticsLoading, setAnalyticsLoading] = useState(false);
	const [insightsOpen, setInsightsOpen] = useState(false);

	const [authExpired, setAuthExpired] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [syncNote, setSyncNote] = useState("");
	// Set while a full re-scan runs; drives the centered progress modal.
	const [scan, setScan] = useState(null); // { baseline, indexed, hidden, note }
	const [toast, setToast] = useState("");
	const toastTimer = useRef(null);

	const showToast = useCallback((text) => {
		setToast(text);
		clearTimeout(toastTimer.current);
		toastTimer.current = setTimeout(() => setToast(""), 5000);
	}, []);

	useEffect(() => () => clearTimeout(toastTimer.current), []);

	// Debounce the search box
	useEffect(() => {
		const timer = setTimeout(() => {
			setQuery(searchInput.trim());
			setPage(1);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const fetchStatus = useCallback(async () => {
		try {
			const res = await fetch("/api/admin/gmail-cv?view=status", { cache: "no-store" });
			if (res.status === 401) {
				setAuthExpired(true);
				return;
			}
			const data = await res.json();
			if (!res.ok || typeof data?.configured !== "boolean") {
				setStatus({
					configured: false,
					connected: false,
					connectionError: data?.error || data?.message || `Status request failed (${res.status})`,
				});
				return;
			}
			setAuthExpired(false);
			setStatus(data);
		} catch {
			setStatus({ configured: false, connected: false, connectionError: "Could not reach the API server" });
		}
	}, []);

	const fetchMessages = useCallback(async () => {
		setListLoading(true);
		try {
			const params = new URLSearchParams({
				page: String(page),
				perPage: String(PER_PAGE),
				folder,
				days: String(days),
			});
			if (query) params.set("q", query);
			if (domain) params.set("domain", domain);

			const res = await fetch(`/api/admin/gmail-cv?${params.toString()}`, { cache: "no-store" });
			if (res.status === 401) {
				setAuthExpired(true);
				setMessages([]);
				return;
			}
			const data = await res.json();

			if (data?.success) {
				setMessages(data.messages || []);
				setFolderCounts(data.folderCounts || {});
				setPagination(data.paginationData || {});
			} else {
				setMessages([]);
			}
		} catch {
			setMessages([]);
		} finally {
			setListLoading(false);
			setSelectedIds(new Set());
		}
	}, [page, folder, query, domain, days]);

	const fetchAnalytics = useCallback(async () => {
		setAnalyticsLoading(true);
		try {
			const res = await fetch(`/api/admin/gmail-cv?view=analytics&days=${days}`, { cache: "no-store" });
			if (res.status === 401) {
				setAuthExpired(true);
				return;
			}
			const data = await res.json();
			if (data?.success) setAnalytics(data);
		} catch {
			setAnalytics(null);
		} finally {
			setAnalyticsLoading(false);
		}
	}, [days]);

	useEffect(() => {
		if (session?.authenticated) fetchStatus();
	}, [session, fetchStatus]);

	useEffect(() => {
		if (session?.authenticated) fetchMessages();
	}, [session, fetchMessages]);

	useEffect(() => {
		if (session?.authenticated) fetchAnalytics();
	}, [session, fetchAnalytics]);

	// ─── Actions ─────────────────────────────────────────────────────────────
	/**
	 * The sync starts on the server and returns 202 straight away — a full
	 * re-scan runs for minutes, past any proxy read timeout. Progress comes from
	 * polling status, with probe=0 so each poll skips the Gmail round-trip.
	 */
	const runSync = useCallback(
		async (full = false) => {
			setSyncing(true);
			setSyncNote(full ? "Full re-scan started…" : "Sync started…");
			if (full) {
				// The previous index size is the best available estimate of the total,
				// since the server does not report how many messages it will scan.
				const baseline = status?.storedMessages || 0;
				setScan({ baseline, indexed: baseline, hidden: false, note: "Starting the re-scan…" });
			}

			const finish = async (note) => {
				setSyncing(false);
				setSyncNote("");
				setScan(null);
				if (note) showToast(note);
				await Promise.all([fetchMessages(), fetchStatus(), fetchAnalytics()]);
			};

			try {
				const res = await fetch("/api/admin/gmail-cv/sync", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ full }),
				});
				const data = await res.json();

				if (!res.ok || !data?.success) {
					setSyncing(false);
					setSyncNote("");
					setScan(null);
					showToast(data?.message || data?.error || "Could not start the sync");
					return;
				}

				// Poll until the server clears the running flag, capped so a run that
				// dies with its pod does not leave the button spinning forever.
				const deadline = Date.now() + 15 * 60 * 1000;
				let seenRunning = false;

				while (Date.now() < deadline) {
					await new Promise((resolve) => setTimeout(resolve, 3000));

					let status;
					try {
						const poll = await fetch("/api/admin/gmail-cv?view=status&probe=0", { cache: "no-store" });
						status = await poll.json();
					} catch {
						continue; // a dropped poll is not a failed sync
					}

					const sync = status?.sync;
					if (sync?.running) {
						seenRunning = true;
						// storedMessages climbs as the sync writes, so it doubles as progress.
						const indexed = status?.storedMessages;
						setSyncNote(
							`${full ? "Scanning your sent mail" : "Checking for new mail"}…${
								indexed ? ` ${indexed} indexed` : ""
							}`
						);
						if (full) {
							setScan((s) =>
								s ? { ...s, indexed: indexed ?? s.indexed, note: "Scanning your sent mail…" } : s
							);
						}
						continue;
					}

					// Not running: either it finished, or it had already finished before
					// the first poll landed.
					if (seenRunning || sync?.lastTrigger === "manual") {
						const r = sync?.lastRun || {};
						const secs = Math.round((sync?.lastDurationMs || 0) / 1000);
						await finish(
							sync?.lastSyncStatus === "error"
								? `Sync failed: ${sync.lastError || "unknown error"}`
								: `Synced in ${secs}s — ${r.inserted || 0} new, ${r.repliesFound || 0} replies found`
						);
						return;
					}
				}

				await finish("Sync is taking longer than expected — showing what has landed so far");
			} catch {
				setSyncing(false);
				setSyncNote("");
				setScan(null);
				showToast("Sync failed — could not reach the API server");
			}
		},
		[fetchMessages, fetchStatus, fetchAnalytics, showToast, status]
	);

	const toggleStar = useCallback(
		async (message) => {
			const next = !message.starred;

			// Optimistic — the row flips immediately, like Gmail.
			setMessages((prev) =>
				prev.map((m) => (m.gmailMessageId === message.gmailMessageId ? { ...m, starred: next } : m))
			);
			setOpenMessage((prev) =>
				prev && prev.gmailMessageId === message.gmailMessageId ? { ...prev, starred: next } : prev
			);

			try {
				const res = await fetch(`/api/admin/gmail-cv?id=${encodeURIComponent(message.gmailMessageId)}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ starred: next }),
				});
				if (!res.ok) throw new Error("failed");
				setFolderCounts((prev) => ({ ...prev, starred: (prev.starred || 0) + (next ? 1 : -1) }));
			} catch {
				setMessages((prev) =>
					prev.map((m) =>
						m.gmailMessageId === message.gmailMessageId ? { ...m, starred: !next } : m
					)
				);
				showToast("Could not update the star");
			}
		},
		[showToast]
	);

	const openThread = useCallback(async (message) => {
		setOpenMessage(message);
		setRelated([]);

		try {
			const res = await fetch(
				`/api/admin/gmail-cv?view=message&id=${encodeURIComponent(message.gmailMessageId)}`,
				{ cache: "no-store" }
			);
			const data = await res.json();
			if (data?.success) {
				setOpenMessage(data.message);
				setRelated(data.related || []);
			}
		} catch {
			// keep the row data we already have
		}
	}, []);

	const openById = useCallback(
		(id) => {
			const found = messages.find((m) => m.gmailMessageId === id);
			openThread(found || { gmailMessageId: id });
		},
		[messages, openThread]
	);

	const toggleCheck = useCallback((id) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const toggleCheckAll = useCallback(() => {
		setSelectedIds((prev) =>
			prev.size === messages.length ? new Set() : new Set(messages.map((m) => m.gmailMessageId))
		);
	}, [messages]);

	/** Export honours whatever the list is currently filtered to. */
	const exportHref = useCallback(
		(format) => {
			const params = new URLSearchParams({ folder, format, days: String(days) });
			if (query) params.set("q", query);
			if (domain) params.set("domain", domain);
			return `/api/admin/gmail-cv/export?${params.toString()}`;
		},
		[folder, query, domain, days]
	);

	const folderLabel = useMemo(
		() => FOLDERS.find((f) => f.id === folder)?.label || "All CVs",
		[folder]
	);

	const notConfigured = status?.configured === false;

	return (
		<div className="nx-scope flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#0B0D10] text-[#F4F4F5]">
			{/* ─── Top bar ───────────────────────────────────────────────────── */}
			<div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#21252D] px-3 sm:px-4">
				<div className="hidden items-center gap-2.5 md:flex">
					<div className="grid h-8 w-8 place-items-center rounded-md bg-[#10B981] text-[#022C22] shadow-[0_1px_2px_rgb(16_185_129/0.35)]">
						<Icon path={MailIcons.send} className="h-4 w-4" />
					</div>
					<div className="leading-tight">
						<span className="nx-display block text-[14px] text-[#F4F4F5]">CV Mail</span>
						<span className="nx-eyebrow block">Gmail outreach</span>
					</div>
				</div>

				{/* The .dashboard-scope reset forces font-size: inherit on inputs, so the size sits on the wrapper. */}
				<div className="flex h-9 max-w-[560px] flex-1 items-center gap-2 rounded-md border border-[#363C47] bg-[#12151A] px-3 text-[13px] transition-[border-color,box-shadow] focus-within:border-[#34D399] focus-within:shadow-[0_0_0_3px_#0B2A20]">
					<Icon path={MailIcons.search} className="h-4 w-4 shrink-0 text-[#70747E]" />
					<input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search company, recipient, subject or CV file"
						className="min-w-0 flex-1 bg-transparent text-[#F4F4F5] placeholder:text-[#70747E] outline-none"
					/>
					{(searchInput || domain) && (
						<button
							type="button"
							aria-label="Clear search"
							onClick={() => {
								setSearchInput("");
								setDomain("");
							}}
							className="grid h-6 w-6 place-items-center rounded text-[#70747E] transition-colors hover:bg-[#21252D] hover:text-[#F4F4F5]"
						>
							<Icon path={MailIcons.close} className="h-4 w-4" />
						</button>
					)}
				</div>

				<div className="ml-auto flex items-center gap-2.5">
					{status?.mailbox && (
						<span className="nx-mono hidden text-[11px] text-[#70747E] lg:inline">{status.mailbox}</span>
					)}
					<div
						className={`grid h-8 w-8 place-items-center rounded-md ring-1 ${
							status?.connected
								? "bg-[#0B2A20] text-[#34D399] ring-[#34D399]/35"
								: "bg-[#12151A] text-[#70747E] ring-[#21252D]"
						}`}
						title={status?.connected ? `Connected as ${status.mailbox}` : "Gmail not connected"}
					>
						<Icon path={MailIcons.person} className="h-4 w-4" />
					</div>
				</div>
			</div>

			{domain && (
				<div className="flex items-center gap-2 px-4 py-2">
					<span className="nx-mono inline-flex items-center gap-1.5 rounded border border-[#1F5C46] bg-[#0B2A20] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#34D399]">
						Domain: {domain}
						<button type="button" onClick={() => setDomain("")} aria-label="Clear domain filter">
							<Icon path={MailIcons.close} className="h-3.5 w-3.5" />
						</button>
					</span>
				</div>
			)}

			<div className="flex min-h-0 flex-1">
				{/* ─── Sidebar ─────────────────────────────────────────────────── */}
				<aside className="hidden w-[240px] shrink-0 flex-col gap-2 pb-3 pt-3 md:flex">
					<div className="px-3 pb-1">
						<button
							type="button"
							onClick={() => runSync(false)}
							disabled={syncing || notConfigured}
							className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#10B981] px-4 text-[13px] font-semibold text-[#022C22] shadow-[0_1px_2px_rgb(16_185_129/0.35)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
						>
							<Icon
								path={MailIcons.refresh}
								className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
							/>
							{syncing ? "Syncing…" : "Sync now"}
						</button>
					</div>

					<nav className="nx-scroll-thin flex-1 overflow-y-auto px-2">
						<p className="nx-eyebrow mb-2 mt-1 flex items-center gap-2 px-2">
							Folders
							<span className="h-px flex-1 bg-[#21252D]" aria-hidden="true" />
						</p>
						{FOLDERS.map((item) => {
							const active = folder === item.id;
							const count = folderCounts[item.countKey] || 0;

							return (
								<button
									key={item.id}
									type="button"
									onClick={() => {
										setFolder(item.id);
										setPage(1);
										setOpenMessage(null);
									}}
									className={`group relative flex w-full items-center gap-3 rounded-md py-1.5 pl-3.5 pr-2 text-[13px] transition-colors ${
										active
											? "bg-[#07080A] font-medium text-[#F4F4F5]"
											: "text-[#A1A1AA] hover:bg-[#07080A]/70 hover:text-[#F4F4F5]"
									}`}
								>
									<span
										aria-hidden="true"
										className={`absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-full transition-all ${
											active ? "h-4 bg-[#10B981]" : "h-2 bg-transparent group-hover:bg-[#363C47]"
										}`}
									/>
									<span
										className={`transition-colors ${
											active ? "text-[#34D399]" : "text-[#70747E] group-hover:text-[#A1A1AA]"
										}`}
									>
										<Icon path={item.icon} className="h-[18px] w-[18px] shrink-0" />
									</span>
									<span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
									<span
										className={`nx-mono shrink-0 tabular-nums ${
											active && count > 0
												? "rounded-full bg-[#10B981] px-1.5 py-px text-[10px] font-semibold text-[#022C22]"
												: `text-[10px] ${count > 0 ? "text-[#A1A1AA]" : "text-[#363C47]"}`
										}`}
									>
										{count}
									</span>
								</button>
							);
						})}
					</nav>

					<div className="nx-mono mt-auto space-y-1 px-4 text-[10px] text-[#70747E]">
						{syncNote ? (
							<p className="flex items-center gap-1.5 text-[#34D399]">
								<span className="nx-pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
								{syncNote}
							</p>
						) : (
							<p>Last sync: {relativeTime(status?.sync?.lastSyncAt)}</p>
						)}
						{status?.sync?.lastSyncStatus === "error" && (
							<p className="text-[#FB7185]">{status.sync.lastError}</p>
						)}
						<p>{status?.storedMessages ?? 0} indexed</p>
						<button
							type="button"
							onClick={() => runSync(true)}
							disabled={syncing || notConfigured}
							className="uppercase tracking-wide text-[#34D399] hover:underline disabled:opacity-50"
						>
							Full re-scan
						</button>
					</div>
				</aside>

				{/* ─── Mail pane ───────────────────────────────────────────────── */}
				<section className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-[#21252D] bg-[#0B0D10]">
					{/* Mobile folder chips */}
					<div className="flex gap-2 overflow-x-auto border-b border-[#21252D] px-3 py-2 md:hidden">
						{FOLDERS.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => {
									setFolder(item.id);
									setPage(1);
									setOpenMessage(null);
								}}
								className={`nx-mono shrink-0 rounded border px-2.5 py-1 text-[10px] uppercase tracking-wide ${
									folder === item.id
										? "border-[#1F5C46] bg-[#0B2A20] text-[#34D399]"
										: "border-[#363C47] text-[#A1A1AA]"
								}`}
							>
								{item.label} {folderCounts[item.countKey] ? `(${folderCounts[item.countKey]})` : ""}
							</button>
						))}
						<button
							type="button"
							onClick={() => runSync(false)}
							disabled={syncing || notConfigured}
							className="shrink-0 rounded bg-[#10B981] px-3 py-1 text-[11px] font-semibold text-[#022C22] disabled:opacity-45"
						>
							{syncing ? "Syncing…" : "Sync"}
						</button>
					</div>

					{authExpired ? (
						<SessionExpiredNotice />
					) : notConfigured ? (
						<SetupNotice status={status} />
					) : openMessage ? (
						<ReadingPane
							message={openMessage}
							related={related}
							onBack={() => setOpenMessage(null)}
							onToggleStar={toggleStar}
							onOpenRelated={openById}
						/>
					) : (
						/* Insights stay pinned; only the message rows scroll (inside MessageList). */
						<div className="flex min-h-0 flex-1 flex-col">
							<div className="shrink-0">
								<StatStrip
									analytics={analytics}
									loading={analyticsLoading}
									days={days}
									onDaysChange={setDays}
								/>
							</div>

							{insightsOpen && (
								<div className="nx-scroll-thin max-h-[45vh] shrink-0 overflow-y-auto">
									<InsightsDetail
										analytics={analytics}
										loading={analyticsLoading}
										onSelectDomain={(value) => {
											setDomain(value);
											setPage(1);
										}}
									/>
								</div>
							)}

							<MessageList
								messages={messages}
								loading={listLoading}
								selectedIds={selectedIds}
								onCheck={toggleCheck}
								onCheckAll={toggleCheckAll}
								onOpen={openThread}
								onToggleStar={toggleStar}
								onRefresh={fetchMessages}
								pagination={pagination}
								onPageChange={setPage}
								insightsOpen={insightsOpen}
								onToggleInsights={() => setInsightsOpen((open) => !open)}
								folderLabel={folderLabel}
								exportHref={exportHref}
								timezone={analytics?.timezone}
							/>
						</div>
					)}
				</section>
			</div>

			{/* Full re-scan progress modal */}
			{scan && !scan.hidden && (
				<FullScanModal scan={scan} onHide={() => setScan((s) => (s ? { ...s, hidden: true } : s))} />
			)}

			{/* Toast */}
			{toast && (
				<div className="nx-rise pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-[#21252D] bg-[#12151A] px-4 py-3 text-[13px] text-[#F4F4F5] shadow-[0_8px_24px_rgb(0_0_0/0.5)]">
					{toast}
				</div>
			)}
		</div>
	);
}
