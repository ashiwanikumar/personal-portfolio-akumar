/** Hero block shared by the three content index pages. */
const PageHeading = ({ eyebrow, titleAccent, titleRest, description, stats }) => (
	<header className="mb-14">
		{eyebrow && (
			<span className="mb-5 inline-block rounded-full border border-[#00ff41]/30 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#00ff41]">
				{eyebrow}
			</span>
		)}
		<h1 className="mb-5 text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.03em] sm:text-[40px] md:text-[48px]">
			<span className="gradient-text">{titleAccent}</span>{" "}
			<span className="text-white">{titleRest}</span>
		</h1>
		{description && (
			<p className="max-w-[680px] text-[17px] leading-[1.8] text-white/50">
				{description}
			</p>
		)}
		{stats?.length ? (
			<dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
				{stats.map((s) => (
					<div key={s.label}>
						<dt className="font-mono text-[11px] uppercase tracking-wider text-white/30">
							{s.label}
						</dt>
						<dd className="text-2xl font-bold text-[#00ff41]">{s.value}</dd>
					</div>
				))}
			</dl>
		) : null}
	</header>
);

export default PageHeading;
