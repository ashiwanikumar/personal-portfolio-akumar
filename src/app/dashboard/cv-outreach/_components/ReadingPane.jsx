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

/* Netraga status band: 3px hue rail on the left edge, hue wash behind. */
function ReplyStatus({ message }) {
	if (message.bounced) {
		return (
			<div className="rounded-md border border-[#FB7194]/45 border-l-[3px] border-l-[#FB7194] bg-[#33141F] px-4 py-3.5">
				<div className="flex items-center gap-2 text-[#FB7194]">
					<Icon path={MailIcons.error} className="h-[18px] w-[18px]" />
					<span className="text-[13px] font-medium">Delivery failed</span>
				</div>
				<p className="mt-1 text-[12px] text-[#9FB0C2]">
					Bounce received from {message.lastReplyFrom || "the mail server"}. The address is probably wrong.
				</p>
			</div>
		);
	}

	if (message.replied) {
		return (
			<div className="rounded-md border border-[#34D399]/35 border-l-[3px] border-l-[#34D399] bg-[#0F2A22] px-4 py-3.5">
				<div className="flex items-center gap-2 text-[#34D399]">
					<Icon path={MailIcons.reply} className="h-[18px] w-[18px]" />
					<span className="text-[13px] font-medium">
						Replied in {message.hoursToReply < 48 ? `${message.hoursToReply} h` : `${message.daysToReply} days`}
					</span>
				</div>
				<p className="mt-1 text-[12px] text-[#9FB0C2]">
					{message.replyCount} {message.replyCount === 1 ? "reply" : "replies"} · first on{" "}
					{formatFullDate(message.firstReplyAt)} from {message.lastReplyFrom}
				</p>
				{message.firstReplySnippet && (
					<p className="mt-3 border-l-2 border-[#2E3B52] pl-3 text-[13px] leading-5 text-[#9FB0C2]">
						{message.firstReplySnippet}
					</p>
				)}
			</div>
		);
	}

	const waiting = daysAgo(message.sentAt);
	return (
		<div className="rounded-md border border-[#5A4310] border-l-[3px] border-l-[#FBBF24] bg-[#2A1F08] px-4 py-3.5">
			<div className="flex items-center gap-2 text-[#FBBF24]">
				<Icon path={MailIcons.schedule} className="h-[18px] w-[18px]" />
				<span className="text-[13px] font-medium">
					No reply yet{waiting > 0 ? ` · ${waiting} ${waiting === 1 ? "day" : "days"}` : ""}
				</span>
			</div>
			<p className="mt-1 text-[12px] text-[#9FB0C2]">
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
			className="group flex w-[240px] items-center gap-3 rounded-md border border-[#1F2A3D] bg-[#121A2B] p-3 shadow-[0_1px_2px_rgb(0_0_0/0.35)] transition-colors hover:border-[#2E3B52] hover:shadow-[0_8px_24px_rgb(0_0_0/0.5)]"
		>
			<div
				className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${
					attachment.isCv ? "bg-[#0C2A33] text-[#33D6EA]" : "bg-[#070C16] text-[#67788C]"
				}`}
			>
				<Icon path={MailIcons.description} className="h-5 w-5" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[13px] text-[#E8EEF4]">{attachment.filename}</p>
				<p className="nx-mono text-[10px] uppercase tracking-wide text-[#67788C]">
					{formatBytes(attachment.sizeBytes)}
					{attachment.isCv ? " · CV" : ""}
				</p>
			</div>
			<Icon
				path={MailIcons.download}
				className="h-[18px] w-[18px] text-[#67788C] opacity-0 transition-opacity group-hover:opacity-100"
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
		<div className="nx-rise flex min-h-0 flex-1 flex-col">
			{/* Toolbar */}
			<div className="flex h-12 shrink-0 items-center gap-1 border-b border-[#1F2A3D] px-2">
				<IconButton label="Back to list" onClick={onBack}>
					<Icon path={MailIcons.arrowBack} className="h-[18px] w-[18px]" />
				</IconButton>
				<div className="mx-1 h-5 w-px bg-[#1F2A3D]" />
				<IconButton label={message.starred ? "Remove star" : "Star"} onClick={() => onToggleStar(message)}>
					<Icon
						path={message.starred ? MailIcons.star : MailIcons.starOutline}
						className={`h-[18px] w-[18px] ${message.starred ? "text-[#FBBF24]" : ""}`}
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
					className="grid h-9 w-9 place-items-center rounded-md text-[#67788C] transition-colors hover:bg-[#1F2A3D] hover:text-[#E8EEF4]"
				>
					<Icon path={MailIcons.openInNew} className="h-[18px] w-[18px]" />
				</a>
			</div>

			{/* Thread */}
			<div className="nx-scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
				<div className="mb-6 flex items-start gap-3">
					<h2 className="nx-display flex-1 text-[20px] leading-7 text-[#E8EEF4] sm:text-[22px]">
						{message.subject}
					</h2>
					<span className="nx-mono mt-1 inline-flex shrink-0 items-center gap-1 rounded border border-[#1F2A3D] bg-[#070C16] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#9FB0C2]">
						<Icon path={MailIcons.label} className="h-3 w-3" />
						Sent
					</span>
				</div>

				<div className="flex items-start gap-3">
					<div
						className={`grid h-10 w-10 shrink-0 place-items-center rounded-md text-[15px] font-medium ${avatarColor(
							recipient
						)}`}
					>
						{initial}
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-baseline gap-x-2">
							<span className="text-[14px] font-semibold text-[#E8EEF4]">me</span>
							<span className="nx-mono text-[11px] text-[#67788C]">
								&lt;{message.fromEmail || "you"}&gt;
							</span>
							<span className="nx-mono ml-auto text-[11px] tabular-nums text-[#67788C]">
								{formatGmailDate(message.sentAt)}
							</span>
						</div>

						<button
							type="button"
							onClick={() => setDetailsOpen((open) => !open)}
							className="mt-0.5 flex items-center gap-1 text-[12px] text-[#67788C] transition-colors hover:text-[#E8EEF4]"
						>
							to {message.primaryRecipient}
							{message.recipientCount > 1 ? ` and ${message.recipientCount - 1} more` : ""}
							<Icon
								path={MailIcons.chevronDown}
								className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
							/>
						</button>

						{detailsOpen && (
							<dl className="nx-rise mt-2 grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 rounded-md border border-[#1F2A3D] bg-[#121A2B] p-3 text-[12px]">
								<dt className="nx-eyebrow pt-0.5">from</dt>
								<dd className="nx-mono text-[11px] text-[#E8EEF4]">{message.fromEmail || "—"}</dd>
								<dt className="nx-eyebrow pt-0.5">to</dt>
								<dd className="nx-mono break-all text-[11px] text-[#E8EEF4]">
									{(message.to || []).join(", ") || "—"}
								</dd>
								{message.cc?.length > 0 && (
									<>
										<dt className="nx-eyebrow pt-0.5">cc</dt>
										<dd className="nx-mono break-all text-[11px] text-[#E8EEF4]">{message.cc.join(", ")}</dd>
									</>
								)}
								{message.bcc?.length > 0 && (
									<>
										<dt className="nx-eyebrow pt-0.5">bcc</dt>
										<dd className="nx-mono break-all text-[11px] text-[#E8EEF4]">{message.bcc.join(", ")}</dd>
									</>
								)}
								<dt className="nx-eyebrow pt-0.5">date</dt>
								<dd className="text-[#E8EEF4]">{formatFullDate(message.sentAt)}</dd>
								<dt className="nx-eyebrow pt-0.5">company</dt>
								<dd className="text-[#E8EEF4]">
									{message.companyName || "—"}{" "}
									<span className="nx-mono text-[11px] text-[#67788C]">
										({message.recipientDomain || "unknown domain"})
									</span>
								</dd>
							</dl>
						)}

						{/* Body */}
						<div className="mt-5 text-[14px] leading-6 text-[#E8EEF4]">
							{loadingBody ? (
								<div className="space-y-2">
									{[90, 75, 82, 60].map((w, i) => (
										<div key={i} className="h-3 animate-pulse rounded bg-[#1F2A3D]" style={{ width: `${w}%` }} />
									))}
								</div>
							) : bodyError ? (
								<div className="rounded-md border border-[#FB7194]/45 border-l-[3px] border-l-[#FB7194] bg-[#33141F] p-4">
									<p className="text-[13px] text-[#FB7194]">{bodyError}</p>
									<p className="mt-1 text-[12px] text-[#67788C]">Showing the stored preview instead.</p>
									<p className="mt-3 text-[13px] text-[#9FB0C2]">{message.snippet}</p>
								</div>
							) : body?.format === "html" ? (
								<div
									className="gmail-body [&_a]:text-[#33D6EA] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#2E3B52] [&_blockquote]:pl-3 [&_img]:max-w-full [&_table]:max-w-full"
									dangerouslySetInnerHTML={{ __html: body.html }}
								/>
							) : body?.text ? (
								<pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-6">{body.text}</pre>
							) : (
								<p className="text-[#9FB0C2]">{message.snippet}</p>
							)}
						</div>

						{/* Attachments */}
						{message.attachments?.length > 0 && (
							<div className="mt-8 border-t border-[#1F2A3D] pt-4">
								<p className="nx-eyebrow mb-3">
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
								<p className="nx-eyebrow mb-2">
									Also sent to {message.companyName || message.recipientDomain}
								</p>
								<div className="nx-stagger divide-y divide-[#1F2A3D] overflow-hidden rounded-md border border-[#1F2A3D]">
									{related.map((item) => (
										<button
											key={item.gmailMessageId}
											type="button"
											onClick={() => onOpenRelated(item.gmailMessageId)}
											className="flex w-full items-center gap-3 bg-[#121A2B] px-3 py-2 text-left transition-colors hover:bg-[#0B1220]"
										>
											<Icon
												path={item.replied ? MailIcons.reply : MailIcons.schedule}
												className={`h-4 w-4 shrink-0 ${item.replied ? "text-[#34D399]" : "text-[#FBBF24]"}`}
											/>
											<span className="min-w-0 flex-1 truncate text-[13px] text-[#E8EEF4]">{item.subject}</span>
											<span className="nx-mono shrink-0 text-[10px] tabular-nums text-[#67788C]">
												{formatGmailDate(item.sentAt)}
											</span>
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
