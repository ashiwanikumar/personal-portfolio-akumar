"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "../_components/DashboardShell";
import { Icon, MailIcons } from "./_components/GmailUI";
import MessageList from "./_components/MessageList";
import ReadingPane from "./_components/ReadingPane";
import InsightsDetail, { StatStrip } from "./_components/InsightsPanel";

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
			<div className="max-w-lg rounded-xl border border-[#3c4043] bg-[#202124] p-6">
				<h2 className="text-[16px] font-medium text-[#e8eaed]">Connect your Gmail</h2>
				<p className="mt-2 text-[13px] leading-5 text-[#9aa0a6]">
					This mailbox view reads your own SENT mail read-only and indexes every message that carries a
					CV attachment.
				</p>

				{status?.missingEnv?.length > 0 && (
					<div className="mt-4 rounded-lg border border-[#3c3418] bg-[#282213] p-3">
						<p className="text-[12px] font-medium text-[#fdd663]">Missing environment variables</p>
						<ul className="mt-1 space-y-0.5 font-mono text-[12px] text-[#bdc1c6]">
							{status.missingEnv.map((key) => (
								<li key={key}>{key}</li>
							))}
						</ul>
					</div>
				)}

				{status?.connectionError && (
					<div className="mt-4 rounded-lg border border-[#5c1a16] bg-[#2d1310] p-3">
						<p className="text-[12px] font-medium text-[#f28b82]">Gmail rejected the credentials</p>
						<p className="mt-1 text-[12px] text-[#bdc1c6]">{status.connectionError}</p>
					</div>
				)}

				<ol className="mt-4 space-y-2 text-[13px] text-[#bdc1c6]">
					<li>
						1. Put <span className="font-mono text-[12px] text-[#8ab4f8]">GMAIL_CLIENT_ID</span> and{" "}
						<span className="font-mono text-[12px] text-[#8ab4f8]">GMAIL_CLIENT_SECRET</span> in{" "}
						<span className="font-mono text-[12px]">.env</span>.
					</li>
					<li>
						2. Run{" "}
						<span className="font-mono text-[12px] text-[#8ab4f8]">
							cd apps/api-server &amp;&amp; npm run gmail:auth
						</span>{" "}
						and approve access.
					</li>
					<li>
						3. Paste the printed{" "}
						<span className="font-mono text-[12px] text-[#8ab4f8]">GMAIL_REFRESH_TOKEN</span> into{" "}
						<span className="font-mono text-[12px]">.env</span> and restart the API server.
					</li>
				</ol>
			</div>
		</div>
	);
}

function SessionExpiredNotice() {
	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<div className="max-w-md rounded-xl border border-[#3c3418] bg-[#282213] p-6 text-center">
				<h2 className="text-[16px] font-medium text-[#fdd663]">Your session expired</h2>
				<p className="mt-2 text-[13px] leading-5 text-[#bdc1c6]">
					Sign in again to load your CV outreach. Nothing is lost — the sync keeps running on the
					server while you are signed out.
				</p>
				<button
					type="button"
					onClick={async () => {
						await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
						window.location.reload();
					}}
					className="mt-4 rounded-lg bg-[#c2e7ff] px-4 py-2 text-[13px] font-medium text-[#062e6f] transition-colors hover:bg-[#a8dbff]"
				>
					Sign in again
				</button>
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

			const finish = async (note) => {
				setSyncing(false);
				setSyncNote("");
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
				showToast("Sync failed — could not reach the API server");
			}
		},
		[fetchMessages, fetchStatus, fetchAnalytics, showToast]
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
		<div className="flex h-[calc(100vh-8.5rem)] min-h-[520px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#2f3033] bg-[#1a1a1a] text-[#e8eaed]">
			{/* ─── Gmail top bar ─────────────────────────────────────────────── */}
			<div className="flex h-16 shrink-0 items-center gap-3 px-3 sm:px-4">
				<div className="hidden items-center gap-2 md:flex">
					<div className="grid h-8 w-8 place-items-center rounded-full bg-[#c2e7ff] text-[#062e6f]">
						<Icon path={MailIcons.send} className="h-4 w-4" />
					</div>
					<span className="text-[18px] font-normal tracking-tight text-[#e8eaed]">CV Mail</span>
				</div>

				<div className="group flex h-12 max-w-[720px] flex-1 items-center gap-2 rounded-full bg-[#333438] px-4 transition-colors focus-within:bg-[#3f4043]">
					<Icon path={MailIcons.search} className="h-5 w-5 shrink-0 text-[#9aa0a6]" />
					<input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search company, recipient, subject or CV file"
						className="min-w-0 flex-1 bg-transparent text-[14px] text-[#e8eaed] placeholder:text-[#9aa0a6] outline-none"
					/>
					{(searchInput || domain) && (
						<button
							type="button"
							aria-label="Clear search"
							onClick={() => {
								setSearchInput("");
								setDomain("");
							}}
							className="grid h-8 w-8 place-items-center rounded-full text-[#9aa0a6] hover:bg-[#4a4b4f]"
						>
							<Icon path={MailIcons.close} className="h-[18px] w-[18px]" />
						</button>
					)}
				</div>

				<div className="ml-auto flex items-center gap-2">
					{status?.mailbox && (
						<span className="hidden text-[12px] text-[#9aa0a6] lg:inline">{status.mailbox}</span>
					)}
					<div
						className={`grid h-8 w-8 place-items-center rounded-full text-[13px] font-medium ${
							status?.connected ? "bg-[#81c995] text-[#0d3b1e]" : "bg-[#3c4043] text-[#9aa0a6]"
						}`}
						title={status?.connected ? `Connected as ${status.mailbox}` : "Gmail not connected"}
					>
						<Icon path={MailIcons.person} className="h-4 w-4" />
					</div>
				</div>
			</div>

			{domain && (
				<div className="flex items-center gap-2 px-4 pb-2">
					<span className="inline-flex items-center gap-1 rounded-full bg-[#004a77] px-3 py-1 text-[12px] text-[#c2e7ff]">
						Domain: {domain}
						<button type="button" onClick={() => setDomain("")} aria-label="Clear domain filter">
							<Icon path={MailIcons.close} className="h-3.5 w-3.5" />
						</button>
					</span>
				</div>
			)}

			<div className="flex min-h-0 flex-1">
				{/* ─── Sidebar ─────────────────────────────────────────────────── */}
				<aside className="hidden w-[240px] shrink-0 flex-col gap-2 pb-3 pr-2 md:flex">
					<div className="px-3 pb-2">
						<button
							type="button"
							onClick={() => runSync(false)}
							disabled={syncing || notConfigured}
							className="flex h-14 items-center gap-3 rounded-2xl bg-[#c2e7ff] px-6 text-[14px] font-medium text-[#062e6f] shadow-[0_1px_3px_rgba(0,0,0,.4)] transition-all hover:bg-[#a8dbff] hover:shadow-[0_2px_6px_rgba(0,0,0,.5)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Icon
								path={MailIcons.refresh}
								className={`h-5 w-5 ${syncing ? "animate-spin" : ""}`}
							/>
							{syncing ? "Syncing…" : "Sync now"}
						</button>
					</div>

					<nav className="flex-1 overflow-y-auto pr-2">
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
									className={`flex h-8 w-full items-center gap-4 rounded-r-full pl-6 pr-3 text-[14px] transition-colors ${
										active
											? "bg-[#004a77] font-bold text-[#c2e7ff]"
											: "text-[#e8eaed] hover:bg-[#2a2a2a]"
									}`}
								>
									<Icon path={item.icon} className="h-[18px] w-[18px] shrink-0" />
									<span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
									<span className={`shrink-0 text-[12px] ${count > 0 ? "" : "text-[#5f6368]"}`}>{count}</span>
								</button>
							);
						})}
					</nav>

					<div className="mt-auto space-y-1 px-4 text-[11px] text-[#5f6368]">
						{syncNote ? (
							<p className="text-[#8ab4f8]">{syncNote}</p>
						) : (
							<p>Last sync: {relativeTime(status?.sync?.lastSyncAt)}</p>
						)}
						{status?.sync?.lastSyncStatus === "error" && (
							<p className="text-[#f28b82]">{status.sync.lastError}</p>
						)}
						<p>{status?.storedMessages ?? 0} indexed</p>
						<button
							type="button"
							onClick={() => runSync(true)}
							disabled={syncing || notConfigured}
							className="text-[#8ab4f8] hover:underline disabled:opacity-50"
						>
							Full re-scan
						</button>
					</div>
				</aside>

				{/* ─── Mail pane ───────────────────────────────────────────────── */}
				<section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-2xl border-l border-t border-[#2f3033] bg-[#1a1a1a] md:rounded-tl-2xl">
					{/* Mobile folder chips */}
					<div className="flex gap-2 overflow-x-auto border-b border-[#2f3033] px-3 py-2 md:hidden">
						{FOLDERS.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => {
									setFolder(item.id);
									setPage(1);
									setOpenMessage(null);
								}}
								className={`shrink-0 rounded-full px-3 py-1 text-[12px] ${
									folder === item.id
										? "bg-[#004a77] text-[#c2e7ff]"
										: "border border-[#3c4043] text-[#bdc1c6]"
								}`}
							>
								{item.label} {folderCounts[item.countKey] ? `(${folderCounts[item.countKey]})` : ""}
							</button>
						))}
						<button
							type="button"
							onClick={() => runSync(false)}
							disabled={syncing || notConfigured}
							className="shrink-0 rounded-full bg-[#c2e7ff] px-3 py-1 text-[12px] font-medium text-[#062e6f] disabled:opacity-50"
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
						<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
							<StatStrip
								analytics={analytics}
								loading={analyticsLoading}
								days={days}
								onDaysChange={setDays}
							/>

							{insightsOpen && (
								<InsightsDetail
									analytics={analytics}
									loading={analyticsLoading}
									onSelectDomain={(value) => {
										setDomain(value);
										setPage(1);
									}}
								/>
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

			{/* Gmail-style toast */}
			{toast && (
				<div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#e8eaed] px-4 py-3 text-[13px] text-[#202124] shadow-xl">
					{toast}
				</div>
			)}
		</div>
	);
}
