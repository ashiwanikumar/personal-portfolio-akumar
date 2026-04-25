import Link from "next/link";

const ButtonPrimary = ({ children, type, url, className, isIcon, href }) => {
	return (
		<Link
			href={url || href || "#"}
			className={`text-sm font-bold text-[#09090b] capitalize py-[14px] px-8 ${
				type === 2 ? "" : ""
			} bg-gradient-to-r from-[#00ff41] to-[#00cc88] hover:shadow-[0_0_30px_rgba(0,255,65,0.4)] rounded-full leading-1 ${className || ''} ${
				isIcon ? "inline-flex gap-2.5 items-center" : ""
			} transition-all duration-300 group font-mono`}
		>
			{children ? children : ""}{" "}
			{isIcon ? (
				<i className="fa-regular fa-arrow-right transition-all duration-400 -rotate-45 group-hover:rotate-0" aria-hidden="true"></i>
			) : null}
		</Link>
	);
};

export default ButtonPrimary;
