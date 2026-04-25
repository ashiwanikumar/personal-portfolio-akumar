import Link from "next/link";

const ButtonDownload = ({ text, path }) => {
	return (
		<div>
			<Link
				href={path ? path : "#"}
				className="text-sm font-bold text-[#09090b] capitalize py-[14px] px-8 bg-gradient-to-r from-[#00ff41] to-[#00cc88] hover:shadow-[0_0_30px_rgba(0,255,65,0.4)] rounded-full leading-1 text-nowrap tracking-1px group inline-flex gap-x-2.5 items-center transition-all duration-300 font-mono"
				aria-label={text || "Download CV"}
			>
				{text ? text : "Download CV"}
				<span className="relative overflow-hidden" aria-hidden="true">
					<i className="flaticon-download ml-0.5 text-size-15 group-hover:translate-y-150% transition-all duration-500 inline-block"></i>
					<i className="flaticon-download ml-0.5 text-size-15 absolute left-0 top-0 -translate-y-150% group-hover:translate-y-0 transition-all duration-500"></i>
				</span>
			</Link>
		</div>
	);
};

export default ButtonDownload;
