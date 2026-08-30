"use client";

import {
	Icon,
	IconButton,
	MailIcons,
	StatusChip,
	displayName,
	formatGmailDate,
} from "./GmailUI";

function Row({ message, checked, onCheck, onOpen, onToggleStar }) {
	// Gmail renders unread mail bold — here "awaiting a reply" is what stands out.
	const pending = !message.replied && !message.bounced;

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
			className="group flex h-[40px] cursor-pointer items-center gap-1 border-b border-[#2f3033] px-2 text-[14px] transition-shadow hover:z-10 hover:bg-[#2a2a2a] hover:shadow-[inset_1px_0_0_#3c4043,inset_-1px_0_0_#3c4043,0_1px_2px_rgba(0,0,0,.4)]"
		>
			<button
				type="button"
				aria-label={checked ? "Deselect" : "Select"}
				onClick={(e) => {
					e.stopPropagation();
					onCheck(message.gmailMessageId);
				}}
				className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#3c4043] ${
					checked ? "text-[#8ab4f8]" : "text-[#5f6368]"
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
				className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#3c4043] ${
					message.starred ? "text-[#f4b400]" : "text-[#5f6368] hover:text-[#e8eaed]"
				}`}
			>
				<Icon path={message.starred ? MailIcons.star : MailIcons.starOutline} className="h-[18px] w-[18px]" />
			</button>

			{/* Recipient */}
			<span
				className={`w-[104px] shrink-0 truncate pl-1 pr-2 sm:w-[140px] lg:w-[168px] ${
					pending ? "font-bold text-[#e8eaed]" : "text-[#bdc1c6]"
				}`}
			>
				<span className="hidden text-[#9aa0a6] sm:inline">To: </span>
				{displayName(message)}
			</span>

			{/* Subject + snippet share one truncating line, as Gmail does */}
			<span className="min-w-0 flex-1 truncate">
				<span className={pending ? "font-bold text-[#e8eaed]" : "text-[#bdc1c6]"}>
					{message.subject}
				</span>
				{message.snippet && <span className="text-[#9aa0a6]"> — {message.snippet}</span>}
			</span>

			<span className="hidden sm:inline-flex">
				<StatusChip message={message} />
			</span>

			{message.attachmentCount > 0 && (
				<span
					title={message.cvFileName}
					className="hidden shrink-0 items-center gap-1 rounded-[4px] border border-[#3c4043] px-1.5 py-[1px] text-[10px] text-[#bdc1c6] xl:inline-flex"
				>
					<Icon path={MailIcons.attachment} className="h-3 w-3" />
					<span className="max-w-[120px] truncate">{message.cvFileName}</span>
				</span>
			)}

			<span
				className={`w-[64px] shrink-0 text-right text-[12px] ${
					pending ? "font-bold text-[#e8eaed]" : "text-[#9aa0a6]"
				}`}
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
}) {
	const allChecked = messages.length > 0 && selectedIds.size === messages.length;
	const { currentPage = 1, perPage = 25, totalMessages = 0, totalPages = 1 } = pagination || {};
	const rangeStart = totalMessages === 0 ? 0 : (currentPage - 1) * perPage + 1;
	const rangeEnd = Math.min(currentPage * perPage, totalMessages);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			{/* Toolbar — sticks to the top of the scrolling pane */}
			<div className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-1 border-b border-[#2f3033] bg-[#1a1a1a] px-2">
				<button
					type="button"
					aria-label={allChecked ? "Deselect all" : "Select all"}
					onClick={onCheckAll}
					className={`grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#2f3033] ${
						allChecked ? "text-[#8ab4f8]" : "text-[#9aa0a6]"
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

				{/* Exports exactly what the current filters show */}
				<a
					href={exportHref("xlsx")}
					title="Export to Excel"
					aria-label="Export to Excel"
					className="grid h-10 w-10 place-items-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#2f3033] hover:text-[#e8eaed]"
				>
					<Icon path={MailIcons.download} className="h-[18px] w-[18px]" />
				</a>
				<a
					href={exportHref("csv")}
					title="Export to CSV"
					aria-label="Export to CSV"
					className="hidden h-10 w-10 place-items-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#2f3033] hover:text-[#e8eaed] sm:grid"
				>
					<Icon path={MailIcons.table} className="h-[18px] w-[18px]" />
				</a>

				{selectedIds.size > 0 && (
					<span className="ml-2 text-[12px] text-[#9aa0a6]">{selectedIds.size} selected</span>
				)}

				<div className="ml-auto flex items-center gap-1">
					<span className="mr-1 text-[12px] text-[#9aa0a6]">
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
								<div className="h-4 w-4 rounded bg-[#2f3033]" />
								<div className="h-3 w-40 rounded bg-[#2f3033]" />
								<div className="h-3 flex-1 rounded bg-[#242528]" />
								<div className="h-3 w-12 rounded bg-[#2f3033]" />
							</div>
						))}
					</div>
				) : messages.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
						<div className="grid h-16 w-16 place-items-center rounded-full bg-[#2a2a2a] text-[#5f6368]">
							<Icon path={MailIcons.send} className="h-7 w-7" />
						</div>
						<p className="text-[15px] text-[#e8eaed]">No CV emails in {folderLabel}</p>
						<p className="max-w-sm text-[13px] text-[#9aa0a6]">
							Emails land here when a sync finds a sent message carrying a CV attachment.
						</p>
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
						/>
					))
				)}
			</div>
		</div>
	);
}
