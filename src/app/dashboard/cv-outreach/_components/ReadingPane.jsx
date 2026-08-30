"use client";

import { useEffect, useState } from "react";
import {
	Icon,
	IconButton,
	MailIcons,
	avatarColor,
	daysAgo,
	displayName,
	formatBytes,
	formatFullDate,
	formatGmailDate,
} from "./GmailUI";

function ReplyStatus({ message }) {
	if (message.bounced) {
		return (
			<div className="rounded-lg border border-[#5c1a16] bg-[#2d1310] p-4">
				<div className="flex items-center gap-2 text-[#f28b82]">
					<Icon path={MailIcons.error} className="h-[18px] w-[18px]" />
					<span className="text-[13px] font-medium">Delivery failed</span>
				</div>
				<p className="mt-1 text-[12px] text-[#bdc1c6]">
					Bounce received from {message.lastReplyFrom || "the mail server"}. The address is probably wrong.
				</p>
			</div>
		);
	}

	if (message.replied) {
		return (
			<div className="rounded-lg border border-[#0d3b1e] bg-[#12251a] p-4">
				<div className="flex items-center gap-2 text-[#81c995]">
					<Icon path={MailIcons.reply} className="h-[18px] w-[18px]" />
					<span className="text-[13px] font-medium">
						Replied in {message.hoursToReply < 48 ? `${message.hoursToReply} h` : `${message.daysToReply} days`}
					</span>
				</div>
				<p className="mt-1 text-[12px] text-[#9aa0a6]">
					{message.replyCount} {message.replyCount === 1 ? "reply" : "replies"} · first on{" "}
					{formatFullDate(message.firstReplyAt)} from {message.lastReplyFrom}
				</p>
				{message.firstReplySnippet && (
					<p className="mt-3 border-l-2 border-[#3c4043] pl-3 text-[13px] leading-5 text-[#bdc1c6]">
						{message.firstReplySnippet}
					</p>
				)}
			</div>
		);
	}

	const waiting = daysAgo(message.sentAt);
	return (
		<div className="rounded-lg border border-[#3c3418] bg-[#282213] p-4">
			<div className="flex items-center gap-2 text-[#fdd663]">
				<Icon path={MailIcons.schedule} className="h-[18px] w-[18px]" />
				<span className="text-[13px] font-medium">
					No reply yet{waiting > 0 ? ` · ${waiting} ${waiting === 1 ? "day" : "days"}` : ""}
				</span>
			</div>
			<p className="mt-1 text-[12px] text-[#9aa0a6]">
				Reply checks run on every sync while the email is inside the reply window.
			</p>
		</div>
	);
}

function AttachmentTile({ message, attachment }) {
	const href = `/api/admin/gmail-cv/attachment?id=${encodeURIComponent(
		message.gmailMessageId
	)}&attachmentId=${encodeURIComponent(attachment.attachmentId)}`;

	return (
		<a
			href={href}
			className="group flex w-[240px] items-center gap-3 rounded-lg border border-[#3c4043] bg-[#202124] p-3 transition-colors hover:border-[#5f6368] hover:bg-[#282a2d]"
		>
			<div
				className={`grid h-10 w-10 shrink-0 place-items-center rounded ${
					attachment.isCv ? "bg-[#5c1a16] text-[#f28b82]" : "bg-[#2f3033] text-[#9aa0a6]"
				}`}
			>
				<Icon path={MailIcons.description} className="h-5 w-5" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[13px] text-[#e8eaed]">{attachment.filename}</p>
				<p className="text-[11px] text-[#9aa0a6]">
					{formatBytes(attachment.sizeBytes)}
					{attachment.isCv ? " · CV" : ""}
				</p>
			</div>
			<Icon
				path={MailIcons.download}
				className="h-[18px] w-[18px] text-[#9aa0a6] opacity-0 transition-opacity group-hover:opacity-100"
			/>
		</a>
	);
}

export default function ReadingPane({ message, related, onBack, onToggleStar, onOpenRelated }) {
	const [body, setBody] = useState(null);
	const [bodyError, setBodyError] = useState("");
	const [loadingBody, setLoadingBody] = useState(true);
	const [detailsOpen, setDetailsOpen] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setLoadingBody(true);
		setBody(null);
		setBodyError("");

		fetch(`/api/admin/gmail-cv?view=body&id=${encodeURIComponent(message.gmailMessageId)}`, {
			cache: "no-store",
		})
			.then((res) => res.json())
			.then((data) => {
				if (cancelled) return;
				if (data?.success) setBody(data.body);
				else setBodyError(data?.message || data?.error || "Could not load the message body");
			})
			.catch(() => !cancelled && setBodyError("Could not reach Gmail"))
			.finally(() => !cancelled && setLoadingBody(false));

		return () => {
			cancelled = true;
		};
	}, [message.gmailMessageId]);

	const recipient = displayName(message);
	const initial = (recipient[0] || "?").toUpperCase();
	const gmailLink = `https://mail.google.com/mail/u/0/#sent/${message.gmailThreadId}`;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			{/* Toolbar */}
			<div className="flex h-12 shrink-0 items-center gap-1 border-b border-[#2f3033] px-2">
				<IconButton label="Back to list" onClick={onBack}>
					<Icon path={MailIcons.arrowBack} className="h-[18px] w-[18px]" />
				</IconButton>
				<div className="mx-1 h-5 w-px bg-[#3c4043]" />
				<IconButton label={message.starred ? "Remove star" : "Star"} onClick={() => onToggleStar(message)}>
					<Icon
						path={message.starred ? MailIcons.star : MailIcons.starOutline}
						className={`h-[18px] w-[18px] ${message.starred ? "text-[#f4b400]" : ""}`}
					/>
				</IconButton>
				<IconButton label="Print" onClick={() => window.print()}>
					<Icon path={MailIcons.print} className="h-[18px] w-[18px]" />
				</IconButton>
				<a
					href={gmailLink}
					target="_blank"
					rel="noopener noreferrer"
					title="Open in Gmail"
					className="grid h-10 w-10 place-items-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#2f3033] hover:text-[#e8eaed]"
				>
					<Icon path={MailIcons.openInNew} className="h-[18px] w-[18px]" />
				</a>
			</div>

			{/* Thread */}
			<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
				<div className="mb-6 flex items-start gap-3">
					<h2 className="flex-1 text-[20px] leading-7 text-[#e8eaed] sm:text-[22px]">{message.subject}</h2>
					<span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-[#2f3033] px-2 py-[2px] text-[11px] text-[#bdc1c6]">
						<Icon path={MailIcons.label} className="h-3 w-3" />
						Sent
					</span>
				</div>

				<div className="flex items-start gap-3">
					<div
						className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-medium ${avatarColor(
							recipient
						)}`}
					>
						{initial}
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-baseline gap-x-2">
							<span className="text-[14px] font-bold text-[#e8eaed]">me</span>
							<span className="text-[12px] text-[#9aa0a6]">
								&lt;{message.fromEmail || "you"}&gt;
							</span>
							<span className="ml-auto text-[12px] text-[#9aa0a6]">
								{formatGmailDate(message.sentAt)}
							</span>
						</div>

						<button
							type="button"
							onClick={() => setDetailsOpen((open) => !open)}
							className="mt-0.5 flex items-center gap-1 text-[12px] text-[#9aa0a6] hover:text-[#e8eaed]"
						>
							to {message.primaryRecipient}
							{message.recipientCount > 1 ? ` and ${message.recipientCount - 1} more` : ""}
							<Icon
								path={MailIcons.chevronDown}
								className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
							/>
						</button>

						{detailsOpen && (
							<dl className="mt-2 grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 rounded-lg border border-[#3c4043] bg-[#202124] p-3 text-[12px]">
								<dt className="text-[#9aa0a6]">from</dt>
								<dd className="text-[#e8eaed]">{message.fromEmail || "—"}</dd>
								<dt className="text-[#9aa0a6]">to</dt>
								<dd className="break-all text-[#e8eaed]">{(message.to || []).join(", ") || "—"}</dd>
								{message.cc?.length > 0 && (
									<>
										<dt className="text-[#9aa0a6]">cc</dt>
										<dd className="break-all text-[#e8eaed]">{message.cc.join(", ")}</dd>
									</>
								)}
								{message.bcc?.length > 0 && (
									<>
										<dt className="text-[#9aa0a6]">bcc</dt>
										<dd className="break-all text-[#e8eaed]">{message.bcc.join(", ")}</dd>
									</>
								)}
								<dt className="text-[#9aa0a6]">date</dt>
								<dd className="text-[#e8eaed]">{formatFullDate(message.sentAt)}</dd>
								<dt className="text-[#9aa0a6]">company</dt>
								<dd className="text-[#e8eaed]">
									{message.companyName || "—"}{" "}
									<span className="text-[#9aa0a6]">({message.recipientDomain || "unknown domain"})</span>
								</dd>
							</dl>
						)}

						{/* Body */}
						<div className="mt-5 text-[14px] leading-6 text-[#e8eaed]">
							{loadingBody ? (
								<div className="space-y-2">
									{[90, 75, 82, 60].map((w, i) => (
										<div key={i} className="h-3 animate-pulse rounded bg-[#2f3033]" style={{ width: `${w}%` }} />
									))}
								</div>
							) : bodyError ? (
								<div className="rounded-lg border border-[#3c4043] bg-[#202124] p-4">
									<p className="text-[13px] text-[#f28b82]">{bodyError}</p>
									<p className="mt-1 text-[12px] text-[#9aa0a6]">Showing the stored preview instead.</p>
									<p className="mt-3 text-[13px] text-[#bdc1c6]">{message.snippet}</p>
								</div>
							) : body?.format === "html" ? (
								<div
									className="gmail-body [&_a]:text-[#8ab4f8] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#3c4043] [&_blockquote]:pl-3 [&_img]:max-w-full [&_table]:max-w-full"
									dangerouslySetInnerHTML={{ __html: body.html }}
								/>
							) : body?.text ? (
								<pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-6">{body.text}</pre>
							) : (
								<p className="text-[#bdc1c6]">{message.snippet}</p>
							)}
						</div>

						{/* Attachments */}
						{message.attachments?.length > 0 && (
							<div className="mt-8 border-t border-[#3c4043] pt-4">
								<p className="mb-3 text-[13px] text-[#9aa0a6]">
									{message.attachments.length}{" "}
									{message.attachments.length === 1 ? "Attachment" : "Attachments"}
								</p>
								<div className="flex flex-wrap gap-3">
									{message.attachments.map((attachment) => (
										<AttachmentTile
											key={attachment.attachmentId || attachment.filename}
											message={message}
											attachment={attachment}
										/>
									))}
								</div>
							</div>
						)}

						{/* Reply status */}
						<div className="mt-6">
							<ReplyStatus message={message} />
						</div>

						{/* Same company */}
						{related?.length > 0 && (
							<div className="mt-6">
								<p className="mb-2 text-[13px] text-[#9aa0a6]">
									Also sent to {message.companyName || message.recipientDomain}
								</p>
								<div className="divide-y divide-[#2f3033] overflow-hidden rounded-lg border border-[#3c4043]">
									{related.map((item) => (
										<button
											key={item.gmailMessageId}
											type="button"
											onClick={() => onOpenRelated(item.gmailMessageId)}
											className="flex w-full items-center gap-3 bg-[#202124] px-3 py-2 text-left transition-colors hover:bg-[#282a2d]"
										>
											<Icon
												path={item.replied ? MailIcons.reply : MailIcons.schedule}
												className={`h-4 w-4 shrink-0 ${item.replied ? "text-[#81c995]" : "text-[#fdd663]"}`}
											/>
											<span className="min-w-0 flex-1 truncate text-[13px] text-[#e8eaed]">{item.subject}</span>
											<span className="shrink-0 text-[11px] text-[#9aa0a6]">{formatGmailDate(item.sentAt)}</span>
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
