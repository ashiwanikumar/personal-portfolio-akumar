"use client";

import { useMemo, useState } from "react";
import { Icon, MailIcons } from "./GmailUI";

/**
 * Series colors validated against the #202124 panel surface: OKLCH lightness
 * band, chroma floor, CVD separation (ΔE 29 protan / 25 tritan), normal-vision
 * floor and 3:1 contrast all pass.
 */
const SENT_COLOR = "#4285f4";
const REPLIED_COLOR = "#c87a22";

const WEEKDAYS = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Tile({ label, value, sub, accent = "text-[#e8eaed]" }) {
	return (
		<div className="rounded-lg border border-[#3c4043] bg-[#202124] px-4 py-3">
			<p className="text-[11px] uppercase tracking-wide text-[#9aa0a6]">{label}</p>
			<p className={`mt-1 text-[22px] font-medium leading-7 ${accent}`}>{value}</p>
			{sub && <p className="text-[11px] text-[#9aa0a6]">{sub}</p>}
		</div>
	);
}

/**
 * A year of daily bars is unreadable, so anything past a quarter rolls up into
 * weeks. The API always returns a gap-filled daily series.
 */
function rollUp(data) {
	if (data.length <= 92) return { series: data, unit: "day" };

	const weeks = [];
	for (let i = 0; i < data.length; i += 7) {
		const chunk = data.slice(i, i + 7);
		weeks.push({
			date: chunk[0].date,
			endDate: chunk[chunk.length - 1].date,
			sent: chunk.reduce((sum, d) => sum + d.sent, 0),
			replied: chunk.reduce((sum, d) => sum + d.replied, 0),
		});
	}

	return { series: weeks, unit: "week" };
}

function DailyChart({ data }) {
	const [hover, setHover] = useState(null);
	const [showTable, setShowTable] = useState(false);

	const { series, unit } = useMemo(() => rollUp(data), [data]);
	const max = Math.max(1, ...series.map((d) => d.sent));

	return (
		<div className="rounded-lg border border-[#3c4043] bg-[#202124] p-4">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<h3 className="text-[13px] font-medium text-[#e8eaed]">
					CVs sent per {unit}
				</h3>
				<div className="flex items-center gap-4 text-[11px] text-[#9aa0a6]">
					<span className="flex items-center gap-1.5">
						<span className="h-2 w-2 rounded-[2px]" style={{ background: SENT_COLOR }} />
						Sent
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-2 w-2 rounded-[2px]" style={{ background: REPLIED_COLOR }} />
						Replied
					</span>
				</div>
			</div>

			<div className="relative">
				{/* Recessive gridlines */}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-[120px]">
					{[0, 0.5, 1].map((t) => (
						<div
							key={t}
							className="absolute inset-x-0 border-t border-[#3c4043]/60"
							style={{ top: `${t * 100}%` }}
						>
							<span className="absolute -top-2 -left-1 bg-[#202124] pr-1 text-[10px] text-[#5f6368]">
								{Math.round(max * (1 - t))}
							</span>
						</div>
					))}
				</div>

				<div className="flex h-[120px] items-end gap-[3px] pl-5">
					{series.map((day, i) => {
						const sentPct = (day.sent / max) * 100;
						const repliedPct = (day.replied / max) * 100;

						return (
							<div
								key={day.date}
								className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-[2px]"
								onMouseEnter={() => setHover(i)}
								onMouseLeave={() => setHover(null)}
							>
								<div
									className="w-[45%] rounded-t-[4px] transition-opacity group-hover:opacity-80"
									style={{ height: `${Math.max(sentPct, day.sent ? 3 : 0)}%`, background: SENT_COLOR }}
									title={`${day.date}: ${day.sent} sent`}
								/>
								<div
									className="w-[45%] rounded-t-[4px] transition-opacity group-hover:opacity-80"
									style={{ height: `${Math.max(repliedPct, day.replied ? 3 : 0)}%`, background: REPLIED_COLOR }}
									title={`${day.date}: ${day.replied} replied`}
								/>

								{hover === i && (
									<div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 w-max -translate-x-1/2 rounded-md border border-[#3c4043] bg-[#2a2b2e] px-2.5 py-1.5 text-left shadow-lg">
										<p className="text-[11px] font-medium text-[#e8eaed]">
											{new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US",
												unit === "week"
													? { day: "numeric", month: "short" }
													: { weekday: "short", day: "numeric", month: "short" }
											)}
											{day.endDate
												? ` – ${new Date(`${day.endDate}T00:00:00`).toLocaleDateString("en-US", {
														day: "numeric",
														month: "short",
												  })}`
												: ""}
										</p>
										<p className="text-[11px] text-[#9aa0a6]">
											<span style={{ color: SENT_COLOR }}>{day.sent}</span> sent ·{" "}
											<span style={{ color: REPLIED_COLOR }}>{day.replied}</span> replied
										</p>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="mt-2 flex items-center justify-between pl-5 text-[10px] text-[#5f6368]">
				<span>{series[0]?.date}</span>
				<span>{series[series.length - 1]?.endDate || series[series.length - 1]?.date}</span>
			</div>

			<button
				type="button"
				onClick={() => setShowTable((open) => !open)}
				className="mt-3 text-[11px] text-[#8ab4f8] hover:underline"
			>
				{showTable ? "Hide data table" : "Show data table"}
			</button>

			{showTable && (
				<div className="mt-2 max-h-48 overflow-y-auto rounded border border-[#3c4043]">
					<table className="w-full text-left text-[11px]">
						<thead className="sticky top-0 bg-[#2a2b2e] text-[#9aa0a6]">
							<tr>
								<th scope="col" className="px-3 py-1.5 font-medium">{unit === "week" ? "Week of" : "Date"}</th>
								<th scope="col" className="px-3 py-1.5 font-medium">Sent</th>
								<th scope="col" className="px-3 py-1.5 font-medium">Replied</th>
							</tr>
						</thead>
						<tbody className="text-[#bdc1c6]">
							{series.map((day) => (
								<tr key={day.date} className="border-t border-[#3c4043]">
									<td className="px-3 py-1">{day.date}</td>
									<td className="px-3 py-1">{day.sent}</td>
									<td className="px-3 py-1">{day.replied}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function RankedList({ title, items, emptyText, renderLabel, onSelect }) {
	const max = Math.max(1, ...items.map((i) => i.sent));

	return (
		<div className="rounded-lg border border-[#3c4043] bg-[#202124] p-4">
			<h3 className="mb-3 text-[13px] font-medium text-[#e8eaed]">{title}</h3>
			{items.length === 0 ? (
				<p className="text-[12px] text-[#9aa0a6]">{emptyText}</p>
			) : (
				<ul className="space-y-2">
					{items.map((item, i) => (
						<li key={i}>
							<button
								type="button"
								disabled={!onSelect}
								onClick={() => onSelect?.(item)}
								className="w-full text-left disabled:cursor-default"
							>
								<div className="flex items-baseline justify-between gap-3">
									<span className="min-w-0 flex-1 truncate text-[12px] text-[#e8eaed]">
										{renderLabel(item)}
									</span>
									<span className="shrink-0 text-[11px] text-[#9aa0a6]">
										{item.sent} sent · {item.replyRate}%
									</span>
								</div>
								<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#2f3033]">
									<div
										className="h-full rounded-full"
										style={{ width: `${(item.sent / max) * 100}%`, background: SENT_COLOR }}
									/>
								</div>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

/** Always-on summary row — the "how many did I send" answer, above the mailbox. */
export function StatStrip({ analytics, loading, days, onDaysChange }) {
	const bestDay = useMemo(() => {
		if (!analytics?.byWeekday?.length) return null;
		return analytics.byWeekday.reduce((best, d) => (d.sent > best.sent ? d : best));
	}, [analytics]);

	if (loading || !analytics) {
		return (
			<div className="border-b border-[#2f3033] bg-[#1a1a1a] p-4">
				<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-[74px] animate-pulse rounded-lg bg-[#202124]" />
					))}
				</div>
			</div>
		);
	}

	const s = analytics.summary || {};
	const replyTime = analytics.replyTime || {};

	return (
		<div className="border-b border-[#2f3033] bg-[#1a1a1a] p-4">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="flex items-center gap-2 text-[13px] font-medium text-[#e8eaed]">
					<Icon path={MailIcons.insights} className="h-4 w-4 text-[#9aa0a6]" />
					Outreach insights
				</h2>
				<select
					value={days}
					onChange={(e) => onDaysChange(Number(e.target.value))}
					className="rounded-full border border-[#3c4043] bg-[#202124] px-3 py-1 text-[12px] text-[#bdc1c6] outline-none focus:border-[#8ab4f8]"
				>
					<option value={7}>Last 7 days</option>
					<option value={30}>Last 30 days</option>
					<option value={90}>Last 90 days</option>
					<option value={365}>Last year</option>
				</select>
			</div>

			<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<Tile label="Sent" value={s.sent ?? 0} sub={`${s.perDay ?? 0} per day`} />
				<Tile
					label="Reply rate"
					value={`${s.replyRate ?? 0}%`}
					sub={`${s.replied ?? 0} replied`}
					accent="text-[#81c995]"
				/>
				<Tile label="Awaiting" value={s.awaiting ?? 0} sub="no reply yet" accent="text-[#fdd663]" />
				<Tile
					label="Avg reply"
					value={
						replyTime.avgHours
							? replyTime.avgHours < 48
								? `${replyTime.avgHours}h`
								: `${Math.round(replyTime.avgHours / 24)}d`
							: "—"
					}
					sub={replyTime.fastestHours ? `fastest ${replyTime.fastestHours}h` : "no replies yet"}
				/>
				<Tile label="Companies" value={s.companies ?? 0} sub="unique domains" />
				<Tile
					label="Best day"
					value={bestDay ? WEEKDAYS[bestDay.weekday] : "—"}
					sub={bestDay ? `${bestDay.sent} sent` : ""}
				/>
			</div>
		</div>
	);
}

/** The deeper view — chart and rankings — shown behind the Insights toggle. */
export default function InsightsDetail({ analytics, loading, onSelectDomain }) {
	if (loading || !analytics) {
		return (
			<div className="border-b border-[#2f3033] bg-[#1a1a1a] px-4 pb-4">
				<div className="h-[220px] animate-pulse rounded-lg bg-[#202124]" />
			</div>
		);
	}

	return (
		<div className="border-b border-[#2f3033] bg-[#1a1a1a] px-4 pb-4">
			{analytics.dailyStats?.length > 0 && <DailyChart data={analytics.dailyStats} />}

			<div className="mt-3 grid gap-3 lg:grid-cols-2">
				<RankedList
					title="Top companies"
					items={analytics.byCompany || []}
					emptyText="No companies in this period."
					onSelect={(item) => onSelectDomain?.(item.domain)}
					renderLabel={(item) => (
						<>
							{item.company}
							<span className="ml-1.5 text-[#5f6368]">{item.domain}</span>
						</>
					)}
				/>
				<RankedList
					title="CV file performance"
					items={analytics.byCvFile || []}
					emptyText="No CV attachments in this period."
					renderLabel={(item) => item.fileName}
				/>
			</div>

			{analytics.allTime && (
				<p className="mt-3 text-[11px] text-[#5f6368]">
					All time: {analytics.allTime.sent} CVs sent · {analytics.allTime.replied} replied ·{" "}
					{analytics.allTime.replyRate}% reply rate
				</p>
			)}
		</div>
	);
}
