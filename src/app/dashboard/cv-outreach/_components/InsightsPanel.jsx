"use client";

import { useMemo, useState } from "react";
import { Icon, MailIcons } from "./GmailUI";

/**
 * Series colors on the #121A2B card surface: brand cyan for sent, signal
 * amber for replied — a reply is observed evidence, and the pair keeps CVD
 * separation (cyan/amber splits cleanly for protan and tritan vision).
 */
const SENT_COLOR = "#00C8E0";
const REPLIED_COLOR = "#FBBF24";

const WEEKDAYS = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/*
 * Netraga stat-tile hues: `surface` owns the wash + ring, `rail` the 3px
 * left edge, `value`/`eyebrow`/`sub` the ink. Washed tiles carry meaning
 * (brand, verdict, signal); plain tiles keep a quiet colour-keyed rail.
 */
const TILE_HUES = {
	cyan: {
		surface: "bg-[#0C2A33] ring-[#135A69]/70",
		rail: "bg-[#00C8E0]",
		eyebrow: "text-[#33D6EA]",
		value: "text-[#33D6EA]",
		sub: "text-[#33D6EA]/70",
	},
	emerald: {
		surface: "bg-[#0F2A22] ring-[#34D399]/30",
		rail: "bg-[#34D399]",
		eyebrow: "text-[#34D399]",
		value: "text-[#34D399]",
		sub: "text-[#34D399]/70",
	},
	signal: {
		surface: "bg-[#2A1F08] ring-[#5A4310]",
		rail: "bg-[#FBBF24]",
		eyebrow: "text-[#FBBF24]",
		value: "text-[#FBBF24]",
		sub: "text-[#FBBF24]/70",
	},
	plain: {
		surface: "bg-[#121A2B] ring-[#1F2A3D]",
		rail: "bg-[#2E3B52]",
		eyebrow: "",
		value: "text-[#E8EEF4]",
		sub: "",
	},
	plainCyan: {
		surface: "bg-[#121A2B] ring-[#1F2A3D]",
		rail: "bg-[#00C8E0]",
		eyebrow: "",
		value: "text-[#E8EEF4]",
		sub: "",
	},
	plainAmber: {
		surface: "bg-[#121A2B] ring-[#1F2A3D]",
		rail: "bg-[#FBBF24]",
		eyebrow: "",
		value: "text-[#E8EEF4]",
		sub: "",
	},
	plainSky: {
		surface: "bg-[#121A2B] ring-[#1F2A3D]",
		rail: "bg-[#38BDF8]",
		eyebrow: "",
		value: "text-[#E8EEF4]",
		sub: "",
	},
	plainViolet: {
		surface: "bg-[#121A2B] ring-[#1F2A3D]",
		rail: "bg-[#8B5CF6]",
		eyebrow: "",
		value: "text-[#E8EEF4]",
		sub: "",
	},
};

function Tile({ label, value, sub, hue = "plain" }) {
	const h = TILE_HUES[hue] || TILE_HUES.plain;
	return (
		<div
			className={`relative min-w-0 overflow-hidden rounded-lg p-3.5 shadow-[0_1px_2px_rgb(0_0_0/0.35)] ring-1 transition-transform duration-200 hover:-translate-y-0.5 ${h.surface}`}
		>
			<span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${h.rail}`} />
			<p className={`nx-eyebrow truncate ${h.eyebrow}`}>{label}</p>
			<p className={`nx-display mt-1.5 truncate text-[22px] leading-7 tabular-nums ${h.value}`}>{value}</p>
			{sub && <p className={`nx-mono mt-0.5 truncate text-[10px] ${h.sub || "text-[#67788C]"}`}>{sub}</p>}
		</div>
	);
}

function TodayTile({ today = 0, yesterday = 0 }) {
	const delta = today - yesterday;
	const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "–";
	const deltaColor = delta > 0 ? "text-[#34D399]" : delta < 0 ? "text-[#FB7194]" : "text-[#67788C]";

	return (
		<div className="nx-hatch relative min-w-0 overflow-hidden rounded-lg bg-[#0C2A33] p-3.5 shadow-[0_1px_2px_rgb(0_0_0/0.35)] ring-1 ring-[#135A69]/70 transition-transform duration-200 hover:-translate-y-0.5">
			<span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-[#00C8E0]" />
			<p className="nx-eyebrow truncate text-[#33D6EA]">Today</p>
			<p className="nx-display mt-1.5 truncate text-[22px] leading-7 tabular-nums text-[#33D6EA]">{today}</p>
			<p className="nx-mono truncate text-[10px] text-[#33D6EA]/70">
				<span className={deltaColor}>
					{arrow} {delta === 0 ? "same as" : `${Math.abs(delta)} vs`}
				</span>{" "}
				yesterday ({yesterday})
			</p>
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
		<div className="rounded-lg border border-[#1F2A3D] bg-[#121A2B] p-4 shadow-[0_1px_2px_rgb(0_0_0/0.35)]">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<h3 className="nx-display text-[13px] text-[#E8EEF4]">
					CVs sent per {unit}
				</h3>
				<div className="nx-mono flex items-center gap-4 text-[10px] uppercase tracking-wide text-[#9FB0C2]">
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
							className="absolute inset-x-0 border-t border-[#1F2A3D]/80"
							style={{ top: `${t * 100}%` }}
						>
							<span className="nx-mono absolute -top-2 -left-1 bg-[#121A2B] pr-1 text-[10px] tabular-nums text-[#67788C]">
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
									className="w-[45%] rounded-t-[3px] transition-opacity group-hover:opacity-80"
									style={{ height: `${Math.max(sentPct, day.sent ? 3 : 0)}%`, background: SENT_COLOR }}
									title={`${day.date}: ${day.sent} sent`}
								/>
								<div
									className="w-[45%] rounded-t-[3px] transition-opacity group-hover:opacity-80"
									style={{ height: `${Math.max(repliedPct, day.replied ? 3 : 0)}%`, background: REPLIED_COLOR }}
									title={`${day.date}: ${day.replied} replied`}
								/>

								{hover === i && (
									<div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 w-max -translate-x-1/2 rounded-md border border-[#2E3B52] bg-[#0B1220] px-2.5 py-1.5 text-left shadow-[0_8px_24px_rgb(0_0_0/0.5)]">
										<p className="text-[11px] font-medium text-[#E8EEF4]">
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
										<p className="nx-mono text-[10px] tabular-nums text-[#9FB0C2]">
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

			<div className="nx-mono mt-2 flex items-center justify-between pl-5 text-[10px] text-[#67788C]">
				<span>{series[0]?.date}</span>
				<span>{series[series.length - 1]?.endDate || series[series.length - 1]?.date}</span>
			</div>

			<button
				type="button"
				onClick={() => setShowTable((open) => !open)}
				className="nx-mono mt-3 text-[10px] uppercase tracking-wide text-[#33D6EA] hover:underline"
			>
				{showTable ? "Hide data table" : "Show data table"}
			</button>

			{showTable && (
				<div className="nx-scroll-thin mt-2 max-h-48 overflow-y-auto rounded border border-[#1F2A3D]">
					<table className="w-full text-left text-[11px]">
						<thead className="sticky top-0 bg-[#0B1220]">
							<tr>
								<th scope="col" className="nx-eyebrow px-3 py-1.5">{unit === "week" ? "Week of" : "Date"}</th>
								<th scope="col" className="nx-eyebrow px-3 py-1.5">Sent</th>
								<th scope="col" className="nx-eyebrow px-3 py-1.5">Replied</th>
							</tr>
						</thead>
						<tbody className="text-[#9FB0C2]">
							{series.map((day) => (
								<tr key={day.date} className="border-t border-[#1F2A3D] transition-colors hover:bg-[#070C16]">
									<td className="nx-mono px-3 py-1 tabular-nums">{day.date}</td>
									<td className="nx-mono px-3 py-1 tabular-nums">{day.sent}</td>
									<td className="nx-mono px-3 py-1 tabular-nums">{day.replied}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function RankedList({ title, items, emptyText, renderLabel, onSelect, barColor = SENT_COLOR }) {
	const max = Math.max(1, ...items.map((i) => i.sent));

	return (
		<div className="rounded-lg border border-[#1F2A3D] bg-[#121A2B] p-4 shadow-[0_1px_2px_rgb(0_0_0/0.35)]">
			<h3 className="nx-display mb-3 text-[13px] text-[#E8EEF4]">{title}</h3>
			{items.length === 0 ? (
				<p className="text-[12px] text-[#67788C]">{emptyText}</p>
			) : (
				<ul className="nx-stagger space-y-2">
					{items.map((item, i) => (
						<li key={i}>
							<button
								type="button"
								disabled={!onSelect}
								onClick={() => onSelect?.(item)}
								className="group w-full rounded px-1 py-0.5 text-left transition-colors enabled:hover:bg-[#070C16] disabled:cursor-default"
							>
								<div className="flex items-baseline justify-between gap-3">
									<span className="min-w-0 flex-1 truncate text-[12px] text-[#E8EEF4]">
										{renderLabel(item)}
									</span>
									<span className="nx-mono shrink-0 text-[10px] tabular-nums text-[#67788C]">
										{item.sent} sent · {item.replyRate}%
									</span>
								</div>
								<div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#070C16]">
									<div
										className="h-full rounded-full"
										style={{ width: `${(item.sent / max) * 100}%`, background: barColor }}
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
			<div className="border-b border-[#1F2A3D] bg-[#0B1220] p-4">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-[86px] animate-pulse rounded-lg bg-[#121A2B]" />
					))}
				</div>
			</div>
		);
	}

	const s = analytics.summary || {};
	const replyTime = analytics.replyTime || {};

	return (
		<div className="border-b border-[#1F2A3D] bg-[#0B1220] p-4">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="flex items-center gap-2">
					<span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#00C8E0] text-[#06202A] shadow-sm">
						<Icon path={MailIcons.insights} className="h-4 w-4" />
					</span>
					<span className="nx-eyebrow text-[#33D6EA]">Outreach insights</span>
				</h2>
				{/*
				 * The .dashboard-scope reset strips border/background/padding from raw
				 * selects with !important, so the frame and the chevron live on the
				 * wrapper — the select itself only carries the text.
				 */}
				<label className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-[#2E3B52] bg-[#121A2B] px-2.5 text-[12px] text-[#9FB0C2] transition-colors focus-within:border-[#33D6EA]">
					<select
						value={days}
						onChange={(e) => onDaysChange(e.target.value)}
						title="Applies to the folder counts and the list as well"
						className="cursor-pointer outline-none"
					>
						<option value="all">All time</option>
						<option value="7">Last 7 days</option>
						<option value="30">Last 30 days</option>
						<option value="90">Last 90 days</option>
						<option value="365">Last year</option>
					</select>
					<Icon path={MailIcons.chevronDown} className="h-3.5 w-3.5 shrink-0 text-[#67788C]" />
				</label>
			</div>

			<div className="nx-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8">
				<TodayTile today={s.today ?? 0} yesterday={s.yesterday ?? 0} />
				<Tile label="Yesterday" value={s.yesterday ?? 0} sub="previous day" hue="plainAmber" />
				<Tile
					label="Sent"
					value={s.sent ?? 0}
					sub={analytics.allTimeMode ? "all time" : `${s.perDay ?? 0} per day`}
					hue="plainCyan"
				/>
				<Tile
					label="Reply rate"
					value={`${s.replyRate ?? 0}%`}
					sub={`${s.replied ?? 0} replied`}
					hue="emerald"
				/>
				<Tile label="Awaiting" value={s.awaiting ?? 0} sub="no reply yet" hue="signal" />
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
				<Tile label="Companies" value={s.companies ?? 0} sub="unique domains" hue="plainViolet" />
				<Tile
					label="Best day"
					value={bestDay ? WEEKDAYS[bestDay.weekday] : "—"}
					sub={bestDay ? `${bestDay.sent} sent` : ""}
					hue="plainSky"
				/>
			</div>
		</div>
	);
}

/** The deeper view — chart and rankings — shown behind the Insights toggle. */
export default function InsightsDetail({ analytics, loading, onSelectDomain }) {
	if (loading || !analytics) {
		return (
			<div className="border-b border-[#1F2A3D] bg-[#0B1220] px-4 pb-4">
				<div className="h-[220px] animate-pulse rounded-lg bg-[#121A2B]" />
			</div>
		);
	}

	return (
		<div className="border-b border-[#1F2A3D] bg-[#0B1220] px-4 pb-4">
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
							<span className="nx-mono ml-1.5 text-[10px] text-[#67788C]">{item.domain}</span>
						</>
					)}
				/>
				<RankedList
					title="CV file performance"
					items={analytics.byCvFile || []}
					emptyText="No CV attachments in this period."
					renderLabel={(item) => item.fileName}
					barColor="#D946EF"
				/>
			</div>

			{analytics.allTime && (
				<p className="nx-mono mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-[#67788C]">
					<span>All time: {analytics.allTime.sent} CVs sent</span>
					<span className="text-[#2E3B52]">/</span>
					<span>{analytics.allTime.replied} replied</span>
					<span className="text-[#2E3B52]">/</span>
					<span>{analytics.allTime.replyRate}% reply rate</span>
				</p>
			)}
		</div>
	);
}
