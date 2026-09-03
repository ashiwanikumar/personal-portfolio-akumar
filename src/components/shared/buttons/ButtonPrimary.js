import Link from "next/link";

const ButtonPrimary = ({ children, type, url, className, isIcon, href }) => {
	return (
		<Link
			href={url || href || "#"}
			className={`text-sm font-medium text-[#022c22] py-2.5 px-5 bg-[#10b981] hover:bg-[#34d399] rounded-lg leading-1 ${className || ''} ${
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
