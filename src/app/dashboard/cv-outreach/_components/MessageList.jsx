"use client";

import {
	DAY_ACCENT,
	Icon,
	IconButton,
	MailIcons,
	StatusChip,
	dayBucket,
	displayName,
	formatGmailDate,
} from "./GmailUI";

function Row({ message, checked, onCheck, onOpen, onToggleStar, timezone }) {
	// Unread mail renders bold in a mailbox — here "awaiting a reply" is what stands out.
	const pending = !message.replied && !message.bounced;
	const bucket = dayBucket(message.sentAt, timezone);

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onOpen(message)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onOpen(message);
				}
			}}
			className={`group flex h-[40px] cursor-pointer items-center gap-1 border-b border-[#1F2A3D] pr-2 text-[13px] transition-colors hover:z-10 hover:bg-[#121A2B] ${
				bucket === "today" ? "bg-[#00C8E0]/[0.05]" : bucket === "yesterday" ? "bg-[#FBBF24]/[0.04]" : ""
			}`}
		>
			<span
				aria-hidden="true"
				className="-my-[1px] h-[40px] w-[3px] shrink-0"
				style={{ background: DAY_ACCENT[bucket] }}
			/>

			<button
				type="button"
				aria-label={checked ? "Deselect" : "Select"}
				onClick={(e) => {
					e.stopPropagation();
					onCheck(message.gmailMessageId);
				}}
				className={`ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors hover:bg-[#1F2A3D] ${
					checked ? "text-[#33D6EA]" : "text-[#67788C]"
				}`}
			>
				<Icon path={checked ? MailIcons.checkboxChecked : MailIcons.checkbox} className="h-[18px] w-[18px]" />
			</button>

			<button
				type="button"
				aria-label={message.starred ? "Remove star" : "Star"}
				onClick={(e) => {
					e.stopPropagation();
					onToggleStar(message);
				}}
				className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors hover:bg-[#1F2A3D] ${
					message.starred ? "text-[#FBBF24]" : "text-[#67788C] hover:text-[#E8EEF4]"
				}`}
			>
				<Icon path={message.starred ? MailIcons.star : MailIcons.starOutline} className="h-[18px] w-[18px]" />
			</button>

			{/* Recipient */}
			<span
				className={`w-[104px] shrink-0 truncate pl-1 pr-2 sm:w-[140px] lg:w-[168px] ${
					pending ? "font-semibold text-[#E8EEF4]" : "text-[#9FB0C2]"
				}`}
			>
				<span className="hidden font-normal text-[#67788C] sm:inline">To: </span>
				{displayName(message)}
			</span>

			{/* Subject + snippet share one truncating line */}
			<span className="min-w-0 flex-1 truncate">
				<span className={pending ? "font-semibold text-[#E8EEF4]" : "text-[#9FB0C2]"}>
					{message.subject}
				</span>
				{message.snippet && <span className="text-[#67788C]"> — {message.snippet}</span>}
			</span>

			<span className="hidden sm:inline-flex">
				<StatusChip message={message} />
			</span>

			{message.attachmentCount > 0 && (
				<span
					title={message.cvFileName}
					className="nx-mono hidden shrink-0 items-center gap-1 rounded border border-[#1F2A3D] px-1.5 py-[1px] text-[10px] text-[#9FB0C2] xl:inline-flex"
				>
					<Icon path={MailIcons.attachment} className="h-3 w-3" />
					<span className="max-w-[120px] truncate">{message.cvFileName}</span>
				</span>
			)}

			<span
				className={`nx-mono w-[64px] shrink-0 text-right text-[11px] tabular-nums ${
					bucket === "older" ? (pending ? "text-[#9FB0C2]" : "text-[#67788C]") : "font-medium"
				}`}
				style={bucket === "older" ? undefined : { color: DAY_ACCENT[bucket] }}
				title={new Date(message.sentAt).toLocaleString()}
			>
				{formatGmailDate(message.sentAt)}
			</span>
		</div>
	);
}

export default function MessageList({
	messages,
	loading,
	selectedIds,
	onCheck,
	onCheckAll,
	onOpen,
	onToggleStar,
	onRefresh,
	pagination,
	onPageChange,
	insightsOpen,
	onToggleInsights,
	folderLabel,
	exportHref,
	timezone,
}) {
	const allChecked = messages.length > 0 && selectedIds.size === messages.length;
	const { currentPage = 1, perPage = 25, totalMessages = 0, totalPages = 1 } = pagination || {};
	const rangeStart = totalMessages === 0 ? 0 : (currentPage - 1) * perPage + 1;
	const rangeEnd = Math.min(currentPage * perPage, totalMessages);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			{/* Toolbar — sticks to the top of the scrolling pane */}
			<div className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-1 border-b border-[#1F2A3D] bg-[#0B1220]/90 px-2 backdrop-blur-md">
				<button
					type="button"
					aria-label={allChecked ? "Deselect all" : "Select all"}
					onClick={onCheckAll}
					className={`grid h-9 w-9 place-items-center rounded-md transition-colors hover:bg-[#1F2A3D] ${
						allChecked ? "text-[#33D6EA]" : "text-[#67788C]"
					}`}
				>
					<Icon path={allChecked ? MailIcons.checkboxChecked : MailIcons.checkbox} className="h-[18px] w-[18px]" />
				</button>

				<IconButton label="Refresh" onClick={onRefresh}>
					<Icon path={MailIcons.refresh} className="h-[18px] w-[18px]" />
				</IconButton>

				<IconButton label="Insights" onClick={onToggleInsights} active={insightsOpen}>
					<Icon path={MailIcons.insights} className="h-[18px] w-[18px]" />
				</IconButton>

				<span className="mx-1 h-5 w-px bg-[#1F2A3D]" aria-hidden="true" />

				{/* Exports exactly what the current filters show */}
				<a
					href={exportHref("xlsx")}
					title="Export to Excel"
					aria-label="Export to Excel"
					className="grid h-9 w-9 place-items-center rounded-md text-[#67788C] transition-colors hover:bg-[#1F2A3D] hover:text-[#E8EEF4]"
				>
					<Icon path={MailIcons.download} className="h-[18px] w-[18px]" />
				</a>
				<a
					href={exportHref("csv")}
					title="Export to CSV"
					aria-label="Export to CSV"
					className="hidden h-9 w-9 place-items-center rounded-md text-[#67788C] transition-colors hover:bg-[#1F2A3D] hover:text-[#E8EEF4] sm:grid"
				>
					<Icon path={MailIcons.table} className="h-[18px] w-[18px]" />
				</a>

				{selectedIds.size > 0 ? (
					<span className="nx-mono ml-2 text-[11px] tabular-nums text-[#9FB0C2]">
						{selectedIds.size} selected
					</span>
				) : (
					<>
						<span className="mx-1 hidden h-5 w-px bg-[#1F2A3D] lg:block" aria-hidden="true" />
						<span className="nx-mono hidden items-center gap-4 pl-1 text-[10px] uppercase tracking-wide text-[#67788C] lg:flex">
							<span className="flex items-center gap-2">
								<span className="h-3 w-[3px] rounded-full" style={{ background: DAY_ACCENT.today }} />
								Today
							</span>
							<span className="flex items-center gap-2">
								<span className="h-3 w-[3px] rounded-full" style={{ background: DAY_ACCENT.yesterday }} />
								Yesterday
							</span>
						</span>
					</>
				)}

				<div className="ml-auto flex items-center gap-1">
					<span className="nx-mono mr-1 text-[11px] tabular-nums text-[#67788C]">
						{rangeStart}–{rangeEnd} of {totalMessages.toLocaleString()}
					</span>
					<IconButton label="Newer" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
						<Icon path={MailIcons.chevronLeft} className="h-[18px] w-[18px]" />
					</IconButton>
					<IconButton
						label="Older"
						disabled={currentPage >= totalPages}
						onClick={() => onPageChange(currentPage + 1)}
					>
						<Icon path={MailIcons.chevronRight} className="h-[18px] w-[18px]" />
					</IconButton>
				</div>
			</div>

			{/* Rows */}
			<div className="min-h-0 flex-1">
				{loading ? (
					<div className="space-y-px p-2">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="flex h-10 animate-pulse items-center gap-3 px-2">
								<div className="h-4 w-4 rounded bg-[#1F2A3D]" />
								<div className="h-3 w-40 rounded bg-[#1F2A3D]" />
								<div className="h-3 flex-1 rounded bg-[#121A2B]" />
								<div className="h-3 w-12 rounded bg-[#1F2A3D]" />
							</div>
						))}
					</div>
				) : messages.length === 0 ? (
					<div className="p-6">
						<div className="nx-hatch relative overflow-hidden rounded-md border border-dashed border-[#135A69] px-6 py-12 text-center">
							<span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[#0C2A33] opacity-40" />
							<span className="relative mx-auto mb-3.5 grid h-11 w-11 place-items-center rounded-full bg-[#00C8E0] text-[#06202A] shadow-sm">
								<Icon path={MailIcons.send} className="h-5 w-5" />
							</span>
							<p className="nx-display relative text-[14px] text-[#E8EEF4]">No CV emails in {folderLabel}</p>
							<p className="relative mx-auto mt-1.5 max-w-md text-[13px] text-[#9FB0C2]">
								Emails land here when a sync finds a sent message carrying a CV attachment.
							</p>
						</div>
					</div>
				) : (
					messages.map((message) => (
						<Row
							key={message.gmailMessageId}
							message={message}
							checked={selectedIds.has(message.gmailMessageId)}
							onCheck={onCheck}
							onOpen={onOpen}
							onToggleStar={onToggleStar}
							timezone={timezone}
						/>
					))
				)}
			</div>
		</div>
	);
}
