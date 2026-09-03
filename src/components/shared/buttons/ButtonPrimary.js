import Link from "next/link";

const ButtonPrimary = ({ children, type, url, className, isIcon, href }) => {
	return (
		<Link
			href={url || href || "#"}
			className={`text-sm font-semibold text-[#022c22] py-[14px] px-7 bg-[#10b981] hover:bg-[#34d399] hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] rounded-full leading-1 ${className || ''} ${
				isIcon ? "inline-flex gap-2.5 items-center" : ""
			} transition-all duration-300 group`}
		>
			{children ? children : ""}{" "}
			{isIcon ? (
				<i className="fa-regular fa-arrow-right transition-all duration-400 group-hover:translate-x-0.5" aria-hidden="true"></i>
			) : null}
		</Link>
	);
};

export default ButtonPrimary;
